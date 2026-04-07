'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  Clock,
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

interface TopItem {
  id: string;
  name: string;
  orderCount: number;
  revenue: number;
}

interface HourlyData {
  hour: number;
  orders: number;
  revenue: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [recentTrends, setRecentTrends] = useState<Array<{ date: string; revenue: number; orders: number }>>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch analytics data
        const res = await fetch(`/api/analytics?restaurantId=${restaurantId}&period=${period}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.summary || data);
          setTopItems(data.topItems || []);
          setHourlyData(data.hourlyData || []);
          setRecentTrends(data.trends || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchAnalytics();
    }
  }, [restaurantId, period]);

  const formatCurrency = (amount: number) => {
    return `${amount?.toLocaleString() || 0} GNF`;
  };

  const getTrendIcon = (change: number) => {
    if (change >= 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    }
    return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = (change: number) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, valueKey, labelKey }: { data: any[]; valueKey: string; labelKey: string }) => {
    const maxValue = Math.max(...data.map((d) => d[valueKey]));
    
    return (
      <div className="space-y-2">
        {data.slice(0, 10).map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-500 truncate">{item[labelKey]}</span>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded transition-all"
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
            <span className="w-20 text-sm font-medium text-right">
              {typeof item[valueKey] === 'number' ? item[valueKey].toLocaleString() : item[valueKey]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Hourly chart
  const HourlyChart = ({ data }: { data: HourlyData[] }) => {
    const maxValue = Math.max(...data.map((d) => d.orders));

    return (
      <div className="flex items-end gap-1 h-40">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center group"
          >
            <div
              className="w-full bg-orange-200 hover:bg-orange-400 rounded-t transition-colors cursor-pointer"
              style={{ height: `${(item.orders / maxValue) * 100}%` }}
              title={`${item.hour}h: ${item.orders} commandes`}
            />
            {i % 4 === 0 && (
              <span className="text-xs text-gray-400 mt-1">{item.hour}h</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">
            Suivez les performances de votre restaurant
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics?.revenue || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {getTrendIcon(analytics?.revenueChange || 0)}
              <span className={getTrendColor(analytics?.revenueChange || 0)}>
                {Math.abs(analytics?.revenueChange || 0)}%
              </span>
              <span className="text-gray-400 ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Commandes</p>
                <p className="text-2xl font-bold">{analytics?.orders || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {getTrendIcon(analytics?.ordersChange || 0)}
              <span className={getTrendColor(analytics?.ordersChange || 0)}>
                {Math.abs(analytics?.ordersChange || 0)}%
              </span>
              <span className="text-gray-400 ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clients</p>
                <p className="text-2xl font-bold">{analytics?.customers || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm">
              {getTrendIcon(analytics?.customersChange || 0)}
              <span className={getTrendColor(analytics?.customersChange || 0)}>
                {Math.abs(analytics?.customersChange || 0)}%
              </span>
              <span className="text-gray-400 ml-1">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Panier moyen</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics?.avgOrderValue || 0)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Par commande
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Plats les plus vendus
            </CardTitle>
            <CardDescription>Basé sur le nombre de commandes</CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <SimpleBarChart data={topItems} valueKey="orderCount" labelKey="name" />
            )}
          </CardContent>
        </Card>

        {/* Revenue by Item */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenus par plat
            </CardTitle>
            <CardDescription>Les plats qui génèrent le plus de revenus</CardDescription>
          </CardHeader>
          <CardContent>
            {topItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Aucune donnée disponible</p>
              </div>
            ) : (
              <SimpleBarChart data={topItems} valueKey="revenue" labelKey="name" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Répartition horaire
          </CardTitle>
          <CardDescription>Heures les plus actives</CardDescription>
        </CardHeader>
        <CardContent>
          {hourlyData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Aucune donnée disponible</p>
            </div>
          ) : (
            <HourlyChart data={hourlyData} />
          )}
        </CardContent>
      </Card>

      {/* Trend Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Évolution des revenus
          </CardTitle>
          <CardDescription>Tendance sur la période</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTrends.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Les données apparaîtront après quelques commandes</p>
            </div>
          ) : (
            <div className="h-64 flex items-end gap-2">
              {recentTrends.map((trend, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group"
                >
                  <div
                    className="w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-t transition-all hover:from-orange-600 hover:to-orange-400 cursor-pointer"
                    style={{
                      height: `${(trend.revenue / Math.max(...recentTrends.map(t => t.revenue))) * 100}%`,
                      minHeight: '4px',
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white text-center p-1">
                      {formatCurrency(trend.revenue)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 mt-1 rotate-45 origin-left">
                    {trend.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Point fort</p>
              <p className="text-green-700 mt-1">
                Vos revenus sont {analytics?.revenueChange && analytics.revenueChange > 0 ? 'en hausse' : 'stables'} cette période.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Conseil</p>
              <p className="text-blue-700 mt-1">
                Les heures de pointe sont entre 12h et 14h. Préparez-vous en conséquence.
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Opportunité</p>
              <p className="text-orange-700 mt-1">
                Créez des promotions pour augmenter le panier moyen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
