// Analytics API - Dashboard analytics
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// GET /api/analytics - Get dashboard analytics
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || 'today';
    const type = searchParams.get('type') || 'dashboard';

    if (!organizationId) {
      return apiError('organizationId est requis');
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const restaurantFilter = restaurantId ? { restaurantId } : { restaurant: { organizationId } };

    // Dashboard overview
    if (type === 'dashboard') {
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
      ] = await Promise.all([
        // Total orders in period
        db.order.count({
          where: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
          },
        }),

        // Total revenue in period
        db.order.aggregate({
          where: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
            status: { not: 'CANCELLED' },
          },
          _sum: { total: true },
        }),

        // Orders by status
        db.order.groupBy({
          by: ['status'],
          where: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
          },
          _count: true,
        }),

        // Orders by type
        db.order.groupBy({
          by: ['orderType'],
          where: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
          },
          _count: true,
        }),

        // Recent orders
        db.order.findMany({
          where: { ...restaurantFilter },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            items: { take: 3 },
          },
        }),

        // Top products
        db.orderItem.groupBy({
          by: ['menuItemId', 'itemName'],
          where: {
            order: {
              ...restaurantFilter,
              createdAt: { gte: startDate, lte: now },
            },
          },
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),

        // Total customers
        db.customerProfile.count({
          where: { organizationId },
        }),

        // New customers in period
        db.customerProfile.count({
          where: {
            organizationId,
            createdAt: { gte: startDate, lte: now },
          },
        }),

        // Total deliveries
        db.delivery.count({
          where: {
            organizationId,
            createdAt: { gte: startDate, lte: now },
          },
        }),

        // Active deliveries
        db.delivery.count({
          where: {
            organizationId,
            status: { in: ['PENDING', 'SEARCHING_DRIVER', 'DRIVER_ASSIGNED', 'PICKED_UP'] },
          },
        }),

        // Payments by method
        db.payment.groupBy({
          by: ['method'],
          where: {
            order: { ...restaurantFilter },
            status: 'PAID',
            createdAt: { gte: startDate, lte: now },
          },
          _sum: { amount: true },
          _count: true,
        }),

        // Revenue by day (last 7 or 30 days)
        getRevenueByDay(restaurantFilter, period === 'month' ? 30 : 7),
      ]);

      // Calculate averages
      const avgOrderValue = ordersCount > 0
        ? (ordersTotal._sum.total || 0) / ordersCount
        : 0;

      return apiSuccess({
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
        ordersByStatus: ordersByStatus.map((s) => ({
          status: s.status,
          count: s._count,
        })),
        ordersByType: ordersByType.map((t) => ({
          type: t.orderType,
          count: t._count,
        })),
        paymentsByMethod: paymentsByMethod.map((p) => ({
          method: p.method,
          amount: p._sum.amount || 0,
          count: p._count,
        })),
        revenueByDay,
        topProducts: topProducts.map((p) => ({
          productId: p.menuItemId,
          name: p.itemName,
          quantity: p._sum.quantity || 0,
          revenue: p._sum.totalPrice || 0,
        })),
        recentOrders,
      });
    }

    // Revenue analytics
    if (type === 'revenue') {
      const [totalRevenue, revenueByPaymentMethod, hourlyDistribution] = await Promise.all([
        db.order.aggregate({
          where: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
            status: { not: 'CANCELLED' },
          },
          _sum: { total: true, subtotal: true, deliveryFee: true, discount: true },
          _avg: { total: true },
        }),
        db.payment.groupBy({
          by: ['method'],
          where: {
            order: { ...restaurantFilter },
            status: 'PAID',
            createdAt: { gte: startDate, lte: now },
          },
          _sum: { amount: true },
        }),
        // Hourly distribution would need raw query in SQLite
        Promise.resolve([]),
      ]);

      return apiSuccess({
        period,
        total: totalRevenue._sum.total || 0,
        subtotal: totalRevenue._sum.subtotal || 0,
        deliveryFees: totalRevenue._sum.deliveryFee || 0,
        discounts: totalRevenue._sum.discount || 0,
        avgOrderValue: totalRevenue._avg.total || 0,
        byPaymentMethod: revenueByPaymentMethod,
      });
    }

    // Products analytics
    if (type === 'products') {
      const topProducts = await db.orderItem.groupBy({
        by: ['menuItemId', 'itemName'],
        where: {
          order: {
            ...restaurantFilter,
            createdAt: { gte: startDate, lte: now },
          },
        },
        _sum: { quantity: true, totalPrice: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 20,
      });

      return apiSuccess({
        period,
        topProducts: topProducts.map((p) => ({
          productId: p.menuItemId,
          name: p.itemName,
          quantity: p._sum.quantity || 0,
          revenue: p._sum.totalPrice || 0,
          orderCount: p._count,
        })),
      });
    }

    // Customers analytics
    if (type === 'customers') {
      const [newCustomers, returningCustomers, topCustomers, loyaltyStats] = await Promise.all([
        db.customerProfile.count({
          where: {
            organizationId,
            createdAt: { gte: startDate, lte: now },
          },
        }),
        db.customerProfile.count({
          where: {
            organizationId,
            createdAt: { lt: startDate },
            lastOrderAt: { gte: startDate, lte: now },
          },
        }),
        db.customerProfile.findMany({
          where: { organizationId },
          orderBy: { totalSpent: 'desc' },
          take: 10,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            totalSpent: true,
            totalOrders: true,
            loyaltyPoints: true,
          },
        }),
        db.customerProfile.aggregate({
          where: { organizationId },
          _sum: { loyaltyPoints: true, totalSpent: true },
          _avg: { totalSpent: true },
        }),
      ]);

      return apiSuccess({
        period,
        newCustomers,
        returningCustomers,
        totalCustomers: newCustomers + returningCustomers,
        topCustomers,
        loyaltyStats: {
          totalPoints: loyaltyStats._sum.loyaltyPoints || 0,
          totalSpent: loyaltyStats._sum.totalSpent || 0,
          avgSpent: loyaltyStats._avg.totalSpent || 0,
        },
      });
    }

    return apiError('Type non reconnu');
  });
}

// Helper: Get revenue by day
async function getRevenueByDay(
  restaurantFilter: Record<string, unknown>,
  days: number
): Promise<{ date: string; revenue: number; orders: number }[]> {
  const result = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayResult = await db.order.aggregate({
      where: {
        ...restaurantFilter,
        createdAt: { gte: date, lt: nextDate },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
      _count: true,
    });

    result.push({
      date: date.toISOString().split('T')[0],
      revenue: dayResult._sum.total || 0,
      orders: dayResult._count,
    });
  }

  return result.reverse();
}
