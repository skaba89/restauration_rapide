// ============================================
// Staff Absences API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Absence type labels
const ABSENCE_TYPE_LABELS: Record<string, string> = {
  unjustified: 'Absence injustifiée',
  late: 'Retard',
  early_departure: 'Départ anticipé',
  no_show: 'Absence non justifiée',
};

// Absence status labels
const ABSENCE_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  justified: 'Justifiée',
  unjustified: 'Non justifiée',
  excused: 'Excusée',
};

// Validation schema
const createAbsenceSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  date: z.string(),
  type: z.enum(['unjustified', 'late', 'early_departure', 'no_show']),
  reason: z.string().optional().nullable(),
  durationMinutes: z.number().optional().nullable(),
  justification: z.string().optional().nullable(),
  documentUrl: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const reviewAbsenceSchema = z.object({
  id: z.string().min(1, 'ID absence requis'),
  status: z.enum(['justified', 'unjustified', 'excused']),
  notes: z.string().optional().nullable(),
});

// GET - List absences with filters
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
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
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        (where.date as Record<string, Date>).gte = new Date(startDate);
      }
      if (endDate) {
        (where.date as Record<string, Date>).lte = new Date(endDate);
      }
    }

    const [absences, total] = await Promise.all([
      db.staffAbsence.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ date: 'desc' }],
        include: {
          staff: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      db.staffAbsence.count({ where }),
    ]);

    return apiSuccess({
      absences: absences.map(a => ({
        ...a,
        staffName: `${a.staff.firstName} ${a.staff.lastName}`,
        typeLabel: ABSENCE_TYPE_LABELS[a.type] || a.type,
        statusLabel: ABSENCE_STATUS_LABELS[a.status] || a.status,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching absences:', error);
    return apiError('Erreur lors de la récupération des absences', 500);
  }
});

// POST - Create new absence
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = createAbsenceSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Real database creation
  try {
    const absence = await db.staffAbsence.create({
      data: {
        staffId: data.staffId,
        date: new Date(data.date),
        type: data.type,
        reason: data.reason || null,
        durationMinutes: data.durationMinutes || null,
        justification: data.justification || null,
        documentUrl: data.documentUrl || null,
        notes: data.notes || null,
        status: 'pending',
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      absence: {
        ...absence,
        staffName: `${absence.staff.firstName} ${absence.staff.lastName}`,
        typeLabel: ABSENCE_TYPE_LABELS[absence.type] || absence.type,
        statusLabel: ABSENCE_STATUS_LABELS[absence.status] || absence.status,
      },
      message: 'Absence enregistrée avec succès',
    });
  } catch (error) {
    console.error('Error creating absence:', error);
    return apiError('Erreur lors de l\'enregistrement de l\'absence', 500);
  }
});

// PUT - Review/justify absence
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, organizationId, action, ...updateData } = body;

  if (!id) {
    return apiError('ID de l\'absence requis', 400);
  }

  const validated = reviewAbsenceSchema.safeParse({ id, ...updateData });
  if (!validated.success && action === 'review') {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  // Real database update
  try {
    const absence = await db.staffAbsence.update({
      where: { id },
      data: {
        status: updateData.status,
        notes: updateData.notes || null,
        reviewedBy: 'Admin',
        reviewedAt: new Date(),
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      absence: {
        ...absence,
        staffName: `${absence.staff.firstName} ${absence.staff.lastName}`,
        typeLabel: ABSENCE_TYPE_LABELS[absence.type] || absence.type,
        statusLabel: ABSENCE_STATUS_LABELS[absence.status] || absence.status,
      },
      message: 'Absence mise à jour avec succès',
    });
  } catch (error: unknown) {
    console.error('Error updating absence:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return apiError('Absence non trouvée', 404);
    }
    return apiError('Erreur lors de la mise à jour de l\'absence', 500);
  }
});