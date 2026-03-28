'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  Truck,
  ChefHat,
  CalendarDays,
  ArrowRight,
  CheckCircle,
  Package,
  Utensils,
  CreditCard,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { dashboardApi } from '@/lib/api-client';

// Demo data for charts (fallback)
const DEMO_SALES_DATA = [
  { name: 'Lun', ventes: 450000, commandes: 32 },
  { name: 'Mar', ventes: 520000, commandes: 38 },
  { name: 'Mer', ventes: 480000, commandes: 35 },
  { name: 'Jeu', ventes: 610000, commandes: 45 },
  { name: 'Ven', ventes: 750000, commandes: 52 },
  { name: 'Sam', ventes: 920000, commandes: 68 },
  { name: 'Dim', ventes: 680000, commandes: 48 },
];

const DEMO_PAYMENT_METHODS = [
  { name: 'Orange Money', value: 35, color: '#f97316' },
  { name: 'MTN Momo', value: 25, color: '#fbbf24' },
  { name: 'Wave', value: 20, color: '#1d4ed8' },
  { name: 'Cash', value: 15, color: '#22c55e' },
  { name: 'Carte', value: 5, color: '#8b5cf6' },
];

const DEMO_TOP_ITEMS = [
  { name: 'Attieké Poisson Grillé', orders: 156, revenue: 1248000 },
  { name: 'Kedjenou de Poulet', orders: 142, revenue: 994000 },
  { name: 'Thiéboudienne', orders: 128, revenue: 896000 },
  { name: 'Alloco Sauce Graine', orders: 115, revenue: 575000 },
  { name: 'Riz Gras', orders: 98, revenue: 490000 },
];

const DEMO_RECENT_ORDERS = [
  { id: 'ORD-2024-0145', customer: 'Kouamé Jean', total: 8500, status: 'PENDING', type: 'DELIVERY', time: '12:30' },
  { id: 'ORD-2024-0144', customer: 'Aya Marie', total: 4500, status: 'PREPARING', type: 'DINE_IN', time: '12:25' },
  { id: 'ORD-2024-0143', customer: 'Koné Ibrahim', total: 12000, status: 'READY', type: 'TAKEAWAY', time: '12:15' },
  { id: 'ORD-2024-0142', customer: 'Diallo Fatou', total: 6000, status: 'OUT_FOR_DELIVERY', type: 'DELIVERY', time: '12:00' },
  { id: 'ORD-2024-0141', customer: 'Touré Amadou', total: 10500, status: 'COMPLETED', type: 'DINE_IN', time: '11:45' },
];

// Format currency for FCFA
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;

