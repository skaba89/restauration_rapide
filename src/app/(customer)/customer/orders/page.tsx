'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronRight,
  RefreshCw,
  Eye,
  Navigation,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const ORDERS = [
  {
    id: 'ORD-2024-0145',
    status: 'PREPARING',
    date: '2024-01-15 12:30',
    total: 8500,
    items: [
      { name: 'Attieké Poisson Grillé', quantity: 2, price: 3500 },
      { name: 'Jus de Bissap', quantity: 1, price: 1500 },
    ],
    type: 'DELIVERY',
    address: 'Cocody, Riviera 2',
    deliveryFee: 500,
    driver: { name: 'Amadou Touré', phone: '+2250700000100', rating: 4.8 },
  },
  {
    id: 'ORD-2024-0144',
    status: 'DELIVERED',
    date: '2024-01-14 19:45',
    total: 12000,
    items: [
      { name: 'Kedjenou de Poulet', quantity: 2, price: 4500 },
      { name: 'Jus de Gingembre', quantity: 3, price: 1000 },
    ],
    type: 'DINE_IN',
    table: 'T5',
  },
  {
    id: 'ORD-2024-0143',
    status: 'CANCELLED',
    date: '2024-01-13 13:00',
    total: 4000,
    items: [{ name: 'Thiéboudienne', quantity: 1, price: 4000 }],
    type: 'TAKEAWAY',
    cancelReason: 'Délai trop long',
  },
  {
    id: 'ORD-2024-0142',
    status: 'OUT_FOR_DELIVERY',
    date: '2024-01-15 13:00',
    total: 6500,
    items: [
      { name: 'Poulet Braisé', quantity: 1, price: 4000 },
      { name: 'Alloco', quantity: 2, price: 1250 },
    ],
    type: 'DELIVERY',
    address: 'Plateau, Rue du Commerce',
    deliveryFee: 500,
    driver: { name: 'Ibrahim Koné', phone: '+2250700000101', rating: 4.6 },
    estimatedArrival: '13:25',
  },
];

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

export default function CustomerOrdersPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const filteredOrders = ORDERS.filter(order => {
    if (filter === 'active') {
      return !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
    }
    if (filter === 'past') {
      return ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  const handleDetails = (order: typeof ORDERS[0]) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleReorder = (order: typeof ORDERS[0]) => {
    toast({ 
      title: 'Articles ajoutés au panier', 
      description: `${order.items.length} article(s) de ${order.id}` 
    });
    router.push('/customer/cart');
  };

  const handleTrack = (order: typeof ORDERS[0]) => {
    if (order.type === 'DELIVERY' && (order.status === 'OUT_FOR_DELIVERY' || order.status === 'PREPARING')) {
      router.push('/customer/tracking');
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes Commandes</h1>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="past">Historique</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Orders List */}
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
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold">{order.id}</p>
                        <Badge variant="outline">
                          {order.type === 'DELIVERY' ? '🚗 Livraison' : 
                           order.type === 'TAKEAWAY' ? '📦 À emporter' : '🍽️ Sur place'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <Badge className={statusConfig.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Items preview */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-3">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-muted-foreground">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{order.items.length - 2} autre(s) article(s)
                      </p>
                    )}
                  </div>

                  {/* Delivery info */}
                  {order.type === 'DELIVERY' && order.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {order.address}
                    </div>
                  )}

                  {/* Driver info */}
                  {order.driver && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                          {order.driver.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.driver.name}</p>
                          <p className="text-xs text-muted-foreground">⭐ {order.driver.rating}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleCall(order.driver!.phone)}>
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleMessage(order.driver!.phone)}>
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Total and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <p className="font-bold text-lg">{order.total.toLocaleString()} FCFA</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDetails(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      {order.status !== 'CANCELLED' && (
                        <Button variant="outline" size="sm" onClick={() => handleReorder(order)}>
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Commander
                        </Button>
                      )}
                      {order.type === 'DELIVERY' && ['PREPARING', 'OUT_FOR_DELIVERY'].includes(order.status) && (
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
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>{selectedOrder?.id}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                <Badge className={STATUS_CONFIG[selectedOrder.status].color}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(selectedOrder.date).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</span>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Articles commandés</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.type === 'DELIVERY' && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{selectedOrder.deliveryFee?.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedOrder.address}</span>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-600">{selectedOrder.total.toLocaleString()} FCFA</span>
              </div>

              {selectedOrder.cancelReason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                  <p className="font-medium text-red-700">Motif d'annulation</p>
                  <p className="text-red-600">{selectedOrder.cancelReason}</p>
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
                Commander à nouveau
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
