'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  XCircle, 
  RefreshCcw,
  UtensilsCrossed,
  Send,
  MapPin,
  Phone,
  Mail,
  ChefHat,
  Package,
  Truck,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import PreOrderForm from './pre-order-form';

// Format GNF currency
const formatCurrency = (amount: number) => `${amount?.toLocaleString('fr-FR') || 0} GNF`;

// Status configuration
const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
  confirmed: { label: 'Confirmé', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
  preparing: { label: 'En préparation', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: ChefHat },
  ready: { label: 'Prêt', color: 'bg-green-100 text-green-700 border-green-300', icon: Package },
  completed: { label: 'Terminé', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-50 text-yellow-600' },
  paid: { label: 'Payé', color: 'bg-green-50 text-green-600' },
  refunded: { label: 'Remboursé', color: 'bg-red-50 text-red-600' },
};

const ORDER_TYPE_CONFIG = {
  dine_in: { label: 'Sur place', icon: UtensilsCrossed, color: 'text-orange-600 bg-orange-50' },
  takeaway: { label: 'À emporter', icon: Package, color: 'text-blue-600 bg-blue-50' },
  delivery: { label: 'Livraison', icon: Truck, color: 'text-purple-600 bg-purple-50' },
};

const RECURRING_PATTERN_CONFIG = {
  daily: 'Quotidien',
  weekly: 'Hebdomadaire',
  monthly: 'Mensuel',
};

interface PreOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  scheduledDate: string;
  scheduledTime: string;
  items: { id: string; name: string; quantity: number; price: number; notes?: string }[];
  status: keyof typeof STATUS_CONFIG;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  recurringEndDate?: string;
  totalAmount: number;
  paymentStatus: keyof typeof PAYMENT_STATUS_CONFIG;
  notes?: string;
  orderType: keyof typeof ORDER_TYPE_CONFIG;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
}

interface PreOrderStats {
  total: number;
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
  recurring: number;
  totalValue: number;
  paidValue: number;
}

