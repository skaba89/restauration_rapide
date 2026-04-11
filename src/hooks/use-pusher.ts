'use client';

import { useEffect, useRef, useState } from 'react';
import Pusher, { Channel } from 'pusher-js';

// Pusher configuration (client-side)
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

// Initialize Pusher client singleton
let pusherInstance: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (!pusherInstance && PUSHER_KEY) {
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      enabledTransports: ['ws', 'wss'],
    });
  }
  return pusherInstance;
}

// Hook to subscribe to a channel
export function usePusherChannel(channelName: string | null) {
  const channelRef = useRef<Channel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!channelName || !PUSHER_KEY) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind('pusher:subscription_error', () => {
      setIsConnected(false);
    });

    return () => {
      if (channelRef.current) {
        pusher.unsubscribe(channelName);
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [channelName]);

  return { channel: channelRef.current, isConnected };
}

// Hook to listen to specific events
export function usePusherEvent<T = unknown>(
  channelName: string | null,
  eventName: string,
  callback: (data: T) => void
) {
  const { channel } = usePusherChannel(channelName);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!channel || !eventName) return;

    const handler = (data: T) => callbackRef.current(data);
    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
    };
  }, [channel, eventName]);
}

// Pre-built hooks for Restaurant OS

// Hook for order status updates
export function useOrderUpdates(
  restaurantId: string,
  onOrderUpdate: (data: { orderId: string; status: string; [key: string]: unknown }) => void
) {
  const channelName = restaurantId ? `restaurant-${restaurantId}-orders` : null;
  
  usePusherEvent(channelName, 'order:status_changed', onOrderUpdate);
  usePusherEvent(channelName, 'order:created', onOrderUpdate);
}

// Hook for delivery tracking
export function useDeliveryTracking(
  deliveryId: string,
  onLocationUpdate: (data: { lat: number; lng: number; [key: string]: unknown }) => void,
  onStatusUpdate?: (data: { status: string; [key: string]: unknown }) => void
) {
  const channelName = deliveryId ? `delivery-${deliveryId}` : null;
  
  usePusherEvent(channelName, 'delivery:location_update', onLocationUpdate);
  
  if (onStatusUpdate) {
    usePusherEvent(channelName, 'delivery:status_changed', onStatusUpdate);
  }
}

// Hook for kitchen display
export function useKitchenUpdates(
  restaurantId: string,
  onNewItem: (data: unknown) => void,
  onItemReady: (data: unknown) => void
) {
  const channelName = restaurantId ? `kitchen-${restaurantId}` : null;
  
  usePusherEvent(channelName, 'kitchen:new_item', onNewItem);
  usePusherEvent(channelName, 'kitchen:item_ready', onItemReady);
}

// Hook for user notifications
export function useUserNotifications(
  userId: string,
  onNotification: (data: { id: string; title: string; message: string; [key: string]: unknown }) => void
) {
  const channelName = userId ? `user-${userId}-notifications` : null;
  
  usePusherEvent(channelName, 'notification:new', onNotification);
}
