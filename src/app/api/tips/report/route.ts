import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Generate tips report
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get('organizationId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'week';
    const groupBy = searchParams.get('groupBy') || 'day';

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