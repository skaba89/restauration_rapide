'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Edit, 
  Link2, 
  CheckCircle, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import type { ChartOfAccount } from '@/lib/accounting-export';

interface ChartOfAccountsProps {
  accounts?: ChartOfAccount[];
  loading?: boolean;
  onUpdateMapping?: (accountId: string, mapping: string) => void;
  onAddAccount?: (account: Omit<ChartOfAccount, 'id'>) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'food_sales', label: 'Ventes de plats' },
  { value: 'beverage_sales', label: 'Ventes de boissons' },
  { value: 'delivery_fees', label: 'Frais de livraison' },
  { value: 'service_charges', label: 'Frais de service' },
  { value: 'food_cost', label: 'Coût des aliments' },
  { value: 'beverage_cost', label: 'Coût des boissons' },
  { value: 'salaries', label: 'Salaires' },
  { value: 'rent', label: 'Loyer' },
  { value: 'utilities', label: 'Services publics' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'supplies', label: 'Fournitures' },
  { value: 'tips', label: 'Pourboires' },
];

const ACCOUNT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  revenue: { icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600', label: 'Revenus' },
  expense: { icon: <TrendingDown className="h-4 w-4" />, color: 'text-red-600', label: 'Dépenses' },
  asset: { icon: <ArrowUpRight className="h-4 w-4" />, color: 'text-blue-600', label: 'Actifs' },
  liability: { icon: <ArrowDownRight className="h-4 w-4" />, color: 'text-orange-600', label: 'Passifs' },
  equity: { icon: <CircleDollarSign className="h-4 w-4" />, color: 'text-purple-600', label: 'Capitaux' },
};

export function ChartOfAccounts({ 
  accounts, 
  loading,
  onUpdateMapping,
  onAddAccount 
}: ChartOfAccountsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    type: 'revenue' as ChartOfAccount['type'],
    mapping: ''
  });

  // Filter accounts
  const filteredAccounts = (accounts || []).filter(account => {
    const matchesSearch = 
      account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  // Group by type
  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    if (!acc[account.type]) {
      acc[account.type] = [];
    }
    acc[account.type].push(account);
    return acc;
  }, {} as Record<string, ChartOfAccount[]>);

  const handleUpdateMapping = (accountId: string, mapping: string) => {
    onUpdateMapping?.(accountId, mapping);
    setIsEditDialogOpen(false);
  };

  const handleAddAccount = () => {
    onAddAccount?.({
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      mapping: newAccount.mapping || undefined,
      isActive: true
    });
    setIsAddDialogOpen(false);
    setNewAccount({ code: '', name: '', type: 'revenue', mapping: '' });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un compte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="revenue">Revenus</SelectItem>
              <SelectItem value="expense">Dépenses</SelectItem>
              <SelectItem value="asset">Actifs</SelectItem>
              <SelectItem value="liability">Passifs</SelectItem>
              <SelectItem value="equity">Capitaux</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un compte</DialogTitle>
                <DialogDescription>
                  Créez un nouveau compte dans le plan comptable
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Code</Label>
                    <Input 
                      value={newAccount.code} 
                      onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                      placeholder="Ex: 701"
                    />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select 
                      value={newAccount.type} 
                      onValueChange={(v) => setNewAccount({ ...newAccount, type: v as ChartOfAccount['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revenue">Revenus</SelectItem>
                        <SelectItem value="expense">Dépenses</SelectItem>
                        <SelectItem value="asset">Actifs</SelectItem>
                        <SelectItem value="liability">Passifs</SelectItem>
                        <SelectItem value="equity">Capitaux</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Nom du compte</Label>
                  <Input 
                    value={newAccount.name} 
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="Ex: Ventes de plats"
                  />
                </div>
                <div>
                  <Label>Mapping catégorie (optionnel)</Label>
                  <Select 
                    value={newAccount.mapping} 
                    onValueChange={(v) => setNewAccount({ ...newAccount, mapping: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddAccount} disabled={!newAccount.code || !newAccount.name}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(ACCOUNT_TYPE_CONFIG).map(([type, config]) => {
          const count = groupedAccounts[type]?.length || 0;
          return (
            <Card key={type} className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterType(type)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className={config.color}>{config.icon}</div>
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Accounts List */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Tous ({filteredAccounts.length})</TabsTrigger>
          <TabsTrigger value="mapped">Mappés ({filteredAccounts.filter(a => a.mapping).length})</TabsTrigger>
          <TabsTrigger value="unmapped">Non mappés ({filteredAccounts.filter(a => !a.mapping).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {Object.entries(groupedAccounts).map(([type, accounts]) => (
                  <div key={type} className="border-b last:border-b-0">
                    <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 sticky top-0">
                      <span className={ACCOUNT_TYPE_CONFIG[type]?.color}>
                        {ACCOUNT_TYPE_CONFIG[type]?.icon}
                      </span>
                      <span className="font-medium">{ACCOUNT_TYPE_CONFIG[type]?.label}</span>
                      <Badge variant="outline" className="ml-auto">{accounts.length}</Badge>
                    </div>
                    <div className="divide-y">
                      {accounts.map(account => (
                        <AccountRow 
                          key={account.id} 
                          account={account} 
                          onEdit={() => {
                            setSelectedAccount(account);
                            setIsEditDialogOpen(true);
                          }}
                          onUpdateMapping={handleUpdateMapping}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapped" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {filteredAccounts.filter(a => a.mapping).map(account => (
                    <AccountRow 
                      key={account.id} 
                      account={account} 
                      onEdit={() => {
                        setSelectedAccount(account);
                        setIsEditDialogOpen(true);
                      }}
                      onUpdateMapping={handleUpdateMapping}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unmapped" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {filteredAccounts.filter(a => !a.mapping).map(account => (
                    <AccountRow 
                      key={account.id} 
                      account={account} 
                      onEdit={() => {
                        setSelectedAccount(account);
                        setIsEditDialogOpen(true);
                      }}
                      onUpdateMapping={handleUpdateMapping}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le mapping</DialogTitle>
            <DialogDescription>
              Associez ce compte à une catégorie du restaurant
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg">{selectedAccount.code}</span>
                  <span className="font-medium">{selectedAccount.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Type: {ACCOUNT_TYPE_CONFIG[selectedAccount.type]?.label}
                </p>
              </div>
              <div>
                <Label>Catégorie associée</Label>
                <Select 
                  value={selectedAccount.mapping || ''} 
                  onValueChange={(v) => handleUpdateMapping(selectedAccount.id, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucun mapping</SelectItem>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Account Row Component
function AccountRow({ 
  account, 
  onEdit,
  onUpdateMapping 
}: { 
  account: ChartOfAccount; 
  onEdit: () => void;
  onUpdateMapping: (accountId: string, mapping: string) => void;
}) {
  const config = ACCOUNT_TYPE_CONFIG[account.type];
  const mappedCategory = CATEGORY_OPTIONS.find(c => c.value === account.mapping);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${config?.color}`}>
          {config?.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{account.code}</span>
            <span className="font-medium">{account.name}</span>
          </div>
          {account.mapping && (
            <div className="flex items-center gap-1 mt-1">
              <Link2 className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">{mappedCategory?.label}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {account.mapping ? (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3 text-green-600" />
            Mappé
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">Non mappé</Badge>
        )}
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default ChartOfAccounts;
