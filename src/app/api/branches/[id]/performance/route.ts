import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, apiSuccess, apiError } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo performance data
const DEMO_PERFORMANCE_DATA: Record<string, any> = {
  'branch-001': {
    branchId: 'branch-001',
    branchName: 'KFM DELICE - Kaloum',
    period: 'today',
    revenue: {
      current: 2850000,
      previous: 2520000,
      change: 13.1,
      trend: 'up',
    },
    orders: {
      current: 145,
      previous: 128,
      change: 13.3,
      trend: 'up',
      byType: {
        dineIn: 45,
        delivery: 62,
        takeaway: 38,
      },
      byStatus: {
        pending: 5,
        preparing: 4,
        ready: 3,
        completed: 130,
        cancelled: 3,
      },
    },
    customers: {
      new: 28,
      returning: 117,
      avgOrderValue: 19655,
      avgWaitTime: 18,
    },
    staff: {
      total: 8,
      active: 7,
      avgOrdersPerStaff: 20.7,
      topPerformers: [
        { name: 'Fatou Sylla', orders: 32, rating: 4.9 },
        { name: 'Ibrahim Diallo', orders: 28, rating: 4.8 },
        { name: 'Aminata Touré', orders: 25, rating: 4.7 },
      ],
    },
    kitchen: {
      avgPrepTime: 15,
      ordersInQueue: 4,
      maxCapacity: 50,
      utilization: 72,
    },
    delivery: {
      orders: 62,
      avgTime: 28,
      onTimeRate: 94,
      driverCount: 3,
    },
    hourlyData: [
      { hour: '08', orders: 5, revenue: 95000 },
      { hour: '09', orders: 8, revenue: 152000 },
      { hour: '10', orders: 12, revenue: 245000 },
      { hour: '11', orders: 18, revenue: 385000 },
      { hour: '12', orders: 28, revenue: 580000 },
      { hour: '13', orders: 22, revenue: 450000 },
      { hour: '14', orders: 15, revenue: 295000 },
      { hour: '15', orders: 10, revenue: 185000 },
      { hour: '16', orders: 8, revenue: 165000 },
      { hour: '17', orders: 12, revenue: 245000 },
      { hour: '18', orders: 20, revenue: 420000 },
      { hour: '19', orders: 25, revenue: 525000 },
      { hour: '20', orders: 18, revenue: 380000 },
      { hour: '21', orders: 12, revenue: 255000 },
    ],
    topProducts: [
      { name: 'Attieké Poisson Grillé', quantity: 45, revenue: 675000 },
      { name: 'Kedjenou de Poulet', quantity: 38, revenue: 532000 },
      { name: 'Thiéboudienne', quantity: 32, revenue: 448000 },
      { name: 'Alloco Sauce Graine', quantity: 28, revenue: 280000 },
      { name: 'Jus de Bissap', quantity: 52, revenue: 156000 },
    ],
    rating: 4.8,
    reviews: {
      total: 45,
      average: 4.8,
      breakdown: { 5: 32, 4: 8, 3: 3, 2: 1, 1: 1 },
    },
  },
  'branch-002': {
    branchId: 'branch-002',
    branchName: 'KFM DELICE - Dixinn',
    period: 'today',
    revenue: {
      current: 4150000,
      previous: 3520000,
      change: 17.9,
      trend: 'up',
    },
    orders: {
      current: 210,
      previous: 175,
      change: 20.0,
      trend: 'up',
      byType: {
        dineIn: 65,
        delivery: 95,
        takeaway: 50,
      },
      byStatus: {
        pending: 8,
        preparing: 6,
        ready: 4,
        completed: 188,
        cancelled: 4,
      },
    },
    customers: {
      new: 42,
      returning: 168,
      avgOrderValue: 19762,
      avgWaitTime: 15,
    },
    staff: {
      total: 12,
      active: 10,
      avgOrdersPerStaff: 21,
      topPerformers: [
        { name: 'Moussa Condé', orders: 38, rating: 4.9 },
        { name: 'Aïssata Traoré', orders: 35, rating: 4.8 },
        { name: 'Seydou Bamba', orders: 32, rating: 4.7 },
      ],
    },
    kitchen: {
      avgPrepTime: 12,
      ordersInQueue: 6,
      maxCapacity: 60,
      utilization: 85,
    },
    delivery: {
      orders: 95,
      avgTime: 25,
      onTimeRate: 96,
      driverCount: 5,
    },
    hourlyData: [
      { hour: '09', orders: 8, revenue: 165000 },
      { hour: '10', orders: 15, revenue: 295000 },
      { hour: '11', orders: 22, revenue: 450000 },
      { hour: '12', orders: 35, revenue: 720000 },
      { hour: '13', orders: 28, revenue: 560000 },
      { hour: '14', orders: 18, revenue: 365000 },
      { hour: '15', orders: 12, revenue: 245000 },
      { hour: '16', orders: 10, revenue: 195000 },
      { hour: '17', orders: 15, revenue: 295000 },
      { hour: '18', orders: 25, revenue: 520000 },
      { hour: '19', orders: 30, revenue: 625000 },
      { hour: '20', orders: 28, revenue: 580000 },
      { hour: '21', orders: 22, revenue: 455000 },
      { hour: '22', orders: 15, revenue: 310000 },
      { hour: '23', orders: 8, revenue: 165000 },
    ],
    topProducts: [
      { name: 'Kedjenou de Poulet', quantity: 62, revenue: 868000 },
      { name: 'Attieké Poisson Grillé', quantity: 55, revenue: 825000 },
      { name: 'Thiéboudienne', quantity: 48, revenue: 672000 },
      { name: 'Foutou Banane', quantity: 35, revenue: 385000 },
      { name: 'Jus de Gingembre', quantity: 68, revenue: 204000 },
    ],
    rating: 4.6,
    reviews: {
      total: 62,
      average: 4.6,
      breakdown: { 5: 40, 4: 15, 3: 4, 2: 2, 1: 1 },
    },
  },
  'branch-003': {
    branchId: 'branch-003',
    branchName: 'KFM DELICE - Matam',
    period: 'today',
    revenue: {
      current: 1850000,
      previous: 1720000,
      change: 7.6,
      trend: 'up',
    },
    orders: {
      current: 85,
      previous: 78,
      change: 9.0,
      trend: 'up',
      byType: {
        dineIn: 30,
        delivery: 32,
        takeaway: 23,
      },
      byStatus: {
        pending: 3,
        preparing: 2,
        ready: 3,
        completed: 75,
        cancelled: 2,
      },
    },
    customers: {
      new: 18,
      returning: 67,
      avgOrderValue: 21765,
      avgWaitTime: 20,
    },
    staff: {
      total: 6,
      active: 5,
      avgOrdersPerStaff: 17,
      topPerformers: [
        { name: 'Mariama Condé', orders: 22, rating: 4.9 },
        { name: 'Youssouf Diallo', orders: 20, rating: 4.8 },
      ],
    },
    kitchen: {
      avgPrepTime: 18,
      ordersInQueue: 2,
      maxCapacity: 30,
      utilization: 55,
    },
    delivery: {
      orders: 32,
      avgTime: 32,
      onTimeRate: 88,
      driverCount: 2,
    },
    hourlyData: [
      { hour: '07', orders: 8, revenue: 165000 },
      { hour: '08', orders: 12, revenue: 245000 },
      { hour: '09', orders: 10, revenue: 205000 },
      { hour: '10', orders: 8, revenue: 175000 },
      { hour: '11', orders: 12, revenue: 265000 },
      { hour: '12', orders: 15, revenue: 335000 },
      { hour: '13', orders: 12, revenue: 275000 },
      { hour: '14', orders: 8, revenue: 165000 },
      { hour: '15', orders: 5, revenue: 95000 },
      { hour: '16', orders: 6, revenue: 125000 },
      { hour: '17', orders: 10, revenue: 215000 },
      { hour: '18', orders: 12, revenue: 265000 },
      { hour: '19', orders: 10, revenue: 225000 },
      { hour: '20', orders: 8, revenue: 175000 },
    ],
    topProducts: [
      { name: 'Garba', quantity: 28, revenue: 196000 },
      { name: 'Attieké Poisson', quantity: 22, revenue: 330000 },
      { name: 'Riz Gras', quantity: 18, revenue: 270000 },
      { name: 'Alloco', quantity: 35, revenue: 175000 },
    ],
    rating: 4.7,
    reviews: {
      total: 28,
      average: 4.7,
      breakdown: { 5: 20, 4: 5, 3: 2, 2: 1, 1: 0 },
    },
  },
  'branch-004': {
    branchId: 'branch-004',
    branchName: 'KFM DELICE - Ratoma',
    period: 'today',
    revenue: { current: 0, previous: 0, change: 0, trend: 'stable' },
    orders: { current: 0, previous: 0, change: 0, trend: 'stable', byType: {}, byStatus: {} },
    customers: { new: 0, returning: 0, avgOrderValue: 0, avgWaitTime: 0 },
    staff: { total: 0, active: 0, avgOrdersPerStaff: 0, topPerformers: [] },
    kitchen: { avgPrepTime: 0, ordersInQueue: 0, maxCapacity: 0, utilization: 0 },
    delivery: { orders: 0, avgTime: 0, onTimeRate: 0, driverCount: 0 },
    hourlyData: [],
    topProducts: [],
    rating: 0,
    reviews: { total: 0, average: 0, breakdown: {} },
  },
};

// GET - Get branch performance analytics
export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const demo = searchParams.get('demo') === 'true';
  const organizationId = searchParams.get('organizationId');
  const period = searchParams.get('period') || 'today'; // today, week, month

  // Demo mode
  if (demo || !organizationId) {
    const performance = DEMO_PERFORMANCE_DATA[id];
    
    if (!performance) {
      return apiError('Données de performance non trouvées', 404);
    }

    return apiSuccess({
      ...performance,
      period,
    });
  }

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
