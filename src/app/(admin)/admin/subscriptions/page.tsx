'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
// Plan type definition (to avoid client-side Prisma import)
type Plan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

// Demo data
const DEMO_SUBSCRIPTION_STATS = [
  { plan: 'STARTER' as Plan, count: 28, revenue: 0, color: '#94a3b8' },
  { plan: 'PRO' as Plan, count: 68, revenue: 3332000, color: '#8b5cf6' },
  { plan: 'BUSINESS' as Plan, count: 42, revenue: 4158000, color: '#6366f1' },
  { plan: 'ENTERPRISE' as Plan, count: 18, revenue: 4482000, color: '#4f46e5' },
];

const DEMO_REVENUE_DATA = [
  { name: 'Jan', mrr: 8200000, newRevenue: 1200000, churn: 200000 },
  { name: 'Feb', mrr: 8500000, newRevenue: 1100000, churn: 180000 },
  { name: 'Mar', mrr: 8900000, newRevenue: 1300000, churn: 220000 },
  { name: 'Apr', mrr: 9100000, newRevenue: 950000, churn: 250000 },
  { name: 'May', mrr: 9800000, newRevenue: 1500000, churn: 190000 },
  { name: 'Jun', mrr: 10500000, newRevenue: 1400000, churn: 210000 },
  { name: 'Jul', mrr: 11972000, newRevenue: 1650000, churn: 180000 },
];

const DEMO_ACTIVE_SUBSCRIPTIONS = [
  {
    id: '1',
    organization: { name: 'Le Groupe Savana', id: 'org-1' },
    plan: 'BUSINESS' as Plan,
    amount: 99000,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-06-15'),
    status: 'active',
    autoRenew: true,
  },
  {
    id: '2',
    organization: { name: 'Saveurs d\'Afrique', id: 'org-2' },
    plan: 'PRO' as Plan,
    amount: 49000,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2025-03-20'),
    status: 'active',
    autoRenew: true,
  },
  {
    id: '3',
    organization: { name: 'La Terrasse Grill', id: 'org-3' },
    plan: 'ENTERPRISE' as Plan,
    amount: 249000,
    startDate: new Date('2023-11-20'),
    endDate: new Date('2025-12-31'),
    status: 'active',
    autoRenew: true,
  },
  {
    id: '4',
    organization: { name: 'Café du Plateau', id: 'org-4' },
    plan: 'PRO' as Plan,
    amount: 49000,
    startDate: new Date('2024-01-05'),
    endDate: new Date('2025-04-01'),
    status: 'cancelled',
    autoRenew: false,
  },
  {
    id: '5',
    organization: { name: 'Maquis Chez Maman', id: 'org-5' },
    plan: 'STARTER' as Plan,
    amount: 0,
    startDate: new Date('2024-04-18'),
    endDate: null,
    status: 'trial',
    autoRenew: false,
  },
];

const DEMO_PAYMENT_HISTORY = [
  {
    id: 'pay-1',
    organization: 'Le Groupe Savana',
    amount: 99000,
    method: 'MOBILE_MONEY_ORANGE',
    status: 'PAID',
    date: new Date('2025-01-15'),
    invoiceNumber: 'INV-2025-001',
  },
  {
    id: 'pay-2',
    organization: 'Saveurs d\'Afrique',
    amount: 49000,
    method: 'MOBILE_MONEY_MTN',
    status: 'PAID',
    date: new Date('2025-01-14'),
    invoiceNumber: 'INV-2025-002',
  },
  {
    id: 'pay-3',
    organization: 'La Terrasse Grill',
    amount: 249000,
    method: 'BANK_TRANSFER',
    status: 'PAID',
    date: new Date('2025-01-10'),
    invoiceNumber: 'INV-2025-003',
  },
  {
    id: 'pay-4',
    organization: 'Café du Plateau',
    amount: 49000,
    method: 'CARD',
    status: 'FAILED',
    date: new Date('2025-01-08'),
    invoiceNumber: 'INV-2025-004',
  },
  {
    id: 'pay-5',
    organization: 'Le Petit Bistro',
    amount: 49000,
    method: 'MOBILE_MONEY_WAVE',
    status: 'PENDING',
    date: new Date('2025-01-12'),
    invoiceNumber: 'INV-2025-005',
  },
];

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getPlanBadgeStyle = (plan: Plan) => {
  const styles: Record<Plan, string> = {
    STARTER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    PRO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    BUSINESS: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    ENTERPRISE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return styles[plan];
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    MOBILE_MONEY_ORANGE: 'Orange Money',
    MOBILE_MONEY_MTN: 'MTN MoMo',
    MOBILE_MONEY_WAVE: 'Wave',
    CARD: 'Card',
    BANK_TRANSFER: 'Bank Transfer',
    CASH: 'Cash',
  };
  return labels[method] || method;
};

export default function SubscriptionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStats, setSubscriptionStats] = useState(DEMO_SUBSCRIPTION_STATS);
  const [revenueData, setRevenueData] = useState(DEMO_REVENUE_DATA);
  const [activeSubscriptions, setActiveSubscriptions] = useState(DEMO_ACTIVE_SUBSCRIPTIONS);
  const [paymentHistory, setPaymentHistory] = useState(DEMO_PAYMENT_HISTORY);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const totalMRR = subscriptionStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalSubscriptions = subscriptionStats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage subscriptions and revenue</p>
        </div>
        <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Recurring Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalMRR)}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+18.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{totalSubscriptions}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+12 this month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">2.3%</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <ArrowDownRight className="h-4 w-4" />
                    <span>-0.5%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Revenue/Account</p>
                  <p className="text-2xl font-bold">{formatCurrency(Math.round(totalMRR / totalSubscriptions))}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      labelStyle={{ color: '#000' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="mrr"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMrr)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Subscriptions by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptionStats.map((stat) => (
                  <div key={stat.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span className="font-medium">{stat.plan}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{stat.count}</span>
                        <span className="text-xs text-muted-foreground ml-1">orgs</span>
                      </div>
                    </div>
                    <Progress 
                      value={(stat.count / totalSubscriptions) * 100} 
                      className="h-2"
                    />
                    {stat.revenue > 0 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {formatCurrency(stat.revenue)}/mo
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Active Subscriptions
          </CardTitle>
          <CardDescription>Current subscription status for all organizations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto-Renew</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{sub.organization.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPlanBadgeStyle(sub.plan)}>
                          {sub.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatCurrency(sub.amount)}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(sub.startDate)} - {sub.endDate ? formatDate(sub.endDate) : 'Ongoing'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            sub.status === 'active' ? 'default' : 
                            sub.status === 'cancelled' ? 'destructive' : 'secondary'
                          }
                          className={sub.status === 'active' ? 'bg-green-600' : ''}
                        >
                          {sub.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {sub.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                          {sub.status === 'trial' && <Clock className="h-3 w-3 mr-1" />}
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {sub.autoRenew ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Recent subscription payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell>{payment.organization}</TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getPaymentMethodLabel(payment.method)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(payment.date)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              payment.status === 'PAID' ? 'default' : 
                              payment.status === 'FAILED' ? 'destructive' : 'secondary'
                            }
                            className={payment.status === 'PAID' ? 'bg-green-600' : ''}
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
