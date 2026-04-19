'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  Clock, 
  Download, 
  Printer,
  TrendingUp,
  Calendar,
  Users,
  CreditCard
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrencySafe } from '@/lib/currency-context';

// Types
interface PayrollEntry {
  staffId: string;
  staffName: string;
  role: string;
  roleLabel: string;
  hourlyRate: number;
  hoursWorked: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  tips: number;
  totalPay: number;
  status: 'pending' | 'paid';
}

// Get initials
const getInitials = (name: string) => {
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
};

// Role colors
const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-purple-100 text-purple-700',
  chef: 'bg-red-100 text-red-700',
  cook: 'bg-orange-100 text-orange-700',
  waiter: 'bg-blue-100 text-blue-700',
  cashier: 'bg-green-100 text-green-700',
  delivery_driver: 'bg-amber-100 text-amber-700',
  cleaner: 'bg-gray-100 text-gray-700',
};

export function PayrollSummary() {
  const { formatCurrency } = useCurrencySafe();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [payroll, setPayroll] = useState<PayrollEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Generate month options
  const monthOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      options.push({
        value: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: fr }),
      });
    }
    return options;
  }, []);

  // Filter payroll by search
  const filteredPayroll = payroll.filter(p => 
    p.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.roleLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const totals = useMemo(() => {
    return filteredPayroll.reduce((acc, p) => ({
      hoursWorked: acc.hoursWorked + p.hoursWorked,
      overtimeHours: acc.overtimeHours + p.overtimeHours,
      regularPay: acc.regularPay + p.regularPay,
      overtimePay: acc.overtimePay + p.overtimePay,
      tips: acc.tips + p.tips,
      totalPay: acc.totalPay + p.totalPay,
    }), {
      hoursWorked: 0,
      overtimeHours: 0,
      regularPay: 0,
      overtimePay: 0,
      tips: 0,
      totalPay: 0,
    });
  }, [filteredPayroll]);

  // Handle export
  const handleExport = () => {
    const csv = [
      ['Employé', 'Rôle', 'Heures', 'Heures Sup.', 'Salaire Base', 'Heures Sup.', 'Pourboires', 'Total', 'Statut'].join(','),
      ...filteredPayroll.map(p => [
        p.staffName,
        p.roleLabel,
        p.hoursWorked,
        p.overtimeHours,
        p.regularPay,
        p.overtimePay,
        p.tips,
        p.totalPay,
        p.status === 'paid' ? 'Payé' : 'En attente'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paie-${selectedMonth}.csv`;
    link.click();
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Mark as paid
  const handleMarkPaid = (staffId: string) => {
    setPayroll(payroll.map(p => 
      p.staffId === staffId ? { ...p, status: 'paid' } : p
    ));
  };

  // Mark all as paid
  const handleMarkAllPaid = () => {
    setPayroll(payroll.map(p => ({ ...p, status: 'paid' })));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total à payer</p>
                <p className="text-2xl font-bold">{formatCurrency(totals.totalPay)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures totales</p>
                <p className="text-2xl font-bold">{totals.hoursWorked}h</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Heures supplémentaires</p>
                <p className="text-2xl font-bold">{totals.overtimeHours}h</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pourboires</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.tips)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Fiche de paie</CardTitle>
              <CardDescription>
                {format(new Date(selectedMonth + '-01'), 'MMMM yyyy', { locale: fr })}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleMarkAllPaid} variant="outline">
              Tout marquer comme payé
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employé</TableHead>
                  <TableHead className="text-center">Heures</TableHead>
                  <TableHead className="text-center">H. Sup.</TableHead>
                  <TableHead className="text-right">Salaire base</TableHead>
                  <TableHead className="text-right">H. Sup.</TableHead>
                  <TableHead className="text-right">Pourboires</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.map(entry => (
                  <TableRow key={entry.staffId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-orange-100 text-orange-700">
                            {getInitials(entry.staffName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{entry.staffName}</p>
                          <Badge variant="outline" className={ROLE_COLORS[entry.role]}>
                            {entry.roleLabel}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{entry.hoursWorked}h</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.overtimeHours > 0 ? (
                        <Badge className="bg-purple-100 text-purple-700">
                          +{entry.overtimeHours}h
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(entry.regularPay)}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.overtimePay > 0 ? formatCurrency(entry.overtimePay) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">{formatCurrency(entry.tips)}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold">{formatCurrency(entry.totalPay)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={entry.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {entry.status === 'paid' ? 'Payé' : 'En attente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkPaid(entry.staffId)}
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Salaires de base</p>
              <p className="text-xl font-bold">{formatCurrency(totals.regularPay)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Heures supplémentaires</p>
              <p className="text-xl font-bold">{formatCurrency(totals.overtimePay)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pourboires distribués</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totals.tips)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total général</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(totals.totalPay)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollSummary;