'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Gift,
  Search,
  Plus,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { GiftCardDesign } from './gift-card-design';
import { GiftCardPurchase } from './gift-card-purchase';
import { toast } from 'sonner';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount.toLocaleString('fr-FR')} GNF`;

// Format date
const formatDate = (date: Date | string) => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Status colors and labels
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  active: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Actif' },
  used: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Utilisé' },
  expired: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Expiré' },
  cancelled: { color: 'text-red-600', bgColor: 'bg-red-50', label: 'Annulé' },
};

// Types
interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  type: 'purchase' | 'redemption' | 'refund';
  amount: number;
  orderId?: string;
  createdAt: Date | string;
}

interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  currentBalance: number;
  status: 'active' | 'used' | 'expired' | 'cancelled';
  buyerName: string;
  buyerPhone: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryMethod: 'sms' | 'email' | 'print';
  purchasedAt: Date | string;
  expiresAt: Date | string;
  transactions: GiftCardTransaction[];
}

export function GiftCardManager() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [balanceCheckCode, setBalanceCheckCode] = useState('');
  const [balanceResult, setBalanceResult] = useState<any>(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
    totalBalance: 0,
    totalValue: 0,
  });

  // Fetch gift cards
  const fetchGiftCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/gift-cards?status=${statusFilter === 'all' ? '' : statusFilter}&search=${searchTerm}`
      );
      if (response.ok) {
        const data = await response.json();
        setGiftCards(data.data || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  // Check balance
  const checkBalance = async () => {
    if (!balanceCheckCode) return;
    
    try {
      const response = await fetch(`/api/gift-cards?code=${balanceCheckCode}`);
      const data = await response.json();
      
      if (data.success) {
        setBalanceResult(data.data);
      } else {
        toast.error('Carte non trouvée');
        setBalanceResult(null);
      }
    } catch (error) {
      toast.error('Erreur de vérification');
    }
  };

  // Handle view detail
  const handleViewDetail = (card: GiftCard) => {
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  // Handle purchase success
  const handlePurchaseSuccess = (card: GiftCard) => {
    setGiftCards([card, ...giftCards]);
    setIsPurchaseOpen(false);
    fetchGiftCards();
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <Gift className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Actives</p>
                <p className="text-xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Utilisées</p>
                <p className="text-xl font-bold">{stats.used}</p>
              </div>
              <XCircle className="h-6 w-6 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirées</p>
                <p className="text-xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <Clock className="h-6 w-6 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Solde total</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Valeur totale</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Liste des cartes</TabsTrigger>
          <TabsTrigger value="check">Vérifier solde</TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par code ou nom..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="used">Utilisés</SelectItem>
                    <SelectItem value="expired">Expirés</SelectItem>
                    <SelectItem value="cancelled">Annulés</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchGiftCards} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button onClick={() => setIsPurchaseOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle carte
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid gap-3">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </div>
                  ) : giftCards.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune carte trouvée
                    </div>
                  ) : (
                    giftCards.map((card) => (
                      <Card
                        key={card.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleViewDetail(card)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                                <Gift className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold">{card.code}</span>
                                  <Badge className={STATUS_CONFIG[card.status].bgColor}>
                                    <span className={STATUS_CONFIG[card.status].color}>
                                      {STATUS_CONFIG[card.status].label}
                                    </span>
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Acheteur: {card.buyerName}
                                  {card.recipientName && ` → ${card.recipientName}`}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(card.currentBalance)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                sur {formatCurrency(card.initialAmount)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Check Balance Tab */}
        <TabsContent value="check">
          <Card>
            <CardHeader>
              <CardTitle>Vérifier le solde</CardTitle>
              <CardDescription>
                Entrez le code de votre carte cadeau pour vérifier son solde
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Ex: KFM-A7X2-M9P4"
                  value={balanceCheckCode}
                  onChange={(e) => setBalanceCheckCode(e.target.value.toUpperCase())}
                  className="font-mono text-lg"
                />
                <Button onClick={checkBalance}>
                  Vérifier
                </Button>
              </div>

              {balanceResult && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Code</p>
                      <p className="font-mono font-bold">{balanceResult.code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Solde</p>
                      <p className="font-bold text-green-600 text-xl">
                        {formatCurrency(balanceResult.balance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <Badge className={STATUS_CONFIG[balanceResult.status]?.bgColor}>
                        {STATUS_CONFIG[balanceResult.status]?.label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expire le</p>
                      <p>{formatDate(balanceResult.expiresAt)}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la Carte Cadeau</DialogTitle>
          </DialogHeader>
          
          {selectedCard && (
            <div className="space-y-6">
              <GiftCardDesign card={selectedCard} showQRCode />
              
              {/* Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historique des transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedCard.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'purchase' ? 'bg-green-100 text-green-600' :
                            tx.type === 'redemption' ? 'bg-orange-100 text-orange-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {tx.type === 'purchase' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-medium capitalize">
                              {tx.type === 'purchase' ? 'Achat' :
                               tx.type === 'redemption' ? 'Utilisation' : 'Remboursement'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(tx.createdAt)}
                              {tx.orderId && ` • Commande: ${tx.orderId}`}
                            </p>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          tx.type === 'purchase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'purchase' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Buyer/Recipient info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Acheteur</h4>
                    <p>{selectedCard.buyerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedCard.buyerPhone}</p>
                  </CardContent>
                </Card>
                {selectedCard.recipientName && (
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Destinataire</h4>
                      <p>{selectedCard.recipientName}</p>
                      <p className="text-sm text-muted-foreground">{selectedCard.recipientPhone}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      <Dialog open={isPurchaseOpen} onOpenChange={setIsPurchaseOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une Carte Cadeau</DialogTitle>
            <DialogDescription>
              Achetez une carte cadeau pour quelqu'un de spécial
            </DialogDescription>
          </DialogHeader>
          
          <GiftCardPurchase
            onSuccess={handlePurchaseSuccess}
            onCancel={() => setIsPurchaseOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GiftCardManager;
