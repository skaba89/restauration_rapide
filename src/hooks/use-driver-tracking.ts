'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { usePusherChannel } from '@/hooks/use-pusher';
import { usePusherEvent } from '@/hooks/use-pusher';
import { fetchWithAuth } from '@/lib/api-client';

const DEFAULT_RESTAURANT_ID = 'demo-rest-1';

export interface DriverLocation {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  vehicleType: string;
  vehiclePlate: string | null;
  vehicleColor: string | null;
  status: 'online' | 'busy' | 'offline' | 'suspended';
  isAvailable: boolean;
  currentLat: number;
  currentLng: number;
  heading: number;
  speed: number;
  lastLocationAt: string;
  activeDelivery: {
    orderId: string;
    orderNumber: string;
    customerName: string;
    deliveryAddress: string;
    status: string;
    destinationLat: number;
    destinationLng: number;
  } | null;
}

export interface TrackingStats {
  total: number;
  online: number;
  busy: number;
  offline: number;
}

/**
 * Hook for real-time driver tracking.
 * Admin/kitchen subscribes to a global tracking channel to see all driver movements.
 * Uses polling + Pusher events for comprehensive real-time coverage.
 */
export function useDriverTracking(options: {
  restaurantId?: string;
  pollingInterval?: number;
  enabled?: boolean;
} = {}) {
  const {
    restaurantId = DEFAULT_RESTAURANT_ID,
    pollingInterval = 5000,
    enabled = true,
  } = options;

  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const [stats, setStats] = useState<TrackingStats>({ total: 0, online: 0, busy: 0, offline: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  // Subscribe to the global orders channel for delivery location events
  const trackingChannel = `restaurant-${restaurantId}-orders`;
  const { isConnected: pusherConnected } = usePusherChannel(enabled ? trackingChannel : null);

  // Listen for delivery location updates
  usePusherEvent<{ orderId: string; driverId: string; lat: number; lng: number; status: string; etaMinutes?: number }>(
    enabled ? trackingChannel : null,
    'delivery:location_update',
    useCallback((data) => {
      // Update the specific driver's location in the drivers array
      setDrivers(prev =>
        prev.map(d => {
          if (d.id === data.driverId || (d.activeDelivery && d.activeDelivery.orderId === data.orderId)) {
            return {
              ...d,
              currentLat: data.lat,
              currentLng: data.lng,
              lastLocationAt: new Date().toISOString(),
              activeDelivery: d.activeDelivery
                ? { ...d.activeDelivery, status: data.status || d.activeDelivery.status }
                : null,
            };
          }
          return d;
        })
      );
    }, [])
  );

  // Listen for driver status changes via order events
  usePusherEvent<{ driverId: string; status: string; orderId: string; orderNumber: string; customerName: string; deliveryAddress: string }>(
    enabled ? trackingChannel : null,
    'order:driver_assigned',
    useCallback((data) => {
      setDrivers(prev =>
        prev.map(d => {
          if (d.id === data.driverId) {
            return {
              ...d,
              status: 'busy' as const,
              isAvailable: false,
              activeDelivery: {
                orderId: data.orderId,
                orderNumber: data.orderNumber,
                customerName: data.customerName || '',
                deliveryAddress: data.deliveryAddress || '',
                status: 'PICKED_UP',
                destinationLat: d.activeDelivery?.destinationLat || d.currentLat + 0.01,
                destinationLng: d.activeDelivery?.destinationLng || d.currentLng + 0.01,
              },
            };
          }
          return d;
        })
      );
    }, [])
  );

  useEffect(() => {
    setIsConnected(pusherConnected);
  }, [pusherConnected]);

  // Fetch driver locations from API
  const fetchDrivers = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/drivers/tracking');
      const data = await response.json();

      if (data.success && data.data) {
        setDrivers(data.data.drivers || []);
        setStats(data.data.stats || { total: 0, online: 0, busy: 0, offline: 0 });
        setLastUpdate(new Date(data.data.updatedAt || new Date().toISOString()));
      }
    } catch (error) {
      console.error('Failed to fetch driver tracking:', error);
    } finally {
      setIsLoading(false);
      fetchCountRef.current += 1;
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    if (!enabled) return;

    fetchDrivers();
    const interval = setInterval(fetchDrivers, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchDrivers, pollingInterval, enabled]);

  // Get a specific driver by ID
  const getDriver = useCallback((driverId: string) => {
    return drivers.find(d => d.id === driverId) || null;
  }, [drivers]);

  // Get selected driver details
  const selectedDriver = selectedDriverId ? getDriver(selectedDriverId) : null;

  // Get busy drivers (with active deliveries)
  const busyDrivers = drivers.filter(d => d.status === 'busy' && d.activeDelivery);

  // Get available drivers
  const availableDrivers = drivers.filter(d => d.status === 'online' && d.isAvailable);

  return {
    drivers,
    stats,
    isLoading,
    lastUpdate,
    isConnected,
    selectedDriver,
    selectedDriverId,
    setSelectedDriverId,
    getDriver,
    busyDrivers,
    availableDrivers,
    refetch: fetchDrivers,
  };
}
