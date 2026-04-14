'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Types
interface OrderEvent {
  orderId: string;
  orderNumber: string;
  organizationId: string;
  restaurantId: string;
  status: string;
  customerName?: string;
  total?: number;
  itemCount?: number;
  orderType?: string;
  timestamp: Date;
}

interface ReservationEvent {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  status: string;
  guestName: string;
  partySize: number;
  timestamp: Date;
}

interface DeliveryEvent {
  deliveryId: string;
  organizationId: string;
  driverId?: string;
  status: string;
  lat?: number;
  lng?: number;
  timestamp: Date;
}

interface UseRealTimeOptions {
  organizationId?: string;
  restaurantId?: string;
  role?: 'admin' | 'manager' | 'staff' | 'driver' | 'customer';
  userId?: string;
  autoConnect?: boolean;
}

interface UseRealTimeReturn {
  isConnected: boolean;
  isAvailable: boolean;
  newOrders: OrderEvent[];
  orderUpdates: OrderEvent[];
  newReservations: ReservationEvent[];
  deliveryUpdates: DeliveryEvent[];
  clearNewOrders: () => void;
  clearOrderUpdates: () => void;
  clearNewReservations: () => void;
  connect: () => void;
  disconnect: () => void;
}

// Check if WebSocket should be enabled
function shouldEnableWebSocket(): boolean {
  // Check if a WebSocket URL is explicitly configured
  if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
    return true;
  }
  
  // In development, allow localhost WebSocket
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // In production without explicit WebSocket URL, disable WebSocket
  // This prevents errors when no WebSocket server is available
  return false;
}

// Lazy load socket.io-client
type SocketType = any;
let socketIO: typeof import('socket.io-client') | null = null;
let socketInstance: SocketType | null = null;
let connectionFailed = false;

async function getSocketIO() {
  if (!socketIO) {
    socketIO = await import('socket.io-client');
  }
  return socketIO;
}

