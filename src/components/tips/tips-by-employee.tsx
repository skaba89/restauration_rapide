'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  Search, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  BarChart3
} from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface StaffTipEarnings {
  staffId: string;
  staffName: string;
  role: string;
  hoursWorked: number;
  tipsEarned: number;
  pendingTips: number;
  paidTips: number;
  tipsPerHour: number;
}

interface TipsByEmployeeProps {
  earnings?: StaffTipEarnings[];
  loading?: boolean;
  onExport?: () => void;
}

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  waiter: 'bg-blue-100 text-blue-800',
  kitchen: 'bg-orange-100 text-orange-800',
  delivery: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800'
};

// Chart colors
const chartConfig = {
  tipsEarned: {
    label: "Pourboires",
    color: "#22c55e",
  },
} satisfies ChartConfig;

export function TipsByEmployee({ 
  earnings = loading,
  onExport 
}: TipsByEmployeeProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'earned' | 'perHour'>('earned');

  // Filter and sort earnings
  const filteredEarnings = earnings
    .filter(e => {
      const matchesSearch = e.staffName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || e.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.staffName.localeCompare(b.staffName);
        case 'earned':
          return b.tipsEarned - a.tipsEarned;
        case 'perHour':
          return b.tipsPerHour - a.tipsPerHour;
        default:
          return 0;
      }
    });

  // Calculate totals
  const totalEarned = earnings.reduce((sum, e) => sum + e.tipsEarned, 0);
  const totalPending = earnings.reduce((sum, e) => sum + e.pendingTips, 0);
  const totalPaid = earnings.reduce((sum, e) => sum + e.paidTips, 0);
  const avgPerHour = earnings.reduce((sum, e) => sum + e.tipsPerHour, 0) / earnings.length;

  // Prepare chart data
  const chartData = filteredEarnings.slice(0, 5).map(e => ({
    name: e.staffName.split(' ')[0],
    tipsEarned: e.tipsEarned,
    fill: e.role === 'waiter' ? '#3b82f6' : e.role === 'kitchen' ? '#f97316' : '#22c55e'
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Distribué</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(totalPending)}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employés</p>
                <p className="text-xl font-bold">{earnings.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Moyenne/H</p>
                <p className="text-xl font-bold">{avgPerHour.toFixed(0)} GNF</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Employés par Pourboires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tipsEarned" radius={4}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gains par Employé</CardTitle>
              <CardDescription>Vue détaillée des pourboires par employé</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="waiter">Serveurs</SelectItem>
                <SelectItem value="kitchen">Cuisine</SelectItem>
                <SelectItem value="delivery">Livraison</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earned">Plus gagnés</SelectItem>
                <SelectItem value="perHour">Par heure</SelectItem>
                <SelectItem value="name">Nom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee Cards */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {filteredEarnings.map((employee, index) => (
                <EmployeeCard 
                  key={employee.staffId} 
                  employee={employee} 
                  rank={index + 1}
                  maxEarned={Math.max(...earnings.map(e => e.tipsEarned))}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary by Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Répartition par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {['waiter', 'kitchen', 'delivery'].map(role => {
              const roleEarnings = earnings.filter(e => e.role === role);
              const roleTotal = roleEarnings.reduce((sum, e) => sum + e.tipsEarned, 0);
              const roleAvg = roleEarnings.length > 0 
                ? roleTotal / roleEarnings.length 
                : 0;
              
              return (
                <div key={role} className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={ROLE_COLORS[role]}>
                      {role === 'waiter' ? 'Serveurs' : role === 'kitchen' ? 'Cuisine' : 'Livraison'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ({roleEarnings.length})
                    </span>
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(roleTotal)}</p>
                  <p className="text-sm text-muted-foreground">
                    Moyenne: {formatCurrency(Math.round(roleAvg))}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Employee Card Component
function EmployeeCard({ 
  employee, 
  rank,
  maxEarned 
}: { 
  employee: StaffTipEarnings; 
  rank: number;
  maxEarned: number;
}) {
  const percentage = (employee.tipsEarned / maxEarned) * 100;
  
  return (
    <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          rank === 1 ? 'bg-yellow-100 text-yellow-800' :
          rank === 2 ? 'bg-gray-100 text-gray-800' :
          rank === 3 ? 'bg-orange-100 text-orange-800' :
          'bg-muted text-muted-foreground'
        }`}>
          {rank}
        </div>

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-bold text-lg">
          {employee.staffName.split(' ').map(n => n[0]).join('')}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{employee.staffName}</span>
            <Badge className={ROLE_COLORS[employee.role]}>
              {employee.role === 'waiter' ? 'Serveur' : 
               employee.role === 'kitchen' ? 'Cuisine' : 
               employee.role === 'delivery' ? 'Livraison' : 'Autre'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {employee.hoursWorked}h travaillées
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {employee.tipsPerHour} GNF/h
            </span>
          </div>
          <Progress value={percentage} className="h-1.5 mt-2" />
        </div>

        {/* Amounts */}
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">{formatCurrency(employee.tipsEarned)}</p>
          {employee.pendingTips > 0 && (
            <p className="text-xs text-orange-600">
              +{formatCurrency(employee.pendingTips)} en attente
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {((employee.tipsEarned / maxEarned) * 100).toFixed(1)}% du max
          </p>
        </div>
      </div>
    </div>
  );
}

export default TipsByEmployee;