'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Grid3X3, Plus, Users, Clock, RefreshCw, Edit, Trash2, Check, X } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  guests: number;
  orderId?: string;
  serverName?: string;
  reservationName?: string;
  reservationTime?: string;
}

const DEMO_TABLES: Table[] = [
  { id: '1', name: 'Table 1', seats: 4, status: 'available', guests: 0 },
  { id: '2', name: 'Table 2', seats: 2, status: 'occupied', guests: 2, serverName: 'Ibrahim' },
  { id: '3', name: 'Table 3', seats: 6, status: 'occupied', guests: 4, serverName: 'Fatou' },
  { id: '4', name: 'Table 4', seats: 4, status: 'reserved', guests: 0, reservationName: 'M. Diallo', reservationTime: '19:30' },
  { id: '5', name: 'Table 5', seats: 8, status: 'available', guests: 0 },
  { id: '6', name: 'Table 6', seats: 4, status: 'occupied', guests: 3, serverName: 'Ibrahim' },
  { id: '7', name: 'Table 7', seats: 2, status: 'cleaning', guests: 0 },
  { id: '8', name: 'Table 8', seats: 4, status: 'available', guests: 0 },
  { id: '9', name: 'Table 9', seats: 6, status: 'reserved', guests: 0, reservationName: 'Mme Sylla', reservationTime: '20:00' },
  { id: '10', name: 'Table 10', seats: 4, status: 'available', guests: 0 },
  { id: '11', name: 'Table 11', seats: 2, status: 'occupied', guests: 2, serverName: 'Fatou' },
  { id: '12', name: 'Table 12', seats: 8, status: 'available', guests: 0 },
];

