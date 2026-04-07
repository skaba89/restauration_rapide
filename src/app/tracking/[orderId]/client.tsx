'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChefHat,
  Package,
  Home,
  Store,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

// Dynamically import the map component
const RealMap = dynamic(() => import('@/components/maps/real-map'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Chargement de la carte...</div>
    </div>
  ),
});

interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note: string | null;
  }>;
  estimatedReadyTime: string | null;
  estimatedDeliveryTime: string | null;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    coordinates: { lat: number; lng: number } | null;
  };
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  delivery: {
    status: string;
    driver?: {
      id: string;
      name: string;
      phone: string;
      avatar: string | null;
      vehicleType: string;
      rating: number;
    };
    currentLocation?: { lat: number; lng: number } | null;
    distanceRemaining?: number;
    timeRemaining?: number;
  } | null;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; step: number }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock, step: 1 },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, step: 2 },
  PREPARING: { label: 'En préparation', color: 'bg-orange-100 text-orange-700', icon: ChefHat, step: 3 },
  READY: { label: 'Prête', color: 'bg-green-100 text-green-700', icon: Package, step: 4 },
  OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-purple-100 text-purple-700', icon: Truck, step: 5 },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700', icon: CheckCircle, step: 6 },
  COMPLETED: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle, step: 6 },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: AlertCircle, step: 0 },
};

const TRACKING_STEPS = [
  { id: 1, title: 'Commande reçue', icon: CheckCircle },
  { id: 2, title: 'Confirmée', icon: CheckCircle },
  { id: 3, title: 'En préparation', icon: ChefHat },
  { id: 4, title: 'Prête', icon: Package },
  { id: 5, title: 'En livraison', icon: Truck },
  { id: 6, title: 'Livrée', icon: Home },
];

export default function PublicTrackingClient({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/tracking/${orderId}`);
      if (!res.ok) {
        throw new Error('Commande non trouvée');
      }
      const data = await res.json();
      setTracking(data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto-refresh every 30 seconds for active orders
  useEffect(() => {
    if (!tracking || ['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(tracking.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchTracking();
    }, 30000);

    return () => clearInterval(interval);
  }, [tracking, fetchTracking]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTracking();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Suivi de commande ${tracking?.orderNumber}`,
          text: `Suivez ma commande ${tracking?.orderNumber} - ${tracking?.restaurant.name}`,
          url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">Commande introuvable</h1>
            <p className="text-gray-500 mt-2">{error || 'Cette commande n\'existe pas ou a expiré.'}</p>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => router.push('/')}>
                Accueil
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={() => router.push('/tracking')}>
                Rechercher
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tracking.status] || STATUS_CONFIG.PENDING;
  const currentStep = statusConfig.step;
  const progress = (currentStep / TRACKING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold">Suivi de commande</h1>
              <p className="text-sm text-gray-500">{tracking.orderNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="ghost" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-4">
        {/* Order Status */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{tracking.restaurant.name}</CardTitle>
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {tracking.status !== 'CANCELLED' && (
              <>
                <div className="mb-4">
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="grid grid-cols-6 gap-1 text-center text-xs">
                  {TRACKING_STEPS.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = step.id <= currentStep;
                    const isCurrent = step.id === currentStep;
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-2 ring-orange-500 ring-offset-1' : ''}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={isCompleted ? 'text-green-700' : 'text-gray-400'}>
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            
            {tracking.status === 'CANCELLED' && (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 font-medium">Cette commande a été annulée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estimated Time */}
        {!['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(tracking.status) && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Temps estimé</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {tracking.delivery?.timeRemaining 
                      ? `${tracking.delivery.timeRemaining} min`
                      : tracking.estimatedReadyTime
                      ? new Date(tracking.estimatedReadyTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                      : 'En cours...'
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Map for delivery orders */}
        {tracking.delivery?.currentLocation && tracking.status === 'OUT_FOR_DELIVERY' && (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Suspense fallback={
                <div className="h-64 bg-gray-100 flex items-center justify-center">
                  Chargement de la carte...
                </div>
              }>
                <RealMap
                  driverLocation={tracking.delivery.currentLocation}
                  restaurantLocation={tracking.restaurant.coordinates || { lat: 9.6412, lng: -13.5784 }}
                  destinationLocation={{ lat: 9.6289, lng: -13.5956 }}
                  driverName={tracking.delivery.driver?.name || 'Livreur'}
                  destinationAddress={tracking.customer.address || ''}
                  showRoute={true}
                  className="h-64"
                />
              </Suspense>
            </CardContent>
          </Card>
        )}

        {/* Driver Info */}
        {tracking.delivery?.driver && ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(tracking.status) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Votre livreur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                  {tracking.delivery.driver.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{tracking.delivery.driver.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-yellow-500">★</span>
                    <span>{tracking.delivery.driver.rating}</span>
                    <span>•</span>
                    <span>{tracking.delivery.driver.vehicleType === 'motorcycle' ? '🛵 Moto' : '🚗 Voiture'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-10 w-10" 
                    onClick={() => handleCall(tracking.delivery.driver!.phone)}
                  >
                    <Phone className="h-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restaurant Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Restaurant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Store className="w-10 h-10 text-orange-500" />
              <div className="flex-1">
                <p className="font-medium">{tracking.restaurant.name}</p>
                <p className="text-sm text-muted-foreground">{tracking.restaurant.address}</p>
              </div>
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => handleCall(tracking.restaurant.phone)}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Votre commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracking.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-medium">
                <span>Total</span>
                <span className="text-orange-600">{tracking.total.toLocaleString()} GNF</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Address */}
        {tracking.customer.address && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{tracking.customer.address}</p>
              <p className="text-sm text-gray-500 mt-1">Client: {tracking.customer.name}</p>
            </CardContent>
          </Card>
        )}

        {/* Payment Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Paiement</p>
                <p className="font-medium">{tracking.paymentMethod}</p>
              </div>
              <Badge variant={tracking.paymentStatus === 'PAID' ? 'default' : 'secondary'}>
                {tracking.paymentStatus === 'PAID' ? 'Payé' : 'En attente'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Actions */}
      {tracking.status === 'OUT_FOR_DELIVERY' && tracking.delivery?.driver && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
          <div className="max-w-2xl mx-auto flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => handleCall(tracking.delivery!.driver!.phone)}
            >
              <Phone className="w-4 h-4 mr-2" />
              Appeler
            </Button>
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
