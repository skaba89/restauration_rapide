'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface RecurringExpense {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: string;
  nextDueDate: Date;
  lastProcessed: Date | null;
  category: string;
  supplierName: string | null;
  paymentMethod: string | null;
  notes: string | null;
  isActive: boolean;
  autoCreate: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' },
];

const CATEGORY_OPTIONS = [
  { value: 'supplies', label: 'Fournitures' },
  { value: 'utilities', label: 'Factures' },
  { value: 'rent', label: 'Loyer' },
  { value: 'salaries', label: 'Salaires' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Autres' },
];

const PAYMENT_METHODS = [
  { value: 'Espèces', label: 'Espèces' },
  { value: 'Orange Money', label: 'Orange Money' },
  { value: 'MTN Momo', label: 'MTN Momo' },
  { value: 'Wave', label: 'Wave' },
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Carte bancaire', label: 'Carte bancaire' },
  { value: 'Prélèvement automatique', label: 'Prélèvement automatique' },
];

// Format GNF currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Get frequency label
const getFrequencyLabel = (frequency: string) => {
  return FREQUENCY_OPTIONS.find(f => f.value === frequency)?.label || frequency;
};

// Get days until due
const getDaysUntilDue = (nextDueDate: Date) => {
  const now = new Date();
  const due = new Date(nextDueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

interface RecurringExpensesManagerProps {
  onRecurringChange?: () => void;
}

export function RecurringExpensesManager({ onRecurringChange }: RecurringExpensesManagerProps) {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<RecurringExpense | null>(null);
  const [newExpense, setNewExpense] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: 'monthly',
    nextDueDate: new Date().toISOString().split('T')[0],
    category: 'other',
    supplierName: '',
    paymentMethod: 'Virement bancaire',
    notes: '',
    autoCreate: true,
  });

  // Fetch recurring expenses
  const fetchRecurringExpenses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/expenses/recurring?demo=true');
      const data = await response.json();
      
      if (data.success) {
        setRecurringExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching recurring expenses:', error);
      toast.error('Erreur lors du chargement des dépenses récurrentes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  // Add recurring expense
  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount || !newExpense.nextDueDate) {
      toast.error('Le nom, le montant et la date d\'échéance sont requis');
      return;
    }

    try {
      const response = await fetch('/api/expenses/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Dépense récurrente créée avec succès');
        setIsAddDialogOpen(false);
        setNewExpense({
          name: '',
          description: '',
          amount: '',
          frequency: 'monthly',
          nextDueDate: new Date().toISOString().split('T')[0],
          category: 'other',
          supplierName: '',
          paymentMethod: 'Virement bancaire',
          notes: '',
          autoCreate: true,
        });
        fetchRecurringExpenses();
        onRecurringChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error adding recurring expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Update recurring expense
  const handleUpdateExpense = async () => {
    if (!editingExpense) return;

    try {
      const response = await fetch('/api/expenses/recurring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingExpense.id,
          ...editingExpense,
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Dépense récurrente mise à jour');
        setEditingExpense(null);
        fetchRecurringExpenses();
        onRecurringChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating recurring expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Delete recurring expense
  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetch(`/api/expenses/recurring?id=${id}&demo=true`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Dépense récurrente supprimée');
        fetchRecurringExpenses();
        onRecurringChange?.();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting recurring expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Toggle active status
  const handleToggleActive = async (expense: RecurringExpense) => {
    try {
      const response = await fetch('/api/expenses/recurring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: expense.id,
          isActive: !expense.isActive,
          demo: true,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(expense.isActive ? 'Dépense récurrente désactivée' : 'Dépense récurrente activée');
        fetchRecurringExpenses();
        onRecurringChange?.();
      }
    } catch (error) {
      console.error('Error toggling recurring expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Calculate total monthly
  const totalMonthly = recurringExpenses
    .filter(e => e.isActive)
    .reduce((sum, e) => {
      switch (e.frequency) {
        case 'daily': return sum + (e.amount * 30);
        case 'weekly': return sum + (e.amount * 4);
        case 'monthly': return sum + e.amount;
        case 'yearly': return sum + (e.amount / 12);
        default: return sum;
      }
    }, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total mensuel estimé</p>
              <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {recurringExpenses.filter(e => e.isActive).length} dépenses récurrentes actives
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recurring Expenses Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Dépenses récurrentes</CardTitle>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouvelle dépense récurrente</DialogTitle>
                  <DialogDescription>
                    Configurer une dépense qui se répète automatiquement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom *</Label>
                    <Input 
                      value={newExpense.name}
                      onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                      placeholder="Ex: Loyer mensuel"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input 
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Description optionnelle"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Montant (GNF) *</Label>
                      <Input 
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Fréquence</Label>
                      <Select 
                        value={newExpense.frequency} 
                        onValueChange={(v) => setNewExpense({ ...newExpense, frequency: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map(f => (
                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prochaine échéance *</Label>
                      <Input 
                        type="date"
                        value={newExpense.nextDueDate}
                        onChange={(e) => setNewExpense({ ...newExpense, nextDueDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Catégorie</Label>
                      <Select 
                        value={newExpense.category} 
                        onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Fournisseur</Label>
                      <Input 
                        value={newExpense.supplierName}
                        onChange={(e) => setNewExpense({ ...newExpense, supplierName: e.target.value })}
                        placeholder="Nom du fournisseur"
                      />
                    </div>
                    <div>
                      <Label>Mode de paiement</Label>
                      <Select 
                        value={newExpense.paymentMethod} 
                        onValueChange={(v) => setNewExpense({ ...newExpense, paymentMethod: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_METHODS.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea 
                      value={newExpense.notes}
                      onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                      placeholder="Notes additionnelles..."
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newExpense.autoCreate}
                      onCheckedChange={(v) => setNewExpense({ ...newExpense, autoCreate: v })}
                    />
                    <Label className="font-normal">Créer automatiquement la dépense à l&apos;échéance</Label>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleAddExpense} disabled={!newExpense.name || !newExpense.amount}>
                    Créer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="h-48 bg-muted animate-pulse" />
          ) : (
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Fréquence</TableHead>
                    <TableHead>Prochaine échéance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringExpenses.map((expense) => {
                    const daysUntilDue = getDaysUntilDue(expense.nextDueDate);
                    const isOverdue = daysUntilDue < 0;
                    const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0;
                    
                    return (
                      <TableRow key={expense.id} className={!expense.isActive ? 'opacity-50' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.name}</p>
                            {expense.supplierName && (
                              <p className="text-xs text-muted-foreground">{expense.supplierName}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getFrequencyLabel(expense.frequency)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm">{formatDate(expense.nextDueDate)}</p>
                              {isOverdue ? (
                                <p className="text-xs text-red-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  En retard de {Math.abs(daysUntilDue)} jours
                                </p>
                              ) : isDueSoon ? (
                                <p className="text-xs text-yellow-600">
                                  Dans {daysUntilDue} jours
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Dans {daysUntilDue} jours
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={expense.isActive}
                              onCheckedChange={() => handleToggleActive(expense)}
                            />
                            <span className="text-xs">
                              {expense.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la dépense récurrente</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input 
                  value={editingExpense.name}
                  onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant (GNF)</Label>
                  <Input 
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Fréquence</Label>
                  <Select 
                    value={editingExpense.frequency} 
                    onValueChange={(v) => setEditingExpense({ ...editingExpense, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCY_OPTIONS.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Prochaine échéance</Label>
                <Input 
                  type="date"
                  value={new Date(editingExpense.nextDueDate).toISOString().split('T')[0]}
                  onChange={(e) => setEditingExpense({ ...editingExpense, nextDueDate: new Date(e.target.value) })}
                />
              </div>
              <div>
                <Label>Mode de paiement</Label>
                <Select 
                  value={editingExpense.paymentMethod || ''} 
                  onValueChange={(v) => setEditingExpense({ ...editingExpense, paymentMethod: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingExpense.autoCreate}
                  onCheckedChange={(v) => setEditingExpense({ ...editingExpense, autoCreate: v })}
                />
                <Label className="font-normal">Créer automatiquement la dépense</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateExpense}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RecurringExpensesManager;
