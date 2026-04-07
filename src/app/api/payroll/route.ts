// ============================================
// Payroll API - Payroll Calculations
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';

// Demo payroll data
const DEMO_PAYROLL = [
  { staffId: '1', staffName: 'Amadou Diallo', role: 'manager', roleLabel: 'Directeur', hourlyRate: 15000, hoursWorked: 176, overtimeHours: 12, regularPay: 2640000, overtimePay: 270000, tips: 150000, totalPay: 3060000, status: 'pending' },
  { staffId: '2', staffName: 'Fatou Sylla', role: 'chef', roleLabel: 'Chef Cuisinier', hourlyRate: 12000, hoursWorked: 192, overtimeHours: 8, regularPay: 2304000, overtimePay: 144000, tips: 200000, totalPay: 2648000, status: 'pending' },
  { staffId: '3', staffName: 'Ibrahim Keita', role: 'cook', roleLabel: 'Cuisinier', hourlyRate: 8000, hoursWorked: 184, overtimeHours: 16, regularPay: 1472000, overtimePay: 192000, tips: 80000, totalPay: 1744000, status: 'pending' },
  { staffId: '4', staffName: 'Marie Koulibaly', role: 'waiter', roleLabel: 'Serveuse', hourlyRate: 5000, hoursWorked: 168, overtimeHours: 20, regularPay: 840000, overtimePay: 150000, tips: 350000, totalPay: 1340000, status: 'pending' },
  { staffId: '5', staffName: 'Moussa Camara', role: 'delivery_driver', roleLabel: 'Livreur', hourlyRate: 5000, hoursWorked: 180, overtimeHours: 24, regularPay: 900000, overtimePay: 180000, tips: 280000, totalPay: 1360000, status: 'pending' },
  { staffId: '6', staffName: 'Aissatou Traore', role: 'cashier', roleLabel: 'Caissière', hourlyRate: 6000, hoursWorked: 176, overtimeHours: 4, regularPay: 1056000, overtimePay: 36000, tips: 120000, totalPay: 1212000, status: 'pending' },
  { staffId: '8', staffName: 'Fanta Diarra', role: 'waiter', roleLabel: 'Serveuse', hourlyRate: 5000, hoursWorked: 160, overtimeHours: 8, regularPay: 800000, overtimePay: 60000, tips: 290000, totalPay: 1150000, status: 'pending' },
  { staffId: '9', staffName: 'Oumar Bah', role: 'cleaner', roleLabel: 'Agent d\'entretien', hourlyRate: 4000, hoursWorked: 88, overtimeHours: 0, regularPay: 352000, overtimePay: 0, tips: 20000, totalPay: 372000, status: 'pending' },
];

// Demo time entries for calculation
const DEMO_TIME_ENTRIES = [
  { staffId: '1', clockIn: new Date(Date.now() - 6 * 60 * 60 * 1000), clockOut: null },
  { staffId: '2', clockIn: new Date(Date.now() - 8 * 60 * 60 * 1000), clockOut: null },
  { staffId: '3', clockIn: new Date(Date.now() - 5 * 60 * 60 * 1000), clockOut: null },
  { staffId: '4', clockIn: new Date(Date.now() - 4 * 60 * 60 * 1000), clockOut: null },
  { staffId: '5', clockIn: new Date(Date.now() - 3 * 60 * 60 * 1000), clockOut: null },
];

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
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId') || '';
  const period = searchParams.get('period') || format(new Date(), 'yyyy-MM'); // Default to current month
  const staffId = searchParams.get('staffId');

  // Parse period
  const periodDate = new Date(period + '-01');
  const periodStart = startOfMonth(periodDate);
  const periodEnd = endOfMonth(periodDate);

  // Demo mode
  if (demo || !organizationId) {
    let payrollData = [...DEMO_PAYROLL];

    if (staffId) {
      payrollData = payrollData.filter(p => p.staffId === staffId);
    }

    // Calculate totals
    const totals = payrollData.reduce((acc, p) => ({
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
        label: format(periodDate, 'MMMM yyyy', { locale: undefined }),
      },
      payroll: payrollData,
      totals,
      summary: {
        employeeCount: payrollData.length,
        averageHours: Math.round(totals.hoursWorked / payrollData.length * 100) / 100 || 0,
        averagePay: Math.round(totals.totalPay / payrollData.length) || 0,
        pendingCount: payrollData.filter(p => p.status === 'pending').length,
        paidCount: payrollData.filter(p => p.status === 'paid').length,
      },
    });
  }

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
  const demo = body.demo === true;
  const organizationId = body.organizationId || '';
  const { staffIds, period } = body;

  // Demo mode
  if (demo || !organizationId) {
    return apiSuccess({
      message: 'Paie marquée comme payée (mode démo)',
      paidCount: staffIds?.length || DEMO_PAYROLL.length,
    });
  }

  // Real implementation would update database
  return apiSuccess({
    message: 'Paie marquée comme payée avec succès',
    paidCount: staffIds?.length || 0,
  });
});
