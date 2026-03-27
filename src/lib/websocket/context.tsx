'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketRooms,
} from './types';

// Socket type
type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Context interface
interface SocketContextValue {
  socket: TypedSocket | null;
  isConnected: boolean;
  error: Error | null;
  
  // Connection management
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Room management
  joinRestaurant: (restaurantId: string) => void;
  leaveRestaurant: (restaurantId: string) => void;
  joinOrganization: (organizationId: string) => void;
  leaveOrganization: (organizationId: string) => void;
  joinKitchen: (restaurantId: string) => void;
  joinDelivery: (organizationId: string) => void;
  
  // Driver events
  updateDriverLocation: (lat: number, lng: number, accuracy?: number, batteryLevel?: number) => void;
  updateDriverStatus: (status: 'online' | 'offline' | 'busy') => void;
  
  // Order events
  acceptOrder: (orderId: string) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  
  // Table events
  updateTableStatus: (tableId: string, status: string, partySize?: number) => void;
  
  // Event subscription
  subscribe: <K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) => () => void;
}

// Create context
const SocketContext = createContext<SocketContextValue | null>(null);

// Socket URL from environment or default
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

// Provider props
interface SocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  token?: string;
}

/**
 * Socket Provider Component
 * Wrap your app with this to enable real-time features
 */
export function SocketProvider({ children, autoConnect = false, token }: SocketProviderProps) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());

  // Connect to socket server
  const connect = useCallback((authToken: string) => {
    if (socket?.connected) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }) as TypedSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      console.log('[Socket] Connected:', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Socket] Disconnected:', reason);
    });

    newSocket.on('connect_error', (err) => {
      setError(err);
      console.error('[Socket] Connection error:', err.message);
    });

    setSocket(newSocket);
  }, [socket]);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      subscriptionsRef.current.clear();
    }
  }, [socket]);

  // Room management functions
  const joinRestaurant = useCallback((restaurantId: string) => {
    socket?.emit('join:restaurant' as never, restaurantId);
  }, [socket]);

  const leaveRestaurant = useCallback((restaurantId: string) => {
    socket?.emit('leave:restaurant' as never, restaurantId);
  }, [socket]);

  const joinOrganization = useCallback((organizationId: string) => {
    socket?.emit('join:organization' as never, organizationId);
  }, [socket]);

  const leaveOrganization = useCallback((organizationId: string) => {
    socket?.emit('leave:organization' as never, organizationId);
  }, [socket]);

  const joinKitchen = useCallback((restaurantId: string) => {
    socket?.emit('join:kitchen' as never, restaurantId);
  }, [socket]);

  const joinDelivery = useCallback((organizationId: string) => {
    socket?.emit('join:delivery' as never, organizationId);
  }, [socket]);

  // Driver event functions
  const updateDriverLocation = useCallback((lat: number, lng: number, accuracy?: number, batteryLevel?: number) => {
    socket?.emit('driver:location' as never, { lat, lng, accuracy, batteryLevel });
  }, [socket]);

  const updateDriverStatus = useCallback((status: 'online' | 'offline' | 'busy') => {
    socket?.emit('driver:status' as never, { status, isAvailable: status === 'online' });
  }, [socket]);

  // Order event functions
  const acceptOrder = useCallback((orderId: string) => {
    socket?.emit('order:accept' as never, orderId);
  }, [socket]);

  const rejectOrder = useCallback((orderId: string, reason: string) => {
    socket?.emit('order:reject' as never, { orderId, reason });
  }, [socket]);

  // Table event functions
  const updateTableStatus = useCallback((tableId: string, status: string, partySize?: number) => {
    socket?.emit('table:status' as never, { tableId, status, partySize });
  }, [socket]);

  // Generic event subscription
  const subscribe = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) => {
    if (!socket) {
      return () => {};
    }

    socket.on(event, callback);
    
    const unsubscribe = () => {
      socket.off(event, callback);
    };

    subscriptionsRef.current.set(event as string, unsubscribe);
    return unsubscribe;
  }, [socket]);

  // Auto-connect if token provided
  useEffect(() => {
    if (autoConnect && token) {
      connect(token);
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, token, connect, disconnect]);

  // Context value
  const value: SocketContextValue = {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    joinRestaurant,
    leaveRestaurant,
    joinOrganization,
    leaveOrganization,
    joinKitchen,
    joinDelivery,
    updateDriverLocation,
    updateDriverStatus,
    acceptOrder,
    rejectOrder,
    updateTableStatus,
    subscribe,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook to access socket context
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

/**
 * Hook for order events in dashboard
 */
export function useOrderEvents(restaurantId?: string) {
  const { socket, isConnected, subscribe, joinRestaurant, leaveRestaurant } = useSocket();
  const [newOrders, setNewOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected || !restaurantId) return;

    joinRestaurant(restaurantId);

    const unsubNew = subscribe('order:new', (data: any) => {
      setNewOrders((prev) => [data, ...prev]);
    });

    const unsubStatus = subscribe('order:status', (data: any) => {
      // Handle status updates
      console.log('Order status update:', data);
    });

    return () => {
      unsubNew();
      unsubStatus();
      leaveRestaurant(restaurantId);
    };
  }, [isConnected, restaurantId, subscribe, joinRestaurant, leaveRestaurant]);

  return { newOrders, isConnected };
}

