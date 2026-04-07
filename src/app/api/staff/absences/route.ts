// ============================================
// Staff Absences API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo absences data for KFM DELICE
const DEMO_ABSENCES = [
  {
    id: '1',
    staffId: '1',
    staffName: 'Amadou Diallo',
    date: new Date('2024-05-20'),
    type: 'late',
    reason: 'Embouteillages',
    durationMinutes: 45,
    status: 'justified',
    justification: 'Accident sur la route principale',
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-05-20'),
    createdAt: new Date('2024-05-20'),
  },
  {
    id: '2',
    staffId: '2',
    staffName: 'Fatou Sylla',
    date: new Date('2024-05-18'),
    type: 'unjustified',
    reason: null,
    durationMinutes: null,
    status: 'unjustified',
    justification: null,
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-05-19'),
    createdAt: new Date('2024-05-18'),
  },
  {
    id: '3',
    staffId: '3',
    staffName: 'Ibrahim Keita',
    date: new Date('2024-05-15'),
    type: 'early_departure',
    reason: 'Rendez-vous médical',
    durationMinutes: 60,
    status: 'justified',
    justification: 'Certificat médical fourni',
    documentUrl: '/documents/medical-cert-001.pdf',
    reviewedBy: 'Amadou Diallo',
    reviewedAt: new Date('2024-05-16'),
    createdAt: new Date('2024-05-15'),
  },
  {
    id: '4',
    staffId: '4',
    staffName: 'Marie Koulibaly',
    date: new Date('2024-05-10'),
    type: 'late',
    reason: 'Problème de transport',
    durationMinutes: 30,
    status: 'excused',
    justification: 'Grève des transports',
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-05-10'),
    createdAt: new Date('2024-05-10'),
  },
  {
    id: '5',
    staffId: '5',
    staffName: 'Moussa Camara',
    date: new Date('2024-05-08'),
    type: 'no_show',
    reason: null,
    durationMinutes: null,
    status: 'pending',
    justification: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date('2024-05-08'),
  },
  {
    id: '6',
    staffId: '6',
    staffName: 'Aissatou Traore',
    date: new Date('2024-05-05'),
    type: 'late',
    reason: 'Enfant malade',
    durationMinutes: 20,
    status: 'justified',
    justification: 'Urgence familiale',
    reviewedBy: 'Amadou Diallo',
    reviewedAt: new Date('2024-05-05'),
    createdAt: new Date('2024-05-05'),
  },
  {
    id: '7',
    staffId: '7',
    staffName: 'Sekou Konate',
    date: new Date('2024-05-03'),
    type: 'early_departure',
    reason: 'Fin de contrat',
    durationMinutes: 180,
    status: 'justified',
    justification: 'Préavis de démission',
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-05-03'),
    createdAt: new Date('2024-05-03'),
  },
  {
    id: '8',
    staffId: '8',
    staffName: 'Fanta Diarra',
    date: new Date('2024-04-28'),
    type: 'late',
    reason: 'Premier jour - perdu',
    durationMinutes: 15,
    status: 'excused',
    justification: 'Nouvel employé - période d\'adaptation',
    reviewedBy: 'Fatou Sylla',
    reviewedAt: new Date('2024-04-28'),
    createdAt: new Date('2024-04-28'),
  },
  {
    id: '9',
    staffId: '9',
    staffName: 'Oumar Bah',
    date: new Date('2024-04-25'),
    type: 'unjustified',
    reason: null,
    durationMinutes: null,
    status: 'pending',
    justification: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date('2024-04-25'),
  },
  {
    id: '10',
    staffId: '10',
    staffName: 'Adama Sow',
    date: new Date('2024-04-20'),
    type: 'no_show',
    reason: null,
    durationMinutes: null,
    status: 'unjustified',
    justification: null,
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-04-21'),
    notes: 'Contrat non renouvelé suite à cette absence',
    createdAt: new Date('2024-04-20'),
  },
  {
    id: '11',
    staffId: '4',
    staffName: 'Marie Koulibaly',
    date: new Date('2024-04-15'),
    type: 'late',
    reason: 'Réveil tardif',
    durationMinutes: 25,
    status: 'pending',
    justification: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: new Date('2024-04-15'),
  },
  {
    id: '12',
    staffId: '3',
    staffName: 'Ibrahim Keita',
    date: new Date('2024-04-10'),
    type: 'early_departure',
    reason: 'Urgence personnelle',
    durationMinutes: 90,
    status: 'justified',
    justification: 'Appel téléphonique confirmé',
    reviewedBy: 'Fatou Sylla',
    reviewedAt: new Date('2024-04-10'),
    createdAt: new Date('2024-04-10'),
  },
  {
    id: '13',
    staffId: '5',
    staffName: 'Moussa Camara',
    date: new Date('2024-04-05'),
    type: 'late',
    reason: 'Moto en panne',
    durationMinutes: 40,
    status: 'justified',
    justification: 'Facture de réparation fournie',
    documentUrl: '/documents/facture-moto.pdf',
    reviewedBy: 'Amadou Diallo',
    reviewedAt: new Date('2024-04-05'),
    createdAt: new Date('2024-04-05'),
  },
  {
    id: '14',
    staffId: '6',
    staffName: 'Aissatou Traore',
    date: new Date('2024-04-02'),
    type: 'early_departure',
    reason: 'Rendez-vous bancaire',
    durationMinutes: 45,
    status: 'justified',
    justification: 'Heures récupérées le samedi',
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-04-02'),
    createdAt: new Date('2024-04-02'),
  },
  {
    id: '15',
    staffId: '2',
    staffName: 'Fatou Sylla',
    date: new Date('2024-03-28'),
    type: 'late',
    reason: 'Fête familiale',
    durationMinutes: 60,
    status: 'unjustified',
    justification: null,
    reviewedBy: 'Admin',
    reviewedAt: new Date('2024-03-28'),
    notes: 'Avertissement verbal',
    createdAt: new Date('2024-03-28'),
  },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const { page, limit, skip } = getPagination(searchParams);

  // Return demo data
  if (demo || !organizationId) {
    let filteredAbsences = [...DEMO_ABSENCES];

    if (staffId) {
      filteredAbsences = filteredAbsences.filter(a => a.staffId === staffId);
    }
    if (status && status !== 'all') {
      filteredAbsences = filteredAbsences.filter(a => a.status === status);
    }
    if (type && type !== 'all') {
      filteredAbsences = filteredAbsences.filter(a => a.type === type);
    }
    if (startDate) {
      filteredAbsences = filteredAbsences.filter(a => new Date(a.date) >= new Date(startDate));
    }
    if (endDate) {
      filteredAbsences = filteredAbsences.filter(a => new Date(a.date) <= new Date(endDate));
    }

    const total = filteredAbsences.length;
    const paginatedAbsences = filteredAbsences.slice(skip, skip + limit);

    return apiSuccess({
      absences: paginatedAbsences.map(a => ({
        ...a,
        typeLabel: ABSENCE_TYPE_LABELS[a.type] || a.type,
        statusLabel: ABSENCE_STATUS_LABELS[a.status] || a.status,
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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createAbsenceSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const newAbsence = {
      id: `${Date.now()}`,
      ...data,
      date: new Date(data.date),
      status: 'pending',
      staffName: 'Employé',
      createdAt: new Date(),
    };
    return apiSuccess({
      absence: {
        ...newAbsence,
        typeLabel: ABSENCE_TYPE_LABELS[data.type] || data.type,
        statusLabel: ABSENCE_STATUS_LABELS['pending'],
      },
      message: 'Absence enregistrée (mode démo)',
    });
  }

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
  const { id, demo, organizationId, action, ...updateData } = body;

  if (!id) {
    return apiError('ID de l\'absence requis', 400);
  }

  const validated = reviewAbsenceSchema.safeParse({ id, ...updateData });
  if (!validated.success && action === 'review') {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const existingAbsence = DEMO_ABSENCES.find(a => a.id === id);
    if (!existingAbsence) {
      return apiError('Absence non trouvée', 404);
    }

    const updatedAbsence = {
      ...existingAbsence,
      ...updateData,
      reviewedBy: 'Admin',
      reviewedAt: new Date(),
    };

    return apiSuccess({
      absence: {
        ...updatedAbsence,
        typeLabel: ABSENCE_TYPE_LABELS[updatedAbsence.type] || updatedAbsence.type,
        statusLabel: ABSENCE_STATUS_LABELS[updatedAbsence.status] || updatedAbsence.status,
      },
      message: 'Absence mise à jour (mode démo)',
    });
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
