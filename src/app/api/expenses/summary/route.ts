import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Calculate summary from expenses
function calculateSummary(expenses: Array<{ amount: number; date: Date; category: string; status: string; paymentMethod: string }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Calculate totals
  const todayTotal = expenses
    .filter(e => new Date(e.date) >= today)
    .reduce((sum, e) => sum + e.amount, 0);

  const weekTotal = expenses
    .filter(e => new Date(e.date) >= weekStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const monthTotal = expenses
    .filter(e => new Date(e.date) >= monthStart)
    .reduce((sum, e) => sum + e.amount, 0);

  const lastMonthTotal = expenses
    .filter(e => {
      const date = new Date(e.date);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingTotal = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const paidTotal = expenses
    .filter(e => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);

  const approvedTotal = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by payment method
  const byPaymentMethod = expenses.reduce((acc, e) => {
    acc[e.paymentMethod] = (acc[e.paymentMethod] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  // Daily totals for current month (for charts)
  const dailyTotals: Array<{ date: string; amount: number }> = [];
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(now.getFullYear(), now.getMonth(), day);
    const dayTotal = expenses
      .filter(e => {
        const eDate = new Date(e.date);
        return eDate.getFullYear() === dayDate.getFullYear() &&
               eDate.getMonth() === dayDate.getMonth() &&
               eDate.getDate() === dayDate.getDate();
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    if (dayTotal > 0) {
      dailyTotals.push({
        date: dayDate.toISOString().split('T')[0],
        amount: dayTotal,
      });
    }
  }

  // Weekly comparison (last 4 weeks)
  const weeklyComparison: Array<{ week: string; amount: number }> = [];
  for (let i = 3; i >= 0; i--) {
    const weekStartDate = new Date(today);
    weekStartDate.setDate(today.getDate() - (today.getDay() + (i * 7)));
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const weekTotal = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date >= weekStartDate && date <= weekEndDate;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    weeklyComparison.push({
      week: `S${getWeekNumber(weekStartDate)}`,
      amount: weekTotal,
    });
  }

  // Category breakdown with percentages
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = Object.entries(byCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0,
  })).sort((a, b) => b.amount - a.amount);

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    lastMonth: lastMonthTotal,
    total,
    pending: pendingTotal,
    paid: paidTotal,
    approved: approvedTotal,
    byCategory,
    byPaymentMethod,
    dailyTotals,
    weeklyComparison,
    categoryBreakdown,
    count: expenses.length,
    pendingCount: expenses.filter(e => e.status === 'pending').length,
    paidCount: expenses.filter(e => e.status === 'paid').length,
    approvedCount: expenses.filter(e => e.status === 'approved').length,
  };
}

// Helper to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// GET - Get expense summary
export async function GET(request: NextRequest) {
  try {
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json(
        { success: false, error: 'Base de données non disponible' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'month'; // today, week, month, year

    // Real database query
    const where: Record<string, unknown> = { organizationId };
    if (restaurantId) where.restaurantId = restaurantId;

    // Apply date filters
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    } else {
      // Default period filtering
      const now = new Date();
      switch (period) {
        case 'today':
          where.date = { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          where.date = { gte: weekStart };
          break;
        case 'month':
          where.date = { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
          break;
        case 'year':
          where.date = { gte: new Date(now.getFullYear(), 0, 1) };
          break;
      }
    }

    const expenses = await db.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const summary = calculateSummary(expenses.map(e => ({
      amount: e.amount,
      date: e.date,
      category: e.category,
      status: e.status,
      paymentMethod: e.paymentMethod || 'Non spécifié',
    })));

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du résumé des dépenses' },
      { status: 500 }
    );
  }
}