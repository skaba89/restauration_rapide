'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Phone, 
  Navigation, 
  Package,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-states';

// ============================================
// Order Tracking Types
// ============================================

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  driverName?: string;
  estimatedTime: number;
  distance: number;
}

// ============================================
// Order Tracking Map Component
// ============================================

interface OrderTrackingMapProps {
  orderId?: string;
}

export function OrderTrackingMap({ orderId }: OrderTrackingMapProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Map View */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Suivi en temps réel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-80px)]">
            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin className="w-16 h-16 mx-auto mb-2" />
                <p>Carte interactive</p>
                <p className="text-sm">Intégrer Google Maps / Mapbox</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Commandes actives</CardTitle>
          </CardHeader>
          <CardContent className="p-2 overflow-y-auto h-[calc(100%-60px)]">
            <div className="text-center text-muted-foreground py-8">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune commande active</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OrderTrackingMap;
