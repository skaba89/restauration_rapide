'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  FileText, 
  CalendarIcon, 
  FileSpreadsheet,
  FileCode,
  FileArchive,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AccountingExport, ProfitLossData, TaxSummary } from '@/lib/accounting-export';

interface AccountingExportProps {
  onExport?: (type: 'csv' | 'excel' | 'quickbooks' | 'sage', startDate: Date, endDate: Date, dataType: 'pnl' | 'tax') => void;
  exportHistory?: AccountingExport[];
  loading?: boolean;
}

// Export type configurations
const EXPORT_TYPES: Array<{
  value: 'csv' | 'excel' | 'quickbooks' | 'sage';
  label: string;
  description: string;
  icon: React.ReactNode;
  recommended?: boolean;
}> = [
  { 
    value: 'csv', 
    label: 'CSV', 
    description: 'Format universel, compatible Excel et autres tableurs',
    icon: <FileText className="h-5 w-5" />,
    recommended: true
  },
  { 
    value: 'excel', 
    label: 'Excel (XML)', 
    description: 'Format Microsoft Excel avec mise en forme',
    icon: <FileSpreadsheet className="h-5 w-5" />
  },
  { 
    value: 'quickbooks', 
    label: 'QuickBooks (IIF)', 
    description: 'Format d\'import pour QuickBooks',
    icon: <FileCode className="h-5 w-5" />
  },
  { 
    value: 'sage', 
    label: 'Sage', 
    description: 'Format d\'import pour Sage Comptabilité',
    icon: <FileArchive className="h-5 w-5" />
  },
];

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

export function AccountingExportComponent({ 
  onExport, 
  exportHistory,
  loading 
}: AccountingExportProps) {
  const [selectedType, setSelectedType] = useState<'csv' | 'excel' | 'quickbooks' | 'sage'>('csv');
  const [dataType, setDataType] = useState<'pnl' | 'tax'>('pnl');
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Demo export history
  const history = exportHistory || [
    {
      id: 'exp-001',
      type: 'csv' as const,
      dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
      status: 'completed' as const,
      downloadUrl: '/exports/q1-2024.csv',
      createdAt: new Date(2024, 3, 5)
    },
    {
      id: 'exp-002',
      type: 'excel' as const,
      dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
      status: 'completed' as const,
      downloadUrl: '/exports/q1-2024.xlsx',
      createdAt: new Date(2024, 3, 3)
    },
    {
      id: 'exp-003',
      type: 'quickbooks' as const,
      dateRange: { start: new Date(2024, 0, 1), end: new Date(2024, 2, 31) },
      status: 'failed' as const,
      createdAt: new Date(2024, 3, 1)
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport?.(selectedType, startDate, endDate, dataType);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    // Generate preview content
    const preview = generatePreviewContent(dataType);
    setPreviewData(preview);
    setIsPreviewOpen(true);
  };

  const generatePreviewContent = (type: 'pnl' | 'tax'): string => {
    if (type === 'pnl') {
      return `Compte de Résultat - KFM DELICE
Période: ${format(startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(endDate, 'dd/MM/yyyy', { locale: fr })}

REVENUS
Ventes de plats,87,500,000 GNF
Ventes de boissons,28,500,000 GNF
Frais de livraison,4,500,000 GNF
Frais de service,3,200,000 GNF
Total Revenus,124,900,000 GNF

COÛT DES MARCHANDISES VENDUES
Coût des aliments,26,250,000 GNF
Coût des boissons,8,550,000 GNF
Total COGS,34,800,000 GNF

MARGE BRUTE,90,100,000 GNF

CHARGES D'EXPLOITATION
Loyer,15,000,000 GNF
Services publics,3,500,000 GNF
Salaires,32,000,000 GNF
Marketing,4,500,000 GNF
Total Charges,62,500,000 GNF

RÉSULTAT NET,27,600,000 GNF`;
    } else {
      return `Résumé Fiscal - KFM DELICE
Période: ${format(startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(endDate, 'dd/MM/yyyy', { locale: fr })}

TVA COLLECTÉE,22,482,000 GNF
TVA DÉDUCTIBLE,6,264,000 GNF
TVA NETTE À PAYER,16,218,000 GNF

Chiffre d'affaires taxable,124,900,000 GNF
Taux TVA,18%`;
    }
  };

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
      {/* Export Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter les Données Comptables
          </CardTitle>
          <CardDescription>
            Choisissez le format et la période pour l&apos;export
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div>
            <Label>Type de données</Label>
            <div className="flex gap-4 mt-2">
              <Button
                variant={dataType === 'pnl' ? 'default' : 'outline'}
                onClick={() => setDataType('pnl')}
                className="flex-1"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Compte de Résultat
              </Button>
              <Button
                variant={dataType === 'tax' ? 'default' : 'outline'}
                onClick={() => setDataType('tax')}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Résumé Fiscal
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left mt-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(startDate, 'dd MMMM yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left mt-2">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {format(endDate, 'dd MMMM yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Export Format Selection */}
          <div>
            <Label>Format d&apos;export</Label>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {EXPORT_TYPES.map((type) => (
                <div
                  key={type.value}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedType === type.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => setSelectedType(type.value)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${selectedType === type.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{type.label}</span>
                        {type.recommended && (
                          <Badge variant="secondary" className="text-xs">Recommandé</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </div>
                  {selectedType === type.value && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handlePreview} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
              <CheckCircle className="h-5 w-5" />
              <span>Export généré avec succès!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des Exports</CardTitle>
          <CardDescription>Les derniers exports effectués</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {history.map((exp) => (
                <div 
                  key={exp.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      exp.status === 'completed' ? 'bg-green-100' : 
                      exp.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {exp.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : exp.status === 'failed' ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium uppercase">{exp.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {exp.status === 'completed' ? 'Terminé' : 
                           exp.status === 'failed' ? 'Échec' : 'En cours'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(exp.dateRange.start, 'dd/MM/yyyy', { locale: fr })} - {format(exp.dateRange.end, 'dd/MM/yyyy', { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Créé le {format(exp.createdAt, 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exp.downloadUrl && exp.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Télécharger
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Aperçu des Données</DialogTitle>
            <DialogDescription>
              {dataType === 'pnl' ? 'Compte de Résultat' : 'Résumé Fiscal'} - {' '}
              {format(startDate, 'dd/MM/yyyy', { locale: fr })} au {format(endDate, 'dd/MM/yyyy', { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            <pre className="text-sm font-mono whitespace-pre-wrap p-4 bg-muted rounded-lg">
              {previewData}
            </pre>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Fermer
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountingExportComponent;
