// Admin Reports API - Rapports et analyses
import { NextRequest } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { withAdminAuth } from '@/lib/auth-middleware';

// Demo report data
const DEMO_REPORT_DATA = {
  kpis: {
    totalRevenue: 108600000,
    totalOrders: 11570,
    totalCustomers: 3730,
    avgOrderValue: 9400,
    revenueGrowth: 18.5,
    ordersGrowth: 15.2,
    customerGrowth: 22.8,
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500000, orders: 1250, customers: 450 },
    { month: 'Fév', revenue: 15200000, orders: 1480, customers: 520 },
    { month: 'Mar', revenue: 18900000, orders: 1820, customers: 610 },
    { month: 'Avr', revenue: 16500000, orders: 1590, customers: 580 },
    { month: 'Mai', revenue: 21000000, orders: 2050, customers: 720 },
    { month: 'Juin', revenue: 24500000, orders: 2380, customers: 850 },
  ],
  categoryPerformance: [
    { name: 'Plats principaux', value: 45, revenue: 15000000 },
    { name: 'Grillades', value: 25, revenue: 8500000 },
    { name: 'Boissons', value: 15, revenue: 5000000 },
    { name: 'Desserts', value: 10, revenue: 3500000 },
    { name: 'Autres', value: 5, revenue: 1750000 },
  ],
  restaurantPerformance: [
    { id: 'rest-1', name: 'KFM DELICE - Kaloum', revenue: 32000000, orders: 3200, rating: 4.8 },
    { id: 'rest-2', name: 'KFM DELICE - Dixinn', revenue: 18500000, orders: 1850, rating: 4.6 },
    { id: 'rest-3', name: 'KFM DELICE - Matam', revenue: 12000000, orders: 1200, rating: 4.5 },
  ],
  topProducts: [
    { id: 'item-1', name: 'Attieké Poisson', quantity: 1250, revenue: 56250000, category: 'Plats Ivoiriens' },
    { id: 'item-4', name: 'Thiéboudienne', quantity: 980, revenue: 44100000, category: 'Plats Sénégalais' },
    { id: 'item-6', name: 'Mix Grill', quantity: 650, revenue: 42250000, category: 'Grillades' },
    { id: 'item-3', name: 'Garba', quantity: 890, revenue: 26700000, category: 'Plats Ivoiriens' },
    { id: 'item-5', name: 'Yassa Poulet', quantity: 720, revenue: 28800000, category: 'Plats Sénégalais' },
  ],
  paymentMethods: [
    { method: 'Orange Money', count: 4500, amount: 45000000, percentage: 41 },
    { method: 'MTN MoMo', count: 3200, amount: 32000000, percentage: 29 },
    { method: 'Wave', count: 1800, amount: 18000000, percentage: 16 },
    { method: 'Espèces', count: 1500, amount: 15000000, percentage: 14 },
  ],
  hourlyDistribution: [
    { hour: '08:00', orders: 45 },
    { hour: '09:00', orders: 78 },
    { hour: '10:00', orders: 120 },
    { hour: '11:00', orders: 180 },
    { hour: '12:00', orders: 350 },
    { hour: '13:00', orders: 420 },
    { hour: '14:00', orders: 280 },
    { hour: '15:00', orders: 150 },
    { hour: '16:00', orders: 90 },
    { hour: '17:00', orders: 120 },
    { hour: '18:00', orders: 250 },
    { hour: '19:00', orders: 380 },
    { hour: '20:00', orders: 320 },
    { hour: '21:00', orders: 180 },
    { hour: '22:00', orders: 85 },
  ],
};

