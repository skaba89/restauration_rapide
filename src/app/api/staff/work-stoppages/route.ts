// ============================================
// Work Stoppages API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Work stoppage type labels
const STOPPAGE_TYPE_LABELS: Record<string, string> = {
  sick_leave: 'Maladie',
  work_accident: 'Accident de travail',
  occupational_disease: 'Maladie professionnelle',
  maternity: 'Maternité',
  paternity: 'Paternité',
};

// Work stoppage status labels
const STOPPAGE_STATUS_LABELS: Record<string, string> = {
  active: 'En cours',
  extended: 'Prolongé',
  returned: 'Revenu',
  cancelled: 'Annulé',
};

// Validation schema
const createStoppageSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  type: z.enum(['sick_leave', 'work_accident', 'occupational_disease', 'maternity', 'paternity']),
  startDate: z.string(),
  endDate: z.string(),
  durationDays: z.number().min(1, 'Durée invalide'),
  reason: z.string().optional().nullable(),
  medicalCertificateUrl: z.string().optional().nullable(),
  certificateNumber: z.string().optional().nullable(),
  prescribedBy: z.string().optional().nullable(),
  hospitalName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateStoppageSchema = z.object({
  id: z.string().min(1, 'ID arrêt requis'),
  action: z.enum(['extend', 'return', 'cancel']),
  newEndDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// GET - List work stoppages with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const { page, limit, skip } = getPagination(searchParams);

  // Real database query
  try {
    const where: Record<string, unknown> = {};

    if (staffId) {
      where.staffId = staffId;
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    const [stoppages, total] = await Promise.all([
      db.workStoppage.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startDate: 'desc' }],
        include: {
          staff: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      db.workStoppage.count({ where }),
    ]);

    return apiSuccess({
      stoppages: stoppages.map(s => ({
        ...s,
        staffName: `${s.staff.firstName} ${s.staff.lastName}`,
        typeLabel: STOPPAGE_TYPE_LABELS[s.type] || s.type,
        statusLabel: STOPPAGE_STATUS_LABELS[s.status] || s.status,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching work stoppages:', error);
    return apiError('Erreur lors de la récupération des arrêts de travail', 500);
  }
});

// POST - Create new work stoppage
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = createStoppageSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Real database creation
  try {
    const stoppage = await db.workStoppage.create({
      data: {
        staffId: data.staffId,
        type: data.type,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        durationDays: data.durationDays,
        reason: data.reason || null,
        medicalCertificateUrl: data.medicalCertificateUrl || null,
        certificateNumber: data.certificateNumber || null,
        prescribedBy: data.prescribedBy || null,
        hospitalName: data.hospitalName || null,
        notes: data.notes || null,
        status: 'active',
        extensionCount: 0,
        socialSecurityNotified: false,
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      stoppage: {
        ...stoppage,
        staffName: `${stoppage.staff.firstName} ${stoppage.staff.lastName}`,
        typeLabel: STOPPAGE_TYPE_LABELS[stoppage.type] || stoppage.type,
        statusLabel: STOPPAGE_STATUS_LABELS[stoppage.status] || stoppage.status,
      },
      message: 'Arrêt de travail enregistré avec succès',
    });
  } catch (error) {
    console.error('Error creating work stoppage:', error);
    return apiError('Erreur lors de l\'enregistrement de l\'arrêt de travail', 500);
  }
});

// PUT - Update work stoppage (extend, return, cancel)
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { organizationId, ...updateData } = body;

  const validated = updateStoppageSchema.safeParse(updateData);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { id, action, newEndDate, notes } = validated.data;

  // Real database update
  try {
    let data: Record<string, unknown> = { notes };

    if (action === 'extend' && newEndDate) {
      data = {
        ...data,
        endDate: new Date(newEndDate),
        status: 'extended',
        extensionCount: { increment: 1 },
      };
    } else if (action === 'return') {
      data = { ...data, status: 'returned' };
    } else if (action === 'cancel') {
      data = { ...data, status: 'cancelled' };
    }

    const stoppage = await db.workStoppage.update({
      where: { id },
      data,
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      stoppage: {
        ...stoppage,
        staffName: `${stoppage.staff.firstName} ${stoppage.staff.lastName}`,
        typeLabel: STOPPAGE_TYPE_LABELS[stoppage.type] || stoppage.type,
        statusLabel: STOPPAGE_STATUS_LABELS[stoppage.status] || stoppage.status,
      },
      message: 'Arrêt de travail mis à jour avec succès',
    });
  } catch (error: unknown) {
    console.error('Error updating work stoppage:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return apiError('Arrêt de travail non trouvé', 404);
    }
    return apiError('Erreur lors de la mise à jour de l\'arrêt de travail', 500);
  }
});