/**
 * Hook for kitchen display
 */
export function useKitchenEvents(restaurantId: string) {
  const { isConnected, subscribe, joinKitchen } = useSocket();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    joinKitchen(restaurantId);

    const unsubOrder = subscribe('kitchen:order', (data: any) => {
      setPendingOrders((prev) => [...prev, data]);
    });

    const unsubReady = subscribe('kitchen:item-ready', (data: any) => {
      setPendingOrders((prev) =>
        prev.map((o: any) => {
          if (o.orderId === data.orderId) {
            return {
              ...o,
              items: o.items?.filter((i: any) => i.id !== data.itemId),
            };
          }
          return o;
        }).filter((o: any) => !o.items || o.items.length > 0)
      );
    });

    return () => {
      unsubOrder();
      unsubReady();
    };
  }, [isConnected, restaurantId, subscribe, joinKitchen]);

  return { pendingOrders, isConnected };
}

/**
 * Hook for delivery tracking
 */
export function useDeliveryTracking(deliveryId: string) {
  const { isConnected, subscribe } = useSocket();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected) return;

    const unsubLocation = subscribe('delivery:location', (data: any) => {
      if (data.deliveryId === deliveryId) {
        setLocation({ lat: data.lat, lng: data.lng });
      }
    });

    const unsubStatus = subscribe('delivery:status', (data: any) => {
      if (data.deliveryId === deliveryId) {
        setStatus(data.status);
      }
    });

    return () => {
      unsubLocation();
      unsubStatus();
    };
  }, [isConnected, deliveryId, subscribe]);

  return { location, status, isConnected };
}

/**
 * Hook for driver updates
 */
export function useDriverUpdates() {
  const { isConnected, subscribe, updateDriverLocation, updateDriverStatus } = useSocket();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isConnected) return;

    const unsubAssigned = subscribe('delivery:assigned', (data: any) => {
      setOrders((prev) => [...prev, data]);
    });

    const unsubStatus = subscribe('delivery:status', (data: any) => {
      if (data.status === 'DELIVERED' || data.status === 'CANCELLED') {
        setOrders((prev) => prev.filter((o) => o.deliveryId !== data.deliveryId));
      }
    });

    return () => {
      unsubAssigned();
      unsubStatus();
    };
  }, [isConnected, subscribe]);

  return {
    orders,
    updateLocation: updateDriverLocation,
    updateStatus: updateDriverStatus,
    isConnected,
  };
}

export default SocketProvider;
