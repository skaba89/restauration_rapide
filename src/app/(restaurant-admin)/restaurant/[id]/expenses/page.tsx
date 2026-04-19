'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingDown,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Tag,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { useCurrencySafe } from '@/lib/currency-context';

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
  supplier?: string;
  notes?: string;
}

const CATEGORIES = ['Matières premières', 'Utilities', 'Salaires', 'Loyer', 'Équipement', 'Marketing', 'Autres'];

export default function RestaurantExpensesPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrencySafe();

  useEffect(() => {
    loadExpenses();
  }, [restaurantId]);

  const loadExpenses = async () => {
    try {
      const data = await apiGet<any>(`/expenses?restaurantId=${restaurantId}`);
      if (data?.expenses?.length > 0) {
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(e =>
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-orange-500" />
            Dépenses
          </h1>
          <p className="text-muted-foreground">
            Suivez et gérez vos dépenses
          </p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle dépense
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-sm text-muted-foreground">total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(paidExpenses)}</p>
                <p className="text-sm text-muted-foreground">payés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(pendingExpenses)}</p>
                <p className="text-sm text-muted-foreground">en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Historique des dépenses</CardTitle>
              <CardDescription>Toutes vos dépenses récentes</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Description</th>
                  <th className="text-left py-3 px-2">Catégorie</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Montant</th>
                  <th className="text-left py-3 px-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b">
                    <td className="py-3 px-2">
                      <p className="font-medium">{expense.description}</p>
                      {expense.supplier && (
                        <p className="text-sm text-muted-foreground">{expense.supplier}</p>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline">
                        <Tag className="h-3 w-3 mr-1" />
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-2 font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={
                        expense.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }>
                        {expense.status === 'PAID' ? 'Payé' : 'En attente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}