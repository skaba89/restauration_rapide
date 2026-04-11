import { Metadata } from 'next';
import ExpenseManager from '@/components/expenses/expense-manager';
import { CategoryManager } from '@/components/expenses/category-manager';
import { RecurringExpensesManager } from '@/components/expenses/recurring-expenses-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, Download, TrendingDown, Tag, RefreshCw, HelpCircle } from 'lucide-react';
import { CurrencyBadge } from '@/components/ui/currency-display';

export const metadata: Metadata = {
  title: 'Suivi des Dépenses - KFM DELICE',
  description: 'Gérez vos dépenses quotidiennes',
};

export default function ExpensesPage() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Suivi des Dépenses</h1>
              <p className="text-muted-foreground">
                Gérez et analysez vos dépenses quotidiennes
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyBadge />
          <Badge variant="secondary" className="gap-1">
            <Download className="h-3 w-3" />
            Export CSV
          </Badge>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="expenses" className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Dépenses
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="h-4 w-4" />
            Catégories
          </TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Récurrentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-6">
          <ExpenseManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="recurring" className="mt-6">
          <RecurringExpensesManager />
        </TabsContent>
      </Tabs>

      {/* Categories Legend Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Catégories de dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Fournitures', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
              { label: 'Factures', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
              { label: 'Loyer', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
              { label: 'Salaires', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
              { label: 'Maintenance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
              { label: 'Marketing', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300' },
              { label: 'Autres', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
            ].map((cat) => (
              <div key={cat.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${cat.color.split(' ')[0]}`} />
                <span className="text-sm">{cat.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Guide d&apos;utilisation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Ajouter une dépense</p>
              <p className="text-muted-foreground">Enregistrez chaque dépense avec catégorie et montant</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-yellow-600">2</span>
            </div>
            <div>
              <p className="font-medium">Configurer les catégories</p>
              <p className="text-muted-foreground">Définissez vos catégories avec budgets mensuels</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-green-600">3</span>
            </div>
            <div>
              <p className="font-medium">Dépenses récurrentes</p>
              <p className="text-muted-foreground">Configurez les dépenses automatiques mensuelles</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-purple-600">4</span>
            </div>
            <div>
              <p className="font-medium">Exporter</p>
              <p className="text-muted-foreground">Téléchargez vos données en CSV pour la comptabilité</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
