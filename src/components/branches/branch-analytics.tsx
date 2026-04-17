'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Star,
  Calendar,
  Loader2,
  BarChart3,
  Award,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const chartConfig = {
  revenue: {
    label: 'Revenus',
    color: '#f97316',
  },
  orders: {
    label: 'Commandes',
    color: '#3b82f6',
  },
  Kaloum: {
    label: 'Kaloum',
    color: '#f97316',
  },
  Dixinn: {
    label: 'Dixinn',
    color: '#3b82f6',
  },
  Matam: {
    label: 'Matam',
    color: '#22c55e',
  },
} satisfies ChartConfig;

// Format GNF currency
const formatCurrency = (amount: number) => `${(amount / 1000000).toFixed(1)}M GNF`;

export function BranchAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="mt-2 text-muted-foreground">Chargement des analyses...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-500" />
            Analyse comparative
          </h2>
          <p className="text-muted-foreground">
            Comparez les performances de vos succursales
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <TrendingUp className="h-3 w-3 mr-1" />
          +13% ce mois
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus totaux</p>
                <p className="text-xl font-bold">{formatCurrency(analytics.comparison.totalRevenue)}</p>
              </div>
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commandes totales</p>
                <p className="text-xl font-bold">{analytics.comparison.totalOrders}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  {analytics.comparison.avgRating}
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Croissance moyenne</p>
                <p className="text-xl font-bold text-green-600">+{analytics.comparison.avgGrowth}%</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des succursales</CardTitle>
          <CardDescription>Performances de la semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Succursale</th>
                  <th className="text-right py-3 px-4 font-medium">Revenus</th>
                  <th className="text-right py-3 px-4 font-medium">Commandes</th>
                  <th className="text-right py-3 px-4 font-medium">Note</th>
                  <th className="text-right py-3 px-4 font-medium">Croissance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.branches.map((branch, index) => (
                  <tr key={branch.name} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ['#f97316', '#3b82f6', '#22c55e', '#9ca3af'][index] }}
                        />
                        <span className="font-medium">{branch.name}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            Principal
                          </Badge>
                        )}
                        {branch.revenue === 0 && (
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            À venir
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono">
                      {branch.revenue > 0 ? formatCurrency(branch.revenue) : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {branch.orders > 0 ? branch.orders : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {branch.rating > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          {branch.rating}
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        </span>
                      ) : '-'}
                    </td>
                    <td className="text-right py-3 px-4">
                      {branch.growth > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-green-600">
                          <ArrowUpRight className="h-4 w-4" />
                          +{branch.growth}%
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <CardDescription>Par succursale sur 7 jours</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrend}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="Dixinn" 
                    stackId="1"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Kaloum" 
                    stackId="1"
                    stroke="#f97316" 
                    fill="#f97316" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Matam" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Branch */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes par succursale</CardTitle>
            <CardDescription>Répartition des commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.ordersByBranch}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {analytics.ordersByBranch.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance horaire</CardTitle>
            <CardDescription>Commandes et revenus par heure</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.hourlyPerformance}>
                  <XAxis dataKey="hour" fontSize={10} />
                  <YAxis fontSize={10} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Meilleures performances
          </CardTitle>
          <CardDescription>Succursales les plus performantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analytics.topPerformers.map((performer, index) => (
              <div key={performer.branch} className="p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'}>
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{performer.branch}</span>
                </div>
                <p className="text-sm text-muted-foreground">{performer.metric}</p>
                <p className="text-lg font-bold mt-1">{performer.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-sm ${performer.up ? 'text-green-600' : 'text-red-600'}`}>
                  {performer.up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {performer.change}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BranchAnalytics;