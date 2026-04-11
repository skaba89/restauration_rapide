'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  UtensilsCrossed, 
  Coffee, 
  Truck, 
  Percent,
  Building,
  Zap,
  Users,
  Megaphone,
  Package,
  Wrench,
  Shield
} from 'lucide-react';
import type { ProfitLossData } from '@/lib/accounting-export';

interface ProfitLossProps {
  data?: ProfitLossData | null;
  loading?: boolean;
}

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Calculate percentage change
const calculateChange = (current: number, previous?: number) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export function ProfitLoss({ data, loading }: ProfitLossProps) {
  const [viewMode, setViewMode] = useState<'detail' | 'summary'>('detail');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune donnée disponible pour cette période
        </CardContent>
      </Card>
    );
  }

  const revenueChange = calculateChange(data.revenue.totalRevenue, data.previousPeriod?.revenue.totalRevenue);
  const profitChange = calculateChange(data.netProfit, data.previousPeriod?.netProfit);
  const grossMargin = (data.grossProfit / data.revenue.totalRevenue) * 100;
  const netMargin = (data.netProfit / data.revenue.totalRevenue) * 100;

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(data.revenue.totalRevenue)}</p>
                {data.previousPeriod && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(revenueChange).toFixed(1)}% vs période préc.
                  </div>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Marge Brute</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(data.grossProfit)}</p>
                <p className="text-xs text-muted-foreground mt-1">{grossMargin.toFixed(1)}% de marge</p>
              </div>
              <Percent className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résultat Net</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(data.netProfit)}</p>
                {data.previousPeriod && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profitChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(profitChange).toFixed(1)}% vs période préc.
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Marge Nette</p>
                <p className="text-xl font-bold">{netMargin.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Bénéfice / Revenus</p>
              </div>
              <Percent className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Revenus
              </CardTitle>
              <CardDescription>Détail des sources de revenus</CardDescription>
            </div>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as 'detail' | 'summary')}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="detail">Détaillé</SelectItem>
                <SelectItem value="summary">Résumé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue Items */}
            <div className="grid gap-3">
              <RevenueLineItem
                icon={<UtensilsCrossed className="h-4 w-4" />}
                label="Ventes de plats"
                amount={data.revenue.foodSales}
                total={data.revenue.totalRevenue}
                color="bg-green-500"
              />
              <RevenueLineItem
                icon={<Coffee className="h-4 w-4" />}
                label="Ventes de boissons"
                amount={data.revenue.beverageSales}
                total={data.revenue.totalRevenue}
                color="bg-blue-500"
              />
              <RevenueLineItem
                icon={<Truck className="h-4 w-4" />}
                label="Frais de livraison"
                amount={data.revenue.deliveryFees}
                total={data.revenue.totalRevenue}
                color="bg-purple-500"
              />
              <RevenueLineItem
                icon={<Users className="h-4 w-4" />}
                label="Frais de service"
                amount={data.revenue.serviceCharges}
                total={data.revenue.totalRevenue}
                color="bg-orange-500"
              />
              {data.revenue.otherRevenue > 0 && (
                <RevenueLineItem
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Autres revenus"
                  amount={data.revenue.otherRevenue}
                  total={data.revenue.totalRevenue}
                  color="bg-gray-500"
                />
              )}
            </div>

            {/* Total Revenue */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">Total Revenus</span>
                <span className="font-bold text-xl text-green-600">{formatCurrency(data.revenue.totalRevenue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost of Goods Sold */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-red-600" />
            Coût des Marchandises Vendues (COGS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                <span>Coût des aliments</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-red-600">{formatCurrency(data.costOfGoodsSold.foodCost)}</span>
                <p className="text-xs text-muted-foreground">
                  {((data.costOfGoodsSold.foodCost / data.revenue.foodSales) * 100).toFixed(1)}% du prix de vente
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Coffee className="h-4 w-4 text-muted-foreground" />
                <span>Coût des boissons</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-red-600">{formatCurrency(data.costOfGoodsSold.beverageCost)}</span>
                <p className="text-xs text-muted-foreground">
                  {((data.costOfGoodsSold.beverageCost / data.revenue.beverageSales) * 100).toFixed(1)}% du prix de vente
                </p>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total COGS</span>
                <span className="font-bold text-red-600">{formatCurrency(data.costOfGoodsSold.totalCOGS)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Marge Brute</h3>
              <p className="text-sm text-muted-foreground">Revenus - COGS</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{formatCurrency(data.grossProfit)}</span>
              <p className="text-sm text-muted-foreground">{grossMargin.toFixed(1)}% de marge</p>
            </div>
          </div>
          <Progress value={grossMargin} max={100} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Operating Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-orange-600" />
            Charges d&apos;Exploitation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <ExpenseLineItem icon={<Building className="h-4 w-4" />} label="Loyer" amount={data.operatingExpenses.rent} />
            <ExpenseLineItem icon={<Zap className="h-4 w-4" />} label="Services publics" amount={data.operatingExpenses.utilities} />
            <ExpenseLineItem icon={<Users className="h-4 w-4" />} label="Salaires" amount={data.operatingExpenses.salaries} />
            <ExpenseLineItem icon={<Megaphone className="h-4 w-4" />} label="Marketing" amount={data.operatingExpenses.marketing} />
            <ExpenseLineItem icon={<Package className="h-4 w-4" />} label="Fournitures" amount={data.operatingExpenses.supplies} />
            <ExpenseLineItem icon={<Wrench className="h-4 w-4" />} label="Maintenance" amount={data.operatingExpenses.maintenance} />
            <ExpenseLineItem icon={<Shield className="h-4 w-4" />} label="Assurance" amount={data.operatingExpenses.insurance} />
            <ExpenseLineItem icon={<DollarSign className="h-4 w-4" />} label="Autres" amount={data.operatingExpenses.other} />
          </div>

          <div className="pt-4 mt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total Charges</span>
              <span className="font-bold text-orange-600">{formatCurrency(data.operatingExpenses.totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className={`border-l-4 ${data.netProfit >= 0 ? 'border-l-green-500 bg-green-50/50' : 'border-l-red-500 bg-red-50/50'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Résultat Net</h3>
              <p className="text-sm text-muted-foreground">Marge Brute - Charges d&apos;Exploitation</p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold ${data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.netProfit)}
              </span>
              <p className="text-sm text-muted-foreground">{netMargin.toFixed(1)}% de marge nette</p>
            </div>
          </div>
          
          {/* Profit Margin Visualization */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>COGS</span>
              <span>{((data.costOfGoodsSold.totalCOGS / data.revenue.totalRevenue) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden flex">
              <div 
                className="bg-red-400" 
                style={{ width: `${(data.costOfGoodsSold.totalCOGS / data.revenue.totalRevenue) * 100}%` }} 
              />
              <div 
                className="bg-orange-400" 
                style={{ width: `${(data.operatingExpenses.totalExpenses / data.revenue.totalRevenue) * 100}%` }} 
              />
              <div 
                className="bg-green-400" 
                style={{ width: `${netMargin}%` }} 
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Charges: {((data.operatingExpenses.totalExpenses / data.revenue.totalRevenue) * 100).toFixed(1)}%</span>
              <span>Bénéfice: {netMargin.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Revenue Line Item Component
function RevenueLineItem({ 
  icon, 
  label, 
  amount, 
  total, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  amount: number; 
  total: number;
  color: string;
}) {
  const percentage = (amount / total) * 100;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <span className="font-medium">{label}</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      <span className="font-medium text-green-600">{formatCurrency(amount)}</span>
    </div>
  );
}

// Expense Line Item Component
function ExpenseLineItem({ 
  icon, 
  label, 
  amount 
}: { 
  icon: React.ReactNode; 
  label: string; 
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span>{label}</span>
      </div>
      <span className="font-medium text-red-600">{formatCurrency(amount)}</span>
    </div>
  );
}

export default ProfitLoss;
