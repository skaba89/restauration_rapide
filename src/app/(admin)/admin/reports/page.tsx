'use client';

// ============================================
// Restaurant OS - Admin Reports
// Rapports et analyses
// ============================================

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  Printer,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';
import { useCurrencySafe } from '@/lib/currency-context';

// Dynamic imports for recharts
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false });



// Demo data
const monthlyRevenueData = [
  { month: 'Jan', revenue: 12500000, orders: 1250, customers: 450 },
  { month: 'Fév', revenue: 15200000, orders: 1480, customers: 520 },
  { month: 'Mar', revenue: 18900000, orders: 1820, customers: 610 },
  { month: 'Avr', revenue: 16500000, orders: 1590, customers: 580 },
  { month: 'Mai', revenue: 21000000, orders: 2050, customers: 720 },
  { month: 'Juin', revenue: 24500000, orders: 2380, customers: 850 },
];

const categoryPerformance = [
  { name: 'Plats principaux', value: 45, revenue: 15000000 },
  { name: 'Grillades', value: 25, revenue: 8500000 },
  { name: 'Boissons', value: 15, revenue: 5000000 },
  { name: 'Desserts', value: 10, revenue: 3500000 },
  { name: 'Autres', value: 5, revenue: 1750000 },
];

const restaurantPerformance = [
  { name: 'KFM DELICE - Kaloum', revenue: 32000000, orders: 3200, rating: 4.8 },
  { name: 'KFM DELICE - Dixinn', revenue: 18500000, orders: 1850, rating: 4.6 },
  { name: 'KFM DELICE - Matam', revenue: 12000000, orders: 1200, rating: 4.5 },
];

const COLORS = ['#8b5cf6', '#6366f1', '#4f46e5', '#a78bfa', '#c4b5fd'];

export default function AdminReportsPage() {
  const { formatCurrency } = useCurrencySafe();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [activeReport, setActiveReport] = useState('overview');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const kpis = {
    totalRevenue: 108600000,
    totalOrders: 11570,
    totalCustomers: 3730,
    avgOrderValue: 9400,
    revenueGrowth: 18.5,
    ordersGrowth: 15.2,
    customerGrowth: 22.8,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Rapports & Analyses</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    +{kpis.revenueGrowth}%
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(kpis.totalRevenue)}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    +{kpis.ordersGrowth}%
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{kpis.totalOrders.toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    +{kpis.customerGrowth}%
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{kpis.totalCustomers.toLocaleString()}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            {loading ? <Skeleton className="h-20 w-full" /> : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Panier moyen</p>
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    +5.2%
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(kpis.avgOrderValue)}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution du chiffre d'affaires</CardTitle>
            <CardDescription>Performance mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000000}M`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par catégorie</CardTitle>
            <CardDescription>Répartition des ventes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPerformance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2 mt-4">
              {categoryPerformance.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(cat.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par mois</CardTitle>
            <CardDescription>Volume de commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restaurant Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par restaurant</CardTitle>
          <CardDescription>Classement des points de vente</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {restaurantPerformance.map((restaurant, index) => (
                <div key={restaurant.name} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{restaurant.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{restaurant.orders.toLocaleString()} commandes</span>
                      <span>Note: {restaurant.rating}/5</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(restaurant.revenue)}</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <TrendingUp className="h-3 w-3" />
                      +{(Math.random() * 20 + 5).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Rapport financier</p>
                <p className="text-sm text-muted-foreground">CA, dépenses, bénéfices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Rapport ventes</p>
                <p className="text-sm text-muted-foreground">Commandes, paniers, produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Rapport clients</p>
                <p className="text-sm text-muted-foreground">Acquisition, fidélité, segments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
