'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { 
  TrendingDown, 
  Plus, 
  Search,
  Calendar,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Filter,
  RefreshCw,
  Trash2,
  Edit,
  Receipt,
  ArrowUpDown,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseStats } from './expense-stats';
import { useFormatCurrency } from '@/components/ui/currency-display';
import { fetchWithAuth } from '@/lib/api-client';

// Types
type ExpenseCategory = 'supplies' | 'utilities' | 'rent' | 'salaries' | 'maintenance' | 'marketing' | 'other';
type PaymentMethod = 'cash' | 'mobile_money' | 'bank';
type ExpenseStatus = 'pending' | 'approved' | 'paid';

interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string | Date;
  status: ExpenseStatus;
  paymentMethod: string;
  supplier?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy: string;
}

interface ExpenseStatsData {
  today: number;
  week: number;
  month: number;
  total: number;
  pending: number;
  paid: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
  count: number;
  pendingCount: number;
  paidCount: number;
}

// Category configuration
const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; color: string }> = {
  supplies: { label: 'Fournitures', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  utilities: { label: 'Factures', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  rent: { label: 'Loyer', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  salaries: { label: 'Salaires', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
  other: { label: 'Autres', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
};

// Status configuration
const STATUS_CONFIG: Record<ExpenseStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  approved: { label: 'Approuvé', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: CheckCircle },
  paid: { label: 'Payé', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle },
};

// Payment method options
const PAYMENT_METHODS = [
  { value: 'Espèces', label: 'Espèces' },
  { value: 'Orange Money', label: 'Orange Money' },
  { value: 'MTN Momo', label: 'MTN Momo' },
  { value: 'Wave', label: 'Wave' },
  { value: 'Virement bancaire', label: 'Virement bancaire' },
  { value: 'Carte bancaire', label: 'Carte bancaire' },
  { value: 'Chèque', label: 'Chèque' },
];

// Format date
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export function ExpenseManager() {
  const { format: formatCurrency, currencyCode } = useFormatCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState({
    category: 'supplies' as ExpenseCategory,
    description: '',
    amount: '',
    paymentMethod: 'Espèces',
    supplier: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch expenses
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (dateFrom) params.append('startDate', dateFrom);
      if (dateTo) params.append('endDate', dateTo);

      const response = await fetchWithAuth(`/api/expenses?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setExpenses(data.data);
        setStats(data.stats);
      } else {
        toast.error('Erreur lors du chargement des dépenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedStatus, dateFrom, dateTo]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Filter expenses by search term
  const filteredExpenses = expenses.filter(e => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      e.description.toLowerCase().includes(search) ||
      e.supplier?.toLowerCase().includes(search) ||
      CATEGORY_CONFIG[e.category]?.label.toLowerCase().includes(search)
    );
  });

  // Add expense
  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast.error('La description et le montant sont requis');
      return;
    }

    try {
      const response = await fetchWithAuth('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Dépense enregistrée avec succès');
        setIsAddDialogOpen(false);
        setNewExpense({
          category: 'supplies',
          description: '',
          amount: '',
          paymentMethod: 'Espèces',
          supplier: '',
          notes: '',
          date: new Date().toISOString().split('T')[0],
        });
        fetchExpenses();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Update expense status
  const handleUpdateStatus = async (id: string, status: ExpenseStatus) => {
    try {
      const response = await fetchWithAuth('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Statut mis à jour');
        fetchExpenses();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Delete expense
  const handleDeleteExpense = async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Dépense supprimée');
        fetchExpenses();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erreur de connexion');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Catégorie', 'Description', 'Montant', 'Mode de paiement', 'Fournisseur', 'Statut'];
    const rows = filteredExpenses.map(e => [
      formatDate(e.date),
      CATEGORY_CONFIG[e.category]?.label || e.category,
      e.description,
      e.amount.toString(),
      e.paymentMethod,
      e.supplier || '',
      STATUS_CONFIG[e.status]?.label || e.status,
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `depenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success('Export CSV téléchargé');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ExpenseStats stats={stats} isLoading={isLoading} />

      {/* Main Content */}
      <Tabs defaultValue="list">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="by-category">Par catégorie</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchExpenses} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter CSV
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle dépense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouvelle dépense</DialogTitle>
                  <DialogDescription>
                    Enregistrer une nouvelle dépense
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Catégorie *</Label>
                    <Select 
                      value={newExpense.category} 
                      onValueChange={(v) => setNewExpense({ ...newExpense, category: v as ExpenseCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description *</Label>
                    <Input 
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Description de la dépense"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Montant ({currencyCode}) *</Label>
                      <Input 
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>Date</Label>
                      <Input 
                        type="date"
                        value={newExpense.date}
                        onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                          {PAYMENT_METHODS.map(method => (
                            <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fournisseur</Label>
                      <Input 
                        value={newExpense.supplier}
                        onChange={(e) => setNewExpense({ ...newExpense, supplier: e.target.value })}
                        placeholder="Nom du fournisseur"
                      />
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
                  <div>
                    <Label>Reçu (fichier)</Label>
                    <Input 
                      type="file"
                      accept="image/*,.pdf"
                      className="cursor-pointer"
                      onChange={(e) => {
                        // Placeholder for file upload
                        if (e.target.files?.length) {
                          toast.info('Fonctionnalité de téléchargement bientôt disponible');
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Image ou PDF du reçu (optionnel)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <Button onClick={handleAddExpense} disabled={!newExpense.description || !newExpense.amount}>
                    Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une dépense..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Date filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Période:</span>
                  </div>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40"
                      placeholder="Du"
                    />
                    <span className="text-muted-foreground">à</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40"
                      placeholder="Au"
                    />
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Effacer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune dépense trouvée</p>
                  <p className="text-sm text-muted-foreground">Modifiez vos filtres ou ajoutez une nouvelle dépense</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map(expense => {
                        const StatusIcon = STATUS_CONFIG[expense.status]?.icon || Clock;
                        return (
                          <TableRow key={expense.id}>
                            <TableCell className="text-sm whitespace-nowrap">
                              {formatDate(expense.date)}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{expense.description}</p>
                                {expense.supplier && (
                                  <p className="text-xs text-muted-foreground">{expense.supplier}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={CATEGORY_CONFIG[expense.category]?.color}>
                                {CATEGORY_CONFIG[expense.category]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{expense.paymentMethod}</TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={expense.status}
                                onValueChange={(v) => handleUpdateStatus(expense.id, v as ExpenseStatus)}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <Badge className={STATUS_CONFIG[expense.status]?.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {STATUS_CONFIG[expense.status]?.label}
                                  </Badge>
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(STATUS_CONFIG).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingExpense(expense);
                                    setIsEditDialogOpen(true);
                                  }}
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
        </TabsContent>

        <TabsContent value="by-category" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
              <CardDescription>
                Vue détaillée des dépenses par catégorie pour cette période
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : (
                <div className="space-y-4">
                  {Object.entries(stats?.byCategory || {})
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount]) => {
                      const percentage = stats?.total ? (amount / stats.total) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge className={CATEGORY_CONFIG[category as ExpenseCategory]?.color}>
                              {CATEGORY_CONFIG[category as ExpenseCategory]?.label || category}
                            </Badge>
                            <div className="text-right">
                              <span className="font-medium">{formatCurrency(amount)}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div 
                              className="bg-primary h-3 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la dépense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input 
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Montant ({currencyCode})</Label>
                  <Input 
                    type="number"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Select 
                    value={editingExpense.category}
                    onValueChange={(v) => setEditingExpense({ ...editingExpense, category: v as ExpenseCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORY_CONFIG).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={async () => {
              if (editingExpense) {
                await handleUpdateStatus(editingExpense.id, editingExpense.status);
                setIsEditDialogOpen(false);
                toast.success('Dépense modifiée');
              }
            }}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ExpenseManager;
