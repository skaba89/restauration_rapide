// ============================================
// Leave Balances API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Leave type labels
const LEAVE_TYPE_LABELS: Record<string, string> = {
  annual: 'Congés annuels',
  sick: 'Maladie',
  personal: 'Personnel',
  maternity: 'Maternité',
  paternity: 'Paternité',
};

// Validation schema
const createBalanceSchema = z.object({
  staffId: z.string().min(1, 'ID employé requis'),
  year: z.number().min(2020).max(2030),
  leaveType: z.enum(['annual', 'sick', 'personal', 'maternity', 'paternity']),
  totalDays: z.number().min(0),
  usedDays: z.number().min(0).default(0),
  pendingDays: z.number().min(0).default(0),
  remainingDays: z.number().min(0).default(0),
  carriedOver: z.number().min(0).default(0),
  carryOverExpiry: z.string().optional().nullable(),
});

const adjustBalanceSchema = z.object({
  id: z.string().min(1, 'ID solde requis'),
  adjustment: z.number(),
  adjustmentType: z.enum(['add', 'subtract', 'set']),
  reason: z.string().optional().nullable(),
});

// GET - Get leave balances for staff/year
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const year = searchParams.get('year');

  // Real database query
  try {
    const where: Record<string, unknown> = {};

    if (staffId) {
      where.staffId = staffId;
    }
    if (year) {
      where.year = parseInt(year);
    }

    const balances = await db.leaveBalance.findMany({
      where,
      orderBy: [{ year: 'desc' }, { leaveType: 'asc' }],
      include: {
        staff: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return apiSuccess({
      balances: balances.map(b => ({
        ...b,
        staffName: `${b.staff.firstName} ${b.staff.lastName}`,
        leaveTypeLabel: LEAVE_TYPE_LABELS[b.leaveType] || b.leaveType,
      })),
    });
  } catch (error) {
    console.error('Error fetching leave balances:', error);
    return apiError('Erreur lors de la récupération des soldes de congés', 500);
  }
});

// POST - Create/update leave balance
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';

  const validated = createBalanceSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Real database upsert
  try {
    const balance = await db.leaveBalance.upsert({
      where: {
        staffId_year_leaveType: {
          staffId: data.staffId,
          year: data.year,
          leaveType: data.leaveType,
        },
      },
      update: {
        totalDays: data.totalDays,
        usedDays: data.usedDays,
        pendingDays: data.pendingDays,
        remainingDays: data.remainingDays,
        carriedOver: data.carriedOver,
        carryOverExpiry: data.carryOverExpiry ? new Date(data.carryOverExpiry) : null,
      },
      create: {
        staffId: data.staffId,
        year: data.year,
        leaveType: data.leaveType,
        totalDays: data.totalDays,
        usedDays: data.usedDays,
        pendingDays: data.pendingDays,
        remainingDays: data.remainingDays,
        carriedOver: data.carriedOver,
        carryOverExpiry: data.carryOverExpiry ? new Date(data.carryOverExpiry) : null,
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      balance: {
        ...balance,
        staffName: `${balance.staff.firstName} ${balance.staff.lastName}`,
        leaveTypeLabel: LEAVE_TYPE_LABELS[balance.leaveType] || balance.leaveType,
      },
      message: 'Solde de congés mis à jour avec succès',
    });
  } catch (error) {
    console.error('Error updating leave balance:', error);
    return apiError('Erreur lors de la mise à jour du solde de congés', 500);
  }
});

// PUT - Adjust balance (manual adjustment)
export const PUT = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { organizationId, ...updateData } = body;

  const validated = adjustBalanceSchema.safeParse(updateData);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { id, adjustment, adjustmentType, reason } = validated.data;

  // Real database update
  try {
    const currentBalance = await db.leaveBalance.findUnique({
      where: { id },
    });

    if (!currentBalance) {
      return apiError('Solde de congés non trouvé', 404);
    }

    let newRemainingDays = currentBalance.remainingDays;
    let newTotalDays = currentBalance.totalDays;

    if (adjustmentType === 'add') {
      newRemainingDays += adjustment;
      newTotalDays += adjustment;
    } else if (adjustmentType === 'subtract') {
      newRemainingDays = Math.max(0, newRemainingDays - adjustment);
    } else {
      newRemainingDays = adjustment;
    }

    const balance = await db.leaveBalance.update({
      where: { id },
      data: {
        remainingDays: newRemainingDays,
        totalDays: newTotalDays,
      },
      include: {
        staff: { select: { firstName: true, lastName: true } },
      },
    });

    return apiSuccess({
      balance: {
        ...balance,
        staffName: `${balance.staff.firstName} ${balance.staff.lastName}`,
        leaveTypeLabel: LEAVE_TYPE_LABELS[balance.leaveType] || balance.leaveType,
      },
      message: 'Solde ajusté avec succès',
    });
  } catch (error: unknown) {
    console.error('Error adjusting leave balance:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return apiError('Solde de congés non trouvé', 404);
    }
    return apiError('Erreur lors de l\'ajustement du solde', 500);
  }
});