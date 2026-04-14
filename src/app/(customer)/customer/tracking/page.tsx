'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle,
  ChefHat, Package, Home, Wifi, WifiOff, Loader2, Navigation,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrderTracking } from '@/hooks/use-order-sync';

const RealMap = dynamic(() => import('@/components/maps/real-map'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Chargement de la carte...</div>
    </div>
  ),
});

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  orderType: string;
  total: number;
  deliveryAddress?: string;
  deliveryCity?: string;
  driverName?: string;
  driverPhone?: string;
  createdAt: string;
  items: Array<{ name: string; quantity: number }>;
}

const TRACKING_STEPS_CONFIG = [
  { status: 'CONFIRMED', title: 'Commande confirmee', icon: CheckCircle },
  { status: 'PREPARING', title: 'En preparation', icon: ChefHat },
  { status: 'READY', title: 'Prete', icon: Package },
  { status: 'OUT_FOR_DELIVERY', title: 'En livraison', icon: Truck },
  { status: 'DELIVERED', title: 'Livree', icon: Home },
];

const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];

// Abidjan coordinates
const RESTAURANT_LOCATION = { lat: 5.3599, lng: -4.0083 };
const DESTINATION_LOCATION = { lat: 5.3799, lng: -4.0283 };

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState({ lat: 5.3699, lng: -4.0183 });
  const { toast } = useToast();

  // Subscribe to real-time updates for this specific order
  const { isTracking, isConnected, lastUpdate } = useOrderTracking(orderId);

  // Fetch order from shared API
  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/orders?demo=true`);
      const result = await response.json();
      if (result.success && result.data?.data) {
        const found = result.data.data.find((o: any) => o.id === orderId);
        if (found) {
          setOrder({
            id: found.id,
            orderNumber: found.orderNumber,
            status: found.status,
            customerName: found.customerName,
            orderType: found.orderType,
            total: found.total,
            deliveryAddress: found.deliveryAddress,
            deliveryCity: found.deliveryCity,
            driverName: found.driverName,
            driverPhone: found.driverPhone,
            createdAt: found.createdAt,
            items: (found.items || []).map((i: any) => ({ name: i.itemName, quantity: i.quantity })),
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  // React to real-time updates (when admin changes status or assigns driver)
  useEffect(() => {
    if (lastUpdate) {
      fetchOrder(); // Refetch to get latest data
      if (lastUpdate.status === 'PREPARING') {
        toast({ title: 'En preparation', description: 'Votre commande est en cours de preparation' });
      } else if (lastUpdate.status === 'READY') {
        toast({ title: 'Commande prete !', description: 'Votre commande est prete' });
      } else if (lastUpdate.status === 'OUT_FOR_DELIVERY') {
        toast({ title: 'En livraison !', description: 'Le livreur est en route' });
      }
    }
  }, [lastUpdate, fetchOrder, toast]);

  // Simulate driver movement when out for delivery
  useEffect(() => {
    if (order?.status !== 'OUT_FOR_DELIVERY') return;
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + (DESTINATION_LOCATION.lat - prev.lat) * 0.03,
        lng: prev.lng + (DESTINATION_LOCATION.lng - prev.lng) * 0.03,
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [order?.status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement du suivi...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6 pb-24">
        <h1 className="text-2xl font-bold">Suivi de Livraison</h1>
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Commande non trouvée</p>
            <Link href="/customer/orders">
              <Button className="mt-4 bg-orange-500 hover:bg-orange-600">Voir mes commandes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const progress = Math.max(0, (currentStepIndex / (TRACKING_STEPS_CONFIG.length)) * 100);

  const handleCall = () => {
    if (order.driverPhone) {
      window.open(`tel:${order.driverPhone}`, '_self');
      toast({ title: 'Appel en cours...', description: order.driverPhone });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suivi de Livraison</h1>
        <Badge variant={isConnected ? 'default' : 'secondary'} className={`text-xs ${isConnected ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'}`}>
          {isConnected ? <><Wifi className="h-3 w-3 mr-1" /> Temps reel</> : <><WifiOff className="h-3 w-3 mr-1" /> Hors ligne</>}
        </Badge>
      </div>

      {/* Order Info */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{order.orderNumber}</CardTitle>
            <Badge className="bg-orange-100 text-orange-700">
              {order.status === 'OUT_FOR_DELIVERY' && <Truck className="h-3 w-3 mr-1" />}
              {order.status === 'PREPARING' && <ChefHat className="h-3 w-3 mr-1" />}
              {order.status === 'READY' && <Package className="h-3 w-3 mr-1" />}
              {TRACKING_STEPS_CONFIG.find(s => s.status === order.status)?.title || order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* Real Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Suspense fallback={
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-muted-foreground">Chargement de la carte...</div>
            </div>
          }>
            <RealMap
              driverLocation={driverLocation}
              restaurantLocation={RESTAURANT_LOCATION}
              destinationLocation={DESTINATION_LOCATION}
              driverName={order.driverName || 'Livreur'}
              destinationAddress={order.deliveryAddress || 'Destination'}
              showRoute={true}
              className="h-64"
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Delivery Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TRACKING_STEPS_CONFIG.map((step) => {
              const stepIndex = STATUS_FLOW.indexOf(step.status);
              const isActive = order.status === step.status;
              const isCompleted = currentStepIndex >= stepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.status} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  } ${isActive ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? '' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
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
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Votre livreur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                {order.driverName.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{order.driverName}</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={handleCall}>
                  <Phone className="h-5 w-5" />
                </Button>
                {order.driverPhone && (
                  <Link href={`/customer/messages?to=${encodeURIComponent(order.driverPhone)}`}>
                    <Button size="icon" variant="outline" className="h-10 w-10">
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      {order.deliveryAddress && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Adresse de livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
              <p className="font-medium">{order.deliveryAddress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fixed Actions at bottom */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-gray-950 border-t p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleCall} disabled={!order.driverPhone}>
            <Phone className="h-4 w-4 mr-2" />
            Appeler
          </Button>
          <Link href="/customer/orders" className="flex-1">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              <Navigation className="h-4 w-4 mr-2" />
              Mes Commandes
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return <TrackingContent />;
}
