// ============================================
// Restaurant OS - Analytics Service
// Advanced analytics and reporting
// ============================================

import { logger } from '@/lib/logger';

// ============================================
// Analytics Types
// ============================================

export interface RevenueAnalytics {
  total: number;
  previousPeriod: number;
  change: number;
  changePercent: number;
  byDay: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
  byMonth: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
}

export interface OrderAnalytics {
  total: number;
  previousPeriod: number;
  change: number;
  changePercent: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byHour: Array<{ hour: number; count: number }>;
  byDayOfWeek: Array<{ day: string; count: number }>;
  averageValue: number;
  averageItems: number;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CustomerAnalytics {
  total: number;
  new: number;
  returning: number;
  retentionRate: number;
  averageLifetimeValue: number;
  topCustomers: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalSpent: number;
    lastOrder: string;
  }>;
  segments: Array<{
    segment: string;
    count: number;
    percentage: number;
  }>;
}

export interface DeliveryAnalytics {
  totalDeliveries: number;
  averageTime: number; // in minutes
  onTimeRate: number; // percentage
  byZone: Array<{
    zone: string;
    count: number;
    averageTime: number;
  }>;
  driverPerformance: Array<{
    driverId: string;
    driverName: string;
    deliveries: number;
    averageTime: number;
    rating: number;
  }>;
}

export interface PaymentAnalytics {
  total: number;
  byMethod: Record<string, { count: number; amount: number }>;
  successRate: number;
  failureRate: number;
  averageProcessingTime: number;
}

export interface DashboardMetrics {
  revenue: RevenueAnalytics;
  orders: OrderAnalytics;
  customers: CustomerAnalytics;
  deliveries: DeliveryAnalytics;
  payments: PaymentAnalytics;
  topProducts: ProductAnalytics[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type Period = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// ============================================
// Analytics Service Class
// ============================================

class AnalyticsService {
  /**
   * Get date range for a period
   */
  getDateRange(period: Period): DateRange {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (period) {
      case 'today':
        return { start: today, end: now };
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: today };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - 7);
        return { start: weekStart, end: now };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(monthStart.getDate() - 30);
        return { start: monthStart, end: now };
      case 'quarter':
        const quarterStart = new Date(today);
        quarterStart.setDate(quarterStart.getDate() - 90);
        return { start: quarterStart, end: now };
      case 'year':
        const yearStart = new Date(today);
        yearStart.setDate(yearStart.getDate() - 365);
        return { start: yearStart, end: now };
      default:
        return { start: today, end: now };
    }
  }

  /**
   * Get previous period for comparison
   */
  getPreviousPeriod(range: DateRange): DateRange {
    const duration = range.end.getTime() - range.start.getTime();
    return {
      start: new Date(range.start.getTime() - duration),
      end: range.start,
    };
  }

