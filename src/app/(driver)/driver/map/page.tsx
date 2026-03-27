'use client';

import { useState, useEffect, Suspense } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Dynamically import the map component
const DriverMap = dynamic(() => import('@/components/maps/real-map').then(mod => ({ default: mod.DriverMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Chargement de la carte...</div>
    </div>
  ),
});

const ACTIVE_ORDER = {
  id: 'ORD-2024-0145',
  address: 'Cocody, Riviera 3',
  customerName: 'Kouamé Jean',
  customerPhone: '+2250700000100',
  status: 'En livraison',
  estimatedTime: '15 min',
  location: { lat: 5.3799, lng: -4.0283 },
};

const OTHER_ORDERS = [
  {
    id: 'ORD-2024-0146',
    address: 'Plateau, Rue du Commerce',
    status: 'En attente',
    location: { lat: 5.3599, lng: -4.0083 },
  },
];

export default function DriverMapPage() {
  const [driverLocation, setDriverLocation] = useState({ lat: 5.3699, lng: -4.0183 });
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  // Simulate GPS updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    window.open(`tel:${ACTIVE_ORDER.customerPhone}`, '_self');
    toast({ title: 'Appel en cours...', description: ACTIVE_ORDER.customerPhone });
  };

  const handleMessage = () => {
    toast({ title: 'Messages', description: 'Ouvrir la conversation avec le client' });
  };

  const handleDelivered = () => {
    toast({ 
      title: 'Livraison confirmée', 
      description: `${ACTIVE_ORDER.id} a été marqué comme livré` 
    });
  };

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    toast({ 
      title: isOnline ? 'Hors ligne' : 'En ligne', 
      description: isOnline ? 'Vous ne recevrez plus de commandes' : 'Vous recevrez des commandes' 
    });
  };

  const allOrders = [
    { ...ACTIVE_ORDER, status: ACTIVE_ORDER.status },
    ...OTHER_ORDERS,
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carte</h1>
        <Button
          variant={isOnline ? 'default' : 'outline'}
          className={isOnline ? 'bg-green-500 hover:bg-green-600' : ''}
          onClick={toggleOnline}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-gray-400'} mr-2`} />
          {isOnline ? 'En ligne' : 'Hors ligne'}
        </Button>
      </div>

      {/* Map Container */}
      <Card className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground">Chargement de la carte...</div>
          </div>
        }>
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
        <div className="absolute top-20 right-8 flex flex-col gap-2 z-[1000]">
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

        {/* Legend */}
        <div className="absolute bottom-20 left-8 bg-white/90 dark:bg-gray-800/90 p-3 rounded-lg shadow-md z-[1000]">
          <p className="text-xs font-medium mb-2">Légende</p>
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
      </Card>

      {/* Active Delivery Card */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              <span className="font-bold">{ACTIVE_ORDER.id}</span>
            </div>
            <Badge className="bg-green-100 text-green-700">En livraison</Badge>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>{ACTIVE_ORDER.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{ACTIVE_ORDER.estimatedTime}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCall}>
              <Phone className="h-4 w-4 mr-2" />
              Appeler
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleMessage}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600" onClick={handleDelivered}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Livré
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
