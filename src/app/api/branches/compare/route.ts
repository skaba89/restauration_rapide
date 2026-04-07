import { NextRequest } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo comparison data
const DEMO_COMPARISON = {
  branches: [
    {
      id: 'branch-001',
      name: 'KFM DELICE - Kaloum',
      city: 'Kaloum',
      status: 'ACTIVE',
      isMain: true,
      metrics: {
        revenue: { today: 2850000, week: 18950000, month: 85200000, change: 13.1 },
        orders: { today: 145, week: 1015, month: 4350, change: 13.3 },
        avgOrderValue: { value: 19655, change: -0.2 },
        customers: { new: 28, returning: 117, retention: 80.7 },
        delivery: { orders: 62, avgTime: 28, onTimeRate: 94 },
        rating: { value: 4.8, total: 45, change: 0.1 },
        staff: { total: 8, avgOrdersPerStaff: 20.7 },
        kitchen: { avgPrepTime: 15, utilization: 72 },
      },
      growth: {
        daily: 13.1,
        weekly: 8.5,
        monthly: 12.3,
        trend: 'up',
      },
    },
    {
      id: 'branch-002',
      name: 'KFM DELICE - Dixinn',
      city: 'Dixinn',
      status: 'ACTIVE',
      isMain: false,
      metrics: {
        revenue: { today: 4150000, week: 27650000, month: 124500000, change: 17.9 },
        orders: { today: 210, week: 1470, month: 6300, change: 20.0 },
        avgOrderValue: { value: 19762, change: -1.7 },
        customers: { new: 42, returning: 168, retention: 80.0 },
        delivery: { orders: 95, avgTime: 25, onTimeRate: 96 },
        rating: { value: 4.6, total: 62, change: -0.1 },
        staff: { total: 12, avgOrdersPerStaff: 21.0 },
        kitchen: { avgPrepTime: 12, utilization: 85 },
      },
      growth: {
        daily: 17.9,
        weekly: 15.2,
        monthly: 18.7,
        trend: 'up',
      },
    },
    {
      id: 'branch-003',
      name: 'KFM DELICE - Matam',
      city: 'Matam',
      status: 'ACTIVE',
      isMain: false,
      metrics: {
        revenue: { today: 1850000, week: 12950000, month: 55500000, change: 7.6 },
        orders: { today: 85, week: 595, month: 2550, change: 9.0 },
        avgOrderValue: { value: 21765, change: -1.3 },
        customers: { new: 18, returning: 67, retention: 78.8 },
        delivery: { orders: 32, avgTime: 32, onTimeRate: 88 },
        rating: { value: 4.7, total: 28, change: 0.2 },
        staff: { total: 6, avgOrdersPerStaff: 17.0 },
        kitchen: { avgPrepTime: 18, utilization: 55 },
      },
      growth: {
        daily: 7.6,
        weekly: 5.3,
        monthly: 8.1,
        trend: 'up',
      },
    },
    {
      id: 'branch-004',
      name: 'KFM DELICE - Ratoma',
      city: 'Ratoma',
      status: 'CONSTRUCTION',
      isMain: false,
      metrics: {
        revenue: { today: 0, week: 0, month: 0, change: 0 },
        orders: { today: 0, week: 0, month: 0, change: 0 },
        avgOrderValue: { value: 0, change: 0 },
        customers: { new: 0, returning: 0, retention: 0 },
        delivery: { orders: 0, avgTime: 0, onTimeRate: 0 },
        rating: { value: 0, total: 0, change: 0 },
        staff: { total: 0, avgOrdersPerStaff: 0 },
        kitchen: { avgPrepTime: 0, utilization: 0 },
      },
      growth: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        trend: 'stable',
      },
    },
  ],
  summary: {
    totalRevenue: { today: 8850000, week: 59550000, month: 265200000 },
    totalOrders: { today: 440, week: 3080, month: 13200 },
    avgRating: 4.7,
    totalStaff: 26,
    activeBranches: 3,
    totalBranches: 4,
  },
  rankings: {
    revenue: [
      { branchId: 'branch-002', name: 'Dixinn', value: 4150000, rank: 1 },
      { branchId: 'branch-001', name: 'Kaloum', value: 2850000, rank: 2 },
      { branchId: 'branch-003', name: 'Matam', value: 1850000, rank: 3 },
    ],
    orders: [
      { branchId: 'branch-002', name: 'Dixinn', value: 210, rank: 1 },
      { branchId: 'branch-001', name: 'Kaloum', value: 145, rank: 2 },
      { branchId: 'branch-003', name: 'Matam', value: 85, rank: 3 },
    ],
    rating: [
      { branchId: 'branch-001', name: 'Kaloum', value: 4.8, rank: 1 },
      { branchId: 'branch-003', name: 'Matam', value: 4.7, rank: 2 },
      { branchId: 'branch-002', name: 'Dixinn', value: 4.6, rank: 3 },
    ],
    growth: [
      { branchId: 'branch-002', name: 'Dixinn', value: 17.9, rank: 1 },
      { branchId: 'branch-001', name: 'Kaloum', value: 13.1, rank: 2 },
      { branchId: 'branch-003', name: 'Matam', value: 7.6, rank: 3 },
    ],
    efficiency: [
      { branchId: 'branch-002', name: 'Dixinn', value: 96, rank: 1 }, // on-time rate
      { branchId: 'branch-001', name: 'Kaloum', value: 94, rank: 2 },
      { branchId: 'branch-003', name: 'Matam', value: 88, rank: 3 },
    ],
  },
  trends: {
    revenueByDay: [
      { date: 'Lun', branch001: 420000, branch002: 580000, branch003: 280000 },
      { date: 'Mar', branch001: 380000, branch002: 620000, branch003: 310000 },
      { date: 'Mer', branch001: 450000, branch002: 550000, branch003: 290000 },
      { date: 'Jeu', branch001: 520000, branch002: 680000, branch003: 350000 },
      { date: 'Ven', branch001: 580000, branch002: 750000, branch003: 380000 },
      { date: 'Sam', branch001: 650000, branch002: 820000, branch003: 420000 },
      { date: 'Dim', branch001: 550000, branch002: 700000, branch003: 360000 },
    ],
    ordersByDay: [
      { date: 'Lun', branch001: 22, branch002: 30, branch003: 13 },
      { date: 'Mar', branch001: 20, branch002: 32, branch003: 15 },
      { date: 'Mer', branch001: 24, branch002: 28, branch003: 14 },
      { date: 'Jeu', branch001: 27, branch002: 35, branch003: 17 },
      { date: 'Ven', branch001: 30, branch002: 38, branch003: 18 },
      { date: 'Sam', branch001: 34, branch002: 42, branch003: 20 },
      { date: 'Dim', branch001: 28, branch002: 36, branch003: 17 },
    ],
  },
  insights: [
    {
      type: 'success',
      branch: 'Dixinn',
      message: 'Meilleure croissance quotidienne (+17.9%) et le plus de commandes',
    },
    {
      type: 'success',
      branch: 'Kaloum',
      message: 'Meilleure note client (4.8★) et taux de livraison ponctuel (94%)',
    },
    {
      type: 'warning',
      branch: 'Matam',
      message: 'Temps de livraison plus élevé (32 min), optimisation possible',
    },
    {
      type: 'info',
      branch: 'Ratoma',
      message: 'Ouverture prévue pour Mars 2025 - préparation en cours',
    },
  ],
};

