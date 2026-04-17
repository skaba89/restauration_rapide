'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  useSensor,
  useSensors,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  MeasuringStrategy,
  pointerWithin,
} from '@dnd-kit/core';
import {
  Table as TableIcon,
  Plus,
  Save,
  Undo2,
  Grid3X3,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Copy,
  Settings,
  Layers,
  Move,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCard, TableData } from './table-card';
import { toast } from 'sonner';

interface FloorPlanEditorProps {
  tables?: TableData[];
  onSave?: (tables: TableData[]) => void;
}

export function FloorPlanEditor({ 
  tables: initialTables = onSave 
}: FloorPlanEditorProps) {
  const [tables, setTables] = useState<TableData[]>(initialTables);
  const [originalTables, setOriginalTables] = useState<TableData[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [draggedTable, setDraggedTable] = useState<TableData | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  
  // New table form state
  const [newTable, setNewTable] = useState<Partial<TableData>>({
    number: '',
    shape: 'round',
    capacity: 4,
    section: 'Salle Principale',
    status: 'available',
  });

  // Edit table form state
  const [editTable, setEditTable] = useState<TableData | null>(null);

  // Available sections
  const sections = ['Salle Principale', 'Terrasse', 'VIP', 'Coins Intimes'];

  // Canvas ref for boundary checking
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Canvas dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    })
  );

  // Check if tables have changed
  const hasChanges = JSON.stringify(tables) !== JSON.stringify(originalTables);

  // Snap position to grid
  const snapPosition = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const table = tables.find(t => t.id === active.id);
    if (table) {
      setDraggedTable(table);
      setSelectedTable(table);
      setDragPosition({ x: table.positionX, y: table.positionY });
    }
  }, [tables]);

  // Handle drag move
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { delta } = event;
    if (draggedTable) {
      setDragPosition(prev => ({
        x: prev.x + delta.x / zoom,
        y: prev.y + delta.y / zoom,
      }));
    }
  }, [draggedTable, zoom]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (draggedTable) {
      setTables(prev => prev.map(table => {
        if (table.id === active.id) {
          // Calculate new position
          const newX = snapPosition(table.positionX + delta.x / zoom);
          const newY = snapPosition(table.positionY + delta.y / zoom);
          
          // Boundary checking
          const maxX = CANVAS_WIDTH - table.width;
          const maxY = CANVAS_HEIGHT - table.height;
          
          return {
            ...table,
            positionX: Math.max(10, Math.min(maxX, newX)),
            positionY: Math.max(10, Math.min(maxY, newY)),
          };
        }
        return table;
      }));
    }
    
    setDraggedTable(null);
    setDragPosition({ x: 0, y: 0 });
  }, [draggedTable, snapPosition, zoom]);

  // Handle drag cancel
  const handleDragCancel = useCallback(() => {
    setDraggedTable(null);
    setDragPosition({ x: 0, y: 0 });
  }, []);

  // Add new table
  const handleAddTable = useCallback(() => {
    if (!newTable.number) {
      toast.error('Veuillez entrer un numéro de table');
      return;
    }

    const existingNumbers = tables.map(t => t.number.toLowerCase());
    if (existingNumbers.includes(newTable.number.toLowerCase())) {
      toast.error('Ce numéro de table existe déjà');
      return;
    }

    const shapeSizes = {
      round: { width: 80, height: 80 },
      square: { width: 70, height: 70 },
      rectangle: { width: 120, height: 80 },
    };

    const size = shapeSizes[newTable.shape || 'round'];
    
    const table: TableData = {
      id: `table-${Date.now()}`,
      number: newTable.number,
      shape: newTable.shape as 'round' | 'square' | 'rectangle',
      capacity: newTable.capacity || 4,
      positionX: snapPosition(100 + Math.random() * 300),
      positionY: snapPosition(100 + Math.random() * 200),
      width: size.width,
      height: size.height,
      rotation: 0,
      status: (newTable.status as TableData['status']) || 'available',
      section: newTable.section || 'Salle Principale',
    };

    setTables(prev => [...prev, table]);
    setIsAddDialogOpen(false);
    setNewTable({
      number: '',
      shape: 'round',
      capacity: 4,
      section: 'Salle Principale',
      status: 'available',
    });
    toast.success(`Table ${table.number} ajoutée`);
  }, [newTable, tables, snapPosition]);

  // Edit table
  const handleEditTable = useCallback(() => {
    if (!editTable) return;

    setTables(prev => prev.map(t => 
      t.id === editTable.id ? editTable : t
    ));
    setIsEditDialogOpen(false);
    setSelectedTable(editTable);
    setEditTable(null);
    toast.success(`Table ${editTable.number} modifiée`);
  }, [editTable]);

  // Delete table
  const handleDeleteTable = useCallback((tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    setTables(prev => prev.filter(t => t.id !== tableId));
    if (selectedTable?.id === tableId) {
      setSelectedTable(null);
    }
    toast.success(`Table ${table?.number} supprimée`);
  }, [tables, selectedTable]);

  // Duplicate table
  const handleDuplicateTable = useCallback((table: TableData) => {
    const newNumber = `${table.number}-bis`;
    const newTable: TableData = {
      ...table,
      id: `table-${Date.now()}`,
      number: newNumber,
      positionX: snapPosition(table.positionX + 30),
      positionY: snapPosition(table.positionY + 30),
    };
    setTables(prev => [...prev, newTable]);
    toast.success(`Table ${newNumber} créée`);
  }, [snapPosition]);

  // Save layout
  const handleSave = useCallback(async () => {
    try {
      // Save to API
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tables }),
      });
      
      if (response.ok) {
        setOriginalTables(tables);
        onSave?.(tables);
        toast.success('Plan de salle sauvegardé');
      } else {
        // Still save locally even if API fails
        setOriginalTables(tables);
        onSave?.(tables);
        toast.success('Plan de salle sauvegardé (local)');
      }
    } catch (error) {
      // Save locally on error
      setOriginalTables(tables);
      onSave?.(tables);
      toast.success('Plan de salle sauvegardé (local)');
    }
  }, [tables, onSave]);

  // Reset changes
  const handleReset = useCallback(() => {
    setTables(originalTables);
    setSelectedTable(null);
    toast.info('Modifications annulées');
  }, [originalTables]);

  // Stats
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  // Get section bounds
  const getSectionBounds = (section: string) => {
    const sectionTables = tables.filter(t => t.section === section);
    if (sectionTables.length === 0) return null;
    
    const minX = Math.min(...sectionTables.map(t => t.positionX));
    const minY = Math.min(...sectionTables.map(t => t.positionY));
    
    return { minX, minY };
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
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
      </div>

      {/* Help Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-3 flex items-center gap-3">
          <Move className="h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <span className="font-medium text-blue-700 dark:text-blue-400">Mode Édition actif:</span>
            <span className="text-blue-600 dark:text-blue-300 ml-1">
              Glissez-déposez les tables pour les repositionner. Cliquez sur une table pour la modifier.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Left side */}
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une table
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setZoom(1)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              {/* Grid toggle */}
              <Button
                variant={showGrid ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>

              {/* Settings */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Floor Plan Canvas */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Plan de Salle
              </CardTitle>
              <CardDescription>
                Glissez-déposez les tables pour les repositionner
              </CardDescription>
            </div>
            {selectedTable && (
              <Badge variant="secondary">
                Sélectionnée: {selectedTable.number}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            className="relative bg-slate-100 dark:bg-slate-900 overflow-auto"
            style={{ minHeight: '500px' }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              measuring={{
                droppable: {
                  strategy: MeasuringStrategy.Always,
                },
              }}
            >
              {/* Canvas */}
              <div
                ref={canvasRef}
                className="relative"
                style={{
                  width: `${CANVAS_WIDTH * zoom}px`,
                  height: `${CANVAS_HEIGHT * zoom}px`,
                  minWidth: '100%',
                  minHeight: '500px',
                }}
              >
                {/* Grid pattern */}
                {showGrid && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
                      `,
                      backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                    }}
                  />
                )}

                {/* Section labels */}
                {sections.map(section => {
                  const bounds = getSectionBounds(section);
                  if (!bounds) return null;
                  
                  return (
                    <div
                      key={section}
                      className="absolute text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-background/80 px-2 py-1 rounded"
                      style={{ 
                        left: bounds.minX * zoom, 
                        top: (bounds.minY - 30) * zoom,
                        fontSize: `${zoom * 12}px`,
                      }}
                    >
                      {section}
                    </div>
                  );
                })}

                {/* Tables */}
                <AnimatePresence>
                  {tables.map(table => (
                    <div
                      key={table.id}
                      className="absolute"
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                        left: table.positionX * zoom,
                        top: table.positionY * zoom,
                        width: table.width,
                        height: table.height,
                      }}
                    >
                      <TableCard
                        table={table}
                        isDragging={draggedTable?.id === table.id}
                        isEditMode={true}
                        isSelected={selectedTable?.id === table.id}
                        onClick={() => setSelectedTable(table)}
                        onEdit={() => {
                          setEditTable(table);
                          setIsEditDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteTable(table.id)}
                      />
                    </div>
                  ))}
                </AnimatePresence>

                {/* Drag overlay */}
                <DragOverlay
                  dropAnimation={{
                    duration: 200,
                    easing: 'ease-out',
                  }}
                >
                  {draggedTable && (
                    <div
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top left',
                      }}
                    >
                      <TableCard
                        table={draggedTable}
                        isDragging={true}
                        isEditMode={true}
                      />
                    </div>
                  )}
                </DragOverlay>
              </div>
            </DndContext>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500" />
          <span className="text-sm text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-sm text-muted-foreground">Occupée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500" />
          <span className="text-sm text-muted-foreground">Réservée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-400" />
          <span className="text-sm text-muted-foreground">Nettoyage</span>
        </div>
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une table</DialogTitle>
            <DialogDescription>
              Créez une nouvelle table dans votre plan de salle
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number">Numéro de table</Label>
                <Input
                  id="number"
                  value={newTable.number}
                  onChange={(e) => setNewTable(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="T16"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacité</Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  max={12}
                  value={newTable.capacity}
                  onChange={(e) => setNewTable(prev => ({ ...prev, capacity: parseInt(e.target.value) || 4 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Forme</Label>
              <Select
                value={newTable.shape}
                onValueChange={(value) => setNewTable(prev => ({ ...prev, shape: value as TableData['shape'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Ronde</SelectItem>
                  <SelectItem value="square">Carrée</SelectItem>
                  <SelectItem value="rectangle">Rectangulaire</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <Select
                value={newTable.section}
                onValueChange={(value) => setNewTable(prev => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(section => (
                    <SelectItem key={section} value={section}>{section}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut initial</Label>
              <Select
                value={newTable.status}
                onValueChange={(value) => setNewTable(prev => ({ ...prev, status: value as TableData['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="occupied">Occupée</SelectItem>
                  <SelectItem value="reserved">Réservée</SelectItem>
                  <SelectItem value="cleaning">Nettoyage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddTable}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la table {editTable?.number}</DialogTitle>
            <DialogDescription>
              Modifiez les propriétés de cette table
            </DialogDescription>
          </DialogHeader>
          
          {editTable && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-number">Numéro de table</Label>
                  <Input
                    id="edit-number"
                    value={editTable.number}
                    onChange={(e) => setEditTable(prev => prev ? { ...prev, number: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-capacity">Capacité</Label>
                  <Input
                    id="edit-capacity"
                    type="number"
                    min={1}
                    max={12}
                    value={editTable.capacity}
                    onChange={(e) => setEditTable(prev => prev ? { ...prev, capacity: parseInt(e.target.value) || 4 } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Forme</Label>
                  <Select
                    value={editTable.shape}
                    onValueChange={(value) => setEditTable(prev => prev ? { ...prev, shape: value as TableData['shape'] } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="round">Ronde</SelectItem>
                      <SelectItem value="square">Carrée</SelectItem>
                      <SelectItem value="rectangle">Rectangulaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select
                    value={editTable.section}
                    onValueChange={(value) => setEditTable(prev => prev ? { ...prev, section: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>{section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rotation: {editTable.rotation}°</Label>
                <Slider
                  value={[editTable.rotation || 0]}
                  onValueChange={([value]) => setEditTable(prev => prev ? { ...prev, rotation: value } : null)}
                  min={0}
                  max={360}
                  step={15}
                />
              </div>

              <div className="space-y-2">
                <Label>Statut</Label>
                <Select
                  value={editTable.status}
                  onValueChange={(value) => setEditTable(prev => prev ? { ...prev, status: value as TableData['status'] } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="occupied">Occupée</SelectItem>
                    <SelectItem value="reserved">Réservée</SelectItem>
                    <SelectItem value="cleaning">Nettoyage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDuplicateTable(editTable)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Dupliquer
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    handleDeleteTable(editTable.id);
                    setIsEditDialogOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditTable}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Sheet */}
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Paramètres</SheetTitle>
            <SheetDescription>
              Configurez l'affichage du plan de salle
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Afficher la grille</Label>
                <p className="text-sm text-muted-foreground">
                  Affiche le quadrillage de fond
                </p>
              </div>
              <Switch
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Aligner sur la grille</Label>
                <p className="text-sm text-muted-foreground">
                  Les tables s'alignent automatiquement
                </p>
              </div>
              <Switch
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
              />
            </div>

            <div className="space-y-2">
              <Label>Taille de la grille: {gridSize}px</Label>
              <Slider
                value={[gridSize]}
                onValueChange={([value]) => setGridSize(value)}
                min={10}
                max={50}
                step={5}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Zoom: {Math.round(zoom * 100)}%</Label>
              <Slider
                value={[zoom * 100]}
                onValueChange={([value]) => setZoom(value / 100)}
                min={50}
                max={150}
                step={10}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default FloorPlanEditor;