export function PreOrderManager() {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [stats, setStats] = useState<PreOrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedPreOrder, setSelectedPreOrder] = useState<PreOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch pre-orders
  const fetchPreOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/pre-orders?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPreOrders(data.preOrders);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch pre-orders:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreOrders();
  }, [selectedStatus, selectedDate]);

  // Update pre-order status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch('/api/pre-orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Statut mis à jour');
        fetchPreOrders();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Cancel pre-order
  const handleCancel = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette pré-commande ?')) return;
    
    try {
      const response = await fetch(`/api/pre-orders?id=${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Pré-commande annulée');
        fetchPreOrders();
        setIsDetailOpen(false);
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  // Filter pre-orders by search
  const filteredPreOrders = preOrders.filter(po => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      po.customerName.toLowerCase().includes(search) ||
      po.customerPhone.includes(searchTerm) ||
      po.id.toLowerCase().includes(search)
    );
  });

  // Group pre-orders by date
  const groupedPreOrders = filteredPreOrders.reduce((acc, po) => {
    const date = po.scheduledDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(po);
    return acc;
  }, {} as Record<string, PreOrder[]>);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return "Aujourd'hui";
    if (dateStr === tomorrow.toISOString().split('T')[0]) return "Demain";
    
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Confirmés</p>
                  <p className="text-xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">En préparation</p>
                  <p className="text-xl font-bold text-orange-600">{stats.preparing}</p>
                </div>
                <ChefHat className="h-6 w-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Prêts</p>
                  <p className="text-xl font-bold text-green-600">{stats.ready}</p>
                </div>
                <Package className="h-6 w-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Récurrents</p>
                  <p className="text-xl font-bold text-purple-600">{stats.recurring}</p>
                </div>
                <RefreshCcw className="h-6 w-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pré-commandes
              </CardTitle>
              <CardDescription>
                {stats?.total || 0} commande(s) • Valeur totale: {formatCurrency(stats?.totalValue || 0)}
              </CardDescription>
            </div>
            <Button className="gap-2" onClick={() => setIsNewOrderOpen(true)}>
              <Plus className="h-4 w-4" />
              Nouvelle pré-commande
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
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-44"
            />
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="preparing">En préparation</SelectItem>
                <SelectItem value="ready">Prêt</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pre-orders List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : filteredPreOrders.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune pré-commande trouvée</p>
              <Button className="mt-4" onClick={() => setIsNewOrderOpen(true)}>
                Créer une pré-commande
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedPreOrders)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, orders]) => (
                    <div key={date}>
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3 sticky top-0 bg-background py-1">
                        {formatDate(date)} ({orders.length})
                      </h3>
                      <div className="space-y-3">
                        {orders
                          .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
                          .map(order => {
                            const statusConfig = STATUS_CONFIG[order.status];
                            const orderTypeConfig = ORDER_TYPE_CONFIG[order.orderType];
                            const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus];
                            const StatusIcon = statusConfig.icon;
                            const OrderTypeIcon = orderTypeConfig.icon;

                            return (
                              <div 
                                key={order.id}
                                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => {
                                  setSelectedPreOrder(order);
                                  setIsDetailOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${orderTypeConfig.color}`}>
                                    <OrderTypeIcon className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-semibold">{order.customerName}</p>
                                      {order.isRecurring && (
                                        <Badge variant="outline" className="text-xs">
                                          <RefreshCcw className="h-3 w-3 mr-1" />
                                          {RECURRING_PATTERN_CONFIG[order.recurringPattern!]}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium">{order.scheduledTime}</span>
                                      {' • '}{order.items.length} article(s) • 
                                      <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {order.id} • {order.customerPhone}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <Badge className={statusConfig.color}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {statusConfig.label}
                                    </Badge>
                                    <p className={`text-xs mt-1 ${paymentConfig.color}`}>
                                      {paymentConfig.label}
                                    </p>
                                  </div>
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* New Pre-order Dialog */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Pré-commande</DialogTitle>
            <DialogDescription>
              Créez une nouvelle pré-commande pour un client
            </DialogDescription>
          </DialogHeader>
          <PreOrderForm
            onClose={() => setIsNewOrderOpen(false)}
            onSuccess={() => {
              setIsNewOrderOpen(false);
              fetchPreOrders();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Pre-order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPreOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Pré-commande {selectedPreOrder.id}
                  <Badge className={STATUS_CONFIG[selectedPreOrder.status].color}>
                    {STATUS_CONFIG[selectedPreOrder.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Créée le {new Date(selectedPreOrder.createdAt).toLocaleDateString('fr-FR')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Customer Info */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <p className="font-medium">{selectedPreOrder.customerName}</p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {selectedPreOrder.customerPhone}
                      </p>
                      {selectedPreOrder.customerEmail && (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {selectedPreOrder.customerEmail}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule & Type */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Détails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {new Date(selectedPreOrder.scheduledDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Heure</p>
                        <p className="font-medium">{selectedPreOrder.scheduledTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">
                          {ORDER_TYPE_CONFIG[selectedPreOrder.orderType].label}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Paiement</p>
                        <p className={`font-medium ${
                          selectedPreOrder.paymentStatus === 'paid' ? 'text-green-600' : 
                          selectedPreOrder.paymentStatus === 'refunded' ? 'text-red-600' : ''
                        }`}>
                          {PAYMENT_STATUS_CONFIG[selectedPreOrder.paymentStatus].label}
                        </p>
                      </div>
                    </div>
                    {selectedPreOrder.deliveryAddress && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          {selectedPreOrder.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Items */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Articles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedPreOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}× {item.name}
                            {item.notes && <span className="text-muted-foreground"> ({item.notes})</span>}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span className="text-green-600">{formatCurrency(selectedPreOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recurring Info */}
                {selectedPreOrder.isRecurring && (
                  <Card className="border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-purple-700">
                        <RefreshCcw className="h-4 w-4" />
                        <span className="font-medium">
                          Commande {RECURRING_PATTERN_CONFIG[selectedPreOrder.recurringPattern!]}
                        </span>
                      </div>
                      {selectedPreOrder.recurringEndDate && (
                        <p className="text-sm text-purple-600 mt-1">
                          Jusqu'au {new Date(selectedPreOrder.recurringEndDate).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {selectedPreOrder.notes && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedPreOrder.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {selectedPreOrder.status === 'pending' && (
                    <Button onClick={() => handleUpdateStatus(selectedPreOrder.id, 'confirmed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmer
                    </Button>
                  )}
                  {selectedPreOrder.status === 'confirmed' && (
                    <Button onClick={() => handleUpdateStatus(selectedPreOrder.id, 'preparing')}>
                      <ChefHat className="h-4 w-4 mr-2" />
                      Commencer préparation
                    </Button>
                  )}
                  {selectedPreOrder.status === 'preparing' && (
                    <Button onClick={() => handleUpdateStatus(selectedPreOrder.id, 'ready')}>
                      <Package className="h-4 w-4 mr-2" />
                      Marquer prêt
                    </Button>
                  )}
                  {selectedPreOrder.status === 'ready' && (
                    <Button onClick={() => handleUpdateStatus(selectedPreOrder.id, 'completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Terminer
                    </Button>
                  )}
                  {!['completed', 'cancelled'].includes(selectedPreOrder.status) && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancel(selectedPreOrder.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PreOrderManager;
