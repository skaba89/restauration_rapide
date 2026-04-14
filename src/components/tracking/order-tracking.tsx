'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Loader2 } from 'lucide-react';

const statusSteps = [
  { key: 'PENDING', label: 'En attente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmee', icon: CheckCircle },
  { key: 'PREPARING', label: 'En preparation', icon: Package },
  { key: 'READY', label: 'Prete', icon: CheckCircle },
  { key: 'OUT_FOR_DELIVERY', label: 'En livraison', icon: Truck },
  { key: 'DELIVERED', label: 'Livree', icon: CheckCircle },
];

// Demo order data for tracking
const DEMO_ORDERS: Record<string, {
  orderId: string;
  orderNumber: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  estimatedTime: number;
  driverName: string;
  driverPhone: string;
  events: Array<{ id: string; status: string; timestamp: string; notes?: string }>;
}> = {
  'demo-ord-1': {
    orderId: 'demo-ord-1',
    orderNumber: 'ORD-2024-0144',
    status: 'DELIVERED',
    customerName: 'Aminata Diallo',
    deliveryAddress: 'Kaloum, pres de la mosque',
    estimatedTime: 0,
    driverName: 'Amadou Toure',
    driverPhone: '+2250700000100',
    events: [
      { id: '1', status: 'Commande creee', timestamp: '2024-12-01T10:00:00Z', notes: 'Commande en ligne' },
      { id: '2', status: 'Confirmee', timestamp: '2024-12-01T10:02:00Z' },
      { id: '3', status: 'En preparation', timestamp: '2024-12-01T10:05:00Z' },
      { id: '4', status: 'Prete', timestamp: '2024-12-01T10:20:00Z' },
      { id: '5', status: 'Driver assigne', timestamp: '2024-12-01T10:21:00Z', notes: 'Amadou Toure' },
      { id: '6', status: 'En livraison', timestamp: '2024-12-01T10:25:00Z' },
      { id: '7', status: 'Livree', timestamp: '2024-12-01T10:45:00Z', notes: 'Livree avec succes' },
    ],
  },
  'demo-ord-2': {
    orderId: 'demo-ord-2',
    orderNumber: 'ORD-2024-0145',
    status: 'OUT_FOR_DELIVERY',
    customerName: 'Kouame Jean',
    deliveryAddress: 'Cocody, Riviera 3, pres de la pharmacie',
    estimatedTime: 15,
    driverName: 'Moussa Diallo',
    driverPhone: '+2250700000102',
    events: [
      { id: '1', status: 'Commande creee', timestamp: '2024-12-01T11:30:00Z', notes: 'Commande en ligne' },
      { id: '2', status: 'Confirmee', timestamp: '2024-12-01T11:32:00Z' },
      { id: '3', status: 'En preparation', timestamp: '2024-12-01T11:35:00Z' },
      { id: '4', status: 'Prete', timestamp: '2024-12-01T11:50:00Z' },
      { id: '5', status: 'Driver assigne', timestamp: '2024-12-01T11:51:00Z', notes: 'Moussa Diallo' },
      { id: '6', status: 'En livraison', timestamp: '2024-12-01T11:55:00Z', notes: 'Commande recuperee' },
    ],
  },
  'demo-ord-3': {
    orderId: 'demo-ord-3',
    orderNumber: 'ORD-2024-0146',
    status: 'PREPARING',
    customerName: 'Aya Marie',
    deliveryAddress: 'Plateau, Rue du Commerce',
    estimatedTime: 30,
    driverName: '',
    driverPhone: '',
    events: [
      { id: '1', status: 'Commande creee', timestamp: '2024-12-01T12:00:00Z', notes: 'Commande en ligne' },
      { id: '2', status: 'Confirmee', timestamp: '2024-12-01T12:02:00Z' },
      { id: '3', status: 'En preparation', timestamp: '2024-12-01T12:05:00Z' },
    ],
  },
};

type OrderData = typeof DEMO_ORDERS[string];

export function OrderTracking({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    fetch(`/api/orders?id=${orderId}&demo=true`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.success && data.data) {
          const o = data.data;
          setOrder({
            orderId: o.id,
            orderNumber: o.orderNumber,
            status: o.status,
            customerName: o.customerName || 'Client',
            deliveryAddress: o.deliveryAddress || '',
            estimatedTime: o.estimatedTime || 20,
            driverName: o.driverName || '',
            driverPhone: o.driverPhone || '',
            events: (o.events || []).map((e: any, i: number) => ({
              id: e.id || `evt-${i}`,
              status: e.status || e.type || 'Mise a jour',
              timestamp: e.timestamp || e.createdAt || new Date().toISOString(),
              notes: e.notes,
            })),
          });
          setNotFound(false);
        } else {
          const demoOrder = DEMO_ORDERS[orderId];
          if (demoOrder) {
            setOrder(demoOrder);
            setNotFound(false);
          } else {
            setNotFound(true);
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        const demoOrder = DEMO_ORDERS[orderId];
        if (demoOrder) {
          setOrder(demoOrder);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Recherche de la commande...</span>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Commande non trouvee</p>
          <p className="text-sm text-muted-foreground mt-1">
            Verifiez le numero de commande et reessayez
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Commande</p>
              <p className="font-bold text-lg">{order.orderNumber}</p>
            </div>
            <Badge
              className={
                order.status === 'DELIVERED'
                  ? 'bg-green-500'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-500'
                  : 'bg-orange-500'
              }
            >
              {statusSteps.find((s) => s.key === order.status)?.label || order.status}
            </Badge>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Client: {order.customerName}</span>
          </div>
          {order.estimatedTime > 0 && order.status !== 'DELIVERED' && (
            <div className="mt-2 flex items-center gap-2 text-sm text-orange-600">
              <Clock className="h-4 w-4" />
              <span>Arrivee estimee: {order.estimatedTime} min</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-4">Progression de la commande</p>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? isCurrent
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted ? '' : 'text-muted-foreground'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && order.status !== 'DELIVERED' && (
                      <p className="text-sm text-orange-600">En cours...</p>
                    )}
                    {isCompleted && !isCurrent && (
                      <p className="text-xs text-green-600">Termine</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      {order.driverName && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Votre livreur</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">{order.driverName}</p>
                {order.driverPhone && (
                  <a
                    href={`tel:${order.driverPhone}`}
                    className="text-sm text-orange-600 flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    {order.driverPhone}
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Adresse de livraison</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p>{order.deliveryAddress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Events */}
      {order.events && order.events.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-3">Historique</p>
            <div className="space-y-3">
              {order.events.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString('fr-FR')}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
