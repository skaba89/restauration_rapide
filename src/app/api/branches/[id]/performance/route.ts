import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - Get branch performance analytics
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const period = searchParams.get('period') || 'today'; // today, week, month

  // Production mode - calculate from database
  try {
    const branch = await db.branch.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!branch) {
      return apiError('Succursale non trouvée', 404);
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let previousStart: Date;
    let previousEnd: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(startDate);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        previousStart = new Date(startDate);
        previousStart.setMonth(previousStart.getMonth() - 1);
        previousEnd = new Date(startDate);
        break;
      default: // today
        startDate = new Date(now.setHours(0, 0, 0, 0));
        previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = new Date(startDate);
    }

    // Get orders for current period
    const currentOrders = await db.order.findMany({
      where: {
        restaurantId: branch.mainRestaurantId,
        createdAt: { gte: startDate },
      },
      include: {
        items: true,
      },
    });

    // Get orders for previous period
    const previousOrders = await db.order.findMany({
      where: {
        restaurantId: branch.mainRestaurantId,
        createdAt: { gte: previousStart, lt: previousEnd },
      },
    });

    // Calculate metrics
    const currentRevenue = currentOrders.reduce((sum, o) => sum + o.total, 0);
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
    const revenueChange = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    const orderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    const orderChange = previousOrderCount > 0 
      ? ((orderCount - previousOrderCount) / previousOrderCount) * 100 
      : 0;

    // Build response
    const performance = {
      branchId: id,
      branchName: branch.name,
      period,
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        change: Math.round(revenueChange * 10) / 10,
        trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'stable',
      },
      orders: {
        current: orderCount,
        previous: previousOrderCount,
        change: Math.round(orderChange * 10) / 10,
        trend: orderChange > 0 ? 'up' : orderChange < 0 ? 'down' : 'stable',
      },
      customers: {
        avgOrderValue: orderCount > 0 ? Math.round(currentRevenue / orderCount) : 0,
      },
      rating: branch.rating,
    };

    return apiSuccess(performance);
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la récupération des performances', 500);
  }
});