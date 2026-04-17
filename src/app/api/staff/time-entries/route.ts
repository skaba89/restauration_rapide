// ============================================
// Staff Time Entries API - Clock In/Out
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';

// Calculate hours worked
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

// GET - Get time entries
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const month = searchParams.get('month');
  const status = searchParams.get('status');
  const { page, limit, skip } = getPagination(searchParams);

  // Real database query
  try {
    const where: any = {};

    if (staffId) {
      where.staffId = staffId;
    }

    if (date) {
      const targetDate = new Date(date);
      where.clockIn = {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
      };
    } else if (month) {
      const targetMonth = new Date(month);
      where.clockIn = {
        gte: startOfMonth(targetMonth),
        lte: endOfMonth(targetMonth),
      };
    }

    if (status === 'clocked_in') {
      where.clockOut = null;
    } else if (status === 'clocked_out') {
      where.clockOut = { not: null };
    }

    const [entries, total] = await Promise.all([
      db.timeEntry.findMany({
        where,
        skip,
        take: limit,
        include: {
          staff: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
              hourlyRate: true,
            },
          },
        },
        orderBy: { clockIn: 'desc' },
      }),
      db.timeEntry.count({ where }),
    ]);

    // Calculate stats
    const activeEntries = await db.timeEntry.count({
      where: { clockOut: null },
    });

    const todayEntries = await db.timeEntry.findMany({
      where: {
        clockIn: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
      include: { staff: { select: { hourlyRate: true } } },
    });

    const totalHoursToday = todayEntries.reduce((sum, e) => {
      return sum + calculateHours(e.clockIn, e.clockOut);
    }, 0);

    return apiSuccess({
      entries: entries.map(e => ({
        id: e.id,
        staffId: e.staffId,
        staffName: `${e.staff.firstName} ${e.staff.lastName}`,
        role: e.staff.role,
        clockIn: e.clockIn,
        clockOut: e.clockOut,
        location: e.locationIn,
        status: e.clockOut ? 'clocked_out' : 'clocked_in',
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        clockInFormatted: format(e.clockIn, 'HH:mm'),
        clockOutFormatted: e.clockOut ? format(e.clockOut, 'HH:mm') : null,
        date: format(e.clockIn, 'yyyy-MM-dd'),
        hourlyRate: e.staff.hourlyRate,
      })),
      stats: {
        activeNow: activeEntries,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching time entries:', error);
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
      select: { firstName: true, lastName: true, role: true },
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
        clockIn: entry.clockIn,
        clockOut: null,
        location: entry.locationIn,
        status: 'clocked_in',
        hoursWorked: 0,
        clockInFormatted: format(entry.clockIn, 'HH:mm'),
        clockOutFormatted: null,
        date: format(entry.clockIn, 'yyyy-MM-dd'),
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
        clockIn: entry.clockIn,
        clockOut: entry.clockOut,
        location: entry.locationIn,
        status: 'clocked_out',
        hoursWorked: calculateHours(entry.clockIn, entry.clockOut!),
        clockInFormatted: format(entry.clockIn, 'HH:mm'),
        clockOutFormatted: format(entry.clockOut!, 'HH:mm'),
        date: format(entry.clockIn, 'yyyy-MM-dd'),
        hourlyRate: existingEntry.staff.hourlyRate,
      },
      message: 'Dépointage enregistré avec succès',
    });
  } catch (error) {
    console.error('Error clocking out:', error);
    return apiError('Erreur lors du dépointage', 500);
  }
});