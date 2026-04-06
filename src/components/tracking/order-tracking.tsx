'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';

interface TrackingEvent {
  id: string;
  status: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

interface OrderTrackingProps {
  orderId: string;
  orderNumber: string;
  status: string;
  customerName: string;
  deliveryAddress?: string;
  estimatedTime?: number;
  driverName?: string;
  driverPhone?: string;
  events: TrackingEvent[];
}

const statusSteps = [
  { key: 'PENDING', label: 'En attente', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmée', icon: CheckCircle },
  { key: 'PREPARING', label: 'En préparation', icon: Package },
  { key: 'READY', label: 'Prête', icon: CheckCircle },
  { key: 'OUT_FOR_DELIVERY', label: 'En livraison', icon: Truck },
  { key: 'DELIVERED', label: 'Livrée', icon: CheckCircle },
];

export function OrderTracking({
  orderId,
  orderNumber,
  status,
  customerName,
  deliveryAddress,
  estimatedTime,
  driverName,
  driverPhone,
  events,
}: OrderTrackingProps) {
  const currentStepIndex = statusSteps.findIndex((s) => s.key === status);

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Commande</p>
              <p className="font-bold text-lg">{orderNumber}</p>
            </div>
            <Badge
              className={
                status === 'DELIVERED'
                  ? 'bg-green-500'
                  : status === 'CANCELLED'
                  ? 'bg-red-500'
                  : 'bg-orange-500'
              }
            >
              {statusSteps.find((s) => s.key === status)?.label || status}
            </Badge>
          </div>
          {estimatedTime && status !== 'DELIVERED' && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Arrivée estimée: {estimatedTime} min</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? isCurrent
                          ? 'bg-orange-500 text-white'
                          : 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && status !== 'DELIVERED' && (
                      <p className="text-sm text-orange-600">En cours...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Driver Info */}
      {driverName && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Votre livreur</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">{driverName}</p>
                  {driverPhone && (
                    <a
                      href={`tel:${driverPhone}`}
                      className="text-sm text-orange-600 flex items-center gap-1"
                    >
                      <Phone className="h-3 w-3" />
                      {driverPhone}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Address */}
      {deliveryAddress && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-2">Adresse de livraison</p>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-orange-600 mt-0.5" />
              <p className="text-gray-900">{deliveryAddress}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Events */}
      {events && events.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500 mb-3">Historique</p>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.status}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.timestamp).toLocaleString('fr-FR')}
                    </p>
                    {event.notes && (
                      <p className="text-xs text-gray-400 mt-1">{event.notes}</p>
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
