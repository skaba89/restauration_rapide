'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Table as TableIcon,
  Users, 
  Clock, 
  UserCheck,
  Phone,
  Mail,
  ShoppingBag,
  Calendar,
  ChevronRight,
  X,
  RefreshCw,
  MapPin,
  Grid3X3,
  SprayCan,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TableCard, TableData } from './table-card';

interface FloorPlanViewProps {
  tables?: TableData[];
  onTableStatusChange?: (tableId: string, status: TableData['status']) => void;
  onAssignServer?: (tableId: string, serverId: string) => void;
}

export function FloorPlanView({
  tables: initialTables = [],
  onTableStatusChange,
  onAssignServer
}: FloorPlanViewProps) {
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, this would fetch from API or receive websocket updates
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle status change
  const handleStatusChange = useCallback((tableId: string, newStatus: TableData['status']) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: newStatus, seatedAt: newStatus === 'occupied' ? new Date() : undefined } : t
    ));
    onTableStatusChange?.(tableId, newStatus);
  }, [onTableStatusChange]);

  // Handle server assignment
  const handleAssignServer = useCallback((tableId: string, serverId: string) => {
    const server = null;
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, serverId, serverName: server?.name } : t
    ));
    onAssignServer?.(tableId, serverId);
    if (selectedTable?.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, serverId, serverName: server?.name } : null);
    }
  }, [onAssignServer, selectedTable]);

  // Refresh data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
  };

  // Filter tables by section
  const filteredTables = selectedSection === 'all' 
    ? tables 
    : tables.filter(t => t.section === selectedSection);

  // Get sections
  const sections = [...new Set(tables.map(t => t.section))].filter(Boolean);

  // Calculate stats
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    totalGuests: tables.reduce((sum, t) => sum + (t.currentPartySize || 0), 0),
  };

  // Group tables by section for rendering
  const tablesBySection = sections.reduce((acc, section) => {
    acc[section] = filteredTables.filter(t => t.section === section);
    return acc;
  }, {} as Record<string, TableData[]>);

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <Card className="border-l-4 border-l-slate-500">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Disponibles</p>
            <p className="text-xl font-bold text-emerald-600">{stats.available}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Occupées</p>
            <p className="text-xl font-bold text-red-600">{stats.occupied}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Réservées</p>
            <p className="text-xl font-bold text-amber-600">{stats.reserved}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Nettoyage</p>
            <p className="text-xl font-bold text-slate-600">{stats.cleaning}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Clients</p>
            <p className="text-xl font-bold text-purple-600">{stats.totalGuests}</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-48">
              <MapPin className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Toutes les sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sections</SelectItem>
              {sections.map(section => (
                <SelectItem key={section} value={section!}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Floor Plan Canvas */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Plan de Salle
          </CardTitle>
          <CardDescription>
            Cliquez sur une table pour voir les détails
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Grid Background */}
          <div className="relative bg-slate-50 dark:bg-slate-900 min-h-[600px] overflow-auto">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
            
            {/* Section labels */}
            {sections.map((section, idx) => {
              const sectionTables = tablesBySection[section];
              if (!sectionTables || sectionTables.length === 0) return null;
              
              const minX = Math.min(...sectionTables.map(t => t.positionX));
              const minY = Math.min(...sectionTables.map(t => t.positionY));
              
              return (
                <div
                  key={section}
                  className="absolute text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  style={{ left: minX, top: minY - 25 }}
                >
                  {section}
                </div>
              );
            })}
            
            {/* Tables */}
            <div className="relative" style={{ width: '800px', height: '600px' }}>
              <AnimatePresence>
                {filteredTables.map(table => (
                  <TableCard
                    key={table.id}
                    table={table}
                    onClick={() => setSelectedTable(table)}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span className="text-sm text-muted-foreground">Occupée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500" />
          <span className="text-sm text-muted-foreground">Réservée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-slate-400" />
          <span className="text-sm text-muted-foreground">Nettoyage</span>
        </div>
      </div>

      {/* Table Details Dialog */}
      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TableIcon className="h-5 w-5" />
              Table {selectedTable?.number}
            </DialogTitle>
            <DialogDescription>
              {selectedTable?.section} • Capacité: {selectedTable?.capacity} places
            </DialogDescription>
          </DialogHeader>

          {selectedTable && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge variant="outline" className={`
                  ${selectedTable.status === 'available' ? 'border-emerald-500 text-emerald-700' : ''}
                  ${selectedTable.status === 'occupied' ? 'border-red-500 text-red-700' : ''}
                  ${selectedTable.status === 'reserved' ? 'border-amber-500 text-amber-700' : ''}
                  ${selectedTable.status === 'cleaning' ? 'border-slate-500 text-slate-700' : ''}
                `}>
                  {selectedTable.status === 'available' && 'Disponible'}
                  {selectedTable.status === 'occupied' && 'Occupée'}
                  {selectedTable.status === 'reserved' && 'Réservée'}
                  {selectedTable.status === 'cleaning' && 'Nettoyage'}
                </Badge>
              </div>

              <Separator />

              {/* Current Order Info (if occupied) */}
              {selectedTable.status === 'occupied' && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      Commande en cours
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Clients</span>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {selectedTable.currentPartySize} personnes
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Installés depuis</span>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {Math.floor((Date.now() - (selectedTable.seatedAt?.getTime() || 0)) / 60000)} min
                        </p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Reservation Info (if reserved) */}
              {selectedTable.status === 'reserved' && (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Réservation
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Heure</span>
                        <p className="font-medium">{selectedTable.reservationTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Nom</span>
                        <p className="font-medium">{selectedTable.reservationName}</p>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Server Assignment */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Serveur assigné
                </h4>
                <Select
                  value={selectedTable.serverId || ''}
                  onValueChange={(value) => handleAssignServer(selectedTable.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un serveur" />
                  </SelectTrigger>
                  <SelectContent>
                    {([] as any[]).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Quick Status Actions */}
              <div className="space-y-3">
                <h4 className="font-medium">Changer le statut</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTable.id, 'available')}
                    disabled={selectedTable.status === 'available'}
                    className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Disponible
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTable.id, 'occupied')}
                    disabled={selectedTable.status === 'occupied'}
                    className="border-red-500 text-red-700 hover:bg-red-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Occupée
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTable.id, 'reserved')}
                    disabled={selectedTable.status === 'reserved'}
                    className="border-amber-500 text-amber-700 hover:bg-amber-50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réservée
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTable.id, 'cleaning')}
                    disabled={selectedTable.status === 'cleaning'}
                    className="border-slate-500 text-slate-700 hover:bg-slate-50"
                  >
                    <SprayCan className="h-4 w-4 mr-2" />
                    Nettoyage
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FloorPlanView;