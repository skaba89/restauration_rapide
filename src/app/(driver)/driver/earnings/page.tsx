'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Clock,
  Download,
  ArrowUpRight,
} from 'lucide-react';

const EARNINGS_DATA = {
  today: {
    amount: 12500,
    orders: 8,
    hours: 5.5,
    tips: 1500,
  },
  week: {
    amount: 68500,
    orders: 42,
    hours: 32,
    tips: 8500,
  },
  month: {
    amount: 245000,
    orders: 156,
    hours: 128,
    tips: 32000,
  },
};

const RECENT_EARNINGS = [
  { id: '1', type: 'delivery', description: 'ORD-2024-0145', amount: 500, time: '14:30', date: 'Aujourd\'hui' },
  { id: '2', type: 'tip', description: 'Pourboire de Kouamé J.', amount: 200, time: '14:35', date: 'Aujourd\'hui' },
  { id: '3', type: 'delivery', description: 'ORD-2024-0144', amount: 700, time: '13:15', date: 'Aujourd\'hui' },
  { id: '4', type: 'delivery', description: 'ORD-2024-0143', amount: 500, time: '12:00', date: 'Aujourd\'hui' },
  { id: '5', type: 'bonus', description: 'Bonus heure de pointe', amount: 1000, time: '12:30', date: 'Hier' },
];

const WEEKLY_DATA = [
  { day: 'Lun', amount: 8500, orders: 6 },
  { day: 'Mar', amount: 12000, orders: 8 },
  { day: 'Mer', amount: 9500, orders: 7 },
  { day: 'Jeu', amount: 15000, orders: 10 },
  { day: 'Ven', amount: 18000, orders: 12 },
  { day: 'Sam', amount: 22000, orders: 15 },
  { day: 'Dim', amount: 12500, orders: 8 },
];

export default function DriverEarningsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} FCFA`;

  const data = EARNINGS_DATA[period];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes Revenus</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="week">Cette semaine</TabsTrigger>
          <TabsTrigger value="month">Ce mois</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <DollarSign className="h-6 w-6 mb-2 opacity-80" />
            <p className="text-sm opacity-80">Gains totaux</p>
            <p className="text-2xl font-bold">{formatCurrency(data.amount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Package className="h-6 w-6 mb-2 text-orange-500" />
            <p className="text-sm text-muted-foreground">Commandes</p>
            <p className="text-2xl font-bold">{data.orders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Clock className="h-6 w-6 mb-2 text-blue-500" />
            <p className="text-sm text-muted-foreground">Heures en ligne</p>
            <p className="text-2xl font-bold">{data.hours}h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <TrendingUp className="h-6 w-6 mb-2 text-green-500" />
            <p className="text-sm text-muted-foreground">Pourboires</p>
            <p className="text-2xl font-bold">{formatCurrency(data.tips)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aperçu hebdomadaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {WEEKLY_DATA.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-8 text-sm font-medium">{day.day}</span>
                <div className="flex-1">
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-end pr-2"
                      style={{ width: `${(day.amount / 25000) * 100}%` }}
                    >
                      <span className="text-xs font-medium text-white">{day.orders} cmd</span>
                    </div>
                  </div>
                </div>
                <span className="w-20 text-sm font-medium text-right">{formatCurrency(day.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gain moyen / commande</span>
              <span className="font-medium">{formatCurrency(Math.round(data.amount / data.orders))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Gain moyen / heure</span>
              <span className="font-medium">{formatCurrency(Math.round(data.amount / data.hours))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Taux de pourboire</span>
              <span className="font-medium text-green-600">{Math.round((data.tips / data.orders) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Progression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">vs semaine dernière</span>
              <Badge className="bg-green-100 text-green-700">+15%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">vs mois dernier</span>
              <Badge className="bg-green-100 text-green-700">+22%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Niveau actuel</span>
              <Badge className="bg-yellow-100 text-yellow-700">⭐ Gold Driver</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RECENT_EARNINGS.map((earning) => (
              <div key={earning.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    earning.type === 'delivery' ? 'bg-green-100 text-green-600' :
                    earning.type === 'tip' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {earning.type === 'delivery' ? <Package className="h-5 w-5" /> :
                     earning.type === 'tip' ? <DollarSign className="h-5 w-5" /> :
                     <TrendingUp className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{earning.description}</p>
                    <p className="text-xs text-muted-foreground">{earning.date} • {earning.time}</p>
                  </div>
                </div>
                <span className="font-bold text-green-600">+{formatCurrency(earning.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
