// ============================================
// Timeclock API - Clock In/Out Operations
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { format, startOfDay, endOfDay, differenceInMinutes } from 'date-fns';

// Demo staff for reference
const DEMO_STAFF = [
  { id: '1', firstName: 'Amadou', lastName: 'Diallo', role: 'manager', hourlyRate: 15000, status: 'active' },
  { id: '2', firstName: 'Fatou', lastName: 'Sylla', role: 'chef', hourlyRate: 12000, status: 'active' },
  { id: '3', firstName: 'Ibrahim', lastName: 'Keita', role: 'cook', hourlyRate: 8000, status: 'active' },
  { id: '4', firstName: 'Marie', lastName: 'Koulibaly', role: 'waiter', hourlyRate: 5000, status: 'active' },
  { id: '5', firstName: 'Moussa', lastName: 'Camara', role: 'delivery_driver', hourlyRate: 5000, status: 'active' },
  { id: '6', firstName: 'Aissatou', lastName: 'Traore', role: 'cashier', hourlyRate: 6000, status: 'active' },
  { id: '8', firstName: 'Fanta', lastName: 'Diarra', role: 'waiter', hourlyRate: 5000, status: 'active' },
  { id: '9', firstName: 'Oumar', lastName: 'Bah', role: 'cleaner', hourlyRate: 4000, status: 'active' },
];

// Demo time entries
let DEMO_TIME_ENTRIES = [
  { id: 'te1', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', clockIn: new Date(Date.now() - 6 * 60 * 60 * 1000), clockOut: null, location: 'Restaurant Principal', hourlyRate: 15000 },
  { id: 'te2', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: null, location: 'Cuisine', hourlyRate: 12000 },
  { id: 'te3', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', clockIn: new Date(Date.now() - 5 * 60 * 60 * 1000), clockOut: null, location: 'Cuisine', hourlyRate: 8000 },
  { id: 'te4', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), clockOut: null, location: 'Salle', hourlyRate: 5000 },
  { id: 'te5', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), clockOut: null, location: 'Extérieur', hourlyRate: 5000 },
  { id: 'te6', staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: new Date(Date.now() - 1 * 60 * 60 * 1000), location: 'Caisse', hourlyRate: 6000 },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  // Demo mode
  if (demo || !organizationId) {
    let entries = [...DEMO_TIME_ENTRIES];

    if (staffId) {
      entries = entries.filter(e => e.staffId === staffId);
    }
    if (status === 'clocked_in') {
      entries = entries.filter(e => !e.clockOut);
    } else if (status === 'clocked_out') {
      entries = entries.filter(e => e.clockOut);
    }
    if (date) {
      const targetDate = new Date(date);
      entries = entries.filter(e => {
        const entryDate = new Date(e.clockIn);
        return format(entryDate, 'yyyy-MM-dd') === format(targetDate, 'yyyy-MM-dd');
      });
    }

    // Calculate stats
    const activeEntries = DEMO_TIME_ENTRIES.filter(e => !e.clockOut);
    const todayEntries = DEMO_TIME_ENTRIES.filter(e => {
      const entryDate = new Date(e.clockIn);
      return format(entryDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    });

    const totalHoursToday = todayEntries.reduce((sum, e) => sum + calculateHours(e.clockIn, e.clockOut), 0);
    const notClockedIn = DEMO_STAFF.filter(s => 
      s.status === 'active' && !DEMO_TIME_ENTRIES.find(e => e.staffId === s.id && !e.clockOut)
    );

    return apiSuccess({
      entries: entries.map(e => ({
        ...e,
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        clockInFormatted: format(new Date(e.clockIn), 'HH:mm'),
        clockOutFormatted: e.clockOut ? format(new Date(e.clockOut), 'HH:mm') : null,
        date: format(new Date(e.clockIn), 'yyyy-MM-dd'),
        roleLabel: ROLE_LABELS[e.role] || e.role,
        roleColorClass: ROLE_COLORS[e.role] || 'bg-gray-100 text-gray-700',
        status: e.clockOut ? 'clocked_out' : 'clocked_in',
      })),
      stats: {
        activeNow: activeEntries.length,
        totalToday: todayEntries.length,
        totalHoursToday: Math.round(totalHoursToday * 100) / 100,
        notClockedIn: notClockedIn.length,
      },
      activeStaff: activeEntries.map(e => ({
        id: e.staffId,
        name: e.staffName,
        role: e.role,
        roleLabel: ROLE_LABELS[e.role] || e.role,
        roleColorClass: ROLE_COLORS[e.role] || 'bg-gray-100 text-gray-700',
        clockIn: e.clockIn,
        clockInFormatted: format(new Date(e.clockIn), 'HH:mm'),
        hoursWorked: calculateHours(e.clockIn, e.clockOut),
        location: e.location,
        hourlyRate: e.hourlyRate,
      })),
      notClockedStaff: notClockedIn.map(s => ({
        id: s.id,
        name: `${s.firstName} ${s.lastName}`,
        role: s.role,
        roleLabel: ROLE_LABELS[s.role] || s.role,
        roleColorClass: ROLE_COLORS[s.role] || 'bg-gray-100 text-gray-700',
        hourlyRate: s.hourlyRate,
      })),
    });
  }

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
    const existingEntry = DEMO_TIME_ENTRIES.find(e => e.staffId === staffId && !e.clockOut);
    if (existingEntry) {
      return apiError('Cet employé est déjà pointé', 400);
    }

    const staff = DEMO_STAFF.find(s => s.id === staffId);
    if (!staff) {
      return apiError('Employé non trouvé', 404);
    }

    const newEntry = {
      id: `te${Date.now()}`,
      staffId,
      staffName: `${staff.firstName} ${staff.lastName}`,
      role: staff.role,
      clockIn: new Date(),
      clockOut: null,
      location: location || 'Restaurant',
      hourlyRate: staff.hourlyRate,
    };

    DEMO_TIME_ENTRIES.push(newEntry);

    return apiSuccess({
      entry: {
        ...newEntry,
        hoursWorked: 0,
        clockInFormatted: format(newEntry.clockIn, 'HH:mm'),
        clockOutFormatted: null,
        date: format(newEntry.clockIn, 'yyyy-MM-dd'),
        roleLabel: ROLE_LABELS[newEntry.role] || newEntry.role,
        roleColorClass: ROLE_COLORS[newEntry.role] || 'bg-gray-100 text-gray-700',
        status: 'clocked_in',
      },
      message: 'Pointage enregistré avec succès',
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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = clockOutSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { staffId, location } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const entryIndex = DEMO_TIME_ENTRIES.findIndex(e => e.staffId === staffId && !e.clockOut);
    if (entryIndex === -1) {
      return apiError('Aucun pointage actif pour cet employé', 400);
    }

    const entry = DEMO_TIME_ENTRIES[entryIndex];
    entry.clockOut = new Date();

    return apiSuccess({
      entry: {
        ...entry,
        hoursWorked: calculateHours(entry.clockIn, entry.clockOut),
        clockInFormatted: format(entry.clockIn, 'HH:mm'),
        clockOutFormatted: format(entry.clockOut!, 'HH:mm'),
        date: format(entry.clockIn, 'yyyy-MM-dd'),
        roleLabel: ROLE_LABELS[entry.role] || entry.role,
        roleColorClass: ROLE_COLORS[entry.role] || 'bg-gray-100 text-gray-700',
        status: 'clocked_out',
      },
      message: 'Dépointage enregistré avec succès',
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
