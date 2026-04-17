'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  Printer,
  Plus,
  Search,
  Usb,
  Wifi,
  Bluetooth,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Settings,
  RefreshCcw,
} from 'lucide-react';
import { PrinterList, PrinterStats } from './printer-list';
import { PrintPreviewWithActions } from './print-preview';
import {
  Printer as PrinterType,
  getPrinterService,
} from '@/lib/thermal-printer';

// ============================================
// Add Printer Dialog Component
// ============================================

interface AddPrinterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (printer: Omit<PrinterType, 'id' | 'status' | 'lastUsed'>) => void;
}

function AddPrinterDialog({ open, onOpenChange, onAdd }: AddPrinterDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'receipt' as PrinterType['type'],
    connectionType: 'network' as PrinterType['connectionType'],
    address: '',
    paperWidth: 80 as 58 | 80,
    isDefault: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onOpenChange(false);
    setFormData({
      name: '',
      type: 'receipt',
      connectionType: 'network',
      address: '',
      paperWidth: 80,
      isDefault: false,
    });
  };

  const getConnectionPlaceholder = () => {
    switch (formData.connectionType) {
      case 'network':
        return '192.168.1.100';
      case 'usb':
        return 'USB001';
      case 'bluetooth':
        return 'AA:BB:CC:DD:EE:FF';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une imprimante</DialogTitle>
          <DialogDescription>
            Configurez une nouvelle imprimante thermique
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'imprimante</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Cuisine, Caisse, Livraison..."
              required
            />
          </div>

          {/* Type & Connection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type d'imprimante</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as PrinterType['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Caisse (Reçu)</SelectItem>
                  <SelectItem value="kitchen">Cuisine</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="delivery">Livraison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Connexion</Label>
              <Select
                value={formData.connectionType}
                onValueChange={(v) => setFormData({ ...formData, connectionType: v as PrinterType['connectionType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Réseau
                    </div>
                  </SelectItem>
                  <SelectItem value="usb">
                    <div className="flex items-center gap-2">
                      <Usb className="h-4 w-4" />
                      USB
                    </div>
                  </SelectItem>
                  <SelectItem value="bluetooth">
                    <div className="flex items-center gap-2">
                      <Bluetooth className="h-4 w-4" />
                      Bluetooth
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              {formData.connectionType === 'network' ? 'Adresse IP' : 
               formData.connectionType === 'usb' ? 'Port USB' : 'Adresse MAC'}
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={getConnectionPlaceholder()}
              required
            />
          </div>

          {/* Paper Width */}
          <div className="space-y-2">
            <Label>Largeur du papier</Label>
            <Select
              value={formData.paperWidth.toString()}
              onValueChange={(v) => setFormData({ ...formData, paperWidth: parseInt(v) as 58 | 80 })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">80mm (Standard)</SelectItem>
                <SelectItem value="58">58mm (Compact)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Default */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="isDefault">Définir comme imprimante par défaut</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter l'imprimante</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Printer Discovery Component
// ============================================

interface PrinterDiscoveryProps {
  onDiscovered: (printer: Partial<PrinterType>) => void;
  className?: string;
}

function PrinterDiscovery({ onDiscovered, className }: PrinterDiscoveryProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredPrinters, setDiscoveredPrinters] = useState<Partial<PrinterType>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const scanUSB = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const service = getPrinterService();
      const devices = await service.discoverUSBPrinters();
      
      const printers = devices.map(device => ({
        name: device.productName || 'Imprimante USB',
        connectionType: 'usb' as const,
        address: `USB-${device.vendorId}-${device.productId}`,
        type: 'receipt' as const,
        paperWidth: 80 as const,
      }));
      
      setDiscoveredPrinters(printers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche USB');
    } finally {
      setIsScanning(false);
    }
  };

  const requestUSB = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const service = getPrinterService();
      const device = await service.requestUSBPrinter();
      
      if (device) {
        onDiscovered({
          name: device.productName || 'Imprimante USB',
          connectionType: 'usb',
          address: `USB-${device.vendorId}-${device.productId}`,
          type: 'receipt',
          paperWidth: 80,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande USB');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Découverte d'imprimantes
        </CardTitle>
        <CardDescription>
          Recherchez automatiquement les imprimantes connectées
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={scanUSB}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Usb className="h-6 w-6" />
            )}
            <span>Scanner USB</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={requestUSB}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Wifi className="h-6 w-6" />
            )}
            <span>Configurer USB</span>
          </Button>
        </div>

        {discoveredPrinters.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Imprimantes trouvées:</p>
            {discoveredPrinters.map((printer, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{printer.name}</p>
                  <p className="text-sm text-muted-foreground">{printer.address}</p>
                </div>
                <Button size="sm" onClick={() => onDiscovered(printer)}>
                  Ajouter
                </Button>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La découverte USB nécessite un navigateur compatible (Chrome, Edge).
            Pour les imprimantes réseau, entrez l'adresse IP manuellement.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Print Settings Component
// ============================================

export function PrintSettings() {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('printers');

  const handleAddPrinter = (printerData: Omit<PrinterType, 'id' | 'status' | 'lastUsed'>) => {
    const newPrinter: PrinterType = {
      ...printerData,
      id: crypto.randomUUID(),
      status: 'offline',
    };
    setPrinters(prev => [...prev, newPrinter]);
  };

  const handleRefresh = () => {
    // Simulate refresh
    setPrinters(prev => prev.map(p => ({
      ...p,
      status: Math.random() > 0.2 ? 'online' : 'offline',
    })));
  };

  const handlePrint = (printerId: string, type: 'receipt' | 'kitchen') => {
    console.log('Printing to', printerId, type);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <PrinterStats printers={printers} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="printers" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimantes
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Settings className="h-4 w-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        {/* Printers Tab */}
        <TabsContent value="printers" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Imprimantes configurées</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>
          <PrinterList printers={printers} onRefresh={handleRefresh} />
        </TabsContent>

        {/* Add Tab */}
        <TabsContent value="add" className="space-y-4 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manual Add */}
            <Card>
              <CardHeader>
                <CardTitle>Ajout manuel</CardTitle>
                <CardDescription>
                  Configurez une imprimante manuellement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une imprimante
                </Button>
              </CardContent>
            </Card>

            {/* Auto Discovery */}
            <PrinterDiscovery 
              onDiscovered={(printer) => {
                handleAddPrinter(printer as Omit<PrinterType, 'id' | 'status' | 'lastUsed'>);
              }}
            />
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="mt-6">
          <PrintPreviewWithActions
            printers={printers}
            onPrint={handlePrint}
          />
        </TabsContent>
      </Tabs>

      {/* Add Printer Dialog */}
      <AddPrinterDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddPrinter}
      />
    </div>
  );
}

export default PrintSettings;