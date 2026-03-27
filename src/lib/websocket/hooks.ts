'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSocket } from './context';
import {
  ToastNotification,
  AlertNotification,
  OrderNotification,
  ReservationNotification,
  SocketEvents,
} from './types';

// Toast notification state
interface ToastState {
  id: string;
  title: string;
  message: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration: number;
  timestamp: Date;
}

/**
 * Hook for displaying toast notifications from socket events
 */
export function useToastNotifications() {
  const { isConnected, subscribe } = useSocket();
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Add toast
  const addToast = useCallback((toast: Omit<ToastState, 'id' | 'timestamp'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newToast: ToastState = {
      ...toast,
      id,
      timestamp: new Date(),
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, []);

  // Remove toast
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Subscribe to toast events from socket
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('notification:toast', (data: ToastNotification) => {
      addToast({
        title: data.title,
        message: data.message,
        variant: data.variant,
        duration: data.duration || 5000,
      });
    });

    return unsubscribe;
  }, [isConnected, subscribe, addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts: () => setToasts([]),
  };
}

/**
 * Hook for alert notifications (more important than toasts)
 */
export function useAlertNotifications() {
  const { isConnected, subscribe } = useSocket();
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mark as read
  const markAsRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ) as AlertNotification[]
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setAlerts((prev) =>
      prev.map((a) => ({ ...a, read: true })) as AlertNotification[]
    );
    setUnreadCount(0);
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setUnreadCount(0);
  }, []);

  // Subscribe to alert events
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe('notification:alert', (data: AlertNotification) => {
      setAlerts((prev) => [{ ...data, read: false }, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show browser notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/favicon.ico',
          });
        }
      }
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  return {
    alerts,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAlerts,
  };
}

/**
 * Hook for real-time order updates in dashboard
 */
export function useOrderNotifications(restaurantId?: string) {
  const { isConnected, subscribe, joinRestaurant, leaveRestaurant } = useSocket();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore autoplay errors
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  // Acknowledge notification
  const acknowledge = useCallback((orderId: string) => {
    setNotifications((prev) => prev.filter((n) => n.orderId !== orderId));
    setNewOrderCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Clear all
  const clearAll = useCallback(() => {
    setNotifications([]);
    setNewOrderCount(0);
  }, []);

  // Subscribe to order events
  useEffect(() => {
    if (!isConnected) return;

    if (restaurantId) {
      joinRestaurant(restaurantId);
    }

    const unsubNew = subscribe('order:new', (data: OrderNotification) => {
      setNotifications((prev) => [data, ...prev]);
      setNewOrderCount((prev) => prev + 1);
      playSound();

      // Browser notification
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`Nouvelle commande #${data.orderNumber}`, {
            body: `${data.customerName} - ${data.itemCount} articles - ${data.total} FCFA`,
            icon: '/favicon.ico',
            tag: data.orderId,
          });
        }
      }
    });

    const unsubStatus = subscribe('order:status', (data) => {
      // Remove notification when order is acknowledged
      if (data.newStatus === 'CONFIRMED' || data.newStatus === 'PREPARING') {
        acknowledge(data.orderId);
      }
    });

    return () => {
      unsubNew();
      unsubStatus();
      if (restaurantId) {
        leaveRestaurant(restaurantId);
      }
    };
  }, [isConnected, restaurantId, subscribe, joinRestaurant, leaveRestaurant, playSound, acknowledge]);

  return {
    notifications,
    newOrderCount,
    acknowledge,
    clearAll,
    soundEnabled,
    setSoundEnabled,
  };
}

/**
 * Hook for reservation reminders
 */
export function useReservationNotifications(restaurantId?: string) {
  const { isConnected, subscribe, joinRestaurant, leaveRestaurant } = useSocket();
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationNotification[]>([]);

  useEffect(() => {
    if (!isConnected || !restaurantId) return;

    joinRestaurant(restaurantId);

    const unsubNew = subscribe('reservation:new', (data: ReservationNotification) => {
      setUpcomingReservations((prev) => [...prev, data]);
    });

    const unsubReminder = subscribe('reservation:reminder', (data) => {
      // Show browser notification for reminders
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`Rappel: Reservation ${data.guestName}`, {
            body: `${data.partySize} personnes dans ${data.minutesUntil} minutes`,
            icon: '/favicon.ico',
          });
        }
      }
    });

    return () => {
      unsubNew();
      unsubReminder();
      leaveRestaurant(restaurantId);
    };
  }, [isConnected, restaurantId, subscribe, joinRestaurant, leaveRestaurant]);

  return {
    upcomingReservations,
    clearReservation: (id: string) => {
      setUpcomingReservations((prev) => prev.filter((r) => r.reservationId !== id));
    },
  };
}

/**
 * Hook to request browser notification permission
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied' as NotificationPermission;
  }, []);

  return {
    permission,
    requestPermission,
    canNotify: permission === 'granted',
  };
}

/**
 * Hook for managing all real-time notifications
 */
export function useRealTimeNotifications(restaurantId?: string, organizationId?: string) {
  const toast = useToastNotifications();
  const alerts = useAlertNotifications();
  const orders = useOrderNotifications(restaurantId);
  const reservations = useReservationNotifications(restaurantId);
  const notificationPermission = useNotificationPermission();

  return {
    toast,
    alerts,
    orders,
    reservations,
    notificationPermission,
  };
}

export default useRealTimeNotifications;
