'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
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
  TableRow,
} from '@/components/ui/table';
import {
  CalendarDays,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Calendar,
  PiggyBank
} from 'lucide-react';

// Types
interface LeaveBalance {
  id: string;
  staffId: string;
  staffName: string;
  year: number;
  leaveType: string;
  leaveTypeLabel: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
  carriedOver: number;
  carryOverExpiry: Date | string | null;
}

// Leave type configuration
const LEAVE_TYPES = [
  { value: 'annual', label: 'Congés annuels', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'sick', label: 'Maladie', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'personal', label: 'Personnel', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'maternity', label: 'Maternité', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { value: 'paternity', label: 'Paternité', color: 'bg-green-100 text-green-700 border-green-200' },
];

const STAFF_LIST = [
  { id: '1', name: 'Amadou Diallo' },
  { id: '2', name: 'Fatou Sylla' },
  { id: '3', name: 'Ibrahim Keita' },
  { id: '4', name: 'Marie Koulibaly' },
  { id: '5', name: 'Moussa Camara' },
  { id: '6', name: 'Aissatou Traore' },
  { id: '8', name: 'Fanta Diarra' },
  { id: '9', name: 'Oumar Bah' },
];

export function LeaveBalancesManager() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [selectedLeaveType, setSelectedLeaveType] = useState('all');
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [adjustmentValue, setAdjustmentValue] = useState('1');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // Filter balances
  const filteredBalances = balances.filter(b => {
    const matchesYear = b.year === parseInt(selectedYear);
    const matchesStaff = selectedStaffId === 'all' || b.staffId === selectedStaffId;
    const matchesType = selectedLeaveType === 'all' || b.leaveType === selectedLeaveType;
    return matchesYear && matchesStaff && matchesType;
  });

  // Stats
  const totalAnnualDays = filteredBalances
    .filter(b => b.leaveType === 'annual')
    .reduce((acc, b) => acc + b.totalDays, 0);
  const totalUsedDays = filteredBalances
    .filter(b => b.leaveType === 'annual')
    .reduce((acc, b) => acc + b.usedDays, 0);
  const totalRemainingDays = filteredBalances
    .filter(b => b.leaveType === 'annual')
    .reduce((acc, b) => acc + b.remainingDays, 0);
  const totalPendingDays = filteredBalances
    .reduce((acc, b) => acc + b.pendingDays, 0);

  // Get progress percentage
  const getProgressPercentage = (balance: LeaveBalance) => {
    return Math.round((balance.remainingDays / balance.totalDays) * 100);
  };

  // Handle adjustment
  const handleAdjust = () => {
    if (!selectedBalance) return;
    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) return;

    setBalances(balances.map(b => {
      if (b.id === selectedBalance.id) {
        let newRemainingDays = b.remainingDays;
        let newTotalDays = b.totalDays;

        if (adjustmentType === 'add') {
          newRemainingDays += value;
          newTotalDays += value;
        } else if (adjustmentType === 'subtract') {
          newRemainingDays = Math.max(0, newRemainingDays - value);
        } else {
          newRemainingDays = value;
        }

        return {
          ...b,
          remainingDays: newRemainingDays,
          totalDays: newTotalDays,
        };
      }
      return b;
    }));

    setIsAdjustDialogOpen(false);
    setSelectedBalance(null);
    setAdjustmentValue('1');
    setAdjustmentReason('');
  };

  // Get type config
  const getTypeConfig = (type: string) => LEAVE_TYPES.find(t => t.value === type) || LEAVE_TYPES[0];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total congés annuels</p>
                <p className="text-2xl font-bold">{totalAnnualDays} jours</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jours utilisés</p>
                <p className="text-2xl font-bold text-orange-600">{totalUsedDays} jours</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jours restants</p>
                <p className="text-2xl font-bold text-green-600">{totalRemainingDays} jours</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPendingDays} jours</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balances List Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Soldes de congés</CardTitle>
              <CardDescription>Année {selectedYear} - {filteredBalances.length} solde(s)</CardDescription>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Employé" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les employés</SelectItem>
                {STAFF_LIST.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {LEAVE_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Utilisé</TableHead>
                  <TableHead className="text-center">En attente</TableHead>
                  <TableHead className="text-center">Restant</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBalances.map(balance => {
                  const typeConfig = getTypeConfig(balance.leaveType);
                  const progress = getProgressPercentage(balance);
                  
                  return (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">{balance.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeConfig.color}>
                          {balance.leaveTypeLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{balance.totalDays}</TableCell>
                      <TableCell className="text-center">
                        <span className={balance.usedDays > 0 ? 'text-orange-600 font-medium' : ''}>
                          {balance.usedDays}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {balance.pendingDays > 0 ? (
                          <span className="text-yellow-600 font-medium">{balance.pendingDays}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={balance.remainingDays > 5 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                          {balance.remainingDays}
                        </span>
                      </TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress 
                            value={progress} 
                            className={`h-2 ${progress > 50 ? 'bg-green-100' : progress > 20 ? 'bg-yellow-100' : 'bg-red-100'}`}
                          />
                          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBalance(balance);
                              setAdjustmentType('add');
                              setIsAdjustDialogOpen(true);
                            }}
                          >
                            <Plus className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBalance(balance);
                              setAdjustmentType('subtract');
                              setIsAdjustDialogOpen(true);
                            }}
                          >
                            <Minus className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajuster le solde</DialogTitle>
            <DialogDescription>
              Modifier le solde de congés pour {selectedBalance?.staffName}
            </DialogDescription>
          </DialogHeader>
          {selectedBalance && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4 text-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold text-lg">{selectedBalance.totalDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisé</p>
                  <p className="font-bold text-lg text-orange-600">{selectedBalance.usedDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Restant</p>
                  <p className="font-bold text-lg text-green-600">{selectedBalance.remainingDays}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Type d'ajustement</Label>
                <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as 'add' | 'subtract' | 'set')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Ajouter des jours</SelectItem>
                    <SelectItem value="subtract">Soustraire des jours</SelectItem>
                    <SelectItem value="set">Définir le solde</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  {adjustmentType === 'set' ? 'Nouveau solde' : 'Nombre de jours'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  step="0.5"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Raison</Label>
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Raison de l'ajustement..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleAdjust}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LeaveBalancesManager;