export function useRealTime(options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const {
    organizationId = 'kfm-org-1',
    restaurantId,
    role = 'admin',
    userId,
    autoConnect = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [newOrders, setNewOrders] = useState<OrderEvent[]>([]);
  const [orderUpdates, setOrderUpdates] = useState<OrderEvent[]>([]);
  const [newReservations, setNewReservations] = useState<ReservationEvent[]>([]);
  const [deliveryUpdates, setDeliveryUpdates] = useState<DeliveryEvent[]>([]);

  const hasJoinedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Check WebSocket availability on mount
  useEffect(() => {
    const available = shouldEnableWebSocket();
    setIsAvailable(available); // eslint-disable-line react-hooks/set-state-in-effect
    
    if (!available) {
      console.log('[RealTime] WebSocket disabled - polling will be used for updates');
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get or create socket
  const getSocket = useCallback(async () => {
    // Don't create socket if WebSocket is disabled or already failed
    if (!shouldEnableWebSocket() || connectionFailed) {
      return null;
    }
    
    if (!socketInstance) {
      try {
        const { io } = await getSocketIO();
        // In production, use the same host as the website or the WEBSOCKET_URL env var
        // In development, use localhost:3003
        let wsUrl = 'http://localhost:3003';
        
        if (typeof window !== 'undefined') {
          // Check for environment variable first
          if (process.env.NEXT_PUBLIC_WEBSOCKET_URL) {
            wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
          } else if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // In production without explicit URL, use same origin
            wsUrl = `${window.location.protocol}//${window.location.host}`;
          }
        }
        
        socketInstance = io(wsUrl, {
          path: '/api/socket',
          transports: ['polling', 'websocket'],
          reconnection: true,
          reconnectionAttempts: 3, // Limit attempts
          reconnectionDelay: 2000,
          timeout: 10000,
        });

        socketInstance.on('connect', () => {
          if (isMountedRef.current) {
            console.log('[RealTime] Connected');
            setIsConnected(true);
            setIsAvailable(true);
          }
        });

        socketInstance.on('disconnect', () => {
          if (isMountedRef.current) {
            console.log('[RealTime] Disconnected');
            setIsConnected(false);
            hasJoinedRef.current = false;
          }
        });

        socketInstance.on('connect_error', (error: Error) => {
          // Only log once
          if (!connectionFailed) {
            console.log('[RealTime] WebSocket not available - real-time features disabled');
            connectionFailed = true;
          }
          if (isMountedRef.current) {
            setIsConnected(false);
            setIsAvailable(false);
          }
          // Stop reconnection attempts
          if (socketInstance) {
            socketInstance.disconnect();
          }
        });
      } catch (error) {
        console.log('[RealTime] Failed to load socket.io-client');
        connectionFailed = true;
        return null;
      }
    }
    return socketInstance;
  }, []);

  // Connect and join rooms
  const connect = useCallback(async () => {
    // Don't try to connect if WebSocket is disabled
    if (!shouldEnableWebSocket()) {
      return;
    }
    
    const socket = await getSocket();
    
    if (!socket) return;
    
    if (!socket.connected) {
      socket.connect();
    }

    // Join organization room
    if (organizationId && !hasJoinedRef.current) {
      socket.emit('join:organization', {
        organizationId,
        restaurantId,
        role,
        userId,
      });
      hasJoinedRef.current = true;
    }
  }, [getSocket, organizationId, restaurantId, role, userId]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      hasJoinedRef.current = false;
      connectionFailed = false;
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!autoConnect || !shouldEnableWebSocket()) return;

    let mounted = true;

    const setupSocket = async () => {
      await connect();
      const socket = await getSocket();
      
      if (!socket || !mounted) return;

      // Order created
      const handleOrderCreated = (data: OrderEvent) => {
        if (!mounted) return;
        console.log('[RealTime] New order:', data.orderNumber);
        setNewOrders(prev => [data, ...prev]);
        
        // Play notification sound
        try {
          const audio = new Audio('/sounds/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {}

        // Browser notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`Nouvelle commande #${data.orderNumber}`, {
              body: `${data.customerName || 'Client'} - ${data.itemCount || 0} articles`,
              icon: '/favicon.ico',
            });
          }
        }
      };

      // Order updated
      const handleOrderUpdated = (data: OrderEvent) => {
        if (!mounted) return;
        console.log('[RealTime] Order updated:', data.orderNumber, data.status);
        setOrderUpdates(prev => [data, ...prev]);
      };

      // Reservation created
      const handleReservationCreated = (data: ReservationEvent) => {
        if (!mounted) return;
        console.log('[RealTime] New reservation:', data.reservationId);
        setNewReservations(prev => [data, ...prev]);
      };

      // Delivery status update
      const handleDeliveryUpdate = (data: DeliveryEvent) => {
        if (!mounted) return;
        console.log('[RealTime] Delivery update:', data.deliveryId, data.status);
        setDeliveryUpdates(prev => [data, ...prev]);
      };

      socket.on('order:created', handleOrderCreated);
      socket.on('order:new', handleOrderCreated);
      socket.on('order:updated', handleOrderUpdated);
      socket.on('order:status', handleOrderUpdated);
      socket.on('reservation:created', handleReservationCreated);
      socket.on('reservation:new', handleReservationCreated);
      socket.on('delivery:status', handleDeliveryUpdate);
      socket.on('delivery:updated', handleDeliveryUpdate);
    };

    setupSocket();

    return () => {
      mounted = false;
      if (socketInstance) {
        socketInstance.off('order:created');
        socketInstance.off('order:new');
        socketInstance.off('order:updated');
        socketInstance.off('order:status');
        socketInstance.off('reservation:created');
        socketInstance.off('reservation:new');
        socketInstance.off('delivery:status');
        socketInstance.off('delivery:updated');
      }
    };
  }, [autoConnect, connect, getSocket]);

  // Clear functions
  const clearNewOrders = useCallback(() => setNewOrders([]), []);
  const clearOrderUpdates = useCallback(() => setOrderUpdates([]), []);
  const clearNewReservations = useCallback(() => setNewReservations([]), []);

  return {
    isConnected,
    isAvailable,
    newOrders,
    orderUpdates,
    newReservations,
    deliveryUpdates,
    clearNewOrders,
    clearOrderUpdates,
    clearNewReservations,
    connect,
    disconnect,
  };
}

// Simpler hook just for new order notifications
export function useNewOrderNotifications(onNewOrder?: (order: OrderEvent) => void) {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [latestOrder, setLatestOrder] = useState<OrderEvent | null>(null);

  const { newOrders, isConnected, isAvailable, clearNewOrders } = useRealTime();

  useEffect(() => {
    if (newOrders.length > 0) {
      setNewOrderCount(prev => prev + newOrders.length); // eslint-disable-line react-hooks/set-state-in-effect
      setLatestOrder(newOrders[0]);
      onNewOrder?.(newOrders[0]);
    }
  }, [newOrders, onNewOrder]);

  const acknowledge = useCallback(() => {
    setNewOrderCount(0);
    clearNewOrders();
  }, [clearNewOrders]);

  return {
    newOrderCount,
    latestOrder,
    isConnected: isConnected && isAvailable,
    acknowledge,
  };
}

export default useRealTime;
