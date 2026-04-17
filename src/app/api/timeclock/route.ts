// ============================================
// Timeclock API - Clock In/Out Operations
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { format, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

// Role colors
const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  chef: 'bg-red-100 text-red-700',
  cook: 'bg-orange-100 text-orange-700',
  waiter: 'bg-blue-100 text-blue-700',
  cashier: 'bg-green-100 text-green-700',
  delivery_driver: 'bg-amber-100 text-amber-700',
  cleaner: 'bg-gray-100 text-gray-700',
};

// Role labels
const ROLE_LABELS: Record<string, string> = {
  manager: 'Directeur',
  chef: 'Chef Cuisinier',
  cook: 'Cuisinier',
  waiter: 'Serveur/Serveuse',
  cashier: 'Caissier(ère)',
  delivery_driver: 'Livreur',
  cleaner: 'Agent d\'entretien',
};

// Helper to calculate hours
const calculateHours = (clockIn: Date, clockOut: Date | null): number => {
  const end = clockOut || new Date();
  return Math.round(differenceInMinutes(end, clockIn) / 60 * 100) / 100;
};

// Validation schemas
const clockInSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  location: z.string().optional(),
});

const clockOutSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  location: z.string().optional(),
});

// GET - Get timeclock status and entries
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  // Real database query
  try {
    const where: any = {};

    if (staffId) {
      where.staffId = staffId;
    }

    if (status === 'clocked_in') {
      where.clockOut = null;
    } else if (status === 'clocked_out') {
      where.clockOut = { not: null };
    }

    const entries = await db.timeEntry.findMany({
      where,
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
            hourlyRate: true,
            isActive: true,
          },
        },
      },
      orderBy: { clockIn: 'desc' },
    });

    // Calculate stats
    const activeEntries = entries.filter(e => !e.clockOut);
    const todayEntries = entries.filter(e => {
      return format(e.clockIn, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    });

    const totalHoursToday = todayEntries.reduce((sum, e) => sum + calculateHours(e.clockIn, e.clockOut), 0);

    return apiSuccess({
      entries: entries.map(e => ({
        id: e.id,
        staffId: e.staffId,
        staffName: `${e.staff.firstName} ${e.staff.lastName}`,
        role: e.staff.role,
        roleLabel: ROLE_LABELS[e.staff.role] || e.staff.role,
        roleColorClass: ROLE_COLORS[e.staff.role] || 'bg-gray-100 text-gray-700',
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        clockInFormatted: format(e.clockIn, 'HH:mm'),
        clockOutFormatted: e.clockOut ? format(e.clockOut, 'HH:mm') : null,
        date: format(e.clockIn, 'yyyy-MM-dd'),
        location: e.locationIn,
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        hourlyRate: e.staff.hourlyRate,
        status: e.clockOut ? 'clocked_out' : 'clocked_in',
      })),
      stats: {
        activeNow: activeEntries.length,
        totalToday: todayEntries.length,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      },
      activeStaff: activeEntries.map(e => ({
        id: e.staffId,
        name: `${e.staff.firstName} ${e.staff.lastName}`,
        role: e.staff.role,
        roleLabel: ROLE_LABELS[e.staff.role] || e.staff.role,
        roleColorClass: ROLE_COLORS[e.staff.role] || 'bg-gray-100 text-gray-700',
        clockIn: e.clockIn,
        clockInFormatted: format(e.clockIn, 'HH:mm'),
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        location: e.locationIn,
        hourlyRate: e.staff.hourlyRate,
      })),
    });
  } catch (error) {
    console.error('Error fetching timeclock:', error);
    return apiError('Erreur lors de la récupération des pointages', 500);
  }
});

// POST - Clock in
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = clockInSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, location } = validated.data;

  // Real database creation
  try {
    // Check if already clocked in
    const existingEntry = await db.timeEntry.findFirst({
      where: { staffId, clockOut: null },
    });

    if (existingEntry) {
      return apiError('Cet employé est déjà pointé', 400);
    }

    // Get staff info
    const staff = await db.staffProfile.findUnique({
      where: { id: staffId },
      select: { firstName: true, lastName: true, role: true, hourlyRate: true },
    });

    if (!staff) {
      return apiError('Employé non trouvé', 404);
    }

    const entry = await db.timeEntry.create({
      data: {
        staffId,
        clockIn: new Date(),
        locationIn: location,
      },
    });

    return apiSuccess({
      entry: {
        id: entry.id,
        staffId: entry.staffId,
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        roleLabel: ROLE_LABELS[staff.role] || staff.role,
        roleColorClass: ROLE_COLORS[staff.role] || 'bg-gray-100 text-gray-700',
        clockIn: entry.clockIn,
        clockOut: null,
        clockInFormatted: format(entry.clockIn, 'HH:mm'),
        clockOutFormatted: null,
        date: format(entry.clockIn, 'yyyy-MM-dd'),
        location: entry.locationIn,
        hoursWorked: 0,
        hourlyRate: staff.hourlyRate,
        status: 'clocked_in',
      },
      message: 'Pointage enregistré avec succès',
    });
  } catch (error) {
    console.error('Error clocking in:', error);
    return apiError('Erreur lors du pointage', 500);
  }
});

// PUT - Clock out
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = clockOutSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, location } = validated.data;

  // Real database update
  try {
    const existingEntry = await db.timeEntry.findFirst({
      where: { staffId, clockOut: null },
      include: {
        staff: {
          select: { firstName: true, lastName: true, role: true, hourlyRate: true },
        },
      },
    });

    if (!existingEntry) {
      return apiError('Aucun pointage actif pour cet employé', 400);
    }

    const entry = await db.timeEntry.update({
      where: { id: existingEntry.id },
      data: {
        clockOut: new Date(),
        locationOut: location,
      },
    });

    return apiSuccess({
      entry: {
        id: entry.id,
        staffId: entry.staffId,
        staffName: `${existingEntry.staff.firstName} ${existingEntry.staff.lastName}`,
        role: existingEntry.staff.role,
        roleLabel: ROLE_LABELS[existingEntry.staff.role] || existingEntry.staff.role,
        roleColorClass: ROLE_COLORS[existingEntry.staff.role] || 'bg-gray-100 text-gray-700',
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        clockInFormatted: format(entry.clockIn, 'HH:mm'),
        clockOutFormatted: format(entry.clockOut!, 'HH:mm'),
        date: format(entry.clockIn, 'yyyy-MM-dd'),
        location: entry.locationIn,
        hoursWorked: calculateHours(entry.clockIn, entry.clockOut!),
        hourlyRate: existingEntry.staff.hourlyRate,
        status: 'clocked_out',
      },
      message: 'Dépointage enregistré avec succès',
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    return apiError('Erreur lors du dépointage', 500);
  }
});