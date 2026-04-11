'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  Percent, 
  Calculator,
  Shuffle,
  UserCog,
  Play,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface TipDistribution {
  id: string;
  tipId: string;
  staffId: string;
  staffName: string;
  amount: number;
  percentage: number;
  hoursWorked?: number;
  distributedAt?: Date;
  status: 'pending' | 'paid';
}

interface DistributionRule {
  method: 'hours' | 'role' | 'equal' | 'custom';
  rolePercentages?: {
    waiter: number;
    kitchen: number;
    delivery: number;
    other: number;
  };
}

interface StaffMember {
  id: string;
  name: string;
  role: 'waiter' | 'kitchen' | 'delivery' | 'other';
  hoursWorked: number;
}

interface TipsDistributionProps {
  pendingAmount?: number;
  staff?: StaffMember[];
  onDistribute?: (method: DistributionRule['method'], distributions: TipDistribution[]) => void;
  loading?: boolean;
}

// Demo staff data
const DEMO_STAFF: StaffMember[] = [
  { id: 'staff-001', name: 'Aïssata Traoré', role: 'waiter', hoursWorked: 168 },
  { id: 'staff-002', name: 'Moussa Bamba', role: 'waiter', hoursWorked: 168 },
  { id: 'staff-003', name: 'Mariama Sy', role: 'kitchen', hoursWorked: 84 },
  { id: 'staff-004', name: 'Ibrahim Koné', role: 'kitchen', hoursWorked: 168 },
  { id: 'staff-005', name: 'Fatoumata Diallo', role: 'delivery', hoursWorked: 126 },
  { id: 'staff-006', name: 'Seydou Konaté', role: 'delivery', hoursWorked: 126 },
  { id: 'staff-007', name: 'Amadou Keita', role: 'waiter', hoursWorked: 200 },
];

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

