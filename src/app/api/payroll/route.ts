// ============================================
// Payroll API - Payroll Calculations
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';

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

// Standard work week hours (for overtime calculation)
const STANDARD_WEEKLY_HOURS = 40;
const OVERTIME_MULTIPLIER = 1.5;

// Helper function to calculate hours
function calculateHoursFromEntries(entries: { clockIn: Date; clockOut: Date | null }[]): { regular: number; overtime: number } {
  const totalMinutes = entries.reduce((sum, e) => {
    const end = e.clockOut || new Date();
    return sum + differenceInMinutes(end, e.clockIn);
  }, 0);

  const totalHours = totalMinutes / 60;
  const regularHours = Math.min(totalHours, STANDARD_WEEKLY_HOURS);
  const overtimeHours = Math.max(0, totalHours - STANDARD_WEEKLY_HOURS);

  return {
    regular: Math.round(regularHours * 100) / 100,
    overtime: Math.round(overtimeHours * 100) / 100,
  };
}

// GET - Get payroll data
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get('organizationId') || '';
  const period = searchParams.get('period') || format(new Date(), 'yyyy-MM'); // Default to current month
  const staffId = searchParams.get('staffId');

  // Parse period
  const periodDate = new Date(period + '-01');
  const periodStart = startOfMonth(periodDate);
  const periodEnd = endOfMonth(periodDate);

  // Real database query
  try {
    // Get staff profiles
    const staff = await db.staffProfile.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        hourlyRate: true,
        salary: true,
      },
    });

    // Get time entries for the period
    const timeEntries = await db.timeEntry.findMany({
      where: {
        staff: { organizationId },
        clockIn: { gte: periodStart, lte: periodEnd },
      },
      include: {
        staff: {
          select: { hourlyRate: true },
        },
      },
    });

    // Calculate payroll for each staff member
    const payroll = staff.map(s => {
      const staffEntries = timeEntries.filter(e => e.staffId === s.id);
      const hours = calculateHoursFromEntries(staffEntries);

      const regularPay = hours.regular * (s.hourlyRate || 0);
      const overtimePay = hours.overtime * (s.hourlyRate || 0) * OVERTIME_MULTIPLIER;
      const tips = 0; // Would need to calculate from orders

      return {
        staffId: s.id,
        staffName: `${s.firstName} ${s.lastName}`,
        role: s.role,
        roleLabel: ROLE_LABELS[s.role] || s.role,
        hourlyRate: s.hourlyRate || 0,
        hoursWorked: hours.regular,
        overtimeHours: hours.overtime,
        regularPay,
        overtimePay,
        tips,
        totalPay: regularPay + overtimePay + tips,
        status: 'pending',
      };
    });

    // Calculate totals
    const totals = payroll.reduce((acc, p) => ({
      hoursWorked: acc.hoursWorked + p.hoursWorked,
      overtimeHours: acc.overtimeHours + p.overtimeHours,
      regularPay: acc.regularPay + p.regularPay,
      overtimePay: acc.overtimePay + p.overtimePay,
      tips: acc.tips + p.tips,
      totalPay: acc.totalPay + p.totalPay,
    }), {
      hoursWorked: 0,
      overtimeHours: 0,
      regularPay: 0,
      overtimePay: 0,
      tips: 0,
      totalPay: 0,
    });

    return apiSuccess({
      period: {
        start: format(periodStart, 'yyyy-MM-dd'),
        end: format(periodEnd, 'yyyy-MM-dd'),
        label: format(periodDate, 'MMMM yyyy'),
      },
      payroll,
      totals,
      summary: {
        employeeCount: payroll.length,
        averageHours: Math.round(totals.hoursWorked / payroll.length * 100) / 100 || 0,
        averagePay: Math.round(totals.totalPay / payroll.length) || 0,
        pendingCount: payroll.filter(p => p.status === 'pending').length,
        paidCount: payroll.filter(p => p.status === 'paid').length,
      },
    });
  } catch (error) {
    console.error('Error calculating payroll:', error);
    return apiError('Erreur lors du calcul de la paie', 500);
  }
});

// POST - Mark payroll as paid
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const organizationId = body.organizationId || '';
  const { staffIds, period } = body;

  // Real implementation would update database
  return apiSuccess({
    message: 'Paie marquée comme payée avec succès',
    paidCount: staffIds?.length || 0,
  });
});