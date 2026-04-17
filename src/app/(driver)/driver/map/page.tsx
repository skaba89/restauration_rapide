'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Map,
  Navigation,
  MapPin,
  Clock,
  Package,
  CheckCircle,
  Phone,
  MessageCircle,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Truck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDriverTracking } from '@/hooks/use-driver-tracking';

// Dynamically import the map component
const DriverMap = dynamic(
  () => import('@/components/maps/real-map').then(mod => ({ default: mod.DriverMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Chargement de la carte...</div>
      </div>
    ),
  }
);

export default function DriverMapPage() {
  const [driverLocation, setDriverLocation] = useState({ lat: 5.3699, lng: -4.0183 });
  const [isOnline, setIsOnline] = useState(true);
  const [isSendingLocation, setIsSendingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const { toast } = useToast();
  const { isConnected } = useDriverTracking({ pollingInterval: 10000 });

  // Try to use real GPS (navigator.geolocation)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation && isOnline) {
      const watch = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setDriverLocation(newLocation);

          // Send location to server
          sendLocationToServer(newLocation.lat, newLocation.lng, position.coords.heading || 0, position.coords.speed || 0);
        },
        (error) => {
          console.warn('GPS error, using simulation:', error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        }
      );
      setWatchId(watch);

      return () => {
        if (watch) navigator.geolocation.clearWatch(watch);
      };
    }
  }, [isOnline]);
  useEffect(() => {
    if (watchId !== null) return; // Real GPS is active

    const interval = setInterval(() => {
      if (!isOnline) return;

      setDriverLocation(prev => {
        const newLat = prev.lat + (Math.random() - 0.5) * 0.0008;
        const newLng = prev.lng + (Math.random() - 0.5) * 0.0008;

        // Send simulated location to server
        sendLocationToServer(newLat, newLng, Math.random() * 360, 25);

        return { lat: newLat, lng: newLng };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline, watchId]);

  // Send location to API
  const sendLocationToServer = useCallback(async (lat: number, lng: number, heading: number, speed: number) => {
    setIsSendingLocation(true);
    try {
      await fetch('/api/drivers/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: lat,
          lng,
          heading,
          speed,
        }),
      });
    } catch (error) {
      // Silent fail for location updates - don't spam user
    } finally {
      setIsSendingLocation(false);
    }
  }, []);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
    toast({ title: 'Appel en cours...', description: phone });
  };

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`, '_self');
    toast({ title: 'Message', description: `Envoi d\'un message au ${phone}` });
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);

    // Update status on server
    fetch('/api/drivers/tracking', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: isOnline ? 'offline' : 'online',
        isAvailable: !isOnline,
      }),
    }).catch(() => {});

    toast({
      title: isOnline ? 'Hors ligne' : 'En ligne',
      description: isOnline ? 'Vous ne recevrez plus de commandes' : 'Vous recevrez des commandes',
    });
  };
  const activeDelivery = {
    id: 'ORD-2024-0145',
    address: 'Cocody, Riviera 3',
    customerName: 'Kouame Jean',
    customerPhone: '+2250700000100',
    status: 'En livraison',
    estimatedTime: '15 min',
    location: { lat: 5.3699, lng: -4.0283 },
  };

  const otherOrders = [
    {
      id: 'ORD-2024-0146',
      address: 'Plateau, Rue du Commerce',
      status: 'En attente',
      location: { lat: 5.3599, lng: -4.0083 },
    },
  ];

  const allOrders = [
    { ...activeDelivery, status: activeDelivery.status },
    ...otherOrders,
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-green-600" />
            Carte
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Sending indicator */}
          {isSendingLocation && (
            <div className="flex items-center gap-1 text-xs text-blue-500">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Envoi GPS...</span>
            </div>
          )}

          {/* Connection */}
          <div className={`flex items-center gap-1 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>

          <Button
            variant={isOnline ? 'default' : 'outline'}
            className={isOnline ? 'bg-green-500 hover:bg-green-600' : ''}
            onClick={toggleOnline}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'} mr-2`} />
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card className="flex-1 overflow-hidden relative">
        <CardContent className="p-0 h-full relative">
          <Suspense
            fallback={
              <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                  <p className="mt-2 text-muted-foreground text-sm">Chargement de la carte...</p>
                </div>
              </div>
            }
          >
            <DriverMap
              driverLocation={driverLocation}
              orders={allOrders.map(o => ({
                id: o.id,
                location: o.location,
                address: o.address,
                status: o.status,
              }))}
              className="h-full min-h-[300px]"
            />
          </Suspense>

          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
            <Button size="icon" variant="secondary" className="shadow-md">
              <Map className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="shadow-md">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" className="shadow-md">
              <ZoomOut className="h-4 w-4" />
            </Button>
          </div>

          {/* GPS status */}
          <div className="absolute top-4 left-4 z-[1000]">
            <div className="bg-white/95 dark:bg-gray-900/95 p-2 rounded-lg shadow-md">
              <div className="flex items-center gap-2 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="font-medium">
                  {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-28 left-4 bg-white/95 dark:bg-gray-900/95 p-3 rounded-lg shadow-md z-[1000]">
            <p className="text-xs font-semibold mb-2">Legende</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Votre position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Livraisons</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Delivery Card */}
      <Card className="border-l-4 border-l-green-500 flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="font-bold">{activeDelivery.id}</span>
            </div>
            <Badge className="bg-green-100 text-green-700">En livraison</Badge>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{activeDelivery.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{activeDelivery.estimatedTime}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCall(activeDelivery.customerPhone)}>
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleMessage(activeDelivery.customerPhone)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => {
              toast({
                title: 'Livraison confirmee',
                description: `${activeDelivery.id} a ete marque comme livre`,
              });
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Livre
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}