export function TipsDistribution({ 
  pendingAmount = 63500, 
  staff = DEMO_STAFF,
  onDistribute,
  loading 
}: TipsDistributionProps) {
  const [method, setMethod] = useState<DistributionRule['method']>('hours');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDistributions, setPreviewDistributions] = useState<TipDistribution[]>([]);
  const [rolePercentages, setRolePercentages] = useState({
    waiter: 50,
    kitchen: 25,
    delivery: 20,
    other: 5
  });
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [isDistributing, setIsDistributing] = useState(false);

  // Calculate distributions based on method
  const calculateDistributions = (): TipDistribution[] => {
    const distributions: TipDistribution[] = [];
    
    switch (method) {
      case 'equal':
        // Equal split among all staff
        const equalAmount = Math.round(pendingAmount / staff.length);
        staff.forEach(s => {
          distributions.push({
            id: `dist-preview-${s.id}`,
            tipId: 'preview',
            staffId: s.id,
            staffName: s.name,
            amount: equalAmount,
            percentage: (equalAmount / pendingAmount) * 100,
            hoursWorked: s.hoursWorked,
            status: 'pending'
          });
        });
        break;

      case 'hours':
        // Distribution based on hours worked
        const totalHours = staff.reduce((sum, s) => sum + s.hoursWorked, 0);
        staff.forEach(s => {
          const amount = Math.round(pendingAmount * (s.hoursWorked / totalHours));
          distributions.push({
            id: `dist-preview-${s.id}`,
            tipId: 'preview',
            staffId: s.id,
            staffName: s.name,
            amount,
            percentage: (amount / pendingAmount) * 100,
            hoursWorked: s.hoursWorked,
            status: 'pending'
          });
        });
        break;

      case 'role':
        // Distribution based on role percentages
        const staffByRole = staff.reduce((acc, s) => {
          if (!acc[s.role]) acc[s.role] = [];
          acc[s.role].push(s);
          return acc;
        }, {} as Record<string, StaffMember[]>);

        Object.entries(staffByRole).forEach(([role, members]) => {
          const roleTotal = pendingAmount * ((rolePercentages[role as keyof typeof rolePercentages] || 0) / 100);
          const perMember = Math.round(roleTotal / members.length);
          
          members.forEach(s => {
            distributions.push({
              id: `dist-preview-${s.id}`,
              tipId: 'preview',
              staffId: s.id,
              staffName: s.name,
              amount: perMember,
              percentage: (perMember / pendingAmount) * 100,
              hoursWorked: s.hoursWorked,
              status: 'pending'
            });
          });
        });
        break;

      case 'custom':
        // Custom amounts
        staff.forEach(s => {
          const amount = customAmounts[s.id] || 0;
          distributions.push({
            id: `dist-preview-${s.id}`,
            tipId: 'preview',
            staffId: s.id,
            staffName: s.name,
            amount,
            percentage: (amount / pendingAmount) * 100,
            hoursWorked: s.hoursWorked,
            status: 'pending'
          });
        });
        break;
    }

    return distributions;
  };

  const handlePreview = () => {
    const distributions = calculateDistributions();
    setPreviewDistributions(distributions);
    setIsPreviewOpen(true);
  };

  const handleDistribute = async () => {
    setIsDistributing(true);
    const distributions = calculateDistributions();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onDistribute?.(method, distributions);
    setIsDistributing(false);
    setIsPreviewOpen(false);
  };

  const totalDistributed = previewDistributions.reduce((sum, d) => sum + d.amount, 0);
  const remaining = pendingAmount - totalDistributed;

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
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Méthode de Distribution
          </CardTitle>
          <CardDescription>
            Choisissez comment répartir les {formatCurrency(pendingAmount)} de pourboires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={method} onValueChange={(v) => setMethod(v as DistributionRule['method'])}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hours" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Par Heures</span>
              </TabsTrigger>
              <TabsTrigger value="role" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Par Rôle</span>
              </TabsTrigger>
              <TabsTrigger value="equal" className="flex items-center gap-2">
                <Shuffle className="h-4 w-4" />
                <span className="hidden sm:inline">Parts Égales</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                <span className="hidden sm:inline">Personnalisé</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hours" className="mt-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Les pourboires seront distribués proportionnellement aux heures travaillées par chaque employé.
                </p>
                <div className="mt-4 space-y-2">
                  {staff.slice(0, 3).map(s => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className="text-muted-foreground">{s.hoursWorked}h</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="role" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Définissez le pourcentage attribué à chaque rôle.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Serveurs ({rolePercentages.waiter}%)</Label>
                    <Input 
                      type="number" 
                      value={rolePercentages.waiter}
                      onChange={(e) => setRolePercentages({...rolePercentages, waiter: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Cuisine ({rolePercentages.kitchen}%)</Label>
                    <Input 
                      type="number" 
                      value={rolePercentages.kitchen}
                      onChange={(e) => setRolePercentages({...rolePercentages, kitchen: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Livraison ({rolePercentages.delivery}%)</Label>
                    <Input 
                      type="number" 
                      value={rolePercentages.delivery}
                      onChange={(e) => setRolePercentages({...rolePercentages, delivery: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Autres ({rolePercentages.other}%)</Label>
                    <Input 
                      type="number" 
                      value={rolePercentages.other}
                      onChange={(e) => setRolePercentages({...rolePercentages, other: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={rolePercentages.waiter + rolePercentages.kitchen + rolePercentages.delivery + rolePercentages.other} 
                    max={100} 
                    className="flex-1"
                  />
                  <span className={`text-sm font-medium ${
                    rolePercentages.waiter + rolePercentages.kitchen + rolePercentages.delivery + rolePercentages.other === 100 
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {rolePercentages.waiter + rolePercentages.kitchen + rolePercentages.delivery + rolePercentages.other}%
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="equal" className="mt-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  Les pourboires seront répartis équitablement entre tous les {staff.length} employés.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-background border">
                  <p className="text-center">
                    <span className="text-2xl font-bold">{formatCurrency(Math.round(pendingAmount / staff.length))}</span>
                    <span className="text-sm text-muted-foreground block">par employé</span>
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Attribuez manuellement les montants à chaque employé.
                </p>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-4">
                    {staff.map(s => (
                      <div key={s.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <Label>{s.name}</Label>
                          <p className="text-xs text-muted-foreground">{s.role} - {s.hoursWorked}h</p>
                        </div>
                        <Input
                          type="number"
                          className="w-32"
                          value={customAmounts[s.id] || ''}
                          onChange={(e) => setCustomAmounts({
                            ...customAmounts, 
                            [s.id]: parseInt(e.target.value) || 0
                          })}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <span>Total attribué</span>
                  <span className={`font-bold ${
                    Object.values(customAmounts).reduce((sum, v) => sum + v, 0) === pendingAmount 
                      ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formatCurrency(Object.values(customAmounts).reduce((sum, v) => sum + v, 0))}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Staff Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employés Éligibles
          </CardTitle>
          <CardDescription>
            {staff.length} employés participant à la distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {staff.map(s => {
              const preview = calculateDistributions().find(d => d.staffId === s.id);
              return (
                <div key={s.id} className="p-3 rounded-lg border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.role} • {s.hoursWorked}h
                    </p>
                  </div>
                  {preview && (
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatCurrency(preview.amount)}</p>
                      <p className="text-xs text-muted-foreground">{preview.percentage.toFixed(1)}%</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={handlePreview} className="flex-1">
          <Eye className="h-4 w-4 mr-2" />
          Aperçu
        </Button>
        <Button onClick={handlePreview} className="flex-1">
          <Play className="h-4 w-4 mr-2" />
          Distribuer
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Aperçu de la Distribution</DialogTitle>
            <DialogDescription>
              Répartition de {formatCurrency(pendingAmount)} par méthode {method === 'hours' ? 'heures travaillées' : method === 'role' ? 'rôle' : method === 'equal' ? 'parts égales' : 'personnalisée'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Heures</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewDistributions.map(d => {
                  const staffMember = staff.find(s => s.id === d.staffId);
                  return (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {staffMember?.role || 'other'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{d.hoursWorked}h</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(d.amount)}
                      </TableCell>
                      <TableCell className="text-right">{d.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Total distribué</p>
              <p className="text-xl font-bold">{formatCurrency(totalDistributed)}</p>
            </div>
            {remaining !== 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Reste</p>
                <p className={`font-medium ${remaining > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(remaining))}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleDistribute} 
              disabled={isDistributing || remaining > 1000}
            >
              {isDistributing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirmer la Distribution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TipsDistribution;
