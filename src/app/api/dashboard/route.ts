// Dashboard Analytics API
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// Demo data for when no organization is specified
const DEMO_DATA = {
  today: {
    period: 'today',
    summary: {
      ordersCount: 68,
      revenue: 892000,
      avgOrderValue: 13118,
      customersCount: 52,
      newCustomersCount: 8,
      deliveriesCount: 24,
      activeDeliveries: 3,
    },
    ordersByStatus: [
      { status: 'PENDING', count: 5 },
      { status: 'CONFIRMED', count: 4 },
      { status: 'PREPARING', count: 3 },
      { status: 'READY', count: 2 },
      { status: 'OUT_FOR_DELIVERY', count: 2 },
      { status: 'COMPLETED', count: 48 },
      { status: 'CANCELLED', count: 4 },
    ],
    ordersByType: [
      { type: 'DINE_IN', count: 28 },
      { type: 'DELIVERY', count: 24 },
      { type: 'TAKEAWAY', count: 16 },
    ],
    paymentsByMethod: [
      { method: 'MOBILE_MONEY_ORANGE', amount: 312200, count: 24 },
      { method: 'MOBILE_MONEY_MTN', amount: 223000, count: 17 },
      { method: 'MOBILE_MONEY_WAVE', amount: 178400, count: 14 },
      { method: 'CASH', amount: 133800, count: 10 },
      { method: 'CARD', amount: 44600, count: 3 },
    ],
    revenueByDay: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 450000, orders: 32 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 520000, orders: 38 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 480000, orders: 35 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 610000, orders: 45 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 750000, orders: 52 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 920000, orders: 68 },
      { date: new Date().toISOString().split('T')[0], revenue: 892000, orders: 68 },
    ],
    topProducts: [
      { productId: 'demo-1', name: 'Attieké Poisson Grillé', quantity: 156, revenue: 1248000 },
      { productId: 'demo-2', name: 'Kedjenou de Poulet', quantity: 142, revenue: 994000 },
      { productId: 'demo-3', name: 'Thiéboudienne', quantity: 128, revenue: 896000 },
      { productId: 'demo-4', name: 'Alloco Sauce Graine', quantity: 115, revenue: 575000 },
      { productId: 'demo-5', name: 'Riz Gras', quantity: 98, revenue: 490000 },
    ],
    recentOrders: [
      {
        id: 'demo-ord-1',
        orderNumber: 'ORD-2024-0145',
        customerName: 'Kouamé Jean',
        customerPhone: '+2250700000001',
        status: 'PENDING',
        orderType: 'DELIVERY',
        total: 8500,
        createdAt: new Date(),
        items: [{ itemName: 'Attieké Poisson', quantity: 1, unitPrice: 8500 }],
      },
      {
        id: 'demo-ord-2',
        orderNumber: 'ORD-2024-0144',
        customerName: 'Aya Marie',
        customerPhone: '+2250700000002',
        status: 'PREPARING',
        orderType: 'DINE_IN',
        total: 4500,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        items: [{ itemName: 'Alloco', quantity: 2, unitPrice: 2250 }],
      },
      {
        id: 'demo-ord-3',
        orderNumber: 'ORD-2024-0143',
        customerName: 'Koné Ibrahim',
        customerPhone: '+2250700000003',
        status: 'READY',
        orderType: 'TAKEAWAY',
        total: 12000,
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        items: [{ itemName: 'Kedjenou', quantity: 1, unitPrice: 12000 }],
      },
      {
        id: 'demo-ord-4',
        orderNumber: 'ORD-2024-0142',
        customerName: 'Diallo Fatou',
        customerPhone: '+2250700000004',
        status: 'OUT_FOR_DELIVERY',
        orderType: 'DELIVERY',
        total: 6000,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        items: [{ itemName: 'Thiéboudienne', quantity: 1, unitPrice: 6000 }],
      },
      {
        id: 'demo-ord-5',
        orderNumber: 'ORD-2024-0141',
        customerName: 'Touré Amadou',
        customerPhone: '+2250700000005',
        status: 'COMPLETED',
        orderType: 'DINE_IN',
        total: 10500,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        items: [{ itemName: 'Riz Gras', quantity: 1, unitPrice: 5000 }, { itemName: 'Jus de Bissap', quantity: 2, unitPrice: 2750 }],
      },
    ],
    hourlyDistribution: [
      { hour: '08', orders: 3, revenue: 15000 },
      { hour: '09', orders: 5, revenue: 32000 },
      { hour: '10', orders: 4, revenue: 28000 },
      { hour: '11', orders: 8, revenue: 65000 },
      { hour: '12', orders: 15, revenue: 185000 },
      { hour: '13', orders: 12, revenue: 142000 },
      { hour: '14', orders: 6, revenue: 48000 },
      { hour: '15', orders: 4, revenue: 35000 },
      { hour: '16', orders: 3, revenue: 24000 },
      { hour: '17', orders: 5, revenue: 52000 },
      { hour: '18', orders: 8, revenue: 98000 },
      { hour: '19', orders: 12, revenue: 156000 },
      { hour: '20', orders: 9, revenue: 112000 },
      { hour: '21', orders: 4, revenue: 45000 },
    ],
    activeDrivers: 5,
    tablesOccupied: 8,
    tablesAvailable: 4,
    reservationsToday: 12,
  },
  week: {
    period: 'week',
    summary: {
      ordersCount: 452,
      revenue: 5420000,
      avgOrderValue: 11991,
      customersCount: 285,
      newCustomersCount: 42,
      deliveriesCount: 168,
      activeDeliveries: 3,
    },
    ordersByStatus: [
      { status: 'PENDING', count: 5 },
      { status: 'CONFIRMED', count: 4 },
      { status: 'PREPARING', count: 3 },
      { status: 'READY', count: 2 },
      { status: 'OUT_FOR_DELIVERY', count: 2 },
      { status: 'COMPLETED', count: 428 },
      { status: 'CANCELLED', count: 8 },
    ],
    ordersByType: [
      { type: 'DINE_IN', count: 195 },
      { type: 'DELIVERY', count: 158 },
      { type: 'TAKEAWAY', count: 99 },
    ],
    paymentsByMethod: [
      { method: 'MOBILE_MONEY_ORANGE', amount: 1897000, count: 158 },
      { method: 'MOBILE_MONEY_MTN', amount: 1355000, count: 113 },
      { method: 'MOBILE_MONEY_WAVE', amount: 1084000, count: 90 },
      { method: 'CASH', amount: 813000, count: 73 },
      { method: 'CARD', amount: 271000, count: 18 },
    ],
    revenueByDay: [
      { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 450000, orders: 32 },
      { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 520000, orders: 38 },
      { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 480000, orders: 35 },
      { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 610000, orders: 45 },
      { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 750000, orders: 52 },
      { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], revenue: 920000, orders: 68 },
      { date: new Date().toISOString().split('T')[0], revenue: 892000, orders: 68 },
    ],
    topProducts: [
      { productId: 'demo-1', name: 'Attieké Poisson Grillé', quantity: 892, revenue: 7136000 },
      { productId: 'demo-2', name: 'Kedjenou de Poulet', quantity: 756, revenue: 5292000 },
      { productId: 'demo-3', name: 'Thiéboudienne', quantity: 634, revenue: 4438000 },
      { productId: 'demo-4', name: 'Alloco Sauce Graine', quantity: 512, revenue: 2560000 },
      { productId: 'demo-5', name: 'Riz Gras', quantity: 398, revenue: 1990000 },
    ],
    recentOrders: [],
    hourlyDistribution: [],
    activeDrivers: 5,
    tablesOccupied: 8,
    tablesAvailable: 4,
    reservationsToday: 12,
  },
  month: {
    period: 'month',
    summary: {
      ordersCount: 1856,
      revenue: 22450000,
      avgOrderValue: 12101,
      customersCount: 892,
      newCustomersCount: 156,
      deliveriesCount: 645,
      activeDeliveries: 3,
    },
    ordersByStatus: [
      { status: 'PENDING', count: 5 },
      { status: 'CONFIRMED', count: 4 },
      { status: 'PREPARING', count: 3 },
      { status: 'READY', count: 2 },
      { status: 'OUT_FOR_DELIVERY', count: 2 },
      { status: 'COMPLETED', count: 1812 },
      { status: 'CANCELLED', count: 28 },
    ],
    ordersByType: [
      { type: 'DINE_IN', count: 812 },
      { type: 'DELIVERY', count: 645 },
      { type: 'TAKEAWAY', count: 399 },
    ],
    paymentsByMethod: [
      { method: 'MOBILE_MONEY_ORANGE', amount: 7857500, count: 653 },
      { method: 'MOBILE_MONEY_MTN', amount: 5612500, count: 466 },
      { method: 'MOBILE_MONEY_WAVE', amount: 4490000, count: 373 },
      { method: 'CASH', amount: 3367500, count: 298 },
      { method: 'CARD', amount: 1122500, count: 66 },
    ],
    revenueByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 500000) + 600000,
      orders: Math.floor(Math.random() * 30) + 40,
    })),
    topProducts: [
      { productId: 'demo-1', name: 'Attieké Poisson Grillé', quantity: 3568, revenue: 28544000 },
      { productId: 'demo-2', name: 'Kedjenou de Poulet', quantity: 3024, revenue: 21168000 },
      { productId: 'demo-3', name: 'Thiéboudienne', quantity: 2536, revenue: 17752000 },
      { productId: 'demo-4', name: 'Alloco Sauce Graine', quantity: 2048, revenue: 10240000 },
      { productId: 'demo-5', name: 'Riz Gras', quantity: 1592, revenue: 7960000 },
    ],
    recentOrders: [],
    hourlyDistribution: [],
    activeDrivers: 5,
    tablesOccupied: 8,
    tablesAvailable: 4,
    reservationsToday: 12,
  },
};

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const period = (searchParams.get('period') || 'today') as 'today' | 'week' | 'month' | 'year';
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization/restaurant specified
    if (demo === 'true' || (!organizationId && !restaurantId)) {
      return apiSuccess(DEMO_DATA[period] || DEMO_DATA.today);
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Build where clause - orders are linked via restaurant -> organization
    const orderWhere: Record<string, unknown> = {
      createdAt: { gte: startDate },
    };
    
    if (restaurantId) {
      orderWhere.restaurantId = restaurantId;
    } else if (organizationId) {
      orderWhere.restaurant = { organizationId };
    }

    // Parallel queries for performance
    const [
      ordersCount,
      ordersTotal,
      ordersByStatus,
      ordersByType,
      recentOrders,
      topProducts,
      customersCount,
      newCustomersCount,
      deliveriesCount,
      activeDeliveries,
      paymentsByMethod,
      revenueByDay,
      activeDrivers,
      tablesStatus,
      reservationsToday,
    ] = await Promise.all([
      // Total orders in period
      db.order.count({ where: orderWhere }),

      // Total revenue in period
      db.order.aggregate({
        where: { ...orderWhere, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),

      // Orders by status
      db.order.groupBy({
        by: ['status'],
        where: orderWhere,
        _count: true,
      }),

      // Orders by type
      db.order.groupBy({
        by: ['orderType'],
        where: orderWhere,
        _count: true,
      }),

      // Recent orders
      db.order.findMany({
        where: orderWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { take: 3 },
        },
      }),

      // Top products
      db.orderItem.groupBy({
        by: ['menuItemId', 'itemName'],
        where: { order: orderWhere },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),

      // Total customers
      db.customerProfile.count({
        where: organizationId ? { organizationId } : undefined,
      }),

      // New customers in period
      db.customerProfile.count({
        where: {
          ...(organizationId && { organizationId }),
          createdAt: { gte: startDate },
        },
      }),

      // Total deliveries
      db.delivery.count({
        where: organizationId ? { organizationId, createdAt: { gte: startDate } } : { createdAt: { gte: startDate } },
      }),

      // Active deliveries
      db.delivery.count({
        where: organizationId ? {
          organizationId,
          status: { in: ['PENDING', 'DRIVER_ASSIGNED', 'PICKED_UP'] },
        } : {
          status: { in: ['PENDING', 'DRIVER_ASSIGNED', 'PICKED_UP'] },
        },
      }),

      // Payments by method
      db.payment.groupBy({
        by: ['method'],
        where: { order: orderWhere, status: 'PAID' },
        _sum: { amount: true },
        _count: true,
      }),

      // Revenue by day (last 7 days)
      Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const result = await db.order.aggregate({
            where: { ...orderWhere, createdAt: { gte: date, lt: nextDate }, status: { not: 'CANCELLED' } },
            _sum: { total: true },
            _count: true,
          });

          return {
            date: date.toISOString().split('T')[0],
            revenue: result._sum.total || 0,
            orders: result._count,
          };
        })
      ),

      // Active drivers count
      db.driver.count({
        where: {
          organizationId: organizationId || undefined,
          isActive: true,
          isAvailable: true,
        },
      }),

      // Tables status (if restaurant specified)
      restaurantId ? db.table.count({
        where: { restaurantId, status: 'OCCUPIED' },
      }) : Promise.resolve(0),

      restaurantId ? db.table.count({
        where: { restaurantId, status: 'AVAILABLE' },
      }) : Promise.resolve(0),

      // Reservations today
      restaurantId ? db.reservation.count({
        where: {
          restaurantId,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      }) : Promise.resolve(0),
    ]);

    // Calculate average order value
    const avgOrderValue = ordersCount > 0 
      ? (ordersTotal._sum.total || 0) / ordersCount 
      : 0;

    // Calculate hourly distribution for today
    const hourlyDistribution = await Promise.all(
      Array.from({ length: 14 }, async (_, i) => {
        const hour = i + 8; // 8 AM to 9 PM
        const date = new Date();
        date.setHours(hour, 0, 0, 0);
        const nextHour = new Date(date);
        nextHour.setHours(hour + 1);

        const result = await db.order.aggregate({
          where: {
            ...orderWhere,
            createdAt: { gte: date, lt: nextHour },
          },
          _sum: { total: true },
          _count: true,
        });

        return {
          hour: hour.toString().padStart(2, '0'),
          orders: result._count,
          revenue: result._sum.total || 0,
        };
      })
    );

    const dashboard = {
      period,
      summary: {
        ordersCount,
        revenue: ordersTotal._sum.total || 0,
        avgOrderValue,
        customersCount,
        newCustomersCount,
        deliveriesCount,
        activeDeliveries,
      },
      ordersByStatus: ordersByStatus.map(s => ({
        status: s.status,
        count: s._count,
      })),
      ordersByType: ordersByType.map(t => ({
        type: t.orderType,
        count: t._count,
      })),
      paymentsByMethod: paymentsByMethod.map(p => ({
        method: p.method,
        amount: p._sum.amount || 0,
        count: p._count,
      })),
      revenueByDay: revenueByDay.reverse(),
      topProducts: topProducts.map(p => ({
        productId: p.menuItemId,
        name: p.itemName,
        quantity: p._sum.quantity || 0,
        revenue: p._sum.totalPrice || 0,
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        status: o.status,
        orderType: o.orderType,
        total: o.total,
        createdAt: o.createdAt,
        items: o.items,
      })),
      hourlyDistribution,
      activeDrivers,
      tablesOccupied: tablesStatus,
      tablesAvailable: Array.isArray(tablesStatus) ? 0 : tablesStatus,
      reservationsToday,
    };

    return apiSuccess(dashboard);
  });
}