export default function FloorPlanPage() {
  const [tables, setTables] = useState<Table[]>(DEMO_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    seats: 4,
    status: 'available' as Table['status'],
    guests: 0,
    serverName: '',
    reservationName: '',
    reservationTime: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-400 hover:bg-green-200';
      case 'occupied': return 'bg-red-100 border-red-400 hover:bg-red-200';
      case 'reserved': return 'bg-blue-100 border-blue-400 hover:bg-blue-200';
      case 'cleaning': return 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200';
      default: return 'bg-gray-100 border-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available': return <Badge className="bg-green-500">Libre</Badge>;
      case 'occupied': return <Badge className="bg-red-500">Occupée</Badge>;
      case 'reserved': return <Badge className="bg-blue-500">Réservée</Badge>;
      case 'cleaning': return <Badge className="bg-yellow-500">Nettoyage</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openTableDialog = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      seats: table.seats,
      status: table.status,
      guests: table.guests,
      serverName: table.serverName || '',
      reservationName: table.reservationName || '',
      reservationTime: table.reservationTime || '',
    });
    setShowTableDialog(true);
  };

  const openAddDialog = () => {
    setSelectedTable(null);
    setFormData({
      name: `Table ${tables.length + 1}`,
      seats: 4,
      status: 'available',
      guests: 0,
      serverName: '',
      reservationName: '',
      reservationTime: '',
    });
    setShowAddDialog(true);
  };

  const openStatusDialog = (table: Table) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      seats: table.seats,
      status: table.status,
      guests: table.guests,
      serverName: table.serverName || '',
      reservationName: table.reservationName || '',
      reservationTime: table.reservationTime || '',
    });
    setShowStatusDialog(true);
  };

  const handleAddTable = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newTable: Table = {
        id: Date.now().toString(),
        name: formData.name,
        seats: formData.seats,
        status: formData.status,
        guests: formData.guests,
      };
      setTables(prev => [...prev, newTable]);
      setShowAddDialog(false);
      setIsLoading(false);
    }, 500);
  };

  const handleUpdateTable = () => {
    if (!selectedTable) return;
    setIsLoading(true);
    setTimeout(() => {
      setTables(prev => prev.map(t => 
        t.id === selectedTable.id
          ? {
              ...t,
              name: formData.name,
              seats: formData.seats,
            }
          : t
      ));
      setShowTableDialog(false);
      setIsLoading(false);
    }, 500);
  };

  const handleUpdateStatus = () => {
    if (!selectedTable) return;
    setIsLoading(true);
    setTimeout(() => {
      setTables(prev => prev.map(t => 
        t.id === selectedTable.id
          ? {
              ...t,
              status: formData.status,
              guests: formData.status === 'occupied' ? formData.guests : 0,
              serverName: formData.status === 'occupied' ? formData.serverName : undefined,
              reservationName: formData.status === 'reserved' ? formData.reservationName : undefined,
              reservationTime: formData.status === 'reserved' ? formData.reservationTime : undefined,
            }
          : t
      ));
      setShowStatusDialog(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteTable = () => {
    if (!selectedTable) return;
    setIsLoading(true);
    setTimeout(() => {
      setTables(prev => prev.filter(t => t.id !== selectedTable.id));
      setShowTableDialog(false);
      setIsLoading(false);
    }, 500);
  };

  const quickActions = (table: Table, action: 'seat' | 'clear' | 'reserve' | 'clean') => {
    switch (action) {
      case 'seat':
        setTables(prev => prev.map(t => 
          t.id === table.id ? { ...t, status: 'occupied' as const, guests: 2, serverName: 'Serveur' } : t
        ));
        break;
      case 'clear':
        setTables(prev => prev.map(t => 
          t.id === table.id ? { ...t, status: 'available' as const, guests: 0, serverName: undefined, reservationName: undefined, reservationTime: undefined } : t
        ));
        break;
      case 'reserve':
        setTables(prev => prev.map(t => 
          t.id === table.id ? { ...t, status: 'reserved' as const, reservationName: 'Client', reservationTime: '19:00' } : t
        ));
        break;
      case 'clean':
        setTables(prev => prev.map(t => 
          t.id === table.id ? { ...t, status: 'cleaning' as const } : t
        ));
        break;
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    guests: tables.reduce((sum, t) => sum + t.guests, 0),
    capacity: tables.reduce((sum, t) => sum + t.seats, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan de Salle</h1>
          <p className="text-gray-500">Gérer les tables et réservations</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une table
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
          <span className="text-sm">Libre ({stats.available})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div>
          <span className="text-sm">Occupée ({stats.occupied})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-400"></div>
          <span className="text-sm">Réservée ({stats.reserved})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-400"></div>
          <span className="text-sm">Nettoyage ({tables.filter(t => t.status === 'cleaning').length})</span>
        </div>
        <div className="ml-auto text-sm text-gray-600">
          <Users className="h-4 w-4 inline mr-1" />
          {stats.guests} / {stats.capacity} places
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">Tables</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              <p className="text-sm text-gray-500">Libres</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
              <p className="text-sm text-gray-500">Occupées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.guests}</p>
              <p className="text-sm text-gray-500">Clients présents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floor Plan Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-all border-2 ${getStatusColor(table.status)}`}
            onClick={() => openTableDialog(table)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{table.name}</h3>
                {getStatusBadge(table.status)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{table.guests}/{table.seats}</span>
              </div>
              {table.status === 'occupied' && table.serverName && (
                <p className="text-xs text-gray-500 mt-1">Serveur: {table.serverName}</p>
              )}
              {table.status === 'reserved' && table.reservationTime && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                  <Clock className="h-3 w-3" />
                  <span>{table.reservationTime} - {table.reservationName}</span>
                </div>
              )}
              
              {/* Quick Actions */}
              <div className="flex gap-1 mt-2 pt-2 border-t">
                {table.status === 'available' && (
                  <>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); quickActions(table, 'seat'); }}>
                      Asseoir
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); quickActions(table, 'reserve'); }}>
                      Réserver
                    </Button>
                  </>
                )}
                {table.status === 'occupied' && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); quickActions(table, 'clear'); }}>
                    Libérer
                  </Button>
                )}
                {table.status === 'reserved' && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); quickActions(table, 'seat'); }}>
                    Arrivé
                  </Button>
                )}
                {table.status === 'cleaning' && (
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={(e) => { e.stopPropagation(); quickActions(table, 'clear'); }}>
                    Terminé
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Details Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTable?.name}</DialogTitle>
            <DialogDescription>Gérer cette table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setShowTableDialog(false); openStatusDialog(selectedTable!); }}>
                  Changer statut
                </Button>
              </div>
              <Button variant="destructive" onClick={handleDeleteTable} disabled={isLoading}>
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleUpdateTable} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Table Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une table</DialogTitle>
            <DialogDescription>Créez une nouvelle table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Capacité</Label>
                <Input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTable} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut - {selectedTable?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Table['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Libre</SelectItem>
                  <SelectItem value="occupied">Occupée</SelectItem>
                  <SelectItem value="reserved">Réservée</SelectItem>
                  <SelectItem value="cleaning">Nettoyage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.status === 'occupied' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de clients</Label>
                  <Input
                    type="number"
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Serveur assigné</Label>
                  <Input
                    value={formData.serverName}
                    onChange={(e) => setFormData(prev => ({ ...prev, serverName: e.target.value }))}
                    placeholder="Nom du serveur"
                  />
                </div>
              </div>
            )}
            
            {formData.status === 'reserved' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de la réservation</Label>
                  <Input
                    value={formData.reservationName}
                    onChange={(e) => setFormData(prev => ({ ...prev, reservationName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Heure d'arrivée</Label>
                  <Input
                    type="time"
                    value={formData.reservationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reservationTime: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
