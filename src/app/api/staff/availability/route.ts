// ============================================
// Staff Availability API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo availability data for KFM DELICE
const DEMO_AVAILABILITY = [
  // Amadou Diallo (Manager) - Monday to Saturday
  { id: '1', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '2', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '3', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '4', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
  { id: '5', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isAvailable: true },
  { id: '6', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
  { id: '7', staffId: '1', staffName: 'Amadou Diallo', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Fatou Sylla (Chef) - Tuesday to Sunday
  { id: '11', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 2, startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '12', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 3, startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '13', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 4, startTime: '10:00', endTime: '22:00', isAvailable: true },
  { id: '14', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 5, startTime: '10:00', endTime: '23:00', isAvailable: true },
  { id: '15', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 6, startTime: '10:00', endTime: '23:00', isAvailable: true },
  { id: '16', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 0, startTime: '11:00', endTime: '20:00', isAvailable: true },
  { id: '17', staffId: '2', staffName: 'Fatou Sylla', dayOfWeek: 1, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Ibrahim Keita (Cook) - Monday to Friday
  { id: '21', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '22', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '23', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '24', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '25', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true },
  { id: '26', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '27', staffId: '3', staffName: 'Ibrahim Keita', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Marie Koulibaly (Waiter) - Wednesday to Sunday
  { id: '31', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 3, startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '32', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 4, startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '33', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 5, startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '34', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 6, startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '35', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 0, startTime: '11:00', endTime: '21:00', isAvailable: true },
  { id: '36', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 1, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '37', staffId: '4', staffName: 'Marie Koulibaly', dayOfWeek: 2, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Moussa Camara (Delivery) - Monday to Saturday
  { id: '41', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: '42', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: '43', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: '44', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isAvailable: true },
  { id: '45', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 5, startTime: '09:00', endTime: '20:00', isAvailable: true },
  { id: '46', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 6, startTime: '09:00', endTime: '20:00', isAvailable: true },
  { id: '47', staffId: '5', staffName: 'Moussa Camara', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Aissatou Traore (Cashier) - Monday to Friday
  { id: '51', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 1, startTime: '08:00', endTime: '17:00', isAvailable: true },
  { id: '52', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 2, startTime: '08:00', endTime: '17:00', isAvailable: true },
  { id: '53', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 3, startTime: '08:00', endTime: '17:00', isAvailable: true },
  { id: '54', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 4, startTime: '08:00', endTime: '17:00', isAvailable: true },
  { id: '55', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 5, startTime: '08:00', endTime: '17:00', isAvailable: true },
  { id: '56', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '57', staffId: '6', staffName: 'Aissatou Traore', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Sekou Konate (Cook) - Monday to Friday (inactive)
  { id: '61', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: false },
  { id: '62', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: false },
  { id: '63', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: false },
  { id: '64', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: false },
  { id: '65', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: false },
  { id: '66', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '67', staffId: '7', staffName: 'Sekou Konate', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Fanta Diarra (Waiter) - Wednesday to Sunday
  { id: '71', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 3, startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '72', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 4, startTime: '11:00', endTime: '22:00', isAvailable: true },
  { id: '73', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 5, startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '74', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 6, startTime: '11:00', endTime: '23:00', isAvailable: true },
  { id: '75', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 0, startTime: '11:00', endTime: '21:00', isAvailable: true },
  { id: '76', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 1, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '77', staffId: '8', staffName: 'Fanta Diarra', dayOfWeek: 2, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Oumar Bah (Cleaner) - Monday to Friday
  { id: '81', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 1, startTime: '06:00', endTime: '12:00', isAvailable: true },
  { id: '82', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 2, startTime: '06:00', endTime: '12:00', isAvailable: true },
  { id: '83', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 3, startTime: '06:00', endTime: '12:00', isAvailable: true },
  { id: '84', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 4, startTime: '06:00', endTime: '12:00', isAvailable: true },
  { id: '85', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 5, startTime: '06:00', endTime: '12:00', isAvailable: true },
  { id: '86', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '87', staffId: '9', staffName: 'Oumar Bah', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },

  // Adama Sow (Delivery) - Inactive
  { id: '91', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 1, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '92', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 2, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '93', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 3, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '94', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 4, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '95', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 5, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '96', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 6, startTime: '00:00', endTime: '00:00', isAvailable: false },
  { id: '97', staffId: '10', staffName: 'Adama Sow', dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isAvailable: false },
];

// Day labels
const DAY_LABELS: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

// Validation schema
const setAvailabilitySchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format d\'heure invalide'),
  isAvailable: z.boolean(),
  notes: z.string().optional().nullable(),
});

const batchUpdateSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean(),
  })),
});

// GET - Get staff availability
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');

  // Return demo data
  if (demo || !organizationId) {
    let filteredAvailability = [...DEMO_AVAILABILITY];

    if (staffId) {
      filteredAvailability = filteredAvailability.filter(a => a.staffId === staffId);
    }

    return apiSuccess({
      availability: filteredAvailability.map(a => ({
        ...a,
        dayLabel: DAY_LABELS[a.dayOfWeek],
      })),
    });
  }

  // Real database query
  try {
    const where: Record<string, unknown> = {};
    if (staffId) {
      where.staffId = staffId;
    }

    const availability = await db.staffAvailability.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }],
      include: {
        staff: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess({
      availability: availability.map(a => ({
        ...a,
        staffName: `${a.staff.firstName} ${a.staff.lastName}`,
        dayLabel: DAY_LABELS[a.dayOfWeek],
      })),
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return apiError('Erreur lors de la récupération des disponibilités', 500);
  }
});

// POST - Set/update availability for a single day
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = setAvailabilitySchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    return apiSuccess({
      availability: {
        id: `${Date.now()}`,
        ...data,
        staffName: 'Employé',
        dayLabel: DAY_LABELS[data.dayOfWeek],
      },
      message: 'Disponibilité mise à jour (mode démo)',
    });
  }

  // Real database upsert
  try {
    const availability = await db.staffAvailability.upsert({
      where: {
        staffId_dayOfWeek: {
          staffId: data.staffId,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
        notes: data.notes || null,
      },
      create: {
        staffId: data.staffId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable,
        notes: data.notes || null,
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      availability: {
        ...availability,
        staffName: `${availability.staff.firstName} ${availability.staff.lastName}`,
        dayLabel: DAY_LABELS[availability.dayOfWeek],
      },
      message: 'Disponibilité mise à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    return apiError('Erreur lors de la mise à jour de la disponibilité', 500);
  }
});

// PUT - Batch update availability for the week
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = batchUpdateSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, availability } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    return apiSuccess({
      availability: availability.map(a => ({
        id: `${Date.now()}-${a.dayOfWeek}`,
        staffId,
        staffName: 'Employé',
        ...a,
        dayLabel: DAY_LABELS[a.dayOfWeek],
      })),
      message: 'Disponibilités mises à jour (mode démo)',
    });
  }

  // Real database batch update
  try {
    // Delete existing availability for this staff
    await db.staffAvailability.deleteMany({
      where: { staffId },
    });

    // Create new availability records
    const newAvailability = await db.staffAvailability.createMany({
      data: availability.map(a => ({
        staffId,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable,
      })),
    });

    return apiSuccess({
      count: newAvailability.count,
      message: 'Disponibilités mises à jour avec succès',
    });
  } catch (error) {
    console.error('Error batch updating availability:', error);
    return apiError('Erreur lors de la mise à jour des disponibilités', 500);
  }
});
