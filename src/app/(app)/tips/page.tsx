'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  Users, 
  Settings, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';

import { TipsManager } from '@/components/tips/tips-manager';
import { TipsDistribution } from '@/components/tips/tips-distribution';
import { TipsByEmployee } from '@/components/tips/tips-by-employee';
import { TipsSettings } from '@/components/tips/tips-settings';

export default function TipsPage() {
  const [activeTab, setActiveTab] = useState('tips');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    distributed: 0,
    employeeCount: 7
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats({
        total: 102000,
        pending: 63500,
        distributed: 89000,
        employeeCount: 7
      });
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleDistribute = async (method: string) => {
    console.log('Distributing with method:', method);
  };

  const handleExport = () => {
    console.log('Exporting tips data');
  };

  const handleSaveSettings = async (settings: unknown) => {
    console.log('Saving settings:', settings);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Pourboires</h1>
          <p className="text-muted-foreground">
            Gérez et distribuez les pourboires pour KFM DELICE
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pourboires</p>
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold text-green-600">
                    {(stats.total / 1000).toFixed(0)}K GNF
                  </p>
                )}
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
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold text-orange-600">
                    {(stats.pending / 1000).toFixed(0)}K GNF
                  </p>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distribués</p>
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold text-blue-600">
                    {(stats.distributed / 1000).toFixed(0)}K GNF
                  </p>
                )}
              </div>
              <Users className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Employés</p>
                {loading ? (
                  <Skeleton className="h-7 w-24" />
                ) : (
                  <p className="text-xl font-bold">{stats.employeeCount}</p>
                )}
              </div>
              <Users className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tips">
            <DollarSign className="h-4 w-4 mr-2" />
            Pourboires
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <TrendingUp className="h-4 w-4 mr-2" />
            Distribution
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Employés
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tips" className="mt-6">
          <TipsManager />
        </TabsContent>

        <TabsContent value="distribution" className="mt-6">
          <TipsDistribution 
            pendingAmount={stats.pending}
            onDistribute={handleDistribute}
          />
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <TipsByEmployee 
            onExport={handleExport}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <TipsSettings 
            onSave={handleSaveSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