// GET - Compare branches performance
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId');
  const branchIds = searchParams.get('branchIds')?.split(',') || [];
  const period = searchParams.get('period') || 'today';

  // Demo mode
  if (demo || !organizationId) {
    let data = { ...DEMO_COMPARISON };

    // Filter specific branches if requested
    if (branchIds.length > 0) {
      data.branches = data.branches.filter(b => branchIds.includes(b.id));
      data.rankings.revenue = data.rankings.revenue.filter(r => branchIds.includes(r.branchId));
      data.rankings.orders = data.rankings.orders.filter(r => branchIds.includes(r.branchId));
      data.rankings.rating = data.rankings.rating.filter(r => branchIds.includes(r.branchId));
      data.rankings.growth = data.rankings.growth.filter(r => branchIds.includes(r.branchId));
      data.rankings.efficiency = data.rankings.efficiency.filter(r => branchIds.includes(r.branchId));
      
      // Recalculate summary
      data.summary.totalRevenue.today = data.branches.reduce((sum, b) => sum + b.metrics.revenue.today, 0);
      data.summary.totalOrders.today = data.branches.reduce((sum, b) => sum + b.metrics.orders.today, 0);
      data.summary.totalStaff = data.branches.reduce((sum, b) => sum + b.metrics.staff.total, 0);
      data.summary.activeBranches = data.branches.filter(b => b.status === 'ACTIVE').length;
      data.summary.totalBranches = data.branches.length;
    }

    return apiSuccess({
      ...data,
      period,
    });
  }

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
