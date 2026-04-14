'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  XCircle,
  RefreshCw,
  Eye,
  Navigation,
  MessageCircle,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useCurrencySafe } from '@/lib/currency-context';
import { useOrderSync } from '@/hooks/use-order-sync';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  PREPARING: { label: 'En préparation', color: 'bg-orange-100 text-orange-700', icon: ChefHat },
  READY: { label: 'Prête', color: 'bg-green-100 text-green-700', icon: Package },
  OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-purple-100 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  COMPLETED: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle },
};

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: string;
  orderType: string;
  items: Array<{ id: string; name: string; quantity: number; price: number }>;
  total: number;
  deliveryFee?: number;
  deliveryAddress?: string;
  tableNumber?: string;
  createdAt: string;
  notes?: string;
  driverName?: string;
  driverPhone?: string;
  cancellationReason?: string;
}

export default function CustomerOrdersPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { formatCurrency } = useCurrencySafe();

  // Real-time sync - subscribe to the same channel as admin/kitchen
  const { isConnected: isSynced, lastEvent, clearLastEvent } = useOrderSync({
    restaurantId: 'demo-rest-1',
    enabled: true,
  });

  // Fetch orders from shared API (same data as admin and kitchen)
  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders?demo=true&limit=50');
      const result = await response.json();
      if (result.success && result.data?.data && Array.isArray(result.data.data)) {
        const apiOrders: Order[] = result.data.data.map((o: any) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          status: o.status,
          orderType: o.orderType,
          items: (o.items || []).map((item: any) => ({
            id: item.id,
            name: item.itemName,
            quantity: item.quantity,
            price: item.unitPrice || item.totalPrice / Math.max(item.quantity, 1),
          })),
          total: o.total,
          deliveryFee: o.deliveryFee || 0,
          deliveryAddress: o.deliveryAddress || '',
          tableNumber: o.tableNumber || undefined,
          createdAt: o.createdAt,
          notes: o.notes || '',
          driverName: o.driverName,
          driverPhone: o.driverPhone,
          cancellationReason: o.cancellationReason,
        }));
        setOrders(apiOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // React to sync events from admin/kitchen changes
  useEffect(() => {
    if (lastEvent) {
      fetchOrders();
      if (lastEvent.status === 'PREPARING') {
        toast({ title: 'Commande en préparation', description: `${lastEvent.orderNumber} est en cours de préparation` });
      } else if (lastEvent.status === 'READY') {
        toast({ title: 'Commande prête !', description: `${lastEvent.orderNumber} est prête` });
      } else if (lastEvent.status === 'OUT_FOR_DELIVERY') {
        toast({ title: 'En livraison', description: `${lastEvent.orderNumber} est en route` });
      } else if (lastEvent.status === 'DELIVERED' || lastEvent.status === 'COMPLETED') {
        toast({ title: 'Commande livrée !', description: `${lastEvent.orderNumber} a été livrée` });
      } else if (lastEvent.status === 'CANCELLED') {
        toast({ title: 'Commande annulée', description: `${lastEvent.orderNumber} a été annulée`, variant: 'destructive' });
      }
      clearLastEvent();
    }
  }, [lastEvent, fetchOrders, toast, clearLastEvent]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
    }
    if (filter === 'past') {
      return ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  const handleDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleReorder = (order: Order) => {
    toast({ title: 'Articles ajoutés au panier', description: `${order.items.length} article(s) de ${order.orderNumber}` });
    router.push('/customer/cart');
  };

  const handleTrack = (order: Order) => {
    if (order.orderType === 'DELIVERY' && ['OUT_FOR_DELIVERY', 'PREPARING', 'READY'].includes(order.status)) {
      router.push(`/customer/tracking?id=${order.id}`);
    } else {
      toast({ title: 'Suivi non disponible', description: 'Cette commande ne peut pas être suivie en temps réel' });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
    toast({ title: 'Appel en cours...', description: phone });
  };

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`, '_self');
    toast({ title: 'Message', description: `Envoi d'un message au ${phone}` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement des commandes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Mes Commandes</h1>
            <Badge variant={isSynced ? 'default' : 'secondary'} className={`text-xs ${isSynced ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}`}>
              {isSynced ? <><Wifi className="h-3 w-3 mr-1" /> Synchro</> : <><WifiOff className="h-3 w-3 mr-1" /> Hors ligne</>}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Synchronisé en temps réel avec le restaurant</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="past">Historique</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune commande trouvée</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map(order => {
            const statusConfig = STATUS_CONFIG[order.status];
            const StatusIcon = statusConfig?.icon || Clock;

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold">{order.orderNumber}</p>
                        <Badge variant="outline">
                          {order.orderType === 'DELIVERY' ? 'Livraison' :
                           order.orderType === 'TAKEAWAY' ? 'A emporter' : 'Sur place'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-700'}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label || order.status}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-muted-foreground">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{order.items.length - 2} autre(s) article(s)
                      </p>
                    )}
                  </div>

                  {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {order.deliveryAddress}
                    </div>
                  )}

                  {order.driverName && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {order.driverName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.driverName}</p>
                          <p className="text-xs text-muted-foreground">Livreur</p>
                        </div>
                      </div>
                      {order.driverPhone && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCall(order.driverPhone!)}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMessage(order.driverPhone!)}>
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="font-bold text-lg">{formatCurrency(order.total)}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDetails(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                      {order.status !== 'CANCELLED' && (
                        <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Commander
                        </Button>
                      )}
                      {order.orderType === 'DELIVERY' && ['PREPARING', 'OUT_FOR_DELIVERY', 'READY'].includes(order.status) && (
                        <Button size="sm" className="bg-orange-500 hover:bg-orange-600" onClick={() => handleTrack(order)}>
                          <Navigation className="h-4 w-4 mr-1" />
                          Suivi
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Details de la commande</DialogTitle>
            <DialogDescription>{selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge className={STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100'}>
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}</span>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-2">Articles commandes</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.orderType === 'DELIVERY' && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedOrder.deliveryAddress}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
              {selectedOrder.cancellationReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                  <p className="font-medium text-red-700">Motif d&apos;annulation</p>
                  <p className="text-red-600">{selectedOrder.cancellationReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>Fermer</Button>
            {selectedOrder && selectedOrder.status !== 'CANCELLED' && (
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
                setShowDetails(false);
                handleReorder(selectedOrder);
              }}>
                Commander a nouveau
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
