'use client';

// ============================================
// Restaurant OS - Admin Expenses Management
// Gestion des dépenses
// ============================================

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Wallet,
  Search,
  Plus,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  ShoppingCart,
  Building,
  Truck,
  Zap,
  Users,
} from 'lucide-react';

// Dynamic imports for recharts
const PieChart = dynamic(() => import('recharts').then((mod) => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then((mod) => mod.Cell), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false });
const Legend = dynamic(() => import('recharts').then((mod) => mod.Legend), { ssr: false });

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: string;
  paidBy: string;
  approvedBy?: string;
  restaurant?: { name: string };
  notes?: string;
  receiptUrl?: string;
}

const categoryColors: Record<string, string> = {
  INVENTORY: '#8b5cf6',
  SALARIES: '#6366f1',
  UTILITIES: '#4f46e5',
  RENT: '#a78bfa',
  EQUIPMENT: '#c4b5fd',
  MARKETING: '#f59e0b',
  DELIVERY: '#10b981',
  OTHER: '#94a3b8',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PAID: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const categoryIcons: Record<string, any> = {
  INVENTORY: ShoppingCart,
  SALARIES: Users,
  UTILITIES: Zap,
  RENT: Building,
  EQUIPMENT: Truck,
  MARKETING: TrendingUp,
  DELIVERY: Truck,
  OTHER: Wallet,
};

const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} FCFA`;
const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR');

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: 'INVENTORY',
    amount: '',
    notes: '',
  });

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch('/api/admin/expenses');
        if (response.ok) {
          const data = await response.json();
          setExpenses(data.data || []);
        } else {
          throw new Error('API error');
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
        // Demo data
        setExpenses([
          {
            id: '1',
            description: 'Achat de nourriture - Janvier',
            category: 'INVENTORY',
            amount: 2500000,
            date: '2025-01-15',
            status: 'PAID',
            paidBy: 'Admin',
            approvedBy: 'Directeur',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '2',
            description: 'Salaires personnel - Janvier',
            category: 'SALARIES',
            amount: 4500000,
            date: '2025-01-31',
            status: 'PAID',
            paidBy: 'RH',
            approvedBy: 'Directeur',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '3',
            description: 'Facture électricité',
            category: 'UTILITIES',
            amount: 850000,
            date: '2025-01-10',
            status: 'PAID',
            paidBy: 'Comptabilité',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '4',
            description: 'Loyer mensuel',
            category: 'RENT',
            amount: 3000000,
            date: '2025-01-05',
            status: 'PAID',
            paidBy: 'Admin',
            approvedBy: 'Propriétaire',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '5',
            description: 'Réparation fourneau',
            category: 'EQUIPMENT',
            amount: 750000,
            date: '2025-01-20',
            status: 'APPROVED',
            paidBy: 'Maintenance',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '6',
            description: 'Campagne publicitaire',
            category: 'MARKETING',
            amount: 500000,
            date: '2025-01-25',
            status: 'PENDING',
            paidBy: 'Marketing',
            restaurant: { name: 'KFM DELICE' },
          },
          {
            id: '7',
            description: 'Carburant livreurs',
            category: 'DELIVERY',
            amount: 450000,
            date: '2025-01-28',
            status: 'PAID',
            paidBy: 'Logistique',
            restaurant: { name: 'KFM DELICE' },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = search === '' ||
      expense.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING' || e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryData = expenses.reduce((acc, e) => {
    const cat = e.category;
    acc[cat] = (acc[cat] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
    color: categoryColors[name],
  }));

  const COLORS = Object.values(categoryColors);

  const handleAddExpense = () => {
    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString(),
      status: 'PENDING',
      paidBy: 'Admin',
    };
    setExpenses([expense, ...expenses]);
    setShowAddDialog(false);
    setNewExpense({ description: '', category: 'INVENTORY', amount: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Dépenses</h1>
          <p className="text-muted-foreground">Suivi et validation des dépenses</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle dépense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total du mois</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-100">
                <Wallet className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payées</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingExpenses)}</p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nb transactions</p>
                <p className="text-2xl font-bold">{expenses.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expenses Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une dépense..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    <SelectItem value="INVENTORY">Inventaire</SelectItem>
                    <SelectItem value="SALARIES">Salaires</SelectItem>
                    <SelectItem value="UTILITIES">Utilitaires</SelectItem>
                    <SelectItem value="RENT">Loyer</SelectItem>
                    <SelectItem value="EQUIPMENT">Équipement</SelectItem>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="DELIVERY">Livraison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <p className="font-medium">{expense.description}</p>
                            {expense.restaurant && (
                              <p className="text-xs text-muted-foreground">{expense.restaurant.name}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" style={{ borderColor: categoryColors[expense.category] }}>
                              {expense.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[expense.status]}>
                              {expense.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par catégorie</CardTitle>
            <CardDescription>Dépenses du mois</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="space-y-2 mt-4">
              {Object.entries(categoryData).map(([cat, amount]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[cat] }}
                    />
                    <span className="text-sm">{cat}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle dépense</DialogTitle>
            <DialogDescription>Enregistrer une nouvelle dépense</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="Description de la dépense"
              />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={newExpense.category}
                onValueChange={(v) => setNewExpense({ ...newExpense, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVENTORY">Inventaire</SelectItem>
                  <SelectItem value="SALARIES">Salaires</SelectItem>
                  <SelectItem value="UTILITIES">Utilitaires</SelectItem>
                  <SelectItem value="RENT">Loyer</SelectItem>
                  <SelectItem value="EQUIPMENT">Équipement</SelectItem>
                  <SelectItem value="MARKETING">Marketing</SelectItem>
                  <SelectItem value="DELIVERY">Livraison</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Montant (FCFA)</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                placeholder="Notes additionnelles"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button onClick={handleAddExpense}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
