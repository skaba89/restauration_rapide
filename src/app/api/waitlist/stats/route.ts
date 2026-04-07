import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get waitlist statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || 'today'; // today, week, month
    const demo = searchParams.get('demo') === 'true';

    // Demo data
    if (demo || !restaurantId) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Generate demo stats
      const demoStats = {
        current: {
          waiting: 5,
          notified: 2,
          averageWaitTime: 25,
          longestWait: 45,
          shortestWait: 5,
          totalParties: 7,
          totalGuests: 24,
        },
        today: {
          totalEntries: 23,
          seated: 18,
          cancelled: 2,
          noShows: 1,
          averageWaitTime: 22,
          averageQuotedTime: 25,
          accuracyRate: 88, // Percentage of accurate quotes
          peakHour: '19:00',
          peakWaitTime: 45,
        },
        trends: {
          waitTimeChange: -5, // Percentage change from yesterday
          volumeChange: 12, // Percentage change from yesterday
          seatingRate: 78, // Percentage of entries that were seated
        },
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          entries: i >= 11 && i <= 21 ? Math.floor(Math.random() * 5) + 1 : 0,
          avgWait: i >= 11 && i <= 21 ? Math.floor(Math.random() * 20) + 10 : 0,
        })),
        partySizeDistribution: [
          { size: '1-2', count: 8, percentage: 35 },
          { size: '3-4', count: 10, percentage: 43 },
          { size: '5-6', count: 3, percentage: 13 },
          { size: '7+', count: 2, percentage: 9 },
        ],
        areaPreferences: [
          { area: 'Intérieur', count: 12, percentage: 52 },
          { area: 'Terrasse', count: 8, percentage: 35 },
          { area: 'VIP', count: 3, percentage: 13 },
        ],
      };

      return NextResponse.json({
        success: true,
        data: demoStats,
        period,
        generatedAt: new Date().toISOString(),
      });
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    // Get all entries for the period
    const entries = await db.waitlistEntry.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startDate },
      },
      select: {
        id: true,
        status: true,
        partySize: true,
        preferredArea: true,
        quotedWait: true,
        estimatedWait: true,
        createdAt: true,
        seatedAt: true,
        notifiedAt: true,
        priority: true,
      },
    });

    // Calculate current stats
    const currentWaiting = entries.filter(e => e.status === 'WAITING');
    const currentNotified = entries.filter(e => e.status === 'NOTIFIED');

    const waitTimes = currentWaiting
      .map(e => {
        const created = new Date(e.createdAt);
        return Math.round((now.getTime() - created.getTime()) / (1000 * 60));
      })
      .filter(t => t >= 0);

    // Calculate today's stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEntries = entries.filter(e => new Date(e.createdAt) >= todayStart);
    const todaySeated = todayEntries.filter(e => e.status === 'SEATED');
    const todayCancelled = todayEntries.filter(e => e.status === 'CANCELLED');

    // Calculate actual wait times for seated entries
    const seatedWaitTimes = todaySeated
      .filter(e => e.seatedAt)
      .map(e => {
        const created = new Date(e.createdAt);
        const seated = new Date(e.seatedAt!);
        return Math.round((seated.getTime() - created.getTime()) / (1000 * 60));
      });

    // Calculate quote accuracy
    const quoteAccuracies = todaySeated
      .filter(e => e.quotedWait && e.seatedAt)
      .map(e => {
        const created = new Date(e.createdAt);
        const seated = new Date(e.seatedAt!);
        const actual = Math.round((seated.getTime() - created.getTime()) / (1000 * 60));
        const quoted = e.quotedWait!;
        return Math.abs(actual - quoted) <= 5; // Within 5 minutes is accurate
      });
    const accuracyRate = quoteAccuracies.length > 0
      ? Math.round((quoteAccuracies.filter(Boolean).length / quoteAccuracies.length) * 100)
      : 0;

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hourEntries = todayEntries.filter(e => new Date(e.createdAt).getHours() === i);
      const hourSeated = hourEntries.filter(e => e.seatedAt);
      const avgWait = hourSeated.length > 0
        ? Math.round(hourSeated.reduce((sum, e) => {
            const created = new Date(e.createdAt);
            const seated = new Date(e.seatedAt!);
            return sum + Math.round((seated.getTime() - created.getTime()) / (1000 * 60));
          }, 0) / hourSeated.length)
        : 0;
      return {
        hour: `${i.toString().padStart(2, '0')}:00`,
        entries: hourEntries.length,
        avgWait,
      };
    });

    // Find peak hour
    const peakHourData = hourlyData.reduce((max, h) => h.entries > max.entries ? h : max, hourlyData[0]);

    // Party size distribution
    const partySizes = todayEntries.reduce((acc, e) => {
      let key: string;
      if (e.partySize <= 2) key = '1-2';
      else if (e.partySize <= 4) key = '3-4';
      else if (e.partySize <= 6) key = '5-6';
      else key = '7+';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const partySizeDistribution = Object.entries(partySizes).map(([size, count]) => ({
      size,
      count,
      percentage: Math.round((count / todayEntries.length) * 100),
    }));

    // Area preferences
    const areaPrefs = todayEntries.reduce((acc, e) => {
      if (e.preferredArea) {
        acc[e.preferredArea] = (acc[e.preferredArea] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const areaPreferences = Object.entries(areaPrefs).map(([area, count]) => ({
      area,
      count,
      percentage: Math.round((count / todayEntries.length) * 100),
    }));

    const stats = {
      current: {
        waiting: currentWaiting.length,
        notified: currentNotified.length,
        averageWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
        longestWait: waitTimes.length > 0 ? Math.max(...waitTimes) : 0,
        shortestWait: waitTimes.length > 0 ? Math.min(...waitTimes) : 0,
        totalParties: currentWaiting.length + currentNotified.length,
        totalGuests: currentWaiting.reduce((sum, e) => sum + e.partySize, 0) + currentNotified.reduce((sum, e) => sum + e.partySize, 0),
      },
      today: {
        totalEntries: todayEntries.length,
        seated: todaySeated.length,
        cancelled: todayCancelled.length,
        noShows: todayEntries.filter(e => e.status === 'EXPIRED').length,
        averageWaitTime: seatedWaitTimes.length > 0 ? Math.round(seatedWaitTimes.reduce((a, b) => a + b, 0) / seatedWaitTimes.length) : 0,
        averageQuotedTime: Math.round(todayEntries.filter(e => e.quotedWait).reduce((sum, e) => sum + (e.quotedWait || 0), 0) / Math.max(1, todayEntries.filter(e => e.quotedWait).length)),
        accuracyRate,
        peakHour: peakHourData.hour,
        peakWaitTime: peakHourData.avgWait,
      },
      trends: {
        waitTimeChange: 0, // Would need historical data
        volumeChange: 0,
        seatingRate: todayEntries.length > 0 ? Math.round((todaySeated.length / todayEntries.length) * 100) : 0,
      },
      hourlyData,
      partySizeDistribution,
      areaPreferences,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      period,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