  /**
   * Calculate percentage change
   */
  calculateChange(current: number, previous: number): { change: number; changePercent: number } {
    if (previous === 0) {
      return { change: current, changePercent: current > 0 ? 100 : 0 };
    }
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    return { change, changePercent };
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    restaurantId: string,
    period: Period,
    customRange?: DateRange
  ): Promise<RevenueAnalytics> {
    const range = period === 'custom' && customRange ? customRange : this.getDateRange(period);
    const previousRange = this.getPreviousPeriod(range);

    // In production, fetch from database
    // For demo, return sample data
    const mockData: RevenueAnalytics = {
      total: 8925000,
      previousPeriod: 7850000,
      change: 1075000,
      changePercent: 13.7,
      byDay: this.generateDailyRevenue(range),
      byMonth: this.generateMonthlyRevenue(range),
    };

    return mockData;
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(
    restaurantId: string,
    period: Period,
    customRange?: DateRange
  ): Promise<OrderAnalytics> {
    const range = period === 'custom' && customRange ? customRange : this.getDateRange(period);
    const previousRange = this.getPreviousPeriod(range);

    return {
      total: 847,
      previousPeriod: 756,
      change: 91,
      changePercent: 12.0,
      byStatus: {
        PENDING: 12,
        CONFIRMED: 8,
        PREPARING: 15,
        READY: 10,
        OUT_FOR_DELIVERY: 7,
        DELIVERED: 520,
        COMPLETED: 255,
        CANCELLED: 20,
      },
      byType: {
        DINE_IN: 312,
        DELIVERY: 398,
        TAKEAWAY: 137,
      },
      byHour: this.generateHourlyOrders(),
      byDayOfWeek: this.generateWeeklyOrders(),
      averageValue: 10536,
      averageItems: 2.8,
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(
    restaurantId: string,
    period: Period
  ): Promise<CustomerAnalytics> {
    return {
      total: 1245,
      new: 156,
      returning: 1089,
      retentionRate: 87.5,
      averageLifetimeValue: 125000,
      topCustomers: [
        { id: '1', name: 'Kouamé Jean', totalOrders: 47, totalSpent: 523000, lastOrder: '2024-03-25' },
        { id: '2', name: 'Aya Marie', totalOrders: 38, totalSpent: 412500, lastOrder: '2024-03-24' },
        { id: '3', name: 'Koné Ibrahim', totalOrders: 35, totalSpent: 389000, lastOrder: '2024-03-25' },
        { id: '4', name: 'Diallo Fatou', totalOrders: 31, totalSpent: 345000, lastOrder: '2024-03-23' },
        { id: '5', name: 'Touré Amadou', totalOrders: 28, totalSpent: 298000, lastOrder: '2024-03-25' },
      ],
      segments: [
        { segment: 'VIP', count: 45, percentage: 3.6 },
        { segment: 'Régulier', count: 312, percentage: 25.1 },
        { segment: 'Occasionnel', count: 732, percentage: 58.8 },
        { segment: 'Nouveau', count: 156, percentage: 12.5 },
      ],
    };
  }

  /**
   * Get delivery analytics
   */
  async getDeliveryAnalytics(
    restaurantId: string,
    period: Period
  ): Promise<DeliveryAnalytics> {
    return {
      totalDeliveries: 398,
      averageTime: 28.5,
      onTimeRate: 87.4,
      byZone: [
        { zone: 'Plateau', count: 89, averageTime: 22 },
        { zone: 'Cocody', count: 78, averageTime: 25 },
        { zone: 'Marcory', count: 65, averageTime: 32 },
        { zone: 'Treichville', count: 54, averageTime: 28 },
        { zone: 'Yopougon', count: 48, averageTime: 38 },
        { zone: 'Abobo', count: 35, averageTime: 35 },
        { zone: 'Adjame', count: 29, averageTime: 30 },
      ],
      driverPerformance: [
        { driverId: '1', driverName: 'Amadou Touré', deliveries: 98, averageTime: 24, rating: 4.8 },
        { driverId: '2', driverName: 'Ibrahim Koné', deliveries: 87, averageTime: 26, rating: 4.7 },
        { driverId: '3', driverName: 'Yao Kouassi', deliveries: 76, averageTime: 28, rating: 4.6 },
        { driverId: '4', driverName: 'Aïssata Traoré', deliveries: 72, averageTime: 30, rating: 4.9 },
        { driverId: '5', driverName: 'Moussa Diallo', deliveries: 65, averageTime: 32, rating: 4.5 },
      ],
    };
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(
    restaurantId: string,
    period: Period
  ): Promise<PaymentAnalytics> {
    return {
      total: 8925000,
      byMethod: {
        ORANGE_MONEY: { count: 287, amount: 3125000 },
        MTN_MOMO: { count: 198, amount: 2150000 },
        WAVE: { count: 156, amount: 1780000 },
        CASH: { count: 145, amount: 1250000 },
        CARD: { count: 61, amount: 620000 },
      },
      successRate: 97.8,
      failureRate: 2.2,
      averageProcessingTime: 3.2,
    };
  }

  /**
   * Get top products analytics
   */
  async getTopProducts(
    restaurantId: string,
    period: Period,
    limit: number = 10
  ): Promise<ProductAnalytics[]> {
    const products: ProductAnalytics[] = [
      { productId: '1', productName: 'Attieké Poisson Grillé', category: 'Plats Principaux', quantitySold: 245, revenue: 1960000, rank: 1, trend: 'up' },
      { productId: '2', productName: 'Kedjenou de Poulet', category: 'Plats Principaux', quantitySold: 198, revenue: 1584000, rank: 2, trend: 'up' },
      { productId: '3', productName: 'Thiéboudienne', category: 'Plats Principaux', quantitySold: 187, revenue: 1309000, rank: 3, trend: 'stable' },
      { productId: '4', productName: 'Alloco Sauce Graine', category: 'Plats Principaux', quantitySold: 156, revenue: 1092000, rank: 4, trend: 'up' },
      { productId: '5', productName: 'Riz Gras', category: 'Plats Principaux', quantitySold: 134, revenue: 804000, rank: 5, trend: 'down' },
      { productId: '6', productName: 'Garba', category: 'Plats Principaux', quantitySold: 128, revenue: 640000, rank: 6, trend: 'stable' },
      { productId: '7', productName: 'Foutou Banane', category: 'Plats Principaux', quantitySold: 98, revenue: 588000, rank: 7, trend: 'up' },
      { productId: '8', productName: 'Jus de Bissap', category: 'Boissons', quantitySold: 312, revenue: 468000, rank: 8, trend: 'up' },
      { productId: '9', productName: 'Jus de Gingembre', category: 'Boissons', quantitySold: 287, revenue: 430500, rank: 9, trend: 'stable' },
      { productId: '10', productName: 'Banane Plantain Frite', category: 'Accompagnements', quantitySold: 189, revenue: 283500, rank: 10, trend: 'down' },
    ];

    return products.slice(0, limit);
  }

  /**
   * Get complete dashboard metrics
   */
  async getDashboardMetrics(
    restaurantId: string,
    period: Period
  ): Promise<DashboardMetrics> {
    const [revenue, orders, customers, deliveries, payments, topProducts] = await Promise.all([
      this.getRevenueAnalytics(restaurantId, period),
      this.getOrderAnalytics(restaurantId, period),
      this.getCustomerAnalytics(restaurantId, period),
      this.getDeliveryAnalytics(restaurantId, period),
      this.getPaymentAnalytics(restaurantId, period),
      this.getTopProducts(restaurantId, period),
    ]);

    return {
      revenue,
      orders,
      customers,
      deliveries,
      payments,
      topProducts,
    };
  }

  /**
   * Generate report data
   */
  async generateReport(
    restaurantId: string,
    reportType: 'daily' | 'weekly' | 'monthly',
    date: Date = new Date()
  ): Promise<{
    generatedAt: Date;
    period: { start: Date; end: Date };
    summary: {
      revenue: number;
      orders: number;
      customers: number;
      topProducts: ProductAnalytics[];
    };
    details: DashboardMetrics;
  }> {
    const period = reportType === 'daily' ? 'today' : reportType === 'weekly' ? 'week' : 'month';
    const metrics = await this.getDashboardMetrics(restaurantId, period);
    const range = this.getDateRange(period);

    return {
      generatedAt: new Date(),
      period: range,
      summary: {
        revenue: metrics.revenue.total,
        orders: metrics.orders.total,
        customers: metrics.customers.total,
        topProducts: metrics.topProducts.slice(0, 5),
      },
      details: metrics,
    };
  }

  // ============================================
  // Helper Methods for Mock Data Generation
  // ============================================

  private generateDailyRevenue(range: DateRange): Array<{ date: string; amount: number; orders: number }> {
    const data: Array<{ date: string; amount: number; orders: number }> = [];
    const current = new Date(range.start);
    
    while (current <= range.end) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseAmount = isWeekend ? 1500000 : 1200000;
      const variance = Math.random() * 400000 - 200000;
      
      data.push({
        date: current.toISOString().split('T')[0],
        amount: Math.round(baseAmount + variance),
        orders: Math.round((baseAmount + variance) / 10500),
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return data;
  }

  private generateMonthlyRevenue(range: DateRange): Array<{ month: string; amount: number; orders: number }> {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months.map((month, index) => ({
      month,
      amount: Math.round(8000000 + Math.random() * 4000000),
      orders: Math.round(750 + Math.random() * 250),
    }));
  }

  private generateHourlyOrders(): Array<{ hour: number; count: number }> {
    const hourlyPattern = [
      2, 1, 0, 0, 0, 1, 3, 8, 15, 12, 10, 18, 25, 30, 22, 15, 12, 20, 28, 22, 15, 10, 5, 3
    ];
    return hourlyPattern.map((count, hour) => ({ hour, count }));
  }

  private generateWeeklyOrders(): Array<{ day: string; count: number }> {
    return [
      { day: 'Dim', count: 145 },
      { day: 'Lun', count: 98 },
      { day: 'Mar', count: 112 },
      { day: 'Mer', count: 108 },
      { day: 'Jeu', count: 115 },
      { day: 'Ven', count: 132 },
      { day: 'Sam', count: 137 },
    ];
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