// Dashboard data type
interface DashboardData {
  period: string;
  summary: {
    ordersCount: number;
    revenue: number;
    avgOrderValue: number;
    customersCount: number;
    newCustomersCount: number;
    deliveriesCount: number;
    activeDeliveries: number;
  };
  ordersByStatus: Array<{ status: string; count: number }>;
  ordersByType: Array<{ type: string; count: number }>;
  paymentsByMethod: Array<{ method: string; amount: number; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ productId: string | null; name: string; quantity: number; revenue: number }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    status: string;
    orderType: string;
    total: number;
    createdAt: string;
    items?: Array<{ itemName: string; quantity: number; unitPrice: number }>;
  }>;
  hourlyDistribution?: Array<{ hour: string; orders: number; revenue: number }>;
  activeDrivers?: number;
  tablesOccupied?: number;
  tablesAvailable?: number;
  reservationsToday?: number;
}

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Always use demo mode for now
        const data = await dashboardApi.get({ period: selectedPeriod, demo: 'true' } as any);
        setDashboardData(data as DashboardData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
      PREPARING: 'bg-orange-100 text-orange-700 border-orange-200',
      READY: 'bg-green-100 text-green-700 border-green-200',
      OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-700 border-purple-200',
      DELIVERED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PREPARING: 'En préparation',
      READY: 'Prête',
      OUT_FOR_DELIVERY: 'En livraison',
      DELIVERED: 'Livrée',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  const getPaymentMethodName = (method: string) => {
    const names: Record<string, string> = {
      MOBILE_MONEY_ORANGE: 'Orange Money',
      MOBILE_MONEY_MTN: 'MTN Momo',
      MOBILE_MONEY_WAVE: 'Wave',
      CASH: 'Espèces',
      CARD: 'Carte',
    };
    return names[method] || method;
  };

  // Get counts from ordersByStatus
  const getOrdersByStatusCount = (status: string) => {
    return dashboardData?.ordersByStatus?.find(s => s.status === status)?.count || 0;
  };

  // Prepare chart data
  const salesData = dashboardData?.revenueByDay?.map(d => ({
    name: new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
    ventes: d.revenue,
    commandes: d.orders,
  })) || DEMO_SALES_DATA;

  // Calculate payment method percentages
  const totalPayments = dashboardData?.paymentsByMethod?.reduce((sum, p) => sum + p.amount, 0) || 1;
  const paymentMethods = dashboardData?.paymentsByMethod?.map(p => ({
    name: getPaymentMethodName(p.method),
    value: Math.round((p.amount / totalPayments) * 100),
    color: 
      p.method === 'MOBILE_MONEY_ORANGE' ? '#f97316' :
      p.method === 'MOBILE_MONEY_MTN' ? '#fbbf24' :
      p.method === 'MOBILE_MONEY_WAVE' ? '#1d4ed8' :
      p.method === 'CASH' ? '#22c55e' : '#8b5cf6',
  })) || DEMO_PAYMENT_METHODS;

  // Top products
  const topItems = dashboardData?.topProducts?.slice(0, 5) || DEMO_TOP_ITEMS;

  // Recent orders
  const recentOrders = dashboardData?.recentOrders?.map(o => ({
    id: o.orderNumber,
    customer: o.customerName,
    total: o.total,
    status: o.status,
    type: o.orderType,
    time: new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  })) || DEMO_RECENT_ORDERS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenue sur votre tableau de bord</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as 'today' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
              <TabsTrigger value="month">Mois</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.summary?.revenue || 0)}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+12.5%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{dashboardData?.summary?.ordersCount || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+8.3%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customers */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold">{dashboardData?.summary?.customersCount || 0}</p>
                  <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>+5.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Average Order Value */}
        <Card>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.summary?.avgOrderValue || 0)}</p>
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <TrendingDown className="h-4 w-4" />
                    <span>-2.1%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getOrdersByStatusCount('PENDING')}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getOrdersByStatusCount('PREPARING')}</p>
                  <p className="text-xs text-muted-foreground">En préparation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getOrdersByStatusCount('READY')}</p>
                  <p className="text-xs text-muted-foreground">Prêtes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboardData?.activeDrivers || 0}</p>
                  <p className="text-xs text-muted-foreground">Drivers actifs</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ventes de la semaine</CardTitle>
            <CardDescription>Évolution du chiffre d'affaires et des commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}k`} />
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
                      dataKey="ventes"
                      stroke="#f97316"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVentes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          {/* Tables Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">État des tables</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Occupation</span>
                    <span className="font-semibold">
                      {dashboardData?.tablesOccupied || 0}/{(dashboardData?.tablesOccupied || 0) + (dashboardData?.tablesAvailable || 0)}
                    </span>
                  </div>
                  <Progress 
                    value={((dashboardData?.tablesOccupied || 0) / Math.max(1, (dashboardData?.tablesOccupied || 0) + (dashboardData?.tablesAvailable || 0))) * 100} 
                    className="h-2" 
                  />
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                      <p className="text-lg font-bold text-red-600">{dashboardData?.tablesOccupied || 0}</p>
                      <p className="text-xs text-muted-foreground">Occupées</p>
                    </div>
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                      <p className="text-lg font-bold text-green-600">{dashboardData?.tablesAvailable || 0}</p>
                      <p className="text-xs text-muted-foreground">Disponibles</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reservations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Réservations aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-12" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : (
                <>
                  <p className="text-3xl font-bold">{dashboardData?.reservationsToday || 0}</p>
                  <p className="text-sm text-muted-foreground">Couverts prévus</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Moyens de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="text-sm">{method.name}</span>
                      </div>
                      <span className="text-sm font-medium">{method.value}%</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Commandes récentes</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          order.type === 'DELIVERY' ? 'bg-purple-100 text-purple-600' :
                          order.type === 'TAKEAWAY' ? 'bg-blue-100 text-blue-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {order.type === 'DELIVERY' ? <Truck className="h-5 w-5" /> :
                           order.type === 'TAKEAWAY' ? <Package className="h-5 w-5" /> :
                           <Utensils className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{formatCurrency(order.total)}</p>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Plats populaires</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px]">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topItems.map((item, idx) => (
                    <div
                      key={item.productId || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.orders || item.quantity} commandes</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-green-600">{formatCurrency(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
