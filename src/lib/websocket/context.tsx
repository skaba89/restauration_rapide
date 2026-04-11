'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from './types';

// Socket type
type TypedSocket = any;

// Context interface
interface SocketContextValue {
  socket: TypedSocket | null;
  isConnected: boolean;
  error: Error | null;
  isAvailable: boolean;
  
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

// Check if WebSocket is available (has valid URL configured)
const isWebSocketAvailable = (): boolean => {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  
  // If no URL is configured, WebSocket is not available
  if (!socketUrl) {
    return false;
  }
  
  // If URL is localhost and we're in production, WebSocket is not available
  if (process.env.NODE_ENV === 'production' && socketUrl.includes('localhost')) {
    return false;
  }
  
  return true;
};

// Socket URL from environment or default
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || '';

// Provider props
interface SocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
  token?: string;
}

/**
 * Socket Provider Component
 * Wrap your app with this to enable real-time features
 * 
 * Note: WebSocket is optional and will be disabled if:
 * - NEXT_PUBLIC_SOCKET_URL is not set
 * - The socket server is not available
 */
export function SocketProvider({ children, autoConnect = false, token }: SocketProviderProps) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const socketRef = useRef<TypedSocket | null>(null);
  const connectionAttemptedRef = useRef(false);

  // Check WebSocket availability on mount
  useEffect(() => {
    const available = isWebSocketAvailable();
    setIsAvailable(available);
    
    if (!available) {
      console.log('[Socket] WebSocket not configured - real-time features disabled');
    }
  }, []);

  // Connect to socket server
  const connect = useCallback(async (authToken: string) => {
    // Don't connect if not available
    if (!isWebSocketAvailable()) {
      console.log('[Socket] WebSocket not available, skipping connection');
      return;
    }
    
    // Don't reconnect if already connected or attempting
    if (socketRef.current?.connected || connectionAttemptedRef.current) {
      return;
    }

    connectionAttemptedRef.current = true;

    try {
      // Dynamic import of socket.io-client
      const { io } = await import('socket.io-client');
      
      const newSocket = io(SOCKET_URL, {
        auth: { token: authToken },
        transports: ['polling', 'websocket'], // Start with polling, upgrade to websocket
        reconnection: true,
        reconnectionAttempts: 3, // Limit reconnection attempts
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setError(null);
        setIsAvailable(true);
        console.log('[Socket] Connected:', newSocket.id);
      });

      newSocket.on('disconnect', (reason: string) => {
        setIsConnected(false);
        console.log('[Socket] Disconnected:', reason);
      });

      newSocket.on('connect_error', (err: Error) => {
        setIsConnected(false);
        // Only log once, not on every reconnection attempt
        if (connectionAttemptedRef.current) {
          console.log('[Socket] Connection failed - real-time features unavailable');
          setError(err);
          // Stop trying after first failure in production
          if (process.env.NODE_ENV === 'production') {
            newSocket.disconnect();
            setIsAvailable(false);
          }
        }
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
    } catch (err) {
      console.log('[Socket] Failed to load socket.io-client - real-time features disabled');
      setIsAvailable(false);
    }
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      subscriptionsRef.current.clear();
      connectionAttemptedRef.current = false;
    }
  }, []);

  // Room management functions
  const joinRestaurant = useCallback((restaurantId: string) => {
    socketRef.current?.emit('join:restaurant', restaurantId);
  }, []);

  const leaveRestaurant = useCallback((restaurantId: string) => {
    socketRef.current?.emit('leave:restaurant', restaurantId);
  }, []);

  const joinOrganization = useCallback((organizationId: string) => {
    socketRef.current?.emit('join:organization', organizationId);
  }, []);

  const leaveOrganization = useCallback((organizationId: string) => {
    socketRef.current?.emit('leave:organization', organizationId);
  }, []);

  const joinKitchen = useCallback((restaurantId: string) => {
    socketRef.current?.emit('join:kitchen', restaurantId);
  }, []);

  const joinDelivery = useCallback((organizationId: string) => {
    socketRef.current?.emit('join:delivery', organizationId);
  }, []);

  // Driver event functions
  const updateDriverLocation = useCallback((lat: number, lng: number, accuracy?: number, batteryLevel?: number) => {
    socketRef.current?.emit('driver:location', { lat, lng, accuracy, batteryLevel });
  }, []);

  const updateDriverStatus = useCallback((status: 'online' | 'offline' | 'busy') => {
    socketRef.current?.emit('driver:status', { status, isAvailable: status === 'online' });
  }, []);

  // Order event functions
  const acceptOrder = useCallback((orderId: string) => {
    socketRef.current?.emit('order:accept', orderId);
  }, []);

  const rejectOrder = useCallback((orderId: string, reason: string) => {
    socketRef.current?.emit('order:reject', { orderId, reason });
  }, []);

  // Table event functions
  const updateTableStatus = useCallback((tableId: string, status: string, partySize?: number) => {
    socketRef.current?.emit('table:status', { tableId, status, partySize });
  }, []);

  // Generic event subscription
  const subscribe = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) => {
    if (!socketRef.current) {
      return () => {};
    }

    socketRef.current.on(event, callback as any);
    
    const unsubscribe = () => {
      socketRef.current?.off(event, callback as any);
    };

    subscriptionsRef.current.set(event as string, unsubscribe);
    return unsubscribe;
  }, []);

  // Auto-connect if token provided
  useEffect(() => {
    if (autoConnect && token && isWebSocketAvailable()) {
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
    isAvailable,
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
 * Falls back gracefully when WebSocket is not available
 */
export function useOrderEvents(restaurantId?: string) {
  const { socket, isConnected, isAvailable, subscribe, joinRestaurant, leaveRestaurant } = useSocket();
  const [newOrders, setNewOrders] = useState<any[]>([]);

  useEffect(() => {
    // Don't do anything if WebSocket is not available
    if (!isAvailable || !isConnected || !restaurantId) return;

    joinRestaurant(restaurantId);

    const unsubNew = subscribe('order:new', (data: any) => {
      setNewOrders((prev) => [data, ...prev]);
    });

    const unsubStatus = subscribe('order:status', (data: any) => {
      console.log('Order status update:', data);
    });

    return () => {
      unsubNew();
      unsubStatus();
      leaveRestaurant(restaurantId);
    };
  }, [isAvailable, isConnected, restaurantId, subscribe, joinRestaurant, leaveRestaurant]);

  return { newOrders, isConnected: isConnected && isAvailable };
}

/**
 * Hook for kitchen display
 */
export function useKitchenEvents(restaurantId: string) {
  const { isConnected, isAvailable, subscribe, joinKitchen } = useSocket();
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAvailable || !isConnected) return;

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
  }, [isAvailable, isConnected, restaurantId, subscribe, joinKitchen]);

  return { pendingOrders, isConnected: isConnected && isAvailable };
}

/**
 * Hook for delivery tracking
 */
export function useDeliveryTracking(deliveryId: string) {
  const { isConnected, isAvailable, subscribe } = useSocket();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAvailable || !isConnected) return;

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
  }, [isAvailable, isConnected, deliveryId, subscribe]);

  return { location, status, isConnected: isConnected && isAvailable };
}

/**
 * Hook for driver updates
 */
export function useDriverUpdates() {
  const { isConnected, isAvailable, subscribe, updateDriverLocation, updateDriverStatus } = useSocket();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAvailable || !isConnected) return;

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
  }, [isAvailable, isConnected, subscribe]);

  return {
    orders,
    updateLocation: updateDriverLocation,
    updateStatus: updateDriverStatus,
    isConnected: isConnected && isAvailable,
  };
}

export default SocketProvider;
