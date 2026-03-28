// WebSocket/Real-time exports
// This module provides real-time capabilities for Restaurant OS

// Context and Provider
export { SocketProvider, useSocket, useOrderEvents, useKitchenEvents, useDeliveryTracking, useDriverUpdates } from './context';

// Hooks
export {
  useToastNotifications,
  useAlertNotifications,
  useOrderNotifications,
  useReservationNotifications,
  useNotificationPermission,
  useRealTimeNotifications,
} from './hooks';

// Types
export type {
  ServerToClientEvents,
  ClientToServerEvents,
  SocketData,
  OrderNotification,
  OrderUpdateNotification,
  OrderStatusNotification,
  OrderCancelledNotification,
  ReservationNotification,
  ReservationUpdateNotification,
  ReservationReminderNotification,
  DeliveryAssignedNotification,
  DeliveryLocationUpdate,
  DeliveryStatusNotification,
  DriverStatusNotification,
  DriverLocationUpdate,
  TableStatusNotification,
  QRScanNotification,
  WaitlistNotification,
  KitchenOrderNotification,
  KitchenItemNotification,
  ToastNotification,
  AlertNotification,
  DriverLocationPayload,
  DriverStatusPayload,
  RejectOrderPayload,
  TableStatusPayload,
} from './types';

export { SocketRooms, SocketEvents } from './types';
