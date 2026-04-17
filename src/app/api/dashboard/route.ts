// Dashboard Analytics API
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// GET /api/dashboard - Get dashboard statistics
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const period = (searchParams.get('period') || 'today') as 'today' | 'week' | 'month' | 'year';

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