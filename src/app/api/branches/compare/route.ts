import { NextRequest } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - Compare branches performance
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  const branchIds = searchParams.get('branchIds')?.split(',') || [];
  const period = searchParams.get('period') || 'today';

  // Production mode
  try {
    // Get all branches for organization
    const where: any = { organizationId };
    if (branchIds.length > 0) {
      where.id = { in: branchIds };
    }

    const branches = await db.branch.findMany({
      where,
      include: {
        settings: true,
      },
    });

    // Calculate comparison metrics
    const comparisonData = await Promise.all(
      branches.map(async (branch) => {
        // Get orders for this branch's restaurant
        const orders = await db.order.findMany({
          where: {
            restaurantId: branch.mainRestaurantId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        });

        const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const todayOrders = orders.length;
        const avgOrderValue = todayOrders > 0 ? todayRevenue / todayOrders : 0;

        return {
          id: branch.id,
          name: branch.name,
          city: branch.city,
          status: branch.status,
          isMain: branch.isMain,
          metrics: {
            revenue: { today: todayRevenue, change: 0 },
            orders: { today: todayOrders, change: 0 },
            avgOrderValue: { value: avgOrderValue, change: 0 },
            rating: { value: branch.rating, total: 0 },
            staff: { total: branch.totalStaff },
          },
          growth: { daily: 0, trend: 'stable' },
        };
      })
    );

    // Calculate summary
    const summary = {
      totalRevenue: {
        today: comparisonData.reduce((sum, b) => sum + b.metrics.revenue.today, 0),
      },
      totalOrders: {
        today: comparisonData.reduce((sum, b) => sum + b.metrics.orders.today, 0),
      },
      avgRating: branches.reduce((sum, b) => sum + b.rating, 0) / branches.length || 0,
      totalStaff: branches.reduce((sum, b) => sum + b.totalStaff, 0),
      activeBranches: branches.filter(b => b.status === 'ACTIVE').length,
      totalBranches: branches.length,
    };

    return apiSuccess({
      branches: comparisonData,
      summary,
      period,
    });
  } catch (error) {
    console.error('Database error:', error);
    return apiError('Erreur lors de la comparaison des succursales', 500);
  }
});