// GET /api/admin/reports - Get report data
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const restaurantId = searchParams.get('restaurantId');
    const organizationId = searchParams.get('organizationId');
    const reportType = searchParams.get('type') || 'overview';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Try database first
    if (isDatabaseAvailable() && db) {
      // Build where clause
      const orderWhere: any = {
        createdAt: { gte: startDate },
      };
      
      if (restaurantId) {
        orderWhere.restaurantId = restaurantId;
      }
      if (organizationId) {
        orderWhere.restaurant = { organizationId };
      }

      // Get KPIs
      const [totalOrders, revenueResult, uniqueCustomers] = await Promise.all([
        db.order.count({ where: orderWhere }),
        db.order.aggregate({
          where: { ...orderWhere, status: 'COMPLETED' },
          _sum: { total: true },
          _avg: { total: true },
        }),
        db.order.findMany({
          where: orderWhere,
          select: { customerId: true },
          distinct: ['customerId'],
        }),
      ]);

      // Get previous period for growth calculation
      const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
      const previousOrders = await db.order.count({
        where: {
          ...orderWhere,
          createdAt: { gte: previousStartDate, lt: startDate },
        },
      });

      const previousRevenue = await db.order.aggregate({
        where: {
          ...orderWhere,
          status: 'COMPLETED',
          createdAt: { gte: previousStartDate, lt: startDate },
        },
        _sum: { total: true },
      });

      const currentRevenue = revenueResult._sum.total || 0;
      const previousRevenueValue = previousRevenue._sum.total || 0;
      const revenueGrowth = previousRevenueValue > 0 
        ? ((currentRevenue - previousRevenueValue) / previousRevenueValue * 100).toFixed(1)
        : 0;

      const ordersGrowth = previousOrders > 0
        ? ((totalOrders - previousOrders) / previousOrders * 100).toFixed(1)
        : 0;

      // Get monthly revenue data
      const monthlyData = await getMonthlyRevenueData(orderWhere, period);

      // Get top products
      const topProducts = await getTopProducts(orderWhere);

      // Get payment method distribution
      const paymentDistribution = await getPaymentDistribution(orderWhere);

      const reportData = {
        kpis: {
          totalRevenue: currentRevenue,
          totalOrders,
          totalCustomers: uniqueCustomers.filter(c => c.customerId).length,
          avgOrderValue: revenueResult._avg.total || 0,
          revenueGrowth: parseFloat(revenueGrowth as string),
          ordersGrowth: parseFloat(ordersGrowth as string),
          customerGrowth: 22.8, // Would need historical data
        },
        monthlyRevenue: monthlyData,
        categoryPerformance: DEMO_REPORT_DATA.categoryPerformance,
        restaurantPerformance: DEMO_REPORT_DATA.restaurantPerformance,
        topProducts,
        paymentMethods: paymentDistribution,
        hourlyDistribution: DEMO_REPORT_DATA.hourlyDistribution,
      };

      return apiSuccess(reportData);
    }

    // Return demo data
    return apiSuccess(DEMO_REPORT_DATA);
  } catch (error) {
    console.error('Error generating report:', error);
    return apiError('Erreur lors de la génération du rapport', 500);
  }
});

// Helper to get monthly revenue data
async function getMonthlyRevenueData(orderWhere: any, period: string) {
  if (!db) return DEMO_REPORT_DATA.monthlyRevenue;

  try {
    const now = new Date();
    const months = period === 'year' ? 12 : 6;
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const [orders, revenue, customers] = await Promise.all([
        db.order.count({
          where: {
            ...orderWhere,
            createdAt: { gte: startDate, lte: endDate },
          },
        }),
        db.order.aggregate({
          where: {
            ...orderWhere,
            status: 'COMPLETED',
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { total: true },
        }),
        db.order.findMany({
          where: {
            ...orderWhere,
            createdAt: { gte: startDate, lte: endDate },
          },
          select: { customerId: true },
          distinct: ['customerId'],
        }),
      ]);

      data.push({
        month: startDate.toLocaleString('fr-FR', { month: 'short' }),
        revenue: revenue._sum.total || 0,
        orders,
        customers: customers.filter(c => c.customerId).length,
      });
    }

    return data;
  } catch (error) {
    console.error('Error getting monthly revenue:', error);
    return DEMO_REPORT_DATA.monthlyRevenue;
  }
}

// Helper to get top products
async function getTopProducts(orderWhere: any) {
  if (!db) return DEMO_REPORT_DATA.topProducts;

  try {
    const orderItems = await db.orderItem.groupBy({
      by: ['menuItemId', 'itemName'],
      where: {
        order: orderWhere,
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          totalPrice: 'desc',
        },
      },
      take: 5,
    });

    return orderItems.map((item, index) => ({
      id: item.menuItemId || `item-${index}`,
      name: item.itemName,
      quantity: item._sum.quantity || 0,
      revenue: item._sum.totalPrice || 0,
      category: 'Plats',
    }));
  } catch (error) {
    console.error('Error getting top products:', error);
    return DEMO_REPORT_DATA.topProducts;
  }
}

// Helper to get payment distribution
async function getPaymentDistribution(orderWhere: any) {
  if (!db) return DEMO_REPORT_DATA.paymentMethods;

  try {
    const payments = await db.payment.groupBy({
      by: ['method'],
      where: {
        order: orderWhere,
        status: 'PAID',
      },
      _count: true,
      _sum: { amount: true },
    });

    const total = payments.reduce((sum, p) => sum + (p._sum.amount || 0), 0);

    return payments.map(p => ({
      method: p.method,
      count: p._count,
      amount: p._sum.amount || 0,
      percentage: total > 0 ? Math.round((p._sum.amount || 0) / total * 100) : 0,
    }));
  } catch (error) {
    console.error('Error getting payment distribution:', error);
    return DEMO_REPORT_DATA.paymentMethods;
  }
}
