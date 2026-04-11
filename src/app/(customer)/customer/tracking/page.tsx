'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Dynamically import the map component to avoid SSR issues
const RealMap = dynamic(() => import('@/components/maps/real-map'), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">Chargement de la carte...</div>
    </div>
  ),
});

const TRACKING_STEPS = [
  { id: 1, title: 'Commande confirmée', time: '12:30', completed: true },
  { id: 2, title: 'En préparation', time: '12:35', completed: true },
  { id: 3, title: 'Prête', time: '12:55', completed: true },
  { id: 4, title: 'En livraison', time: '13:00', completed: true, active: true },
  { id: 5, title: 'Livrée', time: '', completed: false },
];

const DRIVER_INFO = {
  name: 'Amadou Touré',
  phone: '+2250700000100',
  rating: 4.8,
  deliveries: 234,
  vehicleType: 'Moto',
  plateNumber: 'AB-123-CD',
  avatar: null,
};

const DELIVERY_INFO = {
  orderId: 'ORD-2024-0145',
  address: 'Cocody, Riviera 2, Abidjan',
  estimatedArrival: '13:25',
  distance: '2.3 km',
  minutesLeft: 15,
};

// Abidjan coordinates
const RESTAURANT_LOCATION = { lat: 5.3599, lng: -4.0083 };
const DESTINATION_LOCATION = { lat: 5.3799, lng: -4.0283 };

export default function TrackingPage() {
  const [driverLocation, setDriverLocation] = useState({ 
    lat: 5.3699, 
    lng: -4.0183 
  });
  const [minutesLeft, setMinutesLeft] = useState(DELIVERY_INFO.minutesLeft);
  const { toast } = useToast();

  // Simulate driver moving towards destination
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation(prev => {
        // Move driver slightly towards destination
        const newLat = prev.lat + (DESTINATION_LOCATION.lat - prev.lat) * 0.05;
        const newLng = prev.lng + (DESTINATION_LOCATION.lng - prev.lng) * 0.05;
        return { lat: newLat, lng: newLng };
      });
      setMinutesLeft(prev => Math.max(0, prev - 1));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const currentStep = TRACKING_STEPS.findIndex(s => s.active) + 1;
  const progress = (currentStep / TRACKING_STEPS.length) * 100;

  const handleCall = () => {
    window.open(`tel:${DRIVER_INFO.phone}`, '_self');
    toast({ title: 'Appel en cours...', description: DRIVER_INFO.phone });
  };

  const handleMessage = () => {
    toast({ title: 'Messages', description: 'Ouvrir la conversation avec le livreur' });
  };

  return (
    <div className="space-y-6 pb-24">
      <h1 className="text-2xl font-bold">Suivi de Livraison</h1>

      {/* Order Info */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{DELIVERY_INFO.orderId}</CardTitle>
            <Badge className="bg-purple-100 text-purple-700">
              <Truck className="h-3 w-3 mr-1" />
              En livraison
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Arrivée estimée</p>
              <p className="text-2xl font-bold text-orange-600">{DELIVERY_INFO.estimatedArrival}</p>
              <p className="text-sm text-muted-foreground">Environ {minutesLeft} minutes</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-medium">{DELIVERY_INFO.distance}</p>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
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
              driverName={DRIVER_INFO.name}
              destinationAddress={DELIVERY_INFO.address}
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
            {TRACKING_STEPS.map((step, idx) => {
              const StepIcon = step.id === 1 ? CheckCircle :
                              step.id === 2 ? ChefHat :
                              step.id === 3 ? Package :
                              step.id === 4 ? Truck : Home;

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  } ${step.active ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${step.completed ? '' : 'text-muted-foreground'}`}>
                        {step.title}
                      </p>
                      <span className="text-sm text-muted-foreground">{step.time}</span>
                    </div>
                    {idx < TRACKING_STEPS.length - 1 && (
                      <div className={`w-0.5 h-6 ml-4 mt-1 ${step.completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Votre livreur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
              AT
            </div>
            <div className="flex-1">
              <p className="font-semibold">{DRIVER_INFO.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-yellow-500">★</span>
                <span>{DRIVER_INFO.rating}</span>
                <span>•</span>
                <span>{DRIVER_INFO.deliveries} livraisons</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>🛵 {DRIVER_INFO.vehicleType}</span>
                <span>•</span>
                <span>{DRIVER_INFO.plateNumber}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="h-10 w-10" onClick={handleCall}>
                <Phone className="h-5 w-5" />
              </Button>
              <Link href="/customer/messages">
                <Button size="icon" variant="outline" className="h-10 w-10" onClick={handleMessage}>
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Adresse de livraison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
            <div>
              <p className="font-medium">{DELIVERY_INFO.address}</p>
              <p className="text-sm text-muted-foreground">Près de la pharmacie du quartier</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fixed Actions at bottom */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white dark:bg-gray-950 border-t p-4 shadow-lg z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleCall}>
            <Phone className="h-4 w-4 mr-2" />
            Appeler
          </Button>
          <Link href="/customer/messages" className="flex-1">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              <MessageCircle className="h-4 w-4 mr-2" />
              Message
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
