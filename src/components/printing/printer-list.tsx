'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  Printer,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Wifi,
  Usb,
  Bluetooth,
  Clock,
  AlertCircle,
  TestTube,
  Star,
  StarOff,
  Settings,
  Power,
  PowerOff,
} from 'lucide-react';
import { Printer as PrinterType } from '@/lib/thermal-printer';

// ============================================
// Printer Card Component
// ============================================

interface PrinterCardProps {
  printer: PrinterType;
  onEdit?: (printer: PrinterType) => void;
  onDelete?: (printer: PrinterType) => void;
  onTest?: (printer: PrinterType) => void;
  onSetDefault?: (printer: PrinterType) => void;
  onToggleActive?: (printer: PrinterType) => void;
  isTesting?: boolean;
}

function PrinterCard({
  printer,
  onEdit,
  onDelete,
  onTest,
  onSetDefault,
  onToggleActive,
  isTesting = false,
}: PrinterCardProps) {
  const getConnectionIcon = () => {
    switch (printer.connectionType) {
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'usb':
        return <Usb className="h-4 w-4" />;
      case 'bluetooth':
        return <Bluetooth className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (printer.status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
    }
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      kitchen: 'Cuisine',
      receipt: 'Caisse',
      bar: 'Bar',
      delivery: 'Livraison',
    };
    return labels[printer.type] || printer.type;
  };

  return (
    <Card className={cn(
      'transition-all',
      printer.status === 'offline' && 'opacity-70',
      printer.status === 'error' && 'border-red-300 dark:border-red-800'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {/* Printer Icon */}
            <div className={cn(
              'p-3 rounded-lg',
              printer.status === 'online' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
            )}>
              <Printer className={cn(
                'h-6 w-6',
                printer.status === 'online' ? 'text-green-600' : 'text-gray-500'
              )} />
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{printer.name}</h4>
                {printer.isDefault && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    Par défaut
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  {getConnectionIcon()}
                  <span>{printer.address}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {printer.paperWidth}mm
                </Badge>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className={cn('w-2 h-2 rounded-full', getStatusColor())} />
                <span className="text-sm capitalize">
                  {printer.status === 'online' ? 'En ligne' : printer.status === 'offline' ? 'Hors ligne' : 'Erreur'}
                </span>
                
                {printer.lastUsed && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
                    <Clock className="h-3 w-3" />
                    {new Date(printer.lastUsed).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Active toggle */}
            <div className="flex items-center gap-1 mr-2">
              <Switch
                checked={printer.status !== 'offline'}
                onCheckedChange={() => onToggleActive?.(printer)}
              />
            </div>
            
            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTest?.(printer)} disabled={isTesting}>
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? 'Test en cours...' : 'Tester l\'impression'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetDefault?.(printer)} disabled={printer.isDefault}>
                  {printer.isDefault ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Déjà par défaut
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Définir par défaut
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit?.(printer)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(printer)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Printer List Component
// ============================================

interface PrinterListProps {
  printers: PrinterType[];
  onRefresh?: () => void;
  className?: string;
}

export function PrinterList({ printers, onRefresh, className }: PrinterListProps) {
  const [printerToDelete, setPrinterToDelete] = useState<PrinterType | null>(null);
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(null);
  const [printerList, setPrinterList] = useState(printers);

  const handleTest = async (printer: PrinterType) => {
    setTestingPrinterId(printer.id);
    // Simulate test print
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestingPrinterId(null);
  };

  const handleSetDefault = (printer: PrinterType) => {
    setPrinterList(prev => 
      prev.map(p => ({
        ...p,
        isDefault: p.id === printer.id,
      }))
    );
  };

  const handleToggleActive = (printer: PrinterType) => {
    setPrinterList(prev =>
      prev.map(p => 
        p.id === printer.id
          ? { ...p, status: p.status === 'offline' ? 'online' : 'offline' }
          : p
      )
    );
  };

  const handleDelete = (printer: PrinterType) => {
    setPrinterToDelete(printer);
  };

  const confirmDelete = () => {
    if (printerToDelete) {
      setPrinterList(prev => prev.filter(p => p.id !== printerToDelete.id));
      setPrinterToDelete(null);
    }
  };

  const onlinePrinters = printerList.filter(p => p.status === 'online');
  const offlinePrinters = printerList.filter(p => p.status !== 'online');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Imprimantes configurées</h3>
          <p className="text-sm text-muted-foreground">
            {onlinePrinters.length} en ligne • {offlinePrinters.length} hors ligne
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <Settings className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        )}
      </div>

      {/* Printer list */}
      {printerList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Aucune imprimante configurée</p>
            <p className="text-sm text-muted-foreground">
              Ajoutez une imprimante pour commencer
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3 pr-4">
            {/* Online printers first */}
            {onlinePrinters.map(printer => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                onTest={handleTest}
                onSetDefault={handleSetDefault}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                isTesting={testingPrinterId === printer.id}
              />
            ))}
            
            {/* Offline printers */}
            {offlinePrinters.length > 0 && onlinePrinters.length > 0 && (
              <div className="pt-2 pb-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Hors ligne
                </p>
              </div>
            )}
            {offlinePrinters.map(printer => (
              <PrinterCard
                key={printer.id}
                printer={printer}
                onTest={handleTest}
                onSetDefault={handleSetDefault}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
                isTesting={testingPrinterId === printer.id}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!printerToDelete} onOpenChange={() => setPrinterToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'imprimante "{printerToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrinterToDelete(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Printer Stats Component
// ============================================

interface PrinterStatsProps {
  printers: PrinterType[];
  className?: string;
}

export function PrinterStats({ printers, className }: PrinterStatsProps) {
  const stats = {
    total: printers.length,
    online: printers.filter(p => p.status === 'online').length,
    offline: printers.filter(p => p.status === 'offline').length,
    error: printers.filter(p => p.status === 'error').length,
  };

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Printer className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">En ligne</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Hors ligne</p>
              <p className="text-2xl font-bold text-gray-500">{stats.offline}</p>
            </div>
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <PowerOff className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Erreurs</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PrinterList;
