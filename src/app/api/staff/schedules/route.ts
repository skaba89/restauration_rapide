// ============================================
// Staff Schedules API - Shift Management
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { startOfWeek, endOfWeek, addDays, format, parseISO } from 'date-fns';

// Demo shifts data
const DEMO_SHIFTS = [
  // Monday
  { id: 's1', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), startTime: '08:00', endTime: '17:00', status: 'scheduled', notes: 'Réunion direction 10h' },
  { id: 's2', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), startTime: '06:00', endTime: '14:00', status: 'scheduled', notes: '' },
  { id: 's3', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), startTime: '06:00', endTime: '14:00', status: 'scheduled', notes: '' },
  { id: 's4', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's5', staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 0), 'yyyy-MM-dd'), startTime: '08:00', endTime: '16:00', status: 'scheduled', notes: '' },

  // Tuesday
  { id: 's6', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), startTime: '08:00', endTime: '17:00', status: 'scheduled', notes: '' },
  { id: 's7', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), startTime: '06:00', endTime: '14:00', status: 'scheduled', notes: '' },
  { id: 's8', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's9', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's10', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd'), startTime: '11:00', endTime: '22:00', status: 'scheduled', notes: '' },

  // Wednesday
  { id: 's11', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), startTime: '06:00', endTime: '14:00', status: 'scheduled', notes: '' },
  { id: 's12', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), startTime: '06:00', endTime: '14:00', status: 'scheduled', notes: '' },
  { id: 's13', staffId: '8', staffName: 'Fanta Diarra', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's14', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), startTime: '11:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's15', staffId: '9', staffName: 'Oumar Bah', role: 'cleaner', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2), 'yyyy-MM-dd'), startTime: '06:00', endTime: '10:00', status: 'scheduled', notes: 'Ménage matin' },

  // Thursday
  { id: 's16', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), startTime: '08:00', endTime: '17:00', status: 'scheduled', notes: '' },
  { id: 's17', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's18', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },
  { id: 's19', staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3), 'yyyy-MM-dd'), startTime: '10:00', endTime: '18:00', status: 'scheduled', notes: '' },

  // Friday
  { id: 's20', staffId: '1', staffName: 'Amadou Diallo', role: 'manager', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '08:00', endTime: '17:00', status: 'scheduled', notes: '' },
  { id: 's21', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '10:00', endTime: '22:00', status: 'scheduled', notes: 'Service soir busy' },
  { id: 's22', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '10:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's23', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '12:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's24', staffId: '8', staffName: 'Fanta Diarra', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '12:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's25', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4), 'yyyy-MM-dd'), startTime: '11:00', endTime: '23:00', status: 'scheduled', notes: '' },

  // Saturday
  { id: 's26', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '10:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's27', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '10:00', endTime: '22:00', status: 'scheduled', notes: '' },
  { id: 's28', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '11:00', endTime: '23:00', status: 'scheduled', notes: '' },
  { id: 's29', staffId: '8', staffName: 'Fanta Diarra', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '11:00', endTime: '23:00', status: 'scheduled', notes: '' },
  { id: 's30', staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '11:00', endTime: '23:00', status: 'scheduled', notes: '' },
  { id: 's31', staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5), 'yyyy-MM-dd'), startTime: '11:00', endTime: '23:00', status: 'scheduled', notes: '' },

  // Sunday
  { id: 's32', staffId: '2', staffName: 'Fatou Sylla', role: 'chef', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd'), startTime: '10:00', endTime: '20:00', status: 'scheduled', notes: '' },
  { id: 's33', staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd'), startTime: '10:00', endTime: '20:00', status: 'scheduled', notes: '' },
  { id: 's34', staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', date: format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd'), startTime: '11:00', endTime: '21:00', status: 'scheduled', notes: '' },
];

// Role colors for calendar
const ROLE_COLORS: Record<string, string> = {
  manager: '#8B5CF6', // Purple
  chef: '#EF4444', // Red
  cook: '#F97316', // Orange
  waiter: '#3B82F6', // Blue
  cashier: '#10B981', // Green
  delivery_driver: '#F59E0B', // Amber
  cleaner: '#6B7280', // Gray
};

// Validation schemas
const createShiftSchema = z.object({
  staffId: z.string().min(1, 'Employé requis'),
  date: z.string().min(1, 'Date requise'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de début invalide'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Heure de fin invalide'),
  notes: z.string().optional(),
  restaurantId: z.string().optional(),
});

const updateShiftSchema = createShiftSchema.partial();

