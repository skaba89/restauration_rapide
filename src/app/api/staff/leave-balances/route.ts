// ============================================
// Leave Balances API - KFM DELICE
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { z } from 'zod';

// Demo leave balances data for KFM DELICE
const DEMO_LEAVE_BALANCES = [
  // Amadou Diallo - 2024
  { id: '1', staffId: '1', staffName: 'Amadou Diallo', year: 2024, leaveType: 'annual', totalDays: 30, usedDays: 8, pendingDays: 2, remainingDays: 20, carriedOver: 5, carryOverExpiry: new Date('2024-03-31') },
  { id: '2', staffId: '1', staffName: 'Amadou Diallo', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 3, pendingDays: 0, remainingDays: 7, carriedOver: 0, carryOverExpiry: null },
  { id: '3', staffId: '1', staffName: 'Amadou Diallo', year: 2024, leaveType: 'personal', totalDays: 3, usedDays: 1, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },

  // Fatou Sylla - 2024
  { id: '11', staffId: '2', staffName: 'Fatou Sylla', year: 2024, leaveType: 'annual', totalDays: 30, usedDays: 12, pendingDays: 5, remainingDays: 13, carriedOver: 0, carryOverExpiry: null },
  { id: '12', staffId: '2', staffName: 'Fatou Sylla', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 4, pendingDays: 0, remainingDays: 6, carriedOver: 0, carryOverExpiry: null },
  { id: '13', staffId: '2', staffName: 'Fatou Sylla', year: 2024, leaveType: 'personal', totalDays: 3, usedDays: 0, pendingDays: 0, remainingDays: 3, carriedOver: 0, carryOverExpiry: null },

  // Ibrahim Keita - 2024
  { id: '21', staffId: '3', staffName: 'Ibrahim Keita', year: 2024, leaveType: 'annual', totalDays: 25, usedDays: 6, pendingDays: 0, remainingDays: 19, carriedOver: 0, carryOverExpiry: null },
  { id: '22', staffId: '3', staffName: 'Ibrahim Keita', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 5, pendingDays: 0, remainingDays: 5, carriedOver: 0, carryOverExpiry: null },
  { id: '23', staffId: '3', staffName: 'Ibrahim Keita', year: 2024, leaveType: 'personal', totalDays: 2, usedDays: 0, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },

  // Marie Koulibaly - 2024
  { id: '31', staffId: '4', staffName: 'Marie Koulibaly', year: 2024, leaveType: 'annual', totalDays: 25, usedDays: 4, pendingDays: 3, remainingDays: 18, carriedOver: 0, carryOverExpiry: null },
  { id: '32', staffId: '4', staffName: 'Marie Koulibaly', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 2, pendingDays: 0, remainingDays: 8, carriedOver: 0, carryOverExpiry: null },
  { id: '33', staffId: '4', staffName: 'Marie Koulibaly', year: 2024, leaveType: 'personal', totalDays: 2, usedDays: 0, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },

  // Moussa Camara - 2024
  { id: '41', staffId: '5', staffName: 'Moussa Camara', year: 2024, leaveType: 'annual', totalDays: 22, usedDays: 3, pendingDays: 0, remainingDays: 19, carriedOver: 0, carryOverExpiry: null },
  { id: '42', staffId: '5', staffName: 'Moussa Camara', year: 2024, leaveType: 'sick', totalDays: 8, usedDays: 0, pendingDays: 0, remainingDays: 8, carriedOver: 0, carryOverExpiry: null },
  { id: '43', staffId: '5', staffName: 'Moussa Camara', year: 2024, leaveType: 'personal', totalDays: 2, usedDays: 0, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },

  // Aissatou Traore - 2024
  { id: '51', staffId: '6', staffName: 'Aissatou Traore', year: 2024, leaveType: 'annual', totalDays: 25, usedDays: 5, pendingDays: 2, remainingDays: 18, carriedOver: 0, carryOverExpiry: null },
  { id: '52', staffId: '6', staffName: 'Aissatou Traore', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 1, pendingDays: 0, remainingDays: 9, carriedOver: 0, carryOverExpiry: null },
  { id: '53', staffId: '6', staffName: 'Aissatou Traore', year: 2024, leaveType: 'maternity', totalDays: 90, usedDays: 0, pendingDays: 0, remainingDays: 90, carriedOver: 0, carryOverExpiry: null },

  // Sekou Konate - 2024 (inactive)
  { id: '61', staffId: '7', staffName: 'Sekou Konate', year: 2024, leaveType: 'annual', totalDays: 25, usedDays: 10, pendingDays: 0, remainingDays: 15, carriedOver: 0, carryOverExpiry: null },
  { id: '62', staffId: '7', staffName: 'Sekou Konate', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 3, pendingDays: 0, remainingDays: 7, carriedOver: 0, carryOverExpiry: null },

  // Fanta Diarra - 2024
  { id: '71', staffId: '8', staffName: 'Fanta Diarra', year: 2024, leaveType: 'annual', totalDays: 25, usedDays: 2, pendingDays: 0, remainingDays: 23, carriedOver: 0, carryOverExpiry: null },
  { id: '72', staffId: '8', staffName: 'Fanta Diarra', year: 2024, leaveType: 'sick', totalDays: 10, usedDays: 0, pendingDays: 0, remainingDays: 10, carriedOver: 0, carryOverExpiry: null },
  { id: '73', staffId: '8', staffName: 'Fanta Diarra', year: 2024, leaveType: 'personal', totalDays: 2, usedDays: 0, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },

  // Oumar Bah - 2024
  { id: '81', staffId: '9', staffName: 'Oumar Bah', year: 2024, leaveType: 'annual', totalDays: 22, usedDays: 1, pendingDays: 0, remainingDays: 21, carriedOver: 0, carryOverExpiry: null },
  { id: '82', staffId: '9', staffName: 'Oumar Bah', year: 2024, leaveType: 'sick', totalDays: 8, usedDays: 0, pendingDays: 0, remainingDays: 8, carriedOver: 0, carryOverExpiry: null },

  // Adama Sow - 2024 (inactive)
  { id: '91', staffId: '10', staffName: 'Adama Sow', year: 2024, leaveType: 'annual', totalDays: 22, usedDays: 0, pendingDays: 0, remainingDays: 22, carriedOver: 0, carryOverExpiry: null },
  { id: '92', staffId: '10', staffName: 'Adama Sow', year: 2024, leaveType: 'sick', totalDays: 8, usedDays: 0, pendingDays: 0, remainingDays: 8, carriedOver: 0, carryOverExpiry: null },

  // Previous year examples for Amadou
  { id: '101', staffId: '1', staffName: 'Amadou Diallo', year: 2023, leaveType: 'annual', totalDays: 30, usedDays: 28, pendingDays: 0, remainingDays: 2, carriedOver: 0, carryOverExpiry: null },
  { id: '102', staffId: '1', staffName: 'Amadou Diallo', year: 2023, leaveType: 'sick', totalDays: 10, usedDays: 6, pendingDays: 0, remainingDays: 4, carriedOver: 0, carryOverExpiry: null },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const staffId = searchParams.get('staffId');
  const year = searchParams.get('year');

  // Return demo data
  if (demo || !organizationId) {
    let filteredBalances = [...DEMO_LEAVE_BALANCES];

    if (staffId) {
      filteredBalances = filteredBalances.filter(b => b.staffId === staffId);
    }
    if (year) {
      filteredBalances = filteredBalances.filter(b => b.year === parseInt(year));
    }

    return apiSuccess({
      balances: filteredBalances.map(b => ({
        ...b,
        leaveTypeLabel: LEAVE_TYPE_LABELS[b.leaveType] || b.leaveType,
      })),
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';

  const validated = createBalanceSchema.safeParse(body);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const data = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    return apiSuccess({
      balance: {
        id: `${Date.now()}`,
        ...data,
        carryOverExpiry: data.carryOverExpiry ? new Date(data.carryOverExpiry) : null,
        staffName: 'Employé',
        leaveTypeLabel: LEAVE_TYPE_LABELS[data.leaveType] || data.leaveType,
      },
      message: 'Solde de congés mis à jour (mode démo)',
    });
  }

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
  const { demo, organizationId, ...updateData } = body;

  const validated = adjustBalanceSchema.safeParse(updateData);
  if (!validated.success) {
    return apiError('Données invalides: ' + validated.error.errors[0].message, 400);
  }

  const { id, adjustment, adjustmentType, reason } = validated.data;

  // Demo mode
  if (demo || !organizationId) {
    const existingBalance = DEMO_LEAVE_BALANCES.find(b => b.id === id);
    if (!existingBalance) {
      return apiError('Solde de congés non trouvé', 404);
    }

    let newRemainingDays = existingBalance.remainingDays;
    let newTotalDays = existingBalance.totalDays;

    if (adjustmentType === 'add') {
      newRemainingDays += adjustment;
      newTotalDays += adjustment;
    } else if (adjustmentType === 'subtract') {
      newRemainingDays = Math.max(0, newRemainingDays - adjustment);
    } else {
      newRemainingDays = adjustment;
    }

    const updatedBalance = {
      ...existingBalance,
      remainingDays: newRemainingDays,
      totalDays: newTotalDays,
    };

    return apiSuccess({
      balance: {
        ...updatedBalance,
        leaveTypeLabel: LEAVE_TYPE_LABELS[updatedBalance.leaveType] || updatedBalance.leaveType,
      },
      message: 'Solde ajusté (mode démo)',
    });
  }

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
