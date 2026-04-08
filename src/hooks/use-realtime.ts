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

// Lazy load socket.io-client
type SocketType = any;
let socketIO: typeof import('socket.io-client') | null = null;
let socketInstance: SocketType | null = null;

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
  const [newOrders, setNewOrders] = useState<OrderEvent[]>([]);
  const [orderUpdates, setOrderUpdates] = useState<OrderEvent[]>([]);
  const [newReservations, setNewReservations] = useState<ReservationEvent[]>([]);
  const [deliveryUpdates, setDeliveryUpdates] = useState<DeliveryEvent[]>([]);

  const hasJoinedRef = useRef(false);

  // Get or create socket
  const getSocket = useCallback(async () => {
    if (!socketInstance) {
      try {
        const { io } = await getSocketIO();
        const wsUrl = typeof window !== 'undefined' 
          ? (window as any).__WEBSOCKET_URL__ || 'http://localhost:3003'
          : 'http://localhost:3003';
        
        socketInstance = io(wsUrl, {
          path: '/',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('[RealTime] Connected:', socketInstance?.id);
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('[RealTime] Disconnected');
          setIsConnected(false);
          hasJoinedRef.current = false;
        });

        socketInstance.on('connect_error', (error: Error) => {
          console.error('[RealTime] Connection error:', error.message);
        });
      } catch (error) {
        console.error('[RealTime] Failed to load socket.io-client:', error);
        return null;
      }
    }
    return socketInstance;
  }, []);

  // Connect and join rooms
  const connect = useCallback(async () => {
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
    }
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;

    const setupSocket = async () => {
      await connect();
      const socket = await getSocket();
      
      if (!socket || !mounted) return;

      // Order created
      const handleOrderCreated = (data: OrderEvent) => {
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
        console.log('[RealTime] Order updated:', data.orderNumber, data.status);
        setOrderUpdates(prev => [data, ...prev]);
      };

      // Reservation created
      const handleReservationCreated = (data: ReservationEvent) => {
        console.log('[RealTime] New reservation:', data.reservationId);
        setNewReservations(prev => [data, ...prev]);
      };

      // Delivery status update
      const handleDeliveryUpdate = (data: DeliveryEvent) => {
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

  const { newOrders, isConnected, clearNewOrders } = useRealTime();

  useEffect(() => {
    if (newOrders.length > 0) {
      setNewOrderCount(prev => prev + newOrders.length);
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
    isConnected,
    acknowledge,
  };
}

export default useRealTime;
