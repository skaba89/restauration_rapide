// ============================================
// Staff Time Entries API - Clock In/Out
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';

// Demo time entries data
const DEMO_TIME_ENTRIES = [
  { id: 'te1', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', clockIn: new Date(Date.now() - 6 * 60 * 60 * 1000), clockOut: null, location: 'Restaurant Principal', status: 'clocked_in' },
  { id: 'te2', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: null, location: 'Cuisine', status: 'clocked_in' },
  { id: 'te3', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', clockIn: new Date(Date.now() - 5 * 60 * 60 * 1000), clockOut: null, location: 'Cuisine', status: 'clocked_in' },
  { id: 'te4', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), clockOut: null, location: 'Salle', status: 'clocked_in' },
  { id: 'te5', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), clockOut: null, location: 'Extérieur', status: 'clocked_in' },
  { id: 'te6', staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), location: 'Caisse', status: 'clocked_out' },
  { id: 'te7', staffId: '8', staffName: 'Fanta Diarra', role: 'waiter', clockIn: new Date(Date.now() - 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 24 * 60 * 60 * 1000), location: 'Salle', status: 'clocked_out' },
  { id: 'te8', staffId: '9', staffName: 'Oumar Bah', role: 'cleaner', clockIn: new Date(Date.now() - 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 24 * 60 * 60 * 1000), location: 'Tout', status: 'clocked_out' },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const month = searchParams.get('month');
  const status = searchParams.get('status');
  const { page, limit, skip } = getPagination(searchParams);

  // Demo mode
  if (demo || !organizationId) {
    let filteredEntries = [...DEMO_TIME_ENTRIES];

    if (staffId) {
      filteredEntries = filteredEntries.filter(e => e.staffId === staffId);
    }
    if (status && status !== 'all') {
      filteredEntries = filteredEntries.filter(e => e.status === status);
    }
    if (date) {
      const targetDate = new Date(date);
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);
      filteredEntries = filteredEntries.filter(e => {
        const entryDate = new Date(e.clockIn);
        return entryDate >= dayStart && entryDate <= dayEnd;
      });
    }
    if (month) {
      const targetMonth = new Date(month);
      const monthStart = startOfMonth(targetMonth);
      const monthEnd = endOfMonth(targetMonth);
      filteredEntries = filteredEntries.filter(e => {
        const entryDate = new Date(e.clockIn);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
    }

    const total = filteredEntries.length;
    const paginatedEntries = filteredEntries.slice(skip, skip + limit);

    // Calculate stats
    const activeNow = filteredEntries.filter(e => e.status === 'clocked_in').length;
    const totalHoursToday = filteredEntries
      .filter(e => {
        const entryDate = new Date(e.clockIn);
        return startOfDay(entryDate).getTime() === startOfDay(new Date()).getTime();
      })
      .reduce((sum, e) => sum + calculateHours(e.clockIn, e.clockOut), 0);

    return apiSuccess({
      entries: paginatedEntries.map(e => ({
        ...e,
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        clockInFormatted: format(new Date(e.clockIn), 'HH:mm'),
        clockOutFormatted: e.clockOut ? format(new Date(e.clockOut), 'HH:mm') : null,
        date: format(new Date(e.clockIn), 'yyyy-MM-dd'),
      })),
      stats: {
        activeNow,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = clockInSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, location } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    // Check if already clocked in
    const existingEntry = DEMO_TIME_ENTRIES.find(e => e.staffId === staffId && e.status === 'clocked_in');
    if (existingEntry) {
      return apiError('Cet employé est déjà pointé', 400);
    }

    const newEntry = {
      id: `te${Date.now()}`,
      staffId,
      staffName: 'Employé',
      role: 'staff',
      clockIn: new Date(),
      clockOut: null,
      location: location || 'Restaurant',
      status: 'clocked_in',
    };
    return apiSuccess({
      entry: {
        ...newEntry,
        hoursWorked: 0,
        clockInFormatted: format(newEntry.clockIn, 'HH:mm'),
        clockOutFormatted: null,
        date: format(newEntry.clockIn, 'yyyy-MM-dd'),
      },
      message: 'Pointage enregistré (mode démo)',
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = clockOutSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, location } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const existingEntry = DEMO_TIME_ENTRIES.find(e => e.staffId === staffId && e.status === 'clocked_in');
    if (!existingEntry) {
      return apiError('Aucun pointage actif pour cet employé', 400);
    }

    const updatedEntry = {
      ...existingEntry,
      clockOut: new Date(),
      status: 'clocked_out',
      location: location || existingEntry.location,
    };
    return apiSuccess({
      entry: {
        ...updatedEntry,
        hoursWorked: calculateHours(updatedEntry.clockIn, updatedEntry.clockOut),
        clockInFormatted: format(updatedEntry.clockIn, 'HH:mm'),
        clockOutFormatted: format(updatedEntry.clockOut!, 'HH:mm'),
        date: format(updatedEntry.clockIn, 'yyyy-MM-dd'),
      },
      message: 'Dépointage enregistré (mode démo)',
    });
  }

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
