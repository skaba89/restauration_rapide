'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin,
  Navigation,
  Phone,
  Package,
  Clock,
  Signal,
  SignalZero,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
  User,
  Truck,
  ChevronRight,
  Circle,
} from 'lucide-react';
import type { DriverLocation, TrackingStats } from '@/hooks/use-driver-tracking';

// Dynamically import the map (avoid SSR issues with Leaflet)
const DriverMap = dynamic(
  () => import('@/components/maps/real-map').then(mod => ({ default: mod.DriverMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-muted-foreground">Chargement de la carte...</span>
      </div>
    ),
  }
);

interface DriverTrackingDashboardProps {
  drivers: DriverLocation[];
  stats: TrackingStats;
  isLoading: boolean;
  lastUpdate: Date | null;
  isConnected: boolean;
  selectedDriverId: string | null;
  onSelectDriver: (driverId: string | null) => void;
  onRefetch: () => void;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'busy':
      return <Badge className="bg-orange-500 text-white">En livraison</Badge>;
    case 'online':
      return <Badge className="bg-green-500 text-white">Disponible</Badge>;
    case 'offline':
      return <Badge className="bg-gray-400 text-white">Hors ligne</Badge>;
    default:
      return <Badge className="bg-gray-400 text-white">{status}</Badge>;
  }
}

