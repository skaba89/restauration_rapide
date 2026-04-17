'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DollarSign, 
  Users, 
  Calculator, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock,
  TrendingUp,
  CreditCard,
  Smartphone,
  Banknote,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Tip {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: 'cash' | 'mobile_money' | 'card';
  distributionStatus: 'pending' | 'distributed';
  distributions: TipDistribution[];
  createdAt: Date;
  staffId?: string;
  staffName?: string;
}

interface TipDistribution {
  id: string;
  tipId: string;
  staffId: string;
  staffName: string;
  amount: number;
  percentage: number;
  hoursWorked?: number;
  status: 'pending' | 'paid';
}

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Method icons
const METHOD_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  mobile_money: <Smartphone className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'Espèces',
  mobile_money: 'Mobile Money',
  card: 'Carte'
};

export function TipsManager() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Filter tips
  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tip.staffName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tip.distributionStatus === filterStatus;
    const matchesMethod = filterMethod === 'all' || tip.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Stats
  const totalTips = tips.reduce((sum, t) => sum + t.amount, 0);
  const pendingTips = tips.filter(t => t.distributionStatus === 'pending').reduce((sum, t) => sum + t.amount, 0);
  const distributedTips = tips.filter(t => t.distributionStatus === 'distributed').reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = tips.filter(t => t.distributionStatus === 'pending').length;

  // By method
  const byMethod = {
    cash: tips.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.amount, 0),
    mobile_money: tips.filter(t => t.method === 'mobile_money').reduce((sum, t) => sum + t.amount, 0),
    card: tips.filter(t => t.method === 'card').reduce((sum, t) => sum + t.amount, 0)
  };

  const handleDistribute = async () => {
    setIsDistributing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTips(tips.map(t => ({ ...t, distributionStatus: 'distributed' as const })));
    setIsDistributing(false);
    setIsDistributeDialogOpen(false);
  };

  const handleViewDetail = (tip: Tip) => {
    setSelectedTip(tip);
    setIsDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total pourboires</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalTips)}</p>
                <p className="text-xs text-muted-foreground mt-1">{tips.length} transactions</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingTips)}</p>
                <p className="text-xs text-muted-foreground mt-1">{pendingCount} à distribuer</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Distribués</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(distributedTips)}</p>
                <p className="text-xs text-muted-foreground mt-1">{tips.length - pendingCount} transactions</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Method Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Par Méthode de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted">
              <Banknote className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Espèces</p>
              <p className="font-bold">{formatCurrency(byMethod.cash)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <Smartphone className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-muted-foreground">Mobile Money</p>
              <p className="font-bold">{formatCurrency(byMethod.mobile_money)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted">
              <CreditCard className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-muted-foreground">Carte</p>
              <p className="font-bold">{formatCurrency(byMethod.card)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Pourboires Reçus</CardTitle>
              <CardDescription>Liste de tous les pourboires</CardDescription>
            </div>
            <Dialog open={isDistributeDialogOpen} onOpenChange={setIsDistributeDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={pendingTips === 0}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Distribuer ({formatCurrency(pendingTips)})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Distribution des Pourboires</DialogTitle>
                  <DialogDescription>
                    Voulez-vous distribuer {formatCurrency(pendingTips)} à {pendingCount} employés?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Les pourboires seront répartis selon les règles configurées dans les paramètres.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDistributeDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleDistribute} disabled={isDistributing}>
                    {isDistributing ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Confirmer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par commande ou employé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="distributed">Distribués</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes méthodes</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {filteredTips.map(tip => (
                <TipCard 
                  key={tip.id} 
                  tip={tip} 
                  onViewDetail={handleViewDetail}
                />
              ))}
              {filteredTips.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun pourboire trouvé
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail du Pourboire</DialogTitle>
          </DialogHeader>
          {selectedTip && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Commande</p>
                  <p className="font-medium">{selectedTip.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Montant</p>
                  <p className="font-bold text-green-600">{formatCurrency(selectedTip.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Méthode</p>
                  <div className="flex items-center gap-2">
                    {METHOD_ICONS[selectedTip.method]}
                    {METHOD_LABELS[selectedTip.method]}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(selectedTip.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                </div>
              </div>
              
              {selectedTip.distributions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Distributions</p>
                  <div className="space-y-2">
                    {selectedTip.distributions.map(dist => (
                      <div key={dist.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">{dist.staffName}</p>
                          <p className="text-sm text-muted-foreground">{dist.percentage}%</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(dist.amount)}</p>
                          <Badge variant={dist.status === 'paid' ? 'default' : 'outline'}>
                            {dist.status === 'paid' ? 'Payé' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tip Card Component
function TipCard({ tip, onViewDetail }: { tip: Tip; onViewDetail: (tip: Tip) => void }) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onViewDetail(tip)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          tip.method === 'cash' ? 'bg-green-100 text-green-600' :
          tip.method === 'mobile_money' ? 'bg-orange-100 text-orange-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          {METHOD_ICONS[tip.method]}
        </div>
        <div>
          <p className="font-medium">{tip.orderNumber}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{format(tip.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
            <span>•</span>
            <span>{METHOD_LABELS[tip.method]}</span>
            {tip.staffName && (
              <>
                <span>•</span>
                <span>{tip.staffName}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-green-600">{formatCurrency(tip.amount)}</span>
        <Badge variant={tip.distributionStatus === 'distributed' ? 'default' : 'outline'}>
          {tip.distributionStatus === 'distributed' ? 'Distribué' : 'En attente'}
        </Badge>
        <Eye className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export default TipsManager;