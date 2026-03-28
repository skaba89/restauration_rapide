'use client';

// ============================================
// Restaurant OS - Admin Dashboard
// Overview with statistics and charts
// ============================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Store,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Stats cards data
const stats = [
  {
    name: 'Revenus mensuels',
    value: '12,450,000 FCFA',
    change: '+23.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Organisations actives',
    value: '127',
    change: '+12',
    trend: 'up',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Restaurants',
    value: '384',
    change: '+28',
    trend: 'up',
    icon: Store,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    name: 'Utilisateurs',
    value: '2,847',
    change: '+156',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

// Revenue by plan
const planRevenue = [
  { plan: 'Free', count: 89, revenue: 0, color: 'bg-gray-400' },
  { plan: 'Starter', count: 156, revenue: 4524000, color: 'bg-blue-500' },
  { plan: 'Pro', count: 98, revenue: 7782000, color: 'bg-orange-500' },
  { plan: 'Business', count: 34, revenue: 6766000, color: 'bg-purple-500' },
];

// Recent signups
const recentSignups = [
  { name: 'Le Jardin Secret', org: 'Jardin Group', plan: 'Pro', date: '2024-01-15', status: 'active' },
  { name: 'Chez Awa', org: 'Awa Restaurant', plan: 'Starter', date: '2024-01-14', status: 'active' },
  { name: 'Ghana Food Chain', org: 'GFC Ltd', plan: 'Business', date: '2024-01-13', status: 'active' },
  { name: 'Mama Africa', org: 'Mama Africa SARL', plan: 'Pro', date: '2024-01-12', status: 'pending' },
  { name: 'Café de la Gare', org: 'Café Group', plan: 'Starter', date: '2024-01-11', status: 'active' },
];

// Top countries
const topCountries = [
  { name: 'Côte d\'Ivoire', flag: '🇨🇮', count: 156, percentage: 41 },
  { name: 'Sénégal', flag: '🇸🇳', count: 98, percentage: 26 },
  { name: 'Ghana', flag: '🇬🇭', count: 67, percentage: 18 },
  { name: 'Cameroun', flag: '🇨🇲', count: 38, percentage: 10 },
  { name: 'Kenya', flag: '🇰🇪', count: 21, percentage: 5 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500">Vue d\'ensemble de la plateforme Restaurant OS</p>
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

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue by plan */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenus par plan</CardTitle>
            <CardDescription>Distribution des abonnements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {planRevenue.map((plan) => (
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
              {topCountries.map((country, index) => (
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
                {recentSignups.map((signup) => (
                  <tr key={signup.name} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <span className="font-medium">{signup.name}</span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {signup.org}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={
                          signup.plan === 'Business'
                            ? 'default'
                            : signup.plan === 'Pro'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {signup.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-500">
                      {new Date(signup.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={signup.status === 'active' ? 'default' : 'secondary'}
                        className={
                          signup.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }
                      >
                        {signup.status === 'active' ? 'Actif' : 'En attente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
