'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Store,
  Building2,
  Globe,
  Activity,
  Zap,
  Truck,
  Calendar,
  Star,
} from 'lucide-react';

// Dynamic imports for recharts to avoid SSR issues with React 19
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

const COLORS = ['#8b5cf6', '#6366f1', '#4f46e5', '#a78bfa', '#c4b5fd'];

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatNumber = (num: number) => num?.toLocaleString('fr-FR') || '0';

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [growthData, setGrowthData] = useState([]);
  const [featureUsage, setFeatureUsage] = useState([]);
  const [geographicData, setGeographicData] = useState([]);
  const [hourlyOrders, setHourlyOrders] = useState([]);
  const [topOrganizations, setTopOrganizations] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState<any>({
    totalOrders: 0,
    avgDeliveryTime: 0,
    customerSatisfaction: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders' | 'users'>('revenue');

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Platform-wide analytics and insights</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-xl font-bold">{formatNumber(platformMetrics.totalOrders)}</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5%</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Avg Delivery</p>
                <p className="text-xl font-bold">{platformMetrics.avgDeliveryTime} min</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>-5.2%</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Satisfaction</p>
                <p className="text-xl font-bold">{platformMetrics.customerSatisfaction}/5</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+0.3</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Active Drivers</p>
                <p className="text-xl font-bold">{platformMetrics.activeDrivers}</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+8</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Peak Hour</p>
                <p className="text-xl font-bold">{platformMetrics.peakHourOrders}</p>
                <p className="text-xs text-muted-foreground">orders/hour</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-xl font-bold">34.5%</p>
                <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+5.2%</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue/Orders/Users Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>Monthly trends for key metrics</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('revenue')}
                >
                  Revenue
                </Button>
                <Button
                  variant={selectedMetric === 'orders' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('orders')}
                >
                  Orders
                </Button>
                <Button
                  variant={selectedMetric === 'users' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMetric('users')}
                >
                  Users
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => 
                      selectedMetric === 'revenue' ? `${v / 1000000}M` : 
                      selectedMetric === 'orders' ? `${v / 1000}K` : v
                    } />
                    <Tooltip
                      formatter={(value: number) => 
                        selectedMetric === 'revenue' ? formatCurrency(value) : formatNumber(value)
                      }
                      labelStyle={{ color: '#000' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hourly Orders & Feature Usage */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Hourly Orders Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Distribution by Hour</CardTitle>
            <CardDescription>Peak hours analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyOrders}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>Platform features adoption rate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <feature.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{feature.feature}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution & Top Organizations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Restaurants by country</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {geographicData.map((country, index) => (
                  <div key={country.code} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {country.code}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{country.country}</p>
                        <p className="text-xs text-muted-foreground">{country.count} restaurants</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(country.revenue)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {country.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Organizations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Top Organizations
            </CardTitle>
            <CardDescription>By revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topOrganizations.map((org, index) => (
                  <div key={org.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{org.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {org.restaurants} restaurants · {formatNumber(org.orders)} orders
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(org.revenue)}</p>
                      <div className={`flex items-center gap-1 text-xs ${org.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {org.growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        <span>{org.growth >= 0 ? '+' : ''}{org.growth}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Health
          </CardTitle>
          <CardDescription>System performance and availability</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-medium text-green-700 dark:text-green-400">API Status</span>
                </div>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-700 dark:text-blue-400">Response Time</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">45ms</p>
                <p className="text-xs text-muted-foreground">Average</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-700 dark:text-purple-400">Delivery Rate</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">98.5%</p>
                <p className="text-xs text-muted-foreground">On-time</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-700 dark:text-amber-400">Avg Rating</span>
                </div>
                <p className="text-2xl font-bold text-amber-600">4.6</p>
                <p className="text-xs text-muted-foreground">Customer satisfaction</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}