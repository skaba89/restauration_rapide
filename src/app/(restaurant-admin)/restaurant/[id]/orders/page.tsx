'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
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
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Bike,
  Package,
  Users,
  Phone,
  MapPin,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  ArrowRight,
  DollarSign,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  status: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  orderType: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN';
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryNotes: string | null;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
  tableNumber?: string;
}

const STATUS_FLOW = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERED', 'COMPLETED', 'CANCELLED'],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
  PREPARING: { label: 'En préparation', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: ChefHat },
  READY: { label: 'Prête', color: 'bg-green-100 text-green-700 border-green-200', icon: Package },
  DELIVERED: { label: 'Livrée', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
  COMPLETED: { label: 'Terminée', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const ORDER_TYPE_CONFIG: Record<string, { label: string; icon: any }> = {
  DELIVERY: { label: 'Livraison', icon: Bike },
  TAKEAWAY: { label: 'Emporté', icon: Package },
  DINE_IN: { label: 'Sur place', icon: Users },
};

export default function OrdersManagementPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('restaurantId', restaurantId);
      if (filter !== 'all') {
        queryParams.set('status', filter);
      }

      const res = await fetch(`/api/orders?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [restaurantId, filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Auto-refresh for pending orders
  useEffect(() => {
    const interval = setInterval(() => {
      if (filter === 'all' || filter === 'PENDING') {
        fetchOrders();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [filter, fetchOrders]);

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        }
        toast.success(`Commande ${STATUS_CONFIG[newStatus].label.toLowerCase()}`);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  // Filter orders by search
  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery)
  );

  // Group orders by status for Kanban view
  const groupedOrders = {
    PENDING: filteredOrders.filter((o) => o.status === 'PENDING'),
    CONFIRMED: filteredOrders.filter((o) => o.status === 'CONFIRMED'),
    PREPARING: filteredOrders.filter((o) => o.status === 'PREPARING'),
    READY: filteredOrders.filter((o) => o.status === 'READY'),
    other: filteredOrders.filter(
      (o) => !['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status)
    ),
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} GNF`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRefreshing(true);
              fetchOrders();
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher par n° commande, client..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les commandes</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="CONFIRMED">Confirmées</SelectItem>
            <SelectItem value="PREPARING">En préparation</SelectItem>
            <SelectItem value="READY">Prêtes</SelectItem>
            <SelectItem value="DELIVERED">Livrées</SelectItem>
            <SelectItem value="CANCELLED">Annulées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].map((status) => {
          const config = STATUS_CONFIG[status];
          const count = groupedOrders[status as keyof typeof groupedOrders].length;
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`p-4 rounded-xl border-2 transition-all ${
                filter === status
                  ? `${config.color} border-current`
                  : 'bg-white hover:bg-gray-50 border-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="text-2xl font-bold">{count}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Aucune commande</h2>
          <p className="text-gray-500 mt-2">
            {filter !== 'all'
              ? 'Aucune commande avec ce statut'
              : 'Les nouvelles commandes apparaîtront ici'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status];
            const typeConfig = ORDER_TYPE_CONFIG[order.orderType];
            const StatusIcon = statusConfig.icon;
            const TypeIcon = typeConfig.icon;

            return (
              <Card
                key={order.id}
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  order.status === 'PENDING' ? 'ring-2 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">#{order.orderNumber}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <TypeIcon className="w-4 h-4" />
                        {typeConfig.label}
                      </div>
                    </div>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Customer */}
                  <div className="mb-3">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </p>
                  </div>

                  {/* Items preview */}
                  <div className="text-sm text-gray-600 mb-3">
                    <p className="line-clamp-1">
                      {order.items.map((i) => `${i.quantity}x ${i.itemName}`).join(', ')}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="font-bold text-orange-600">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-gray-500">{getTimeAgo(order.createdAt)}</p>
                    </div>

                    {/* Quick actions for pending orders */}
                    {order.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'CONFIRMED');
                          }}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(order.id, 'CANCELLED');
                          }}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    )}

                    {/* Quick action for preparing orders */}
                    {order.status === 'PREPARING' && (
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'READY');
                        }}
                      >
                        Prêt
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>#{selectedOrder.orderNumber}</span>
                  <Badge className={STATUS_CONFIG[selectedOrder.status].color}>
                    {STATUS_CONFIG[selectedOrder.status].label}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Client</h3>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {selectedOrder.customerPhone}
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-sm text-gray-600">{selectedOrder.customerEmail}</p>
                  )}
                </div>

                {/* Delivery Info */}
                {selectedOrder.orderType === 'DELIVERY' && selectedOrder.deliveryAddress && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse de livraison
                    </h3>
                    <p>{selectedOrder.deliveryAddress}</p>
                    {selectedOrder.deliveryCity && (
                      <p className="text-sm text-gray-600">{selectedOrder.deliveryCity}</p>
                    )}
                    {selectedOrder.deliveryNotes && (
                      <p className="text-sm text-gray-500 mt-1 italic">
                        {selectedOrder.deliveryNotes}
                      </p>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-medium mb-2">Articles</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {item.itemName}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-500 italic">{item.notes}</p>
                          )}
                        </div>
                        <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Livraison</span>
                      <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-orange-600">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-medium mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Notes
                    </h3>
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Status Actions */}
                {STATUS_FLOW[selectedOrder.status as keyof typeof STATUS_FLOW]?.length > 0 && (
                  <div className="flex gap-2 pt-4">
                    {STATUS_FLOW[selectedOrder.status as keyof typeof STATUS_FLOW]
                      .filter((s) => s !== 'CANCELLED')
                      .map((status) => (
                        <Button
                          key={status}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          disabled={updating}
                        >
                          {STATUS_CONFIG[status].label}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ))}
                    <Button
                      variant="destructive"
                      onClick={() => updateOrderStatus(selectedOrder.id, 'CANCELLED')}
                      disabled={updating}
                    >
                      Annuler
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
