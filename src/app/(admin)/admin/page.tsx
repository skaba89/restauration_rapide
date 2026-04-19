'use client';

// ============================================
// Restaurant OS - Admin Dashboard
// Overview with statistics and charts
// ============================================

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  Store,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
} from 'lucide-react';
import { fetchWithAuth } from '@/lib/api-client';

// Types
interface AdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalRestaurants: number;
  activeRestaurants: number;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  monthlyOrders: number;
  newSignupsThisMonth: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetchWithAuth('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Impossible de charger les statistiques. Aucune donnée disponible.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);

  // Transform stats to card format
  const statsCards = stats ? [
    {
      name: 'Revenus mensuels',
      value: `${(stats.monthlyRevenue / 1000000).toFixed(1)}M FCFA`,
      change: '+23.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Organisations actives',
      value: stats.totalOrganizations.toString(),
      change: '+12',
      trend: 'up',
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Restaurants',
      value: stats.totalRestaurants.toString(),
      change: '+28',
      trend: 'up',
      icon: Store,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Utilisateurs',
      value: stats.totalUsers.toLocaleString(),
      change: '+156',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500">Vue d&apos;ensemble de la plateforme KFM DELICE</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Activity className="mr-2 h-4 w-4" />
            Rapport
          </Button>
          <Button size="sm">
            Exporter
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {stats ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue by plan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenus par plan</CardTitle>
              <CardDescription>Distribution des abonnements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { plan: 'Free', count: 89, revenue: 0, color: 'bg-gray-400' },
                  { plan: 'Starter', count: 156, revenue: 4524000, color: 'bg-blue-500' },
                  { plan: 'Pro', count: 98, revenue: 7782000, color: 'bg-orange-500' },
                  { plan: 'Business', count: 34, revenue: 6766000, color: 'bg-purple-500' },
                ].map((plan) => (
                  <div key={plan.plan} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${plan.color} mr-3`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{plan.plan}</span>
                        <span className="text-sm text-gray-500">
                          {plan.count} orgs
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`${plan.color} h-2 rounded-full transition-all`}
                          style={{
                            width: `${(plan.revenue / 19000000) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-semibold">
                        {plan.revenue > 0 ? `${(plan.revenue / 1000000).toFixed(1)}M` : '0'}
                      </p>
                      <p className="text-xs text-gray-500">FCFA/mois</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total mensuel</span>
                  <span className="text-lg font-bold text-orange-600">19.1M FCFA</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top countries */}
          <Card>
            <CardHeader>
              <CardTitle>Top Pays</CardTitle>
              <CardDescription>Répartition géographique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Côte d\'Ivoire', flag: '🇨🇮', count: 156, percentage: 41 },
                  { name: 'Sénégal', flag: '🇸🇳', count: 98, percentage: 26 },
                  { name: 'Ghana', flag: '🇬🇭', count: 67, percentage: 18 },
                  { name: 'Cameroun', flag: '🇨🇲', count: 38, percentage: 10 },
                  { name: 'Kenya', flag: '🇰🇪', count: 21, percentage: 5 },
                ].map((country) => (
                  <div key={country.name} className="flex items-center">
                    <span className="text-lg mr-2">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">
                          {country.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {country.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-sm font-medium">{country.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Recent signups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inscriptions récentes</CardTitle>
              <CardDescription>Nouvelles organisations cette semaine</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                      Restaurant
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                      Organisation
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                      Plan
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Signup rows will be populated from API data */}
                </tbody>
              </table>
            </div>
          ) : !loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune donnée disponible
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
