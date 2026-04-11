import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo data for reports
const DEMO_DAILY_DATA = [
  { date: '2024-01-15', total: 25000, count: 8, average: 3125 },
  { date: '2024-01-14', total: 18500, count: 6, average: 3083 },
  { date: '2024-01-13', total: 32000, count: 10, average: 3200 },
  { date: '2024-01-12', total: 15000, count: 5, average: 3000 },
  { date: '2024-01-11', total: 28000, count: 9, average: 3111 },
  { date: '2024-01-10', total: 22000, count: 7, average: 3143 },
  { date: '2024-01-09', total: 19500, count: 6, average: 3250 },
];

const DEMO_STAFF_REPORT = [
  { staffId: 'staff-001', staffName: 'Aïssata Traoré', role: 'waiter', totalEarned: 45000, hoursWorked: 168, tipsPerHour: 268 },
  { staffId: 'staff-002', staffName: 'Moussa Bamba', role: 'waiter', totalEarned: 38000, hoursWorked: 160, tipsPerHour: 238 },
  { staffId: 'staff-003', staffName: 'Mariama Sy', role: 'kitchen', totalEarned: 28000, hoursWorked: 84, tipsPerHour: 333 },
  { staffId: 'staff-004', staffName: 'Ibrahim Koné', role: 'kitchen', totalEarned: 35000, hoursWorked: 168, tipsPerHour: 208 },
  { staffId: 'staff-005', staffName: 'Fatoumata Diallo', role: 'delivery', totalEarned: 22000, hoursWorked: 126, tipsPerHour: 175 },
  { staffId: 'staff-006', staffName: 'Seydou Konaté', role: 'delivery', totalEarned: 19500, hoursWorked: 120, tipsPerHour: 163 },
  { staffId: 'staff-007', staffName: 'Amadou Keita', role: 'waiter', totalEarned: 42000, hoursWorked: 176, tipsPerHour: 239 },
];

// GET - Generate tips report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'week';
    const groupBy = searchParams.get('groupBy') || 'day';
    const demo = searchParams.get('demo') === 'true';

    // Demo mode
    if (demo || !organizationId) {
      return NextResponse.json({
        success: true,
        data: {
          period,
          summary: {
            totalTips: DEMO_DAILY_DATA.reduce((sum, d) => sum + d.total, 0),
            totalAmount: DEMO_DAILY_DATA.reduce((sum, d) => sum + d.total, 0),
            averagePerDay: Math.round(DEMO_DAILY_DATA.reduce((sum, d) => sum + d.total, 0) / DEMO_DAILY_DATA.length),
            tipsCount: DEMO_DAILY_DATA.reduce((sum, d) => sum + d.count, 0),
            byMethod: {
              cash: 125000,
              mobile_money: 45000,
              card: 15000
            }
          },
          dailyData: DEMO_DAILY_DATA,
          staffReport: DEMO_STAFF_REPORT,
          byMethod: {
            cash: 125000,
            mobile_money: 45000,
            card: 15000
          }
        }
      });
    }

    // Build where clause
    const where: Record<string, unknown> = { organizationId };
    if (startDate) {
      where.collectedAt = { ...where.collectedAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.collectedAt = { ...where.collectedAt, lte: new Date(endDate) };
    }

    // Get tips from database
    const tips = await db.tip.findMany({
      where,
      orderBy: { collectedAt: 'desc' }
    });

    // Get distributions
    const distributions = await db.tipDistribution.findMany({
      where: {
        tip: { organizationId }
      },
      include: {
        tip: { select: { amount: true, collectedAt: true } }
      }
    });

    // Calculate summary
    const totalAmount = tips.reduce((sum, t) => sum + t.amount, 0);
    const tipsCount = tips.length;
    const averagePerDay = tipsCount > 0 ? Math.round(totalAmount / 7) : 0;

    // By method
    const byMethod = {
      cash: tips.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0),
      mobile_money: tips.filter(t => t.method === 'mobile_money').reduce((sum, t) => sum + t.amount, 0),
      card: tips.filter(t => t.method === 'card').reduce((sum, t) => sum + t.amount, 0)
    };

    // Daily data
    const dailyMap = new Map<string, { total: number; count: number }>();
    tips.forEach(tip => {
      const date = tip.collectedAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { total: 0, count: 0 };
      dailyMap.set(date, {
        total: existing.total + tip.amount,
        count: existing.count + 1
      });
    });

    const dailyData = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        count: data.count,
        average: Math.round(data.total / data.count)
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30);

    // Staff report
    const staffMap = new Map<string, { 
      staffId: string; 
      staffName: string; 
      role: string; 
      totalEarned: number;
      hoursWorked: number;
    }>();

    // Get staff details
    const staff = await db.staffProfile.findMany({
      where: { organizationId, isActive: true }
    });

    distributions.forEach(dist => {
      const staffInfo = staff.find(s => s.id === dist.staffId);
      if (!staffInfo) return;

      const existing = staffMap.get(dist.staffId) || {
        staffId: dist.staffId,
        staffName: `${staffInfo.firstName} ${staffInfo.lastName}`,
        role: staffInfo.role,
        totalEarned: 0,
        hoursWorked: 160
      };

      existing.totalEarned += dist.amount;
      staffMap.set(dist.staffId, existing);
    });

    const staffReport = Array.from(staffMap.values()).map(s => ({
      ...s,
      tipsPerHour: Math.round(s.totalEarned / s.hoursWorked)
    }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        summary: {
          totalTips: tipsCount,
          totalAmount,
          averagePerDay,
          tipsCount,
          byMethod
        },
        dailyData,
        staffReport,
        byMethod
      }
    });
  } catch (error) {
    console.error('Report GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la génération du rapport'
    }, { status: 500 });
  }
}
