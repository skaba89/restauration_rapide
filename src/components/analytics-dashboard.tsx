'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Truck, 
  CreditCard,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, DashboardSkeleton } from '@/components/loading-states';
import { analyticsService, Period, DashboardMetrics } from '@/lib/analytics';

// ============================================
// Analytics Dashboard Component
// ============================================

interface AnalyticsDashboardProps {
  restaurantId: string;
}

export function AnalyticsDashboard({ restaurantId }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<Period>('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics data
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['analytics', restaurantId, period],
    queryFn: () => analyticsService.getDashboardMetrics(restaurantId, period),
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances de votre restaurant</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="yesterday">Hier</SelectItem>
              <SelectItem value="week">7 jours</SelectItem>
              <SelectItem value="month">30 jours</SelectItem>
              <SelectItem value="quarter">90 jours</SelectItem>
              <SelectItem value="year">365 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'affaires"
          value={`${(metrics?.revenue.total || 0).toLocaleString()} FCFA`}
          change={metrics?.revenue.changePercent || 0}
          icon={<DollarSign className="w-5 h-5" />}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        
        <KPICard
          title="Commandes"
          value={metrics?.orders.total || 0}
          change={metrics?.orders.changePercent || 0}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        
        <KPICard
          title="Clients"
          value={metrics?.customers.total || 0}
          subtitle={`${metrics?.customers.new || 0} nouveaux`}
          change={12.5}
          icon={<Users className="w-5 h-5" />}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        
        <KPICard
          title="Livraisons"
          value={metrics?.deliveries.totalDeliveries || 0}
          subtitle={`${metrics?.deliveries.onTimeRate}% à l'heure`}
          change={8.3}
          icon={<Truck className="w-5 h-5" />}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution du chiffre d'affaires</CardTitle>
                <CardDescription>Revenus quotidiens sur la période</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={metrics?.revenue.byDay || []} />
              </CardContent>
            </Card>

            {/* Orders by Hour */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition horaire</CardTitle>
                <CardDescription>Commandes par heure de la journée</CardDescription>
              </CardHeader>
              <CardContent>
                <HourlyChart data={metrics?.orders.byHour || []} />
              </CardContent>
            </Card>

            {/* Order Types */}
            <Card>
              <CardHeader>
                <CardTitle>Types de commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTypeDistribution data={metrics?.orders.byType || {}} />
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Méthodes de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodChart data={metrics?.payments.byMethod || {}} />
              </CardContent>
            </Card>
          </div>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produits</CardTitle>
              <CardDescription>Les produits les plus vendus</CardDescription>
            </CardHeader>
            <CardContent>
              <TopProductsTable products={metrics?.topProducts || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <RevenueTab revenue={metrics?.revenue} />
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <OrdersTab orders={metrics?.orders} />
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomersTab customers={metrics?.customers} />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <ProductsTab products={metrics?.topProducts || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// KPI Card Component
// ============================================

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function KPICard({ title, value, subtitle, change, icon, color, bgColor }: KPICardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold">{value.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Revenue Chart Component
// ============================================

interface RevenueChartProps {
  data: Array<{ date: string; amount: number; orders: number }>;
}

function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) return <div className="h-[200px] flex items-center justify-center text-muted-foreground">Aucune donnée</div>;

  const maxAmount = Math.max(...data.map(d => d.amount));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between h-[200px] gap-1">
        {data.slice(-14).map((item, index) => (
          <div
            key={index}
            className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors cursor-pointer relative group"
            style={{ height: `${(item.amount / maxAmount) * 100}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {(item.amount / 1000).toFixed(0)}K FCFA
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// ============================================
// Hourly Chart Component
// ============================================

interface HourlyChartProps {
  data: Array<{ hour: number; count: number }>;
}

function HourlyChart({ data }: HourlyChartProps) {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between h-[150px] gap-0.5">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 rounded-t transition-colors cursor-pointer"
            style={{ height: `${(item.count / maxCount) * 100}%` }}
            title={`${item.hour}h: ${item.count} commandes`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

// ============================================
// Order Type Distribution Component
// ============================================

function OrderTypeDistribution({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const types = [
    { key: 'DINE_IN', label: 'Sur place', color: 'bg-green-500' },
    { key: 'DELIVERY', label: 'Livraison', color: 'bg-blue-500' },
    { key: 'TAKEAWAY', label: 'À emporter', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-4">
      {types.map(type => {
        const count = data[type.key] || 0;
        const percent = total > 0 ? (count / total) * 100 : 0;
        
        return (
          <div key={type.key} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{type.label}</span>
              <span className="font-medium">{count} ({percent.toFixed(1)}%)</span>
            </div>
            <Progress value={percent} className="h-2" />
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Payment Method Chart Component
// ============================================

function PaymentMethodChart({ data }: { data: Record<string, { count: number; amount: number }> }) {
  const total = Object.values(data).reduce((a, b) => a + b.amount, 0);
  const methods = [
    { key: 'ORANGE_MONEY', label: 'Orange Money', color: 'bg-orange-500' },
    { key: 'MTN_MOMO', label: 'MTN MoMo', color: 'bg-yellow-500' },
    { key: 'WAVE', label: 'Wave', color: 'bg-blue-400' },
    { key: 'CASH', label: 'Espèces', color: 'bg-green-600' },
    { key: 'CARD', label: 'Carte', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-3">
      {methods.map(method => {
        const item = data[method.key];
        if (!item) return null;
        const percent = total > 0 ? (item.amount / total) * 100 : 0;
        
        return (
          <div key={method.key} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${method.color}`} />
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span>{method.label}</span>
                <span>{(item.amount / 1000).toFixed(0)}K FCFA</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-12 text-right">{percent.toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// Top Products Table Component
// ============================================

interface ProductAnalytics {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

function TopProductsTable({ products }: { products: ProductAnalytics[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-2 font-medium">Rang</th>
            <th className="text-left py-3 px-2 font-medium">Produit</th>
            <th className="text-left py-3 px-2 font-medium">Catégorie</th>
            <th className="text-right py-3 px-2 font-medium">Vendus</th>
            <th className="text-right py-3 px-2 font-medium">Revenus</th>
            <th className="text-center py-3 px-2 font-medium">Tendance</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId} className="border-b hover:bg-muted/50">
              <td className="py-3 px-2">
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  product.rank <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {product.rank}
                </span>
              </td>
              <td className="py-3 px-2 font-medium">{product.productName}</td>
              <td className="py-3 px-2 text-muted-foreground">{product.category}</td>
              <td className="py-3 px-2 text-right">{product.quantitySold}</td>
              <td className="py-3 px-2 text-right">{(product.revenue / 1000).toFixed(0)}K FCFA</td>
              <td className="py-3 px-2 text-center">
                {product.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 inline" />}
                {product.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 inline" />}
                {product.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400 inline" />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================
// Tab Content Components
// ============================================

function RevenueTab({ revenue }: { revenue?: any }) {
  if (!revenue) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif des revenus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total période</span>
            <span className="font-bold">{revenue.total.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Période précédente</span>
            <span>{revenue.previousPeriod.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Variation</span>
            <span className={revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {revenue.change >= 0 ? '+' : ''}{revenue.change.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Variation %</span>
            <Badge variant={revenue.changePercent >= 0 ? 'default' : 'destructive'}>
              {revenue.changePercent >= 0 ? '+' : ''}{revenue.changePercent.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Évolution mensuelle</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenue.byMonth?.map((m: any) => ({
            date: m.month,
            amount: m.amount,
            orders: m.orders
          })) || []} />
        </CardContent>
      </Card>
    </div>
  );
}

function OrdersTab({ orders }: { orders?: any }) {
  if (!orders) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(orders.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span>{status}</span>
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Métriques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Valeur moyenne</span>
            <span className="font-medium">{orders.averageValue.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span>Articles moyens</span>
            <span className="font-medium">{orders.averageItems}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomersTab({ customers }: { customers?: any }) {
  if (!customers) return null;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Segments clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.segments.map((segment: any) => (
              <div key={segment.segment} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{segment.segment}</span>
                  <span>{segment.count} ({segment.percentage}%)</span>
                </div>
                <Progress value={segment.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {customers.topCustomers.map((customer: any) => (
              <div key={customer.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-xs text-muted-foreground">{customer.totalOrders} commandes</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{(customer.totalSpent / 1000).toFixed(0)}K FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductsTab({ products }: { products: ProductAnalytics[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance des produits</CardTitle>
      </CardHeader>
      <CardContent>
        <TopProductsTable products={products} />
      </CardContent>
    </Card>
  );
}

export default AnalyticsDashboard;
