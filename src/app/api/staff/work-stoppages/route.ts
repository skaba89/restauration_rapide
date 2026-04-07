// ============================================
// Work Stoppages API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo work stoppages data for KFM DELICE
const DEMO_WORK_STOPPAGES = [
  {
    id: '1',
    staffId: '3',
    staffName: 'Ibrahim Keita',
    type: 'sick_leave',
    startDate: new Date('2024-05-20'),
    endDate: new Date('2024-05-23'),
    durationDays: 4,
    reason: 'Grippe saisonnière',
    medicalCertificateUrl: '/documents/cert-maladie-001.pdf',
    certificateNumber: 'CERT-2024-05-001',
    prescribedBy: 'Dr. Mamadou Bah',
    hospitalName: 'Clinique Pasteur',
    status: 'active',
    extendedFrom: null,
    extensionCount: 0,
    socialSecurityNotified: true,
    socialSecurityRef: 'SS-2024-05-1234',
    approvedBy: 'Amadou Diallo',
    approvedAt: new Date('2024-05-20'),
    createdAt: new Date('2024-05-20'),
  },
  {
    id: '2',
    staffId: '4',
    staffName: 'Marie Koulibaly',
    type: 'sick_leave',
    startDate: new Date('2024-05-10'),
    endDate: new Date('2024-05-11'),
    durationDays: 2,
    reason: 'Consultation médicale',
    medicalCertificateUrl: '/documents/cert-maladie-002.pdf',
    certificateNumber: 'CERT-2024-05-002',
    prescribedBy: 'Dr. Aminata Diallo',
    hospitalName: 'Centre de Santé Matam',
    status: 'returned',
    extendedFrom: null,
    extensionCount: 0,
    socialSecurityNotified: false,
    socialSecurityRef: null,
    approvedBy: 'Amadou Diallo',
    approvedAt: new Date('2024-05-10'),
    createdAt: new Date('2024-05-10'),
  },
  {
    id: '3',
    staffId: '5',
    staffName: 'Moussa Camara',
    type: 'work_accident',
    startDate: new Date('2024-04-25'),
    endDate: new Date('2024-04-30'),
    durationDays: 6,
    reason: 'Chute de moto en livraison',
    medicalCertificateUrl: '/documents/cert-accident-001.pdf',
    certificateNumber: 'ACC-2024-04-001',
    prescribedBy: 'Dr. Ibrahima Sylla',
    hospitalName: 'Hôpital National Ignace Deen',
    status: 'returned',
    extendedFrom: null,
    extensionCount: 0,
    socialSecurityNotified: true,
    socialSecurityRef: 'ACC-TRAV-2024-056',
    approvedBy: 'Amadou Diallo',
    approvedAt: new Date('2024-04-25'),
    notes: 'Accident de travail - Déclaration effectuée',
    createdAt: new Date('2024-04-25'),
  },
  {
    id: '4',
    staffId: '6',
    staffName: 'Aissatou Traore',
    type: 'maternity',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    durationDays: 92,
    reason: 'Congé de maternité',
    medicalCertificateUrl: '/documents/cert-maternite-001.pdf',
    certificateNumber: 'MAT-2024-001',
    prescribedBy: 'Dr. Fatoumata Keita',
    hospitalName: 'Clinique Sainte-Marie',
    status: 'active',
    extendedFrom: null,
    extensionCount: 0,
    socialSecurityNotified: true,
    socialSecurityRef: 'MAT-SEC-2024-089',
    approvedBy: 'Admin',
    approvedAt: new Date('2024-05-15'),
    notes: 'Accouchement prévu fin juin',
    createdAt: new Date('2024-05-15'),
  },
  {
    id: '5',
    staffId: '7',
    staffName: 'Sekou Konate',
    type: 'sick_leave',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-17'),
    durationDays: 3,
    reason: 'Paludisme',
    medicalCertificateUrl: '/documents/cert-maladie-003.pdf',
    certificateNumber: 'CERT-2024-04-003',
    prescribedBy: 'Dr. Moussa Conde',
    hospitalName: 'Centre de Santé Dixinn',
    status: 'returned',
    extendedFrom: null,
    extensionCount: 0,
    socialSecurityNotified: false,
    socialSecurityRef: null,
    approvedBy: 'Amadou Diallo',
    approvedAt: new Date('2024-04-15'),
    createdAt: new Date('2024-04-15'),
  },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const { page, limit, skip } = getPagination(searchParams);

  // Return demo data
  if (demo || !organizationId) {
    let filteredStoppages = [...DEMO_WORK_STOPPAGES];

    if (staffId) {
      filteredStoppages = filteredStoppages.filter(s => s.staffId === staffId);
    }
    if (status && status !== 'all') {
      filteredStoppages = filteredStoppages.filter(s => s.status === status);
    }
    if (type && type !== 'all') {
      filteredStoppages = filteredStoppages.filter(s => s.type === type);
    }

    const total = filteredStoppages.length;
    const paginatedStoppages = filteredStoppages.slice(skip, skip + limit);

    return apiSuccess({
      stoppages: paginatedStoppages.map(s => ({
        ...s,
        typeLabel: STOPPAGE_TYPE_LABELS[s.type] || s.type,
        statusLabel: STOPPAGE_STATUS_LABELS[s.status] || s.status,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createStoppageSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const newStoppage = {
      id: `${Date.now()}`,
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      status: 'active',
      extendedFrom: null,
      extensionCount: 0,
      socialSecurityNotified: false,
      socialSecurityRef: null,
      staffName: 'Employé',
      createdAt: new Date(),
    };
    return apiSuccess({
      stoppage: {
        ...newStoppage,
        typeLabel: STOPPAGE_TYPE_LABELS[data.type] || data.type,
        statusLabel: STOPPAGE_STATUS_LABELS['active'],
      },
      message: 'Arrêt de travail enregistré (mode démo)',
    });
  }

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
  const { demo, organizationId, ...updateData } = body;

  const validated = updateStoppageSchema.safeParse(updateData);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { id, action, newEndDate, notes } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const existingStoppage = DEMO_WORK_STOPPAGES.find(s => s.id === id);
    if (!existingStoppage) {
      return apiError('Arrêt de travail non trouvé', 404);
    }

    let updatedStoppage = { ...existingStoppage };

    if (action === 'extend' && newEndDate) {
      updatedStoppage = {
        ...updatedStoppage,
        endDate: new Date(newEndDate),
        durationDays: Math.ceil((new Date(newEndDate).getTime() - new Date(updatedStoppage.startDate).getTime()) / (1000 * 60 * 60 * 24)),
        status: 'extended',
        extensionCount: (updatedStoppage.extensionCount || 0) + 1,
      };
    } else if (action === 'return') {
      updatedStoppage = {
        ...updatedStoppage,
        status: 'returned',
        notes: notes || updatedStoppage.notes,
      };
    } else if (action === 'cancel') {
      updatedStoppage = {
        ...updatedStoppage,
        status: 'cancelled',
        notes: notes || updatedStoppage.notes,
      };
    }

    return apiSuccess({
      stoppage: {
        ...updatedStoppage,
        typeLabel: STOPPAGE_TYPE_LABELS[updatedStoppage.type] || updatedStoppage.type,
        statusLabel: STOPPAGE_STATUS_LABELS[updatedStoppage.status] || updatedStoppage.status,
      },
      message: 'Arrêt de travail mis à jour (mode démo)',
    });
  }

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
