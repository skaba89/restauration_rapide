'use client';

import { useState, useEffect } from 'react';
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
import {
  Package,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  Phone,
  MessageCircle,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const PENDING_ORDERS = [
  {
    id: 'ORD-2024-0146',
    restaurant: 'Le Petit Maquis',
    restaurantAddress: 'Cocody, Riviera 2',
    customerName: 'Aya Marie',
    customerPhone: '+2250700000002',
    deliveryAddress: 'Cocody, Angré 7ème tranche',
    distance: '2.5 km',
    items: ['1x Attieké Poisson', '2x Jus de Bissap'],
    total: 6500,
    deliveryFee: 500,
    estimatedTime: '15-20 min',
    createdAt: new Date(),
  },
  {
    id: 'ORD-2024-0147',
    restaurant: 'Le Petit Maquis',
    restaurantAddress: 'Cocody, Riviera 2',
    customerName: 'Koné Ibrahim',
    customerPhone: '+2250700000003',
    deliveryAddress: 'Plateau, Rue du Commerce',
    distance: '4.2 km',
    items: ['2x Poulet Braisé', '1x Riz Gras'],
    total: 12500,
    deliveryFee: 700,
    estimatedTime: '25-30 min',
    createdAt: new Date(),
  },
];

const ACTIVE_ORDER = {
  id: 'ORD-2024-0145',
  restaurant: 'Le Petit Maquis',
  restaurantAddress: 'Cocody, Riviera 2',
  customerName: 'Kouamé Jean',
  customerPhone: '+2250700000001',
  deliveryAddress: 'Cocody, Riviera 3, près de la pharmacie',
  distance: '2.3 km',
  items: ['2x Attieké Poisson', '1x Jus de Bissap'],
  total: 8500,
  deliveryFee: 500,
  status: 'PICKED_UP',
  pickedUpAt: new Date(),
};

export default function DriverOrdersPage() {
  const [pendingOrders, setPendingOrders] = useState(PENDING_ORDERS);
  const [activeOrder, setActiveOrder] = useState(ACTIVE_ORDER);
  const [selectedOrder, setSelectedOrder] = useState<typeof PENDING_ORDERS[0] | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const formatCurrency = (amount: number) => `${amount.toLocaleString()} FCFA`;

  const handleAcceptOrder = (order: typeof PENDING_ORDERS[0]) => {
    setSelectedOrder(order);
    setShowAcceptDialog(true);
  };

  const confirmAcceptOrder = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Move to active orders
    setActiveOrder({
      ...selectedOrder,
      status: 'ACCEPTED',
      pickedUpAt: undefined,
    });
    
    // Remove from pending
    setPendingOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
    
    setShowAcceptDialog(false);
    setSelectedOrder(null);
    setIsProcessing(false);
    
    toast({
      title: 'Commande acceptée !',
      description: `Commande ${selectedOrder.id} vous a été assignée`,
    });
  };

  const handleRejectOrder = async (orderId: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== orderId));
    toast({
      title: 'Commande refusée',
      description: 'La commande a été assignée à un autre livreur',
      variant: 'destructive',
    });
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!activeOrder) return;

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
    setIsProcessing(false);

    const statusMessages: Record<string, string> = {
      ARRIVED_AT_RESTAURANT: 'Arrivé au restaurant',
      PICKED_UP: 'Commande récupérée',
      IN_TRANSIT: 'En route vers le client',
      ARRIVED_AT_CUSTOMER: 'Arrivé chez le client',
      DELIVERED: 'Commande livrée !',
    };

    toast({ title: statusMessages[newStatus] || 'Statut mis à jour' });

    if (newStatus === 'DELIVERED') {
      setActiveOrder(null);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Disponible</span>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Active Order */}
      {activeOrder && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Commande Active</CardTitle>
              <Badge className="bg-green-100 text-green-700">
                {activeOrder.status === 'PICKED_UP' ? 'En livraison' : 
                 activeOrder.status === 'IN_TRANSIT' ? 'En transit' :
                 activeOrder.status === 'ARRIVED_AT_CUSTOMER' ? 'Arrivé' : 'En cours'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{activeOrder.id}</p>
                <p className="text-sm text-muted-foreground">{activeOrder.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(activeOrder.deliveryFee)}</p>
                <p className="text-xs text-muted-foreground">Votre gain</p>
              </div>
            </div>

            {/* Addresses */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Restaurant</p>
                  <p className="text-sm font-medium">{activeOrder.restaurantAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Client</p>
                  <p className="text-sm font-medium">{activeOrder.deliveryAddress}</p>
                </div>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCall(activeOrder.customerPhone)}>
                <Phone className="h-4 w-4 mr-1" />
                Appeler
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleMessage(activeOrder.customerPhone)}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/driver/map')}>
                <Navigation className="h-4 w-4" />
              </Button>
            </div>

            {/* Status Actions */}
            <div className="grid grid-cols-2 gap-2">
              {activeOrder.status === 'ACCEPTED' && (
                <Button className="col-span-2 bg-orange-500 hover:bg-orange-600" onClick={() => updateOrderStatus('ARRIVED_AT_RESTAURANT')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Arrivé au restaurant
                </Button>
              )}
              {activeOrder.status === 'ARRIVED_AT_RESTAURANT' && (
                <Button className="col-span-2 bg-green-500 hover:bg-green-600" onClick={() => updateOrderStatus('PICKED_UP')}>
                  <Package className="h-4 w-4 mr-2" />
                  Commande récupérée
                </Button>
              )}
              {activeOrder.status === 'PICKED_UP' && (
                <Button className="col-span-2 bg-blue-500 hover:bg-blue-600" onClick={() => updateOrderStatus('IN_TRANSIT')}>
                  <Navigation className="h-4 w-4 mr-2" />
                  Démarrer la livraison
                </Button>
              )}
              {activeOrder.status === 'IN_TRANSIT' && (
                <Button className="col-span-2 bg-purple-500 hover:bg-purple-600" onClick={() => updateOrderStatus('ARRIVED_AT_CUSTOMER')}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Arrivé chez le client
                </Button>
              )}
              {activeOrder.status === 'ARRIVED_AT_CUSTOMER' && (
                <Button className="col-span-2 bg-green-500 hover:bg-green-600" onClick={() => updateOrderStatus('DELIVERED')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer la livraison
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Orders */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Nouvelles demandes
          {pendingOrders.length > 0 && (
            <Badge className="bg-orange-500">{pendingOrders.length}</Badge>
          )}
        </h2>

        {pendingOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune nouvelle commande</p>
              <p className="text-sm text-muted-foreground">Les demandes apparaîtront ici</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.restaurant}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(order.deliveryFee)}</p>
                      <p className="text-xs text-muted-foreground">{order.distance} • {order.estimatedTime}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                    <p className="text-sm font-medium mb-1">{order.items.join(' • ')}</p>
                    <p className="text-sm text-muted-foreground">
                      Total: {formatCurrency(order.total)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span>{order.deliveryAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>Créée il y a quelques minutes</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleRejectOrder(order.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Refuser
                    </Button>
                    <Button
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={() => handleAcceptOrder(order)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accepter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accepter la commande ?</DialogTitle>
            <DialogDescription>
              Vous serez le livreur assigné à cette commande
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commande</span>
                <span className="font-medium">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client</span>
                <span>{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span>{selectedOrder.distance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Votre gain</span>
                <span className="font-bold text-green-600">{formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button className="bg-green-500 hover:bg-green-600" onClick={confirmAcceptOrder} disabled={isProcessing}>
              {isProcessing ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
