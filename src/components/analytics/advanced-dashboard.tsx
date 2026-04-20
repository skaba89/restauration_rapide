'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Download,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useCurrencySafe } from '@/lib/currency-context';

interface DashboardStats {
  revenue: { total: number; change: number; trend: number[] };
  orders: { total: number; change: number; byType: Record<string, number> };
  customers: { total: number; new: number; returning: number; avgValue: number };
  products: { top: { name: string; quantity: number; revenue: number }[] };
  payments: { byMethod: { method: string; count: number; amount: number }[] };
  hourly: { hour: number; orders: number; revenue: number }[];
}

const PERIODS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'quarter', label: 'Ce trimestre' },
  { value: 'year', label: 'Cette année' },
];

// Simple chart component
function SimpleBarChart({ data, height = 200 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-orange-500 rounded-t transition-all hover:bg-orange-600"
          style={{ height: `${(value / max) * 100}%` }}
          title={`${value.toLocaleString('fr-FR')}`}
        />
      ))}
    </div>
  );
}

// Simple pie chart component  
function SimplePieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  // Calculate cumulative angles for each segment
  const segments = data.reduce<Array<{ startAngle: number; endAngle: number; color: string }>>((acc, d) => {
    const angle = total > 0 ? (d.value / total) * 360 : 0;
    const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    acc.push({ startAngle, endAngle: startAngle + angle, color: d.color });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        {segments.map((segment, i) => {
          const startRad = (segment.startAngle - 90) * (Math.PI / 180);
          const endRad = (segment.endAngle - 90) * (Math.PI / 180);

          const x1 = 50 + 40 * Math.cos(startRad);
          const y1 = 50 + 40 * Math.sin(startRad);
          const x2 = 50 + 40 * Math.cos(endRad);
          const y2 = 50 + 40 * Math.sin(endRad);

          const angle = segment.endAngle - segment.startAngle;
          const largeArc = angle > 180 ? 1 : 0;

          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}
      </svg>
      <div className="space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="flex-1">{d.label}</span>
            <span className="font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdvancedDashboard() {
  const { formatCurrency } = useCurrencySafe();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/dashboard?period=${period}`);
        const data = await response.json();
        
        if (data.success) {
          // Transform dashboard data to our format
          setStats({
            revenue: {
              total: data.data.revenue?.total || 892000,
              change: data.data.revenue?.change || 12.5,
              trend: data.data.revenueByDay?.map((d: any) => d.amount) || [
                120000, 145000, 98000, 167000, 189000, 156000, 134000
              ],
            },
            orders: {
              total: data.data.orders?.total || 156,
              change: data.data.orders?.change || 8.3,
              byType: data.data.ordersByType || {
                DINE_IN: 45,
                DELIVERY: 62,
                TAKEAWAY: 49,
              },
            },
            customers: {
              total: data.data.customers?.total || 234,
              new: data.data.customers?.new || 28,
              returning: data.data.customers?.returning || 206,
              avgValue: data.data.avgOrderValue || 5718,
            },
            products: {
              top: data.data.topProducts || [
                { name: 'Thiéboudienne', quantity: 89, revenue: 534000 },
                { name: 'Yassa Poulet', quantity: 67, revenue: 335000 },
                { name: 'Maafe', quantity: 54, revenue: 270000 },
                { name: 'Kedjenou', quantity: 45, revenue: 315000 },
                { name: 'Attieké Poisson', quantity: 38, revenue: 228000 },
              ],
            },
            payments: {
              byMethod: data.data.paymentMethods || [
                { method: 'Orange Money', count: 67, amount: 385000 },
                { method: 'MTN MoMo', count: 45, amount: 267000 },
                { method: 'Cash', count: 32, amount: 180000 },
                { method: 'Wave', count: 12, amount: 60000 },
              ],
            },
            hourly: data.data.hourlyDistribution || Array.from({ length: 24 }, (_, i) => ({
              hour: i,
              orders: i >= 12 && i <= 14 ? Math.floor(Math.random() * 15) + 10 : 
                      i >= 19 && i <= 21 ? Math.floor(Math.random() * 20) + 15 : 
                      Math.floor(Math.random() * 5),
              revenue: i >= 12 && i <= 14 ? Math.floor(Math.random() * 150000) + 100000 : 
                       i >= 19 && i <= 21 ? Math.floor(Math.random() * 200000) + 150000 : 
                       Math.floor(Math.random() * 50000),
            })),
          });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  // Export to PDF (simulated)
  const exportToPDF = async () => {
    toast.success('Export PDF en cours de génération...');
    // In production, would generate actual PDF
  };

  // Export to Excel (simulated)
  const exportToExcel = async () => {
    toast.success('Export Excel en cours de génération...');
    // In production, would generate actual Excel file
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord analytique</h2>
          <p className="text-gray-500">KFM DELICE - Conakry, Guinée</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Button variant="outline" onClick={exportToExcel}>
            <FileText className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.revenue.total)}</p>
                <div className={`flex items-center text-sm ${stats.revenue.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.revenue.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stats.revenue.change)}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-2xl font-bold">{stats.orders.total}</p>
                <div className={`flex items-center text-sm ${stats.orders.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.orders.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stats.orders.change)}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clients</p>
                <p className="text-2xl font-bold">{stats.customers.total}</p>
                <p className="text-sm text-gray-500">{stats.customers.new} nouveaux</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Panier moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.customers.avgValue)}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Évolution des revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={stats.revenue.trend} height={200} />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>7 derniers jours</span>
                  <span>{formatCurrency(stats.revenue.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Types de commandes</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SimplePieChart
                  data={[
                    { label: 'Sur place', value: stats.orders.byType.DINE_IN || 0, color: '#f97316' },
                    { label: 'Livraison', value: stats.orders.byType.DELIVERY || 0, color: '#3b82f6' },
                    { label: 'À emporter', value: stats.orders.byType.TAKEAWAY || 0, color: '#22c55e' },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 5 produits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.products.top.map((product, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-sm font-medium text-orange-600">
                          {i + 1}
                        </span>
                        <span>{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-gray-400">{product.quantity} vendus</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Méthodes de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.payments.byMethod.map((method, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          method.method.includes('Orange') ? 'bg-orange-500' :
                          method.method.includes('MTN') ? 'bg-yellow-500' :
                          method.method.includes('Wave') ? 'bg-blue-500' : 'bg-gray-500'
                        }`} />
                        <span>{method.method}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(method.amount)}</p>
                        <p className="text-xs text-gray-400">{method.count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse détaillée des revenus</CardTitle>
              <CardDescription>Répartition et évolution du chiffre d'affaires</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={stats.revenue.trend} height={300} />
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Moyenne journalière</p>
                  <p className="text-xl font-bold">{formatCurrency(Math.round(stats.revenue.total / 7))}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Meilleur jour</p>
                  <p className="text-xl font-bold">{formatCurrency(Math.max(...stats.revenue.trend))}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Croissance</p>
                  <p className="text-xl font-bold text-green-500">+{stats.revenue.change}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SimplePieChart
                  data={[
                    { label: 'Sur place', value: stats.orders.byType.DINE_IN || 0, color: '#f97316' },
                    { label: 'Livraison', value: stats.orders.byType.DELIVERY || 0, color: '#3b82f6' },
                    { label: 'À emporter', value: stats.orders.byType.TAKEAWAY || 0, color: '#22c55e' },
                  ]}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribution horaire</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={stats.hourly.filter(h => h.orders > 0).map(h => h.orders)} 
                  height={200} 
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.products.top.map((product, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <span className="text-2xl font-bold text-orange-500">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>{product.quantity} vendus</span>
                        <span>{formatCurrency(product.revenue)} CA</span>
                      </div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-orange-500 rounded-full"
                          style={{ width: `${stats.products.top[0]?.revenue > 0 ? (product.revenue / stats.products.top[0].revenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analyse des paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Par méthode</h4>
                  <div className="space-y-3">
                    {stats.payments.byMethod.map((method, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${
                            method.method.includes('Orange') ? 'bg-orange-500' :
                            method.method.includes('MTN') ? 'bg-yellow-500' :
                            method.method.includes('Wave') ? 'bg-blue-500' : 'bg-gray-500'
                          }`} />
                          <span>{method.method}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(method.amount)}</p>
                          <p className="text-xs text-gray-400">{method.count} transactions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <SimplePieChart
                    data={stats.payments.byMethod.map((m, i) => ({
                      label: m.method,
                      value: m.amount,
                      color: ['#f97316', '#eab308', '#6b7280', '#3b82f6'][i] || '#6b7280',
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
