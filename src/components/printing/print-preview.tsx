'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useCurrencySafe } from '@/lib/currency-context';
import {
  Printer as PrinterIcon,
  Eye,
  FileText,
  ChefHat,
  Truck,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Loader2,
  ShoppingCart,
  Clock,
} from 'lucide-react';
import { getPrinterService, Printer, ReceiptData, KitchenTicketData } from '@/lib/thermal-printer';

// ============================================
// Receipt Preview Component
// ============================================

interface ReceiptPreviewProps {
  data?: ReceiptData;
  paperWidth?: 58 | 80;
  className?: string;
}

export function ReceiptPreview({ 
  data: externalData, 
  paperWidth = 80,
  className 
}: ReceiptPreviewProps) {
  const width = paperWidth === 80 ? 48 : 32;
  
  // Default demo data
  const data: ReceiptData = externalData || {
    orderNumber: 'ORD-2024-0001',
    orderType: 'dine_in',
    items: [
      { name: 'Attieké Poisson Grillé', quantity: 2, price: 15000 },
      { name: 'Jus de Bissap', quantity: 2, price: 3000 },
      { name: 'Eau minérale', quantity: 1, price: 1500 },
    ],
    subtotal: 37500,
    tax: 6750,
    taxRate: 18,
    total: 44250,
    paymentMethod: 'Orange Money',
    tableNumber: '5',
    waiterName: 'Amadou',
    createdAt: new Date(),
  };

  const separator = '='.repeat(width);
  const lineSeparator = '-'.repeat(width);

  const centerText = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  const formatLine = (left: string, right: string) => {
    const spaces = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaces) + right;
  };

  const { formatCurrency } = useCurrencySafe();

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dine_in: 'Sur place',
      takeaway: 'À emporter',
      delivery: 'Livraison',
    };
    return labels[type] || type;
  };

  return (
    <div className={cn('bg-white text-black rounded-lg overflow-hidden', className)}>
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
        <FileText className="h-4 w-4" />
        <span className="font-medium text-sm">Aperçu du reçu</span>
        <Badge variant="outline" className="ml-auto">{paperWidth}mm</Badge>
      </div>
      <ScrollArea className="max-h-[500px]">
        <div className="p-4 font-mono text-xs whitespace-pre bg-gray-50">
          {/* Header */}
          <div className="text-center">
            <div className="font-bold text-sm">{'KFM DELICE'.padStart(width/2 + 5)}</div>
            <div>{'Restaurant & Traiteur'}</div>
            <div>{'Conakry, Guinée'}</div>
            <div>{'Tel: +224 62 00 00 00'}</div>
          </div>
          <div>{separator}</div>
          
          {/* Order info */}
          <div>Ticket: {data.orderNumber}</div>
          <div>Date: {new Date(data.createdAt).toLocaleDateString('fr-FR')} {new Date(data.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>Type: {getOrderTypeLabel(data.orderType)}</div>
          {data.tableNumber && <div>Table: {data.tableNumber}</div>}
          {data.waiterName && <div>Serveur: {data.waiterName}</div>}
          <div>{separator}</div>
          
          {/* Items */}
          <div className="font-medium">{formatLine('Article', 'Prix')}</div>
          <div>{lineSeparator}</div>
          {data.items.map((item, i) => (
            <div key={i}>
              <div>{item.quantity}x {item.name}</div>
              <div className="text-right">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
          <div>{lineSeparator}</div>
          
          {/* Totals */}
          <div>{formatLine('Sous-total', formatCurrency(data.subtotal))}</div>
          {data.discount && data.discount > 0 && (
            <div>{formatLine('Remise', `-${formatCurrency(data.discount)}`)}</div>
          )}
          {data.tax && data.tax > 0 && (
            <div>{formatLine(`TVA (${data.taxRate || 18}%)`, formatCurrency(data.tax))}</div>
          )}
          <div>{separator}</div>
          <div className="font-bold">{formatLine('TOTAL', formatCurrency(data.total))}</div>
          <div>{separator}</div>
          
          {/* Payment */}
          {data.paymentMethod && <div>Paiement: {data.paymentMethod}</div>}
          
          {/* Footer */}
          <div className="text-center mt-2">
            <div>{'Merci de votre visite!'}</div>
            <div>{'À bientôt!'}</div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// Kitchen Ticket Preview Component
// ============================================

interface KitchenTicketPreviewProps {
  data?: KitchenTicketData;
  paperWidth?: 58 | 80;
  className?: string;
}

export function KitchenTicketPreview({ 
  data: externalData, 
  paperWidth = 80,
  className 
}: KitchenTicketPreviewProps) {
  const width = paperWidth === 80 ? 48 : 32;
  
  // Default demo data
  const data: KitchenTicketData = externalData || {
    orderNumber: 'ORD-2024-0001',
    orderType: 'dine_in',
    items: [
      { name: 'Attieké Poisson Grillé', quantity: 2, notes: 'Bien cuit' },
      { name: 'Kedjenou de Poulet', quantity: 1, modifiers: ['Sans piment'] },
    ],
    priority: 'normal',
    tableNumber: '5',
    createdAt: new Date(),
  };

  const separator = '='.repeat(width);

  const centerText = (text: string) => {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  };

  const getOrderTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      dine_in: 'Sur place',
      takeaway: 'À emporter',
      delivery: 'Livraison',
    };
    return labels[type] || type;
  };

  return (
    <div className={cn('bg-white text-black rounded-lg overflow-hidden', className)}>
      <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b">
        <ChefHat className="h-4 w-4" />
        <span className="font-medium text-sm">Aperçu ticket cuisine</span>
        <Badge variant="outline" className="ml-auto">{paperWidth}mm</Badge>
      </div>
      <ScrollArea className="max-h-[400px]">
        <div className="p-4 font-mono text-xs whitespace-pre bg-gray-50">
          {/* Header */}
          <div className="text-center font-bold text-sm">
            {separator}
            {'\n'}
            {'** CUISINE **'}
            {'\n'}
            {separator}
          </div>
          
          {/* Order info */}
          <div>Ticket: {data.orderNumber}</div>
          <div>Heure: {new Date(data.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>Type: {getOrderTypeLabel(data.orderType)}</div>
          {data.tableNumber && <div>Table: {data.tableNumber}</div>}
          
          {/* Priority */}
          {data.priority !== 'normal' && (
            <div className="text-center font-bold mt-2">
              {data.priority === 'urgent' ? '*** URGENT ***' : '** PRIORITAIRE **'}
            </div>
          )}
          
          <div>{separator}</div>
          
          {/* Items */}
          {data.items.map((item, i) => (
            <div key={i}>
              <div className="font-bold">{item.quantity}x {item.name.toUpperCase()}</div>
              {item.notes && <div>   &gt;&gt; {item.notes}</div>}
              {item.modifiers?.map((mod, j) => (
                <div key={j}>   - {mod}</div>
              ))}
            </div>
          ))}
          
          {/* Notes */}
          {data.notes && (
            <div>
              {separator}
              <div>NOTES:</div>
              <div>{data.notes}</div>
            </div>
          )}
          
          <div>{separator}</div>
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// Print Preview with Actions Component
// ============================================

interface PrintPreviewWithActionsProps {
  printers: Printer[];
  defaultPrinterId?: string;
  onPrint?: (printerId: string, type: 'receipt' | 'kitchen') => void;
  className?: string;
}

export function PrintPreviewWithActions({
  printers,
  defaultPrinterId,
  onPrint,
  className,
}: PrintPreviewWithActionsProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>(
    defaultPrinterId || printers.find(p => p.isDefault)?.id || printers[0]?.id || ''
  );
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastPrintStatus, setLastPrintStatus] = useState<'success' | 'error' | null>(null);

  const handlePrint = async (type: 'receipt' | 'kitchen') => {
    if (!selectedPrinter) return;
    
    setIsPrinting(true);
    setLastPrintStatus(null);
    
    try {
      // Simulate printing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onPrint) {
        onPrint(selectedPrinter, type);
      }
      
      setLastPrintStatus('success');
    } catch (error) {
      setLastPrintStatus('error');
    } finally {
      setIsPrinting(false);
      
      // Clear status after 3 seconds
      setTimeout(() => setLastPrintStatus(null), 3000);
    }
  };

  const selectedPrinterData = printers.find(p => p.id === selectedPrinter);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu avant impression
            </CardTitle>
            <CardDescription>
              Vérifiez et imprimez vos tickets
            </CardDescription>
          </div>
          
          {/* Printer selector */}
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sélectionner une imprimante" />
            </SelectTrigger>
            <SelectContent>
              {printers.map(printer => (
                <SelectItem key={printer.id} value={printer.id}>
                  <div className="flex items-center gap-2">
                    <PrinterIcon className="h-4 w-4" />
                    {printer.name}
                    {printer.isDefault && (
                      <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="receipt" className="space-y-4">
          <TabsList>
            <TabsTrigger value="receipt" className="gap-2">
              <FileText className="h-4 w-4" />
              Reçu client
            </TabsTrigger>
            <TabsTrigger value="kitchen" className="gap-2">
              <ChefHat className="h-4 w-4" />
              Ticket cuisine
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="receipt">
            <div className="grid md:grid-cols-2 gap-4">
              <ReceiptPreview paperWidth={selectedPrinterData?.paperWidth || 80} />
              
              <div className="flex flex-col justify-center items-center gap-4">
                <div className="text-center">
                  <p className="font-medium mb-2">Imprimer le reçu client</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Imprimante: {selectedPrinterData?.name || 'Non sélectionnée'}
                  </p>
                </div>
                
                <Button
                  size="lg"
                  className="w-48 gap-2"
                  onClick={() => handlePrint('receipt')}
                  disabled={!selectedPrinter || isPrinting}
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Impression...
                    </>
                  ) : (
                    <>
                      <PrinterIcon className="h-5 w-5" />
                      Imprimer reçu
                    </>
                  )}
                </Button>
                
                {lastPrintStatus && (
                  <div className={cn(
                    'flex items-center gap-2 text-sm',
                    lastPrintStatus === 'success' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {lastPrintStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Impression réussie!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Erreur d'impression
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="kitchen">
            <div className="grid md:grid-cols-2 gap-4">
              <KitchenTicketPreview paperWidth={selectedPrinterData?.paperWidth || 80} />
              
              <div className="flex flex-col justify-center items-center gap-4">
                <div className="text-center">
                  <p className="font-medium mb-2">Imprimer le ticket cuisine</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Imprimante: {selectedPrinterData?.name || 'Non sélectionnée'}
                  </p>
                </div>
                
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-48 gap-2"
                  onClick={() => handlePrint('kitchen')}
                  disabled={!selectedPrinter || isPrinting}
                >
                  {isPrinting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Impression...
                    </>
                  ) : (
                    <>
                      <ChefHat className="h-5 w-5" />
                      Imprimer cuisine
                    </>
                  )}
                </Button>
                
                {lastPrintStatus && (
                  <div className={cn(
                    'flex items-center gap-2 text-sm',
                    lastPrintStatus === 'success' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {lastPrintStatus === 'success' ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Impression réussie!
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Erreur d'impression
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ReceiptPreview;
