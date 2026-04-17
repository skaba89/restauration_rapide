'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RefreshCcw, 
  Users, 
  CreditCard, 
  Pause, 
  Play, 
  Plus, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SubscriptionPlans from './subscription-plans';
import SubscriptionDetail from './subscription-detail';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

// Status configuration
const STATUS_CONFIG = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  paused: { label: 'En pause', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Pause },
  expired: { label: 'Expiré', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: AlertCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

interface Subscription {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  planId: string;
  planName: string;
  mealsPerDay: number;
  daysPerWeek: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'expired' | 'cancelled';
  autoRenew: boolean;
  monthlyPrice: number;
  nextBillingDate: string;
  skippedDays: string[];
  pauseStartDate?: string;
  pauseEndDate?: string;
  totalMealsDelivered: number;
  deliveryAddress?: string;
  deliveryNotes?: string;
  preferredTime: string;
  dietaryNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  paused: number;
  expired: number;
  cancelled: number;
  totalRevenue: number;
  totalMealsDelivered: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  mealsPerDay: number;
  daysPerWeek: number;
  pricePerMonth: number;
  features: string[];
  popular?: boolean;
}

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions');
  
  // New subscription form
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [preferredTime, setPreferredTime] = useState('12:00');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [startDate, setStartDate] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const response = await fetch(`/api/subscriptions?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [selectedStatus]);

  // Filter subscriptions by search
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      sub.customerName.toLowerCase().includes(search) ||
      sub.customerPhone.includes(searchTerm) ||
      sub.id.toLowerCase().includes(search)
    );
  });

  // Handle pause/resume from list
  const handlePauseResume = async (subscription: Subscription) => {
    try {
      const action = subscription.status === 'active' ? 'pause' : 'resume';
      const response = await fetch('/api/subscriptions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: subscription.id, action })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(action === 'pause' ? 'Abonnement mis en pause' : 'Abonnement repris');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Create new subscription
  const handleCreateSubscription = async () => {
    if (!selectedPlan) {
      toast.error('Veuillez sélectionner une formule');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Le nom du client est requis');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Le téléphone est requis');
      return;
    }
    if (!startDate) {
      toast.error('La date de début est requise');
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error('L\'adresse de livraison est requise');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          planId: selectedPlan.id,
          startDate,
          autoRenew,
          deliveryAddress,
          preferredTime,
          dietaryNotes,
          deliveryNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Abonnement créé avec succès');
        setIsNewDialogOpen(false);
        resetForm();
        fetchSubscriptions();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedPlan(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setDeliveryAddress('');
    setPreferredTime('12:00');
    setDietaryNotes('');
    setDeliveryNotes('');
    setStartDate('');
    setAutoRenew(true);
  };

  // Get minimum date
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Actifs</p>
                  <p className="text-xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">En pause</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.paused}</p>
                </div>
                <Pause className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-slate-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Expirés</p>
                  <p className="text-xl font-bold text-slate-600">{stats.expired}</p>
                </div>
                <AlertCircle className="h-6 w-6 text-slate-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Revenus/mois</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <CreditCard className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Repas livrés</p>
                  <p className="text-xl font-bold text-purple-600">{stats.totalMealsDelivered}</p>
                </div>
                <UtensilsCrossed className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="subscriptions" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Abonnements
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Formules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCcw className="h-5 w-5" />
                    Abonnements Repas
                  </CardTitle>
                  <CardDescription>
                    {stats?.total || 0} abonnement(s) • Revenus mensuels: {formatCurrency(stats?.totalRevenue || 0)}
                  </CardDescription>
                </div>
                <Button className="gap-2" onClick={() => setIsNewDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nouvel abonnement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, téléphone ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                    <SelectItem value="expired">Expirés</SelectItem>
                    <SelectItem value="cancelled">Annulés</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subscriptions List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-12">
                  <RefreshCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun abonnement trouvé</p>
                  <Button className="mt-4" onClick={() => setIsNewDialogOpen(true)}>
                    Créer un abonnement
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-3">
                    {filteredSubscriptions.map(subscription => {
                      const statusConfig = STATUS_CONFIG[subscription.status];
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div 
                          key={subscription.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              subscription.status === 'active' ? 'bg-green-100' : 
                              subscription.status === 'paused' ? 'bg-yellow-100' : 'bg-slate-100'
                            }`}>
                              <Users className={`h-6 w-6 ${
                                subscription.status === 'active' ? 'text-green-600' : 
                                subscription.status === 'paused' ? 'text-yellow-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{subscription.customerName}</p>
                                <span className="text-xs text-muted-foreground">({subscription.id})</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {subscription.planName} • {subscription.mealsPerDay} repas/jour
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3 inline mr-1" />
                                {subscription.customerPhone}
                                {' • '}
                                <Calendar className="h-3 w-3 inline mr-1" />
                                Depuis le {new Date(subscription.startDate).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                {formatCurrency(subscription.monthlyPrice)}
                              </p>
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {subscription.totalMealsDelivered} repas livrés
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {subscription.status === 'active' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePauseResume(subscription)}
                                  title="Mettre en pause"
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              )}
                              {subscription.status === 'paused' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handlePauseResume(subscription)}
                                  title="Reprendre"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setIsDetailOpen(true);
                                }}
                                title="Voir détails"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5" />
                Formules d'abonnement
              </CardTitle>
              <CardDescription>
                Les différentes formules disponibles pour les abonnements repas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlans onSelectPlan={() => {}} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Subscription Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvel Abonnement</DialogTitle>
            <DialogDescription>
              Créez un nouvel abonnement repas pour un client
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Plan Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">1. Choisir une formule</Label>
              <SubscriptionPlans 
                onSelectPlan={setSelectedPlan}
                selectedPlanId={selectedPlan?.id}
              />
            </div>

            {selectedPlan && (
              <>
                {/* Customer Info */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">2. Informations client</Label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Nom complet *</Label>
                      <Input
                        id="customerName"
                        placeholder="Nom du client"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Téléphone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="customerPhone"
                          placeholder="+224 62 XXX XX XX"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="customerEmail">Email (optionnel)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder="email@exemple.com"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">3. Livraison</Label>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deliveryAddress">Adresse de livraison *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="deliveryAddress"
                          placeholder="Adresse complète, quartier, landmarks..."
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="pl-10 min-h-[80px]"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          min={getMinDate()}
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime">Heure préférée</Label>
                        <Input
                          id="preferredTime"
                          type="time"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">4. Informations supplémentaires</Label>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dietaryNotes">Préférences alimentaires</Label>
                      <Textarea
                        id="dietaryNotes"
                        placeholder="Allergies, préférences, restrictions..."
                        value={dietaryNotes}
                        onChange={(e) => setDietaryNotes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryNotes">Instructions de livraison</Label>
                      <Textarea
                        id="deliveryNotes"
                        placeholder="Instructions spéciales pour le livreur..."
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Auto Renew */}
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <Label>Renouvellement automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      L'abonnement sera renouvelé automatiquement chaque mois
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>

                {/* Summary */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{selectedPlan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPlan.mealsPerDay} repas/jour • {selectedPlan.daysPerWeek} jours/semaine
                      </p>
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedPlan.pricePerMonth)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewDialogOpen(false);
              resetForm();
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateSubscription}
              disabled={isSubmitting || !selectedPlan}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer l'abonnement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'abonnement</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <SubscriptionDetail
              subscription={selectedSubscription}
              onClose={() => setIsDetailOpen(false)}
              onUpdate={() => {
                fetchSubscriptions();
                // Refresh selected subscription
                const updated = subscriptions.find(s => s.id === selectedSubscription.id);
                if (updated) setSelectedSubscription(updated);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubscriptionManager;
