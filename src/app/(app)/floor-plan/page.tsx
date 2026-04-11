'use client';

import { useState, useCallback, useEffect } from 'react';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Edit, 
  Eye, 
  Settings, 
  RefreshCw,
  Wifi,
  WifiOff,
  Users,
  Table as TableIcon
} from 'lucide-react';
import { FloorPlanEditor } from '@/components/floor-plan/floor-plan-editor';
import { FloorPlanView } from '@/components/floor-plan/floor-plan-view';
import { TableData } from '@/components/floor-plan/table-card';
import { toast } from 'sonner';

// Demo tables data
const DEMO_TABLES: TableData[] = [
  // Salle Principale (Tables 1-5)
  { id: '1', number: 'T1', shape: 'round', capacity: 4, positionX: 80, positionY: 100, width: 80, height: 80, rotation: 0, status: 'occupied', currentPartySize: 3, serverName: 'Aïssata', seatedAt: new Date(Date.now() - 45 * 60000), section: 'Salle Principale' },
  { id: '2', number: 'T2', shape: 'round', capacity: 4, positionX: 200, positionY: 100, width: 80, height: 80, rotation: 0, status: 'reserved', section: 'Salle Principale', reservationTime: '19:30', reservationName: 'M. Koné' },
  { id: '3', number: 'T3', shape: 'round', capacity: 4, positionX: 320, positionY: 100, width: 80, height: 80, rotation: 0, status: 'occupied', currentPartySize: 4, serverName: 'Moussa', seatedAt: new Date(Date.now() - 90 * 60000), section: 'Salle Principale' },
  { id: '4', number: 'T4', shape: 'square', capacity: 4, positionX: 80, positionY: 220, width: 70, height: 70, rotation: 0, status: 'cleaning', section: 'Salle Principale' },
  { id: '5', number: 'T5', shape: 'round', capacity: 4, positionX: 200, positionY: 220, width: 80, height: 80, rotation: 0, status: 'reserved', section: 'Salle Principale', reservationTime: '20:00', reservationName: 'Diallo' },
  
  // Terrasse (Tables 6-10)
  { id: '6', number: 'T6', shape: 'square', capacity: 4, positionX: 520, positionY: 100, width: 70, height: 70, rotation: 0, status: 'occupied', currentPartySize: 2, serverName: 'Fatou', seatedAt: new Date(Date.now() - 30 * 60000), section: 'Terrasse' },
  { id: '7', number: 'T7', shape: 'square', capacity: 4, positionX: 620, positionY: 100, width: 70, height: 70, rotation: 0, status: 'occupied', currentPartySize: 3, serverName: 'Kouamé', seatedAt: new Date(Date.now() - 15 * 60000), section: 'Terrasse' },
  { id: '8', number: 'T8', shape: 'square', capacity: 4, positionX: 720, positionY: 100, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
  { id: '9', number: 'T9', shape: 'square', capacity: 4, positionX: 520, positionY: 200, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
  { id: '10', number: 'T10', shape: 'square', capacity: 4, positionX: 620, positionY: 200, width: 70, height: 70, rotation: 0, status: 'available', section: 'Terrasse' },
  
  // VIP (Tables 11-12)
  { id: '11', number: 'VIP1', shape: 'rectangle', capacity: 6, positionX: 80, positionY: 400, width: 120, height: 80, rotation: 0, status: 'available', section: 'VIP' },
  { id: '12', number: 'VIP2', shape: 'rectangle', capacity: 6, positionX: 240, positionY: 400, width: 120, height: 80, rotation: 0, status: 'available', section: 'VIP' },
  
  // Coins intimes (Tables 13-15)
  { id: '13', number: 'C1', shape: 'round', capacity: 2, positionX: 450, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
  { id: '14', number: 'C2', shape: 'round', capacity: 2, positionX: 530, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
  { id: '15', number: 'C3', shape: 'round', capacity: 2, positionX: 610, positionY: 400, width: 60, height: 60, rotation: 0, status: 'available', section: 'Coins Intimes' },
];

export default function FloorPlanPage() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [tables, setTables] = useState<TableData[]>(DEMO_TABLES);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tables from API
  const fetchTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        if (data.tables && data.tables.length > 0) {
          setTables(data.tables);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      // Use demo data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save tables to API
  const saveTables = useCallback(async (updatedTables: TableData[]) => {
    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables: updatedTables }),
      });
      
      if (response.ok) {
        setTables(updatedTables);
        toast.success('Plan de salle sauvegardé');
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Failed to save tables:', error);
      toast.error('Erreur de connexion');
    }
  }, []);

  // Handle table status change
  const handleStatusChange = useCallback(async (tableId: string, status: TableData['status']) => {
    const updatedTables = tables.map(t => 
      t.id === tableId ? { 
        ...t, 
        status, 
        seatedAt: status === 'occupied' ? new Date() : undefined,
        currentPartySize: status === 'occupied' ? t.currentPartySize || t.capacity : undefined,
      } : t
    );
    
    setTables(updatedTables);
    
    // In real app, this would call the API
    try {
      await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, status }),
      });
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  }, [tables]);

  // Handle server assignment
  const handleAssignServer = useCallback(async (tableId: string, serverId: string) => {
    // In real app, this would update the server assignment via API
    console.log('Assign server:', serverId, 'to table:', tableId);
  }, []);

  // Stats
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    totalGuests: tables.reduce((sum, t) => sum + (t.currentPartySize || 0), 0),
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <TableIcon className="h-8 w-8 text-primary" />
            Plan de Salle
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualisez et gérez vos tables en temps réel
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <Badge 
            variant={isConnected ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3" />
                En direct
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                Hors ligne
              </>
            )}
          </Badge>
          
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchTables}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        <Card className="text-center">
          <CardContent className="p-3">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-l-emerald-500">
          <CardContent className="p-3">
            <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
            <p className="text-xs text-muted-foreground">Disponibles</p>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            <p className="text-xs text-muted-foreground">Occupées</p>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <p className="text-2xl font-bold text-amber-600">{stats.reserved}</p>
            <p className="text-xs text-muted-foreground">Réservées</p>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-l-slate-400">
          <CardContent className="p-3">
            <p className="text-2xl font-bold text-slate-600">{stats.cleaning}</p>
            <p className="text-xs text-muted-foreground">Nettoyage</p>
          </CardContent>
        </Card>
        <Card className="text-center border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <p className="text-2xl font-bold text-purple-600">{stats.totalGuests}</p>
            <p className="text-xs text-muted-foreground">Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Mode Toggle Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'view' | 'edit')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Mode Visualisation
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Mode Édition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-4">
          <FloorPlanView 
            tables={tables}
            onTableStatusChange={handleStatusChange}
            onAssignServer={handleAssignServer}
          />
        </TabsContent>

        <TabsContent value="edit" className="mt-4">
          <FloorPlanEditor 
            tables={tables}
            onSave={saveTables}
          />
        </TabsContent>
      </Tabs>

      {/* Sections Legend */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Sections</CardTitle>
          <CardDescription>
            Votre restaurant dispose de 4 zones distinctes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Salle Principale</p>
                <p className="text-sm text-muted-foreground">
                  {tables.filter(t => t.section === 'Salle Principale').length} tables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Terrasse</p>
                <p className="text-sm text-muted-foreground">
                  {tables.filter(t => t.section === 'Terrasse').length} tables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">VIP</p>
                <p className="text-sm text-muted-foreground">
                  {tables.filter(t => t.section === 'VIP').length} tables
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <p className="font-medium">Coins Intimes</p>
                <p className="text-sm text-muted-foreground">
                  {tables.filter(t => t.section === 'Coins Intimes').length} tables
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