// GET - Get schedules
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';
  const staffId = searchParams.get('staffId');
  const weekStart = searchParams.get('weekStart');
  const date = searchParams.get('date');

  // Calculate week range
  const startDate = weekStart ? parseISO(weekStart) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

  // Demo mode
  if (demo || !organizationId) {
    let filteredShifts = [...DEMO_SHIFTS];

    if (staffId) {
      filteredShifts = filteredShifts.filter(s => s.staffId === staffId);
    }
    if (date) {
      filteredShifts = filteredShifts.filter(s => s.date === date);
    }
    if (weekStart) {
      const weekStartStr = format(startDate, 'yyyy-MM-dd');
      const weekEndStr = format(endDate, 'yyyy-MM-dd');
      filteredShifts = filteredShifts.filter(s => s.date >= weekStartStr && s.date <= weekEndStr);
    }

    return apiSuccess({
      shifts: filteredShifts.map(s => ({
        ...s,
        color: ROLE_COLORS[s.role] || '#6B7280',
      })),
      weekRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
    });
  }

  // Real database query
  try {
    const where: any = { restaurantId };

    if (staffId) {
      where.staffId = staffId;
    } else {
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const shifts = await db.shift.findMany({
      where,
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return apiSuccess({
      shifts: shifts.map(s => ({
        id: s.id,
        staffId: s.staffId,
        staffName: `${s.staff.firstName} ${s.staff.lastName}`,
        role: s.staff.role,
        date: format(s.date, 'yyyy-MM-dd'),
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
        notes: s.notes,
        color: ROLE_COLORS[s.staff.role] || '#6B7280',
      })),
      weekRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return apiError('Erreur lors de la récupération des plannings', 500);
  }
});

// POST - Create shift
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createShiftSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Validate time range
  if (data.startTime >= data.endTime) {
    return apiError('L\'heure de début doit être avant l\'heure de fin', 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const newShift = {
      id: `s${Date.now()}`,
      staffId: data.staffId,
      staffName: 'Nouvel employé',
      role: 'staff',
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled',
      notes: data.notes || '',
      color: '#6B7280',
    };
    return apiSuccess({ shift: newShift, message: 'Shift créé (mode démo)' });
  }

  // Real database creation
  try {
    // Get staff info
    const staff = await db.staffProfile.findUnique({
      where: { id: data.staffId },
      select: { firstName: true, lastName: true, role: true },
    });

    if (!staff) {
      return apiError('Employé non trouvé', 404);
    }

    const shift = await db.shift.create({
      data: {
        restaurantId: data.restaurantId || organizationId,
        staffId: data.staffId,
        date: parseISO(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: 'scheduled',
      },
    });

    return apiSuccess({
      shift: {
        ...shift,
        date: format(shift.date, 'yyyy-MM-dd'),
        staffName: `${staff.firstName} ${staff.lastName}`,
        role: staff.role,
        color: ROLE_COLORS[staff.role] || '#6B7280',
      },
      message: 'Shift créé avec succès',
    });
  } catch (error) {
    console.error('Error creating shift:', error);
    return apiError('Erreur lors de la création du shift', 500);
  }
});

// PUT - Update shift
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { id, demo, organizationId, ...updateData } = body;

  if (!id) {
    return apiError('ID du shift requis', 400);
  }

  const validated = updateShiftSchema.safeParse(updateData);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Validate time range if both times provided
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    return apiError('L\'heure de début doit être avant l\'heure de fin', 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const existingShift = DEMO_SHIFTS.find(s => s.id === id);
    if (!existingShift) {
      return apiError('Shift non trouvé', 404);
    }

    const updatedShift = {
      ...existingShift,
      ...data,
    };
    return apiSuccess({ shift: updatedShift, message: 'Shift mis à jour (mode démo)' });
  }

  // Real database update
  try {
    const shift = await db.shift.update({
      where: { id },
      data: {
        date: data.date ? parseISO(data.date) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        status: updateData.status,
      },
      include: {
        staff: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });

    return apiSuccess({
      shift: {
        ...shift,
        date: format(shift.date, 'yyyy-MM-dd'),
        staffName: `${shift.staff.firstName} ${shift.staff.lastName}`,
        role: shift.staff.role,
        color: ROLE_COLORS[shift.staff.role] || '#6B7280',
      },
      message: 'Shift mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Error updating shift:', error);
    if (error.code === 'P2025') {
      return apiError('Shift non trouvé', 404);
    }
    return apiError('Erreur lors de la mise à jour du shift', 500);
  }
});

// DELETE - Delete shift
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';

  if (!id) {
    return apiError('ID du shift requis', 400);
  }

  // Demo mode
  if (demo || !organizationId) {
    const existingShift = DEMO_SHIFTS.find(s => s.id === id);
    if (!existingShift) {
      return apiError('Shift non trouvé', 404);
    }
    return apiSuccess({ message: 'Shift supprimé (mode démo)' });
  }

  // Real database deletion
  try {
    await db.shift.delete({ where: { id } });
    return apiSuccess({ message: 'Shift supprimé avec succès' });
  } catch (error: any) {
    console.error('Error deleting shift:', error);
    if (error.code === 'P2025') {
      return apiError('Shift non trouvé', 404);
    }
    return apiError('Erreur lors de la suppression du shift', 500);
  }
});
