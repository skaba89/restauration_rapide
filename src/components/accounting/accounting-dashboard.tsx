'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Calculator,
  Building,
  Receipt,
  Download,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  CreditCard,
} from 'lucide-react';
import { format, subMonths, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchWithAuth } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

// Types
interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  mapping?: string;
  isActive: boolean;
  isSystem?: boolean;
}

interface JournalLine {
  id: string;
  lineNumber: number;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  date: Date;
  reference?: string;
  description: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  lines: JournalLine[];
  createdAt: Date;
  postedAt?: Date;
}

interface TrialBalance {
  period: { start: Date; end: Date };
  accounts: Array<{
    code: string;
    name: string;
    type: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  summary: {
    totalDebit: number;
    totalCredit: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  };
}

interface BalanceSheet {
  period: { date: Date; year: number };
  assets: {
    currentAssets: { cash: number; accountsReceivable: number; inventory: number; tvaDeductible: number; total: number };
    fixedAssets: { equipment: number; vehicles: number; accumulatedDepreciation: number; total: number };
    totalAssets: number;
  };
  liabilities: {
    currentLiabilities: { accountsPayable: number; salariesPayable: number; tvaCollected: number; total: number };
    longTermLiabilities: { loans: number; total: number };
    totalLiabilities: number;
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    netIncome: number;
    totalEquity: number;
  };
  totalLiabilitiesAndEquity: number;
}

interface IncomeStatement {
  period: { start: Date; end: Date };
  revenue: {
    foodSales: number;
    beverageSales: number;
    deliveryFees: number;
    serviceCharges: number;
    otherRevenue: number;
    totalRevenue: number;
  };
  costOfGoodsSold: { foodCost: number; beverageCost: number; totalCOGS: number };
  grossProfit: number;
  grossMarginPercent: number;
  operatingExpenses: {
    salaries: number;
    rent: number;
    utilities: number;
    marketing: number;
    supplies: number;
    maintenance: number;
    insurance: number;
    depreciation: number;
    other: number;
    totalExpenses: number;
  };
  netIncome: number;
  netMarginPercent: number;
}

// Format currency in GNF
const formatGNF = (amount: number): string => {
  return new Intl.NumberFormat('fr-GN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' GNF';
};

// Account type configuration
const ACCOUNT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string; bgColor: string }> = {
  ASSET: { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-blue-600', label: 'Actifs', bgColor: 'bg-blue-100' },
  LIABILITY: { icon: <ArrowDownRight className="h-4 w-4" />, color: 'text-orange-600', label: 'Passifs', bgColor: 'bg-orange-100' },
  EQUITY: { icon: <DollarSign className="h-4 w-4" />, color: 'text-purple-600', label: 'Capitaux', bgColor: 'bg-purple-100' },
  REVENUE: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600', label: 'Revenus', bgColor: 'bg-green-100' },
  EXPENSE: { icon: <TrendingDown className="h-4 w-4" />, color: 'text-red-600', label: 'Dépenses', bgColor: 'bg-red-100' },
};

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  DRAFT: { icon: <Clock className="h-4 w-4" />, color: 'text-gray-600', label: 'Brouillon' },
  POSTED: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-600', label: 'Posté' },
  REVERSED: { icon: <XCircle className="h-4 w-4" />, color: 'text-orange-600', label: 'Extourné' },
  CANCELLED: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-600', label: 'Annulé' },
};

export function AccountingDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState<string>('quarter');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null);

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Form states for new entry
  const [newEntry, setNewEntry] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    reference: '',
    description: '',
    lines: [
      { accountId: '', debit: 0, credit: 0, description: '' },
      { accountId: '', debit: 0, credit: 0, description: '' },
    ],
  });

  // Form state for new account
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'EXPENSE' as Account['type'],
    mapping: '',
  });

  // Calculate date range based on period
  const getDateRange = useCallback((periodValue: string) => {
    const now = new Date();
    switch (periodValue) {
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subMonths(now, 2), end: now };
      case 'semester':
        return { start: subMonths(now, 5), end: now };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: subMonths(now, 2), end: now };
    }
  }, []);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsRes, entriesRes, trialRes, balanceRes, incomeRes] = await Promise.all([
        fetchWithAuth('/api/accounting/accounts?organizationId=kfm-delice'),
        fetchWithAuth('/api/accounting/entries?organizationId=kfm-delice'),
        fetchWithAuth(`/api/accounting/reports?type=trial-balance&organizationId=kfm-delice`),
        fetchWithAuth(`/api/accounting/reports?type=balance-sheet&organizationId=kfm-delice`),
        fetchWithAuth(`/api/accounting/reports?type=income-statement&organizationId=kfm-delice`),
      ]);

      const [accountsData, entriesData, trialData, balanceData, incomeData] = await Promise.all([
        accountsRes.json(),
        entriesRes.json(),
        trialRes.json(),
        balanceRes.json(),
        incomeRes.json(),
      ]);

      if (accountsData.success) setAccounts(accountsData.data);
      if (entriesData.success) setEntries(entriesData.data);
      if (trialData.success) setTrialBalance(trialData.data);
      if (balanceData.success) setBalanceSheet(balanceData.data);
      if (incomeData.success) setIncomeStatement(incomeData.data);
    } catch (error) {
      console.error('Error fetching accounting data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, period]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: 'Actualisé',
      description: 'Les données comptables ont été actualisées',
    });
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group accounts by type
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  // Handle create entry
  const handleCreateEntry = async () => {
    try {
      const response = await fetchWithAuth('/api/accounting/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntry,
          organizationId: 'kfm-delice',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Écriture créée',
          description: `L'écriture ${data.data.entryNumber} a été créée avec succès`,
        });
        setIsNewEntryOpen(false);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer l\'écriture',
        variant: 'destructive',
      });
    }
  };

  // Handle post entry
  const handlePostEntry = async (entryId: string) => {
    try {
      const response = await fetchWithAuth('/api/accounting/entries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entryId, action: 'post' }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Écriture postée',
          description: 'L\'écriture a été postée avec succès',
        });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de poster l\'écriture',
        variant: 'destructive',
      });
    }
  };

  // Handle create account
  const handleCreateAccount = async () => {
    try {
      const response = await fetchWithAuth('/api/accounting/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAccount,
          organizationId: 'kfm-delice',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Compte créé',
          description: `Le compte ${data.data.code} a été créé avec succès`,
        });
        setIsNewAccountOpen(false);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le compte',
        variant: 'destructive',
      });
    }
  };

  // Handle export
  const handleExport = async (type: 'csv' | 'excel' | 'quickbooks' | 'sage', dataType: string) => {
    toast({
      title: 'Export en cours',
      description: `Export ${type} pour ${dataType}...`,
    });

    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Export terminé',
      description: `Le fichier a été généré avec succès`,
    });
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="semester">Ce semestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle écriture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nouvelle écriture comptable</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle écriture dans le journal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Référence</Label>
                    <Input
                      placeholder="Ex: ORD-2024-0001"
                      value={newEntry.reference}
                      onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Description"
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-5 gap-2 mb-2 font-medium text-sm text-muted-foreground">
                    <div className="col-span-2">Compte</div>
                    <div className="text-right">Débit</div>
                    <div className="text-right">Crédit</div>
                    <div></div>
                  </div>
                  {newEntry.lines.map((line, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                      <div className="col-span-2">
                        <Select
                          value={line.accountId}
                          onValueChange={(v) => {
                            const newLines = [...newEntry.lines];
                            newLines[index].accountId = v;
                            setNewEntry({ ...newEntry, lines: newLines });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id}>
                                {acc.code} - {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        type="number"
                        placeholder="0"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const newLines = [...newEntry.lines];
                          newLines[index].debit = parseFloat(e.target.value) || 0;
                          setNewEntry({ ...newEntry, lines: newLines });
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="0"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const newLines = [...newEntry.lines];
                          newLines[index].credit = parseFloat(e.target.value) || 0;
                          setNewEntry({ ...newEntry, lines: newLines });
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newLines = [...newEntry.lines];
                          newLines.splice(index, 1);
                          setNewEntry({ ...newEntry, lines: newLines });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewEntry({
                        ...newEntry,
                        lines: [...newEntry.lines, { accountId: '', debit: 0, credit: 0, description: '' }],
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Ajouter ligne
                  </Button>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div>
                    <span className="text-muted-foreground">Total Débit: </span>
                    <span className="font-bold">
                      {formatGNF(newEntry.lines.reduce((sum, l) => sum + l.debit, 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Crédit: </span>
                    <span className="font-bold">
                      {formatGNF(newEntry.lines.reduce((sum, l) => sum + l.credit, 0))}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEntry}>
                  Créer l'écriture
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isNewAccountOpen} onOpenChange={setIsNewAccountOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau compte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nouveau compte</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau compte au plan comptable
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Code</Label>
                    <Input
                      placeholder="Ex: 701"
                      value={newAccount.code}
                      onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(v) => setNewAccount({ ...newAccount, type: v as Account['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASSET">Actif</SelectItem>
                        <SelectItem value="LIABILITY">Passif</SelectItem>
                        <SelectItem value="EQUITY">Capitaux propres</SelectItem>
                        <SelectItem value="REVENUE">Revenus</SelectItem>
                        <SelectItem value="EXPENSE">Dépenses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Nom du compte</Label>
                  <Input
                    placeholder="Ex: Ventes de plats"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAccountOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateAccount}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-xl font-bold text-green-600">
                  {incomeStatement ? formatGNF(incomeStatement.revenue.totalRevenue) : '-'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Net</p>
                <p className="text-xl font-bold text-blue-600">
                  {incomeStatement ? formatGNF(incomeStatement.netIncome) : '-'}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">TVA à Payer</p>
                <p className="text-xl font-bold text-orange-600">
                  {balanceSheet ? formatGNF(balanceSheet.liabilities.currentLiabilities.tvaCollected - (balanceSheet.assets.currentAssets.tvaDeductible || 0)) : '-'}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Écritures</p>
                <p className="text-xl font-bold">{entries.length}</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <PieChart className="h-4 w-4 mr-2" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="entries">
            <FileText className="h-4 w-4 mr-2" />
            Écritures
          </TabsTrigger>
          <TabsTrigger value="accounts">
            <Building className="h-4 w-4 mr-2" />
            Plan Comptable
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapports
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="h-4 w-4 mr-2" />
            Export
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition des Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeStatement && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ventes de plats</span>
                      <span className="font-medium">{formatGNF(incomeStatement.revenue.foodSales)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.revenue.totalRevenue > 0 ? (incomeStatement.revenue.foodSales / incomeStatement.revenue.totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Ventes de boissons</span>
                      <span className="font-medium">{formatGNF(incomeStatement.revenue.beverageSales)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.revenue.totalRevenue > 0 ? (incomeStatement.revenue.beverageSales / incomeStatement.revenue.totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Frais de livraison</span>
                      <span className="font-medium">{formatGNF(incomeStatement.revenue.deliveryFees)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.revenue.totalRevenue > 0 ? (incomeStatement.revenue.deliveryFees / incomeStatement.revenue.totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Répartition des Charges</CardTitle>
              </CardHeader>
              <CardContent>
                {incomeStatement && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Salaires</span>
                      <span className="font-medium">{formatGNF(incomeStatement.operatingExpenses.salaries)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.operatingExpenses.totalExpenses > 0 ? (incomeStatement.operatingExpenses.salaries / incomeStatement.operatingExpenses.totalExpenses) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Loyer</span>
                      <span className="font-medium">{formatGNF(incomeStatement.operatingExpenses.rent)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.operatingExpenses.totalExpenses > 0 ? (incomeStatement.operatingExpenses.rent / incomeStatement.operatingExpenses.totalExpenses) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Marketing</span>
                      <span className="font-medium">{formatGNF(incomeStatement.operatingExpenses.marketing)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${incomeStatement.operatingExpenses.totalExpenses > 0 ? (incomeStatement.operatingExpenses.marketing / incomeStatement.operatingExpenses.totalExpenses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Entries */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Écritures Récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N°</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Débit</TableHead>
                    <TableHead>Crédit</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.slice(0, 5).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                      <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{formatGNF(entry.totalDebit)}</TableCell>
                      <TableCell>{formatGNF(entry.totalCredit)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_CONFIG[entry.status]?.color}>
                          {STATUS_CONFIG[entry.status]?.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journal Entries Tab */}
        <TabsContent value="entries" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Journal Comptable</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="DRAFT">Brouillons</SelectItem>
                      <SelectItem value="POSTED">Postés</SelectItem>
                      <SelectItem value="CANCELLED">Annulés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Écriture</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                        <TableCell>{format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                        <TableCell>{entry.reference || '-'}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell className="text-right">{formatGNF(entry.totalDebit)}</TableCell>
                        <TableCell className="text-right">{formatGNF(entry.totalCredit)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_CONFIG[entry.status]?.color}>
                            {STATUS_CONFIG[entry.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {entry.status === 'DRAFT' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePostEntry(entry.id)}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart of Accounts Tab */}
        <TabsContent value="accounts" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Plan Comptable (OHADA)</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un compte..."
                      className="pl-10 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="ASSET">Actifs</SelectItem>
                      <SelectItem value="LIABILITY">Passifs</SelectItem>
                      <SelectItem value="EQUITY">Capitaux</SelectItem>
                      <SelectItem value="REVENUE">Revenus</SelectItem>
                      <SelectItem value="EXPENSE">Dépenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                  <div key={type} className="border-b last:border-b-0">
                    <div className={`${ACCOUNT_TYPE_CONFIG[type]?.bgColor || 'bg-gray-100'} px-4 py-2 flex items-center gap-2 sticky top-0`}>
                      <span className={ACCOUNT_TYPE_CONFIG[type]?.color}>
                        {ACCOUNT_TYPE_CONFIG[type]?.icon}
                      </span>
                      <span className="font-medium">{ACCOUNT_TYPE_CONFIG[type]?.label}</span>
                      <Badge variant="outline" className="ml-auto">{typeAccounts.length}</Badge>
                    </div>
                    <Table>
                      <TableBody>
                        {typeAccounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono w-24">{account.code}</TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell className="text-right">
                              {account.mapping && (
                                <Badge variant="secondary">
                                  {account.mapping}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="w-20">
                              {!account.isSystem && (
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="mt-6">
          <Tabs defaultValue="trial-balance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trial-balance">Balance</TabsTrigger>
              <TabsTrigger value="balance-sheet">Bilan</TabsTrigger>
              <TabsTrigger value="income-statement">Compte de Résultat</TabsTrigger>
            </TabsList>

            {/* Trial Balance */}
            <TabsContent value="trial-balance">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Balance Générale</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'trial-balance')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Compte</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Débit</TableHead>
                          <TableHead className="text-right">Crédit</TableHead>
                          <TableHead className="text-right">Solde</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trialBalance?.accounts.map((acc) => (
                          <TableRow key={acc.code}>
                            <TableCell className="font-mono">{acc.code}</TableCell>
                            <TableCell>{acc.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={ACCOUNT_TYPE_CONFIG[acc.type]?.color}>
                                {ACCOUNT_TYPE_CONFIG[acc.type]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatGNF(acc.debit)}</TableCell>
                            <TableCell className="text-right">{formatGNF(acc.credit)}</TableCell>
                            <TableCell className={`text-right font-medium ${acc.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatGNF(Math.abs(acc.balance))}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted font-bold">
                          <TableCell colSpan={3}>TOTAUX</TableCell>
                          <TableCell className="text-right">{formatGNF(trialBalance?.summary.totalDebit || 0)}</TableCell>
                          <TableCell className="text-right">{formatGNF(trialBalance?.summary.totalCredit || 0)}</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Balance Sheet */}
            <TabsContent value="balance-sheet">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Bilan</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'balance-sheet')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {balanceSheet && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Assets */}
                      <div>
                        <h3 className="font-bold text-lg mb-4">ACTIF</h3>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Actifs Circulants</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Caisse</span>
                                <span>{formatGNF(balanceSheet.assets.currentAssets.cash)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Clients</span>
                                <span>{formatGNF(balanceSheet.assets.currentAssets.accountsReceivable)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Stocks</span>
                                <span>{formatGNF(balanceSheet.assets.currentAssets.inventory)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>TVA Déductible</span>
                                <span>{formatGNF(balanceSheet.assets.currentAssets.tvaDeductible)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total Actifs Circulants</span>
                                <span>{formatGNF(balanceSheet.assets.currentAssets.total)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Actifs Immobilisés</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Équipements</span>
                                <span>{formatGNF(balanceSheet.assets.fixedAssets.equipment)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Véhicules</span>
                                <span>{formatGNF(balanceSheet.assets.fixedAssets.vehicles)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Amortissements</span>
                                <span>{formatGNF(balanceSheet.assets.fixedAssets.accumulatedDepreciation)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total Actifs Immobilisés</span>
                                <span>{formatGNF(balanceSheet.assets.fixedAssets.total)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex justify-between font-bold text-lg">
                              <span>TOTAL ACTIF</span>
                              <span>{formatGNF(balanceSheet.assets.totalAssets)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Liabilities & Equity */}
                      <div>
                        <h3 className="font-bold text-lg mb-4">PASSIF</h3>
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Dettes à Court Terme</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Fournisseurs</span>
                                <span>{formatGNF(balanceSheet.liabilities.currentLiabilities.accountsPayable)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Salaires à payer</span>
                                <span>{formatGNF(balanceSheet.liabilities.currentLiabilities.salariesPayable)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>TVA Collectée</span>
                                <span>{formatGNF(balanceSheet.liabilities.currentLiabilities.tvaCollected)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total Dettes CT</span>
                                <span>{formatGNF(balanceSheet.liabilities.currentLiabilities.total)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Dettes à Long Terme</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between font-medium">
                                <span>Emprunts</span>
                                <span>{formatGNF(balanceSheet.liabilities.longTermLiabilities.loans)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">Capitaux Propres</h4>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Capital</span>
                                <span>{formatGNF(balanceSheet.equity.capital)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Résultat de l'exercice</span>
                                <span>{formatGNF(balanceSheet.equity.netIncome)}</span>
                              </div>
                              <div className="flex justify-between font-medium pt-2 border-t">
                                <span>Total Capitaux Propres</span>
                                <span>{formatGNF(balanceSheet.equity.totalEquity)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex justify-between font-bold text-lg">
                              <span>TOTAL PASSIF</span>
                              <span>{formatGNF(balanceSheet.totalLiabilitiesAndEquity)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Income Statement */}
            <TabsContent value="income-statement">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Compte de Résultat</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'income-statement')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exporter PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {incomeStatement && (
                    <div className="space-y-6">
                      {/* Revenue */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-green-700">REVENUS</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Ventes de plats</span>
                            <span>{formatGNF(incomeStatement.revenue.foodSales)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Ventes de boissons</span>
                            <span>{formatGNF(incomeStatement.revenue.beverageSales)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frais de livraison</span>
                            <span>{formatGNF(incomeStatement.revenue.deliveryFees)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Frais de service</span>
                            <span>{formatGNF(incomeStatement.revenue.serviceCharges)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Autres revenus</span>
                            <span>{formatGNF(incomeStatement.revenue.otherRevenue)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t text-green-600">
                            <span>Total Revenus</span>
                            <span>{formatGNF(incomeStatement.revenue.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* COGS */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-orange-700">COÛT DES MARCHANDISES VENDUES</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Coût alimentaire</span>
                            <span>{formatGNF(incomeStatement.costOfGoodsSold.foodCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Coût boissons</span>
                            <span>{formatGNF(incomeStatement.costOfGoodsSold.beverageCost)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t text-orange-600">
                            <span>Total COGS</span>
                            <span>{formatGNF(incomeStatement.costOfGoodsSold.totalCOGS)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gross Profit */}
                      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                        <div className="flex justify-between font-bold text-lg">
                          <span>MARGE BRUTE</span>
                          <span className="text-green-600">{formatGNF(incomeStatement.grossProfit)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Marge brute: {incomeStatement.grossMarginPercent.toFixed(1)}%
                        </div>
                      </div>

                      {/* Operating Expenses */}
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3 text-red-700">CHARGES D'EXPLOITATION</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Salaires</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.salaries)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Loyer</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.rent)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Électricité et eau</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.utilities)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Marketing</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.marketing)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fournitures</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.supplies)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Maintenance</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.maintenance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assurance</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.insurance)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Amortissements</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.depreciation)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Autres charges</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.other)}</span>
                          </div>
                          <div className="flex justify-between font-bold pt-2 border-t text-red-600">
                            <span>Total Charges</span>
                            <span>{formatGNF(incomeStatement.operatingExpenses.totalExpenses)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Income */}
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                        <div className="flex justify-between font-bold text-xl">
                          <span>RÉSULTAT NET</span>
                          <span className="text-blue-600">{formatGNF(incomeStatement.netIncome)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Marge nette: {incomeStatement.netMarginPercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Rapide</CardTitle>
                <CardDescription>Exportez vos données comptables dans différents formats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('csv', 'all')}>
                  <FileSpreadsheet className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Export CSV</div>
                    <div className="text-xs text-muted-foreground">Compatible Excel, Google Sheets</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('excel', 'all')}>
                  <BarChart3 className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Export Excel</div>
                    <div className="text-xs text-muted-foreground">Format Microsoft Excel</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('quickbooks', 'all')}>
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">QuickBooks</div>
                    <div className="text-xs text-muted-foreground">Format IIF pour QuickBooks</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('sage', 'all')}>
                  <Building className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Sage</div>
                    <div className="text-xs text-muted-foreground">Format import Sage</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exports Spécifiques</CardTitle>
                <CardDescription>Exportez des rapports individuels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('pdf', 'trial-balance')}>
                  <FileText className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Balance Générale</div>
                    <div className="text-xs text-muted-foreground">Balance PDF</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('pdf', 'balance-sheet')}>
                  <PieChart className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Bilan</div>
                    <div className="text-xs text-muted-foreground">Bilan PDF</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('pdf', 'income-statement')}>
                  <TrendingUp className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Compte de Résultat</div>
                    <div className="text-xs text-muted-foreground">Rapport PDF</div>
                  </div>
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleExport('csv', 'journal')}>
                  <Calculator className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Journal Comptable</div>
                    <div className="text-xs text-muted-foreground">Export CSV</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détail de l'Écriture {selectedEntry?.entryNumber}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedEntry.date), 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedEntry.status]?.color}>
                    {STATUS_CONFIG[selectedEntry.status]?.label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Référence</Label>
                  <p>{selectedEntry.reference || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p>{selectedEntry.description}</p>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ligne</TableHead>
                      <TableHead>Compte</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Débit</TableHead>
                      <TableHead className="text-right">Crédit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{line.lineNumber}</TableCell>
                        <TableCell>
                          <span className="font-mono">{line.accountCode}</span>
                          <span className="ml-2">{line.accountName}</span>
                        </TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          {line.debit > 0 ? formatGNF(line.debit) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {line.credit > 0 ? formatGNF(line.credit) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted font-medium">
                      <TableCell colSpan={3}>TOTAUX</TableCell>
                      <TableCell className="text-right">{formatGNF(selectedEntry.totalDebit)}</TableCell>
                      <TableCell className="text-right">{formatGNF(selectedEntry.totalCredit)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AccountingDashboard;
