'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
  Truck,
  Package,
  Timer,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  ChefHat,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  preparing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  ready: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  picked_up: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  preparing: 'En préparation',
  ready: 'Prêt',
  picked_up: 'Récupéré',
};

const chartConfig = {
  orders: {
    label: 'Commandes',
    color: '#f97316',
  },
  deliveries: {
    label: 'Livraisons',
    color: '#3b82f6',
  },
  takeaway: {
    label: 'À emporter',
    color: '#22c55e',
  },
  time: {
    label: 'Temps (min)',
    color: '#8b5cf6',
  },
} satisfies ChartConfig;

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
  color = 'orange',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}) {
  const bgColors: Record<string, string> = {
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
  };

  const iconColors: Record<string, string> = {
    orange: 'text-orange-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={`p-2 rounded-lg ${bgColors[color]}`}>
            <Icon className={`h-5 w-5 ${iconColors[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DarkKitchenDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({
    todayOrders: 0,
    avgPrepTime: 0,
    targetPrepTime: 30,
    deliveryEfficiency: 0,
    activeDrivers: 0,
    orderTypeSplit: [],
    kitchenUtilization: 0,
    partnerPerformance: [],
    recentOrders: [],
  });

  useEffect(() => {
    // Simulate loading
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
          <p className="mt-2 text-muted-foreground">Chargement du tableau de bord...</p>
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
            <ChefHat className="h-6 w-6 text-orange-500" />
            Tableau de bord Dark Kitchen
          </h2>
          <p className="text-muted-foreground">
            Performances de votre cuisine dédiée livraison
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Activity className="h-3 w-3 mr-1" />
          Mode actif
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Commandes aujourd'hui"
          value={metrics.todayOrders}
          icon={Package}
          trend="+12% vs hier"
          trendUp
          color="orange"
        />
        <StatCard
          title="Temps de préparation"
          value={`${metrics.avgPrepTime} min`}
          subtitle={`Objectif: ${metrics.targetPrepTime} min`}
          icon={Timer}
          trend="-2 min vs semaine"
          trendUp
          color="blue"
        />
        <StatCard
          title="Efficacité livraison"
          value={`${metrics.deliveryEfficiency}%`}
          icon={Truck}
          trend="+5% vs mois dernier"
          trendUp
          color="green"
        />
        <StatCard
          title="Livreurs actifs"
          value={metrics.activeDrivers}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution horaire</CardTitle>
            <CardDescription>Commandes par heure aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.hourlyDistribution}>
                  <XAxis dataKey="hour" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="deliveries" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="takeaway" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Prep Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Évolution du temps de préparation</CardTitle>
            <CardDescription>Moyenne hebdomadaire (minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.prepTimeTrend}>
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Order Type Split & Kitchen Utilization */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Répartition des commandes</CardTitle>
            <CardDescription>Par type de commande</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.orderTypeSplit}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {metrics.orderTypeSplit.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {metrics.orderTypeSplit.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Utilisation cuisine</CardTitle>
            <CardDescription>Capacité actuelle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-500">{metrics.kitchenUtilization}%</div>
              <p className="text-sm text-muted-foreground mt-1">de capacité utilisée</p>
            </div>
            <Progress value={metrics.kitchenUtilization} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>0%</span>
              <span>Capacité optimale: 80%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistiques rapides</CardTitle>
            <CardDescription>Aperçu des performances</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Livraisons</span>
              </div>
              <span className="font-bold text-blue-600">{metrics.deliveryOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                <span className="text-sm">À emporter</span>
              </div>
              <span className="font-bold text-green-600">{metrics.takeawayOrders}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Temps moyen</span>
              </div>
              <span className="font-bold text-amber-600">{metrics.avgPrepTime} min</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Performance & Recent Orders */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Partner Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance des partenaires</CardTitle>
            <CardDescription>Par partenaire de livraison</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {metrics.partnerPerformance.map((partner) => (
                  <div key={partner.partner} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{partner.partner}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{partner.orders} commandes</span>
                        <span>•</span>
                        <span>{partner.avgTime} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="text-lg font-bold">{partner.rating}</span>
                        <span className="text-xs">★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commandes récentes</CardTitle>
            <CardDescription>État actuel des commandes</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[250px]">
              <div className="space-y-3">
                {metrics.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        order.type === 'delivery' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {order.type === 'delivery' ? (
                          <Truck className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Package className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer} • {order.items} articles
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status]}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.prepTime} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DarkKitchenDashboard;