'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Calculator, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
  Percent,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TaxSummary } from '@/lib/accounting-export';

interface TaxSummaryProps {
  data?: TaxSummary | null;
  loading?: boolean;
  onExport?: (type: 'csv' | 'pdf') => void;
}

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// TVA rates
const TVA_RATES = [
  { value: 18, label: '18% - Taux normal' },
  { value: 9, label: '9% - Taux réduit' },
  { value: 0, label: '0% - Exonéré' },
];

export function TaxSummaryComponent({ data, loading, onExport }: TaxSummaryProps) {
  const [selectedRate, setSelectedRate] = useState<string>('18');

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

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Aucune donnée fiscale disponible pour cette période
        </CardContent>
      </Card>
    );
  }

  const periodLabel = `${data.period.start.toLocaleDateString('fr-FR')} - ${data.period.end.toLocaleDateString('fr-FR')}`;
  const tvaRate = parseInt(selectedRate);
  const calculatedTVA = Math.round(data.taxableRevenue * (tvaRate / 100));
  const effectiveRate = data.taxableRevenue > 0 ? (data.tvaCollected / data.taxableRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* TVA Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">TVA Collectée</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>TVA sur les ventes (crédit d&apos;État)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(data.tvaCollected)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">TVA Déductible</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>TVA sur les achats (déductible)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(data.tvaPaid)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${data.netTva >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">TVA Nette</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>TVA collectée - TVA déductible = TVA à payer (ou crédit)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className={`text-xl font-bold ${data.netTva >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.netTva))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.netTva >= 0 ? 'À payer' : 'Crédit TVA'}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.netTva >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {data.netTva >= 0 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CA Taxable</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(data.taxableRevenue)}</p>
                <p className="text-xs text-muted-foreground">
                  Taux effectif: {effectiveRate.toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TVA Calculator */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Calculateur TVA
              </CardTitle>
              <CardDescription>Calculez la TVA selon différents taux</CardDescription>
            </div>
            <Select value={selectedRate} onValueChange={setSelectedRate}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TVA_RATES.map(rate => (
                  <SelectItem key={rate.value} value={rate.value.toString()}>
                    {rate.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Chiffre d&apos;affaires</p>
              <p className="text-2xl font-bold">{formatCurrency(data.taxableRevenue)}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Taux TVA</p>
              <p className="text-2xl font-bold">{tvaRate}%</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-muted-foreground mb-2">TVA calculée</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculatedTVA)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Report Detail */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Déclaration TVA
              </CardTitle>
              <CardDescription>Période: {periodLabel}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onExport?.('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rubrique</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead className="text-center">Taux</TableHead>
                <TableHead className="text-right">TVA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TVA Collectée */}
              <TableRow className="bg-blue-50/50">
                <TableCell colSpan={4} className="font-semibold text-blue-800">
                  TVA COLLECTÉE (Opérations imposables)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Ventes de plats et boissons</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue * 0.93)}</TableCell>
                <TableCell className="text-center">18%</TableCell>
                <TableCell className="text-right">{formatCurrency(Math.round(data.tvaCollected * 0.93))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Frais de service</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue * 0.07)}</TableCell>
                <TableCell className="text-center">18%</TableCell>
                <TableCell className="text-right">{formatCurrency(Math.round(data.tvaCollected * 0.07))}</TableCell>
              </TableRow>
              <TableRow className="bg-blue-50 font-semibold">
                <TableCell>Total TVA Collectée</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue)}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right text-blue-600">{formatCurrency(data.tvaCollected)}</TableCell>
              </TableRow>

              {/* TVA Déductible */}
              <TableRow className="bg-orange-50/50">
                <TableCell colSpan={4} className="font-semibold text-orange-800">
                  TVA DÉDUCTIBLE (Opérations réceptives)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Achats de marchandises</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue * 0.25)}</TableCell>
                <TableCell className="text-center">18%</TableCell>
                <TableCell className="text-right">{formatCurrency(Math.round(data.tvaPaid * 0.65))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Services et charges</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue * 0.10)}</TableCell>
                <TableCell className="text-center">18%</TableCell>
                <TableCell className="text-right">{formatCurrency(Math.round(data.tvaPaid * 0.35))}</TableCell>
              </TableRow>
              <TableRow className="bg-orange-50 font-semibold">
                <TableCell>Total TVA Déductible</TableCell>
                <TableCell className="text-right">{formatCurrency(data.taxableRevenue * 0.35)}</TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right text-orange-600">{formatCurrency(data.tvaPaid)}</TableCell>
              </TableRow>

              {/* Résultat */}
              <TableRow className="bg-green-50 font-bold text-lg">
                <TableCell colSpan={3}>
                  <div className="flex items-center gap-2">
                    {data.netTva >= 0 ? (
                      <>
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                        TVA À PAYER
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                        CRÉDIT DE TVA
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className={`text-right ${data.netTva >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(data.netTva))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Taux de TVA Applicables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded bg-muted">
                <span>Taux normal</span>
                <Badge>18%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted">
                <span>Taux réduit</span>
                <Badge variant="outline">9%</Badge>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted">
                <span>Exonéré</span>
                <Badge variant="secondary">0%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informations Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• La déclaration TVA doit être déposée mensuellement</li>
              <li>• Le paiement doit intervenir avant le 15 du mois suivant</li>
              <li>• Conservation des factures: 10 ans minimum</li>
              <li>• Seuil de franchise: 50,000,000 GNF de CA annuel</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TaxSummaryComponent;
