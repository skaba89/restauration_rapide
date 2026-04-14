'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { usePusherChannel } from '@/hooks/use-pusher';
import { usePusherEvent } from '@/hooks/use-pusher';
import { SYNC_CHANNELS, SYNC_EVENTS } from '@/lib/sync-engine';

const DEFAULT_RESTAURANT_ID = 'demo-rest-1';

interface SyncEvent {
  orderId: string;
  orderNumber: string;
  status: string;
  previousStatus?: string;
  customerName?: string;
  orderType?: string;
  total?: number;
  timestamp?: string;
  [key: string]: unknown;
}

interface UseSyncOptions {
  restaurantId?: string;
  enabled?: boolean;
}

/**
 * Central synchronization hook.
 * All roles subscribe to the same order channels.
 * When an event is received, it returns the update so the caller can refetch.
 */
export function useOrderSync(options: UseSyncOptions = {}) {
  const { restaurantId = DEFAULT_RESTAURANT_ID, enabled = true } = options;
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const eventsRef = useRef<SyncEvent[]>([]);

  const ordersChannel = `restaurant-${restaurantId}-orders`;
  const kitchenChannel = `kitchen-${restaurantId}`;
  const publicChannel = `public-${restaurantId}`;

  // Subscribe to the global orders channel
  const { isConnected } = usePusherChannel(enabled ? ordersChannel : null);

  // Listen for order status changes
  usePusherEvent<SyncEvent>(
    enabled ? ordersChannel : null,
    'order:status_changed',
    useCallback((data) => {
      eventsRef.current.push(data);
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  // Listen for new orders
  usePusherEvent<SyncEvent>(
    enabled ? ordersChannel : null,
    'order:created',
    useCallback((data) => {
      eventsRef.current.push(data);
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  // Listen for cancellations
  usePusherEvent<SyncEvent>(
    enabled ? ordersChannel : null,
    'order:cancelled',
    useCallback((data) => {
      eventsRef.current.push(data);
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  // Listen for driver assignments
  usePusherEvent<SyncEvent>(
    enabled ? ordersChannel : null,
    'order:driver_assigned',
    useCallback((data) => {
      eventsRef.current.push(data);
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  // Clear the last event (after processing)
  const clearLastEvent = useCallback(() => {
    setLastEvent(null);
    if (eventsRef.current.length > 0) {
      eventsRef.current.shift();
    }
  }, []);

  return {
    isConnected,
    lastEvent,
    eventCount,
    clearLastEvent,
  };
}

/**
 * Hook for individual order tracking (client-side).
 * Subscribes to a specific order channel for status updates.
 */
export function useOrderTracking(orderId: string | null) {
  const [lastUpdate, setLastUpdate] = useState<SyncEvent | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const channelName = orderId ? `order-${orderId}-status` : null;

  const { isConnected } = usePusherChannel(channelName);

  // Listen for status changes on this specific order
  usePusherEvent<SyncEvent>(
    channelName,
    'order:status_changed',
    useCallback((data) => {
      setLastUpdate(data);
    }, [])
  );

  // Listen for delivery location updates
  usePusherEvent<SyncEvent>(
    channelName,
    'delivery:location_update',
    useCallback((data) => {
      setLastUpdate(data);
    }, [])
  );

  // Listen for driver assignment
  usePusherEvent<SyncEvent>(
    channelName,
    'delivery:assigned',
    useCallback((data) => {
      setLastUpdate(data);
    }, [])
  );

  useEffect(() => {
    setIsTracking(isConnected);
  }, [isConnected]);

  return {
    isTracking,
    isConnected,
    lastUpdate,
    clearUpdate: useCallback(() => setLastUpdate(null), []),
  };
}

/**
 * Hook for kitchen display synchronization.
 * Subscribes to kitchen channel for new orders and status changes.
 */
export function useKitchenSync(restaurantId: string = DEFAULT_RESTAURANT_ID) {
  const [lastEvent, setLastEvent] = useState<SyncEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);

  const kitchenChannel = `kitchen-${restaurantId}`;

  const { isConnected } = usePusherChannel(kitchenChannel);

  // Listen for new orders in kitchen
  usePusherEvent<SyncEvent>(
    kitchenChannel,
    'kitchen:new_order',
    useCallback((data) => {
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  // Listen for status changes in kitchen
  usePusherEvent<SyncEvent>(
    kitchenChannel,
    'kitchen:status_changed',
    useCallback((data) => {
      setLastEvent(data);
      setEventCount(prev => prev + 1);
    }, [])
  );

  return {
    isConnected,
    lastEvent,
    eventCount,
    clearEvent: useCallback(() => setLastEvent(null), []),
  };
}

/**
 * Hook for driver synchronization.
 * Subscribes to driver channel for new deliveries.
 */
export function useDriverSync(driverId: string | null) {
  const [lastDelivery, setLastDelivery] = useState<SyncEvent | null>(null);

  const channelName = driverId ? `driver-${driverId}` : null;

  const { isConnected } = usePusherChannel(channelName);

  // Listen for new delivery assignments
  usePusherEvent<SyncEvent>(
    channelName,
    'driver:new_delivery',
    useCallback((data) => {
      setLastDelivery(data);
    }, [])
  );

  // Listen for order ready notifications
  usePusherEvent<SyncEvent>(
    channelName,
    'driver:order_ready',
    useCallback((data) => {
      setLastDelivery(data);
    }, [])
  );

  return {
    isConnected,
    lastDelivery,
    clearDelivery: useCallback(() => setLastDelivery(null), []),
  };
}
