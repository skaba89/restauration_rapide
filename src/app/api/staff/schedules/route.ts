// ============================================
// Staff Schedules API - Shift Management
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler, getPagination } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';
import { startOfWeek, endOfWeek, addDays, format, parseISO } from 'date-fns';

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
  const organizationId = searchParams.get('organizationId') || '';
  const restaurantId = searchParams.get('restaurantId') || '';
  const staffId = searchParams.get('staffId');
  const weekStart = searchParams.get('weekStart');
  const date = searchParams.get('date');

  // Calculate week range
  const startDate = weekStart ? parseISO(weekStart) : startOfWeek(new Date(), { weekStartsOn: 1 });
  const endDate = endOfWeek(startDate, { weekStartsOn: 1 });

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
  const { id, organizationId, ...updateData } = body;

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
  const organizationId = searchParams.get('organizationId') || '';

  if (!id) {
    return apiError('ID du shift requis', 400);
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