function getVehicleLabel(type: string) {
  switch (type) {
    case 'motorcycle': return 'Moto';
    case 'scooter': return 'Scooter';
    case 'bicycle': return 'Velo';
    case 'car': return 'Voiture';
    default: return type;
  }
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`;
}

export function DriverTrackingDashboard({
  drivers,
  stats,
  isLoading,
  lastUpdate,
  isConnected,
  selectedDriverId,
  onSelectDriver,
  onRefetch,
}: DriverTrackingDashboardProps) {
  const selectedDriver = drivers.find(d => d.id === selectedDriverId);

  // Map orders for the DriverMap component
  const mapOrders = useMemo(() => {
    if (selectedDriver) {
      // Show selected driver's delivery destinations
      if (selectedDriver.activeDelivery) {
        const dest = selectedDriver.activeDelivery;
        return [
          {
            id: dest.orderNumber,
            location: { lat: dest.destinationLat, lng: dest.destinationLng },
            address: dest.deliveryAddress,
            status: dest.status,
          },
        ];
      }
      return [];
    }

    // Show all delivery destinations from busy drivers
    return drivers
      .filter(d => d.status === 'busy' && d.activeDelivery)
      .map(d => ({
        id: d.activeDelivery!.orderNumber,
        location: { lat: d.activeDelivery!.destinationLat, lng: d.activeDelivery!.destinationLng },
        address: d.activeDelivery!.deliveryAddress,
        status: d.activeDelivery!.status,
      }));
  }, [drivers, selectedDriver]);

  // Center the map on the selected driver or Conakry center
  const mapCenter = selectedDriver
    ? { lat: selectedDriver.currentLat, lng: selectedDriver.currentLng }
    : { lat: 5.35, lng: -4.015 };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-orange-500" />
            Suivi Drivers en Temps Reel
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualisez la position de tous les livreurs en direct
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Circle className="w-3 h-3 text-green-500 fill-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{stats.online}</span>
              <span className="text-xs text-green-600 dark:text-green-500">Dispo</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full">
              <Circle className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">{stats.busy}</span>
              <span className="text-xs text-orange-600 dark:text-orange-500">En cours</span>
            </div>
          </div>

          {/* Connection status */}
          <div className={`flex items-center gap-1.5 text-xs ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isConnected ? 'Temps reel' : 'Polling'}</span>
          </div>

          {/* Last update */}
          <span className="text-xs text-muted-foreground">
            {lastUpdate ? `MAJ: ${formatTime(lastUpdate.toISOString())}` : '--:--:--'}
          </span>

          {/* Refresh */}
          <Button variant="outline" size="icon" onClick={onRefetch} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Content: Map + Sidebar */}
      <div className="flex-1 min-h-0 flex gap-4">
        {/* Map */}
        <div className="flex-1 min-w-0">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full relative">
              {isLoading && !lastUpdate ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
                    <p className="mt-3 text-muted-foreground">Chargement des positions...</p>
                  </div>
                </div>
              ) : (
                <DriverMap
                  driverLocation={mapCenter}
                  orders={mapOrders}
                  className="h-full"
                />
              )}

              {/* Map legend overlay */}
              <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 p-3 rounded-lg shadow-lg z-[1000]">
                <p className="text-xs font-semibold mb-2">Legende</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>En livraison</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Destination</span>
                  </div>
                </div>
              </div>

              {/* Stats overlay for mobile */}
              <div className="absolute top-4 left-4 md:hidden flex gap-2 z-[1000]">
                <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                  {stats.online} Dispo
                </div>
                <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                  {stats.busy} En cours
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Driver list */}
        <div className="w-80 hidden lg:block flex-shrink-0">
          <Card className="h-full flex flex-col">
            <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-sm">Livreurs actifs ({stats.total})</h3>
              {selectedDriverId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => onSelectDriver(null)}
                >
                  Tout voir
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              {drivers.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucun driver actif</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {drivers.map((driver) => (
                    <DriverCard
                      key={driver.id}
                      driver={driver}
                      isSelected={driver.id === selectedDriverId}
                      onClick={() => onSelectDriver(driver.id === selectedDriverId ? null : driver.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Selected Driver Detail Panel (bottom on mobile, overlay on desktop) */}
      {selectedDriver && (
        <Card className="border-l-4 border-l-orange-500 flex-shrink-0">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                  {getInitials(selectedDriver.firstName, selectedDriver.lastName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {selectedDriver.firstName} {selectedDriver.lastName}
                    </span>
                    {getStatusBadge(selectedDriver.status)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {getVehicleLabel(selectedDriver.vehicleType)}
                      {selectedDriver.vehiclePlate && ` - ${selectedDriver.vehiclePlate}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedDriver.phone}
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onSelectDriver(null)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {selectedDriver.activeDelivery && (
              <div className="mt-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm flex items-center gap-1">
                    <Package className="w-4 h-4 text-orange-500" />
                    Livraison en cours
                  </span>
                  <Badge variant="outline" className="text-orange-600">
                    {selectedDriver.activeDelivery.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Commande</p>
                    <p className="font-medium">{selectedDriver.activeDelivery.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Client</p>
                    <p className="font-medium">{selectedDriver.activeDelivery.customerName}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Destination
                    </p>
                    <p className="font-medium">{selectedDriver.activeDelivery.deliveryAddress}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {selectedDriver.speed > 0 ? `${selectedDriver.speed} km/h` : 'Arrete'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Derniere MAJ: {formatTime(selectedDriver.lastLocationAt)}
                  </span>
                  <span>
                    {selectedDriver.currentLat.toFixed(4)}, {selectedDriver.currentLng.toFixed(4)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Individual Driver Card
function DriverCard({
  driver,
  isSelected,
  onClick,
}: {
  driver: DriverLocation;
  isSelected: boolean;
  onClick: () => void;
}) {
  const initials = getInitials(driver.firstName, driver.lastName);
  const isActive = driver.status === 'busy' || driver.status === 'online';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isSelected ? 'bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-300 dark:ring-orange-700' : ''
      } ${!isActive ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
              driver.status === 'busy'
                ? 'bg-gradient-to-br from-orange-500 to-red-600'
                : driver.status === 'online'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gray-400'
            }`}
          >
            {initials}
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${
              driver.status === 'busy'
                ? 'bg-orange-500 animate-pulse'
                : driver.status === 'online'
                ? 'bg-green-500'
                : 'bg-gray-400'
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm truncate">
              {driver.firstName} {driver.lastName}
            </span>
            {getStatusBadge(driver.status)}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {getVehicleLabel(driver.vehicleType)}
            </span>
            {driver.speed > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Navigation className="w-3 h-3" />
                {driver.speed} km/h
              </span>
            )}
          </div>
          {driver.activeDelivery && (
            <div className="mt-1 flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
              <Package className="w-3 h-3" />
              <span className="truncate">{driver.activeDelivery.orderNumber}</span>
              <span className="text-muted-foreground">- {driver.activeDelivery.customerName}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
