// ============================================
// Staff Availability API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

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
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');

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
  const organizationId = body.organizationId || '';

  const validated = setAvailabilitySchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

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
  const organizationId = body.organizationId || '';

  const validated = batchUpdateSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, availability } = validated.data;

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