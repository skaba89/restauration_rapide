'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp, CheckCircle, Clock, Calendar, DollarSign, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ExpenseStatsData {
  today: number;
  week: number;
  month: number;
  lastMonth?: number;
  total: number;
  pending: number;
  paid: number;
  approved?: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  dailyTotals?: Array<{ date: string; amount: number }>;
  weeklyComparison?: Array<{ week: string; amount: number }>;
  categoryBreakdown?: Array<{ category: string; amount: number; percentage: string | number }>;
  count: number;
  pendingCount: number;
  paidCount: number;
  approvedCount?: number;
}

interface ExpenseStatsProps {
  stats: ExpenseStatsData | null;
  isLoading?: boolean;
}

// Format GNF currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

// Format compact currency
const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M GNF';
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + 'K GNF';
  }
  return amount + ' GNF';
};

// Category colors and labels
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  supplies: { label: 'Fournitures', color: 'bg-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  utilities: { label: 'Factures', color: 'bg-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  rent: { label: 'Loyer', color: 'bg-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  salaries: { label: 'Salaires', color: 'bg-green-500', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-500', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  marketing: { label: 'Marketing', color: 'bg-pink-500', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  other: { label: 'Autres', color: 'bg-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-900/30' },
};

export function ExpenseStats({ stats, isLoading }: ExpenseStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const pendingPercentage = stats?.total ? Math.round((stats.pending / stats.total) * 100) : 0;
  const paidPercentage = stats?.total ? Math.round((stats.paid / stats.total) * 100) : 0;
  const approvedPercentage = stats?.total && stats.approved ? Math.round((stats.approved / stats.total) * 100) : 0;

  // Calculate month over month change
  const monthOverMonthChange = stats?.lastMonth && stats.lastMonth > 0
    ? ((stats.month - stats.lastMonth) / stats.lastMonth) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aujourd&apos;hui</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.today || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cette semaine</p>
                <p className="text-xl font-bold">{formatCurrency(stats?.week || 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-xl font-bold">{formatCompactCurrency(stats?.month || 0)}</p>
                {monthOverMonthChange !== 0 && (
                  <div className={`flex items-center gap-1 text-xs ${monthOverMonthChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {monthOverMonthChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(monthOverMonthChange).toFixed(1)}% vs mois dernier
                  </div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{formatCompactCurrency(stats?.total || 0)}</p>
                <p className="text-xs text-muted-foreground">{stats?.count || 0} dépenses</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Payé</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCompactCurrency(stats?.paid || 0)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.paidCount || 0} transactions</p>
                </div>
              </div>
              <Progress value={paidPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{paidPercentage}% du total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="font-medium">En attente</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-yellow-600">{formatCompactCurrency(stats?.pending || 0)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.pendingCount || 0} transactions</p>
                </div>
              </div>
              <Progress value={pendingPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{pendingPercentage}% du total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Approuvé</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{formatCompactCurrency(stats?.approved || 0)}</p>
                  <p className="text-xs text-muted-foreground">{stats?.approvedCount || 0} transactions</p>
                </div>
              </div>
              <Progress value={approvedPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">{approvedPercentage}% du total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Répartition par catégorie</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = stats.total ? (amount / stats.total) * 100 : 0;
                  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${config.color}`} />
                          <span>{config.label}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{formatCompactCurrency(amount)}</span>
                          <span className="text-muted-foreground text-xs ml-2">({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${config.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Comparison Chart */}
      {stats?.weeklyComparison && stats.weeklyComparison.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Évolution hebdomadaire</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-end justify-between gap-2 h-32">
              {stats.weeklyComparison.map((week, index) => {
                const maxAmount = Math.max(...stats.weeklyComparison!.map(w => w.amount));
                const height = maxAmount > 0 ? (week.amount / maxAmount) * 100 : 0;
                
                return (
                  <div key={week.week} className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-xs text-muted-foreground mb-1">
                        {formatCompactCurrency(week.amount)}
                      </span>
                      <div 
                        className={`w-full max-w-8 rounded-t transition-all duration-500 ${
                          index === stats.weeklyComparison!.length - 1 
                            ? 'bg-orange-500' 
                            : 'bg-primary/60'
                        }`}
                        style={{ height: `${height}%`, minHeight: week.amount > 0 ? '8px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{week.week}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods Breakdown */}
      {stats?.byPaymentMethod && Object.keys(stats.byPaymentMethod).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Par mode de paiement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-3">
              {Object.entries(stats.byPaymentMethod)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([method, amount]) => {
                  const percentage = stats.total ? (amount / stats.total) * 100 : 0;
                  return (
                    <div 
                      key={method} 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm font-medium">{method}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCompactCurrency(amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ExpenseStats;
