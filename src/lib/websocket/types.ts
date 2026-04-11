// Socket.io event types and interfaces

// Server to Client events
export type ServerToClientEvents = {
  // Order events
  'order:new': (data: OrderNotification) => void;
  'order:updated': (data: OrderUpdateNotification) => void;
  'order:status': (data: OrderStatusNotification) => void;
  'order:cancelled': (data: OrderCancelledNotification) => void;
  
  // Reservation events
  'reservation:new': (data: ReservationNotification) => void;
  'reservation:updated': (data: ReservationUpdateNotification) => void;
  'reservation:reminder': (data: ReservationReminderNotification) => void;
  
  // Delivery events
  'delivery:assigned': (data: DeliveryAssignedNotification) => void;
  'delivery:location': (data: DeliveryLocationUpdate) => void;
  'delivery:status': (data: DeliveryStatusNotification) => void;
  
  // Driver events
  'driver:status': (data: DriverStatusNotification) => void;
  'driver:location': (data: DriverLocationUpdate) => void;
  
  // Table events
  'table:status': (data: TableStatusNotification) => void;
  'table:qr-scan': (data: QRScanNotification) => void;
  
  // Waitlist events
  'waitlist:update': (data: WaitlistNotification) => void;
  
  // Kitchen events
  'kitchen:order': (data: KitchenOrderNotification) => void;
  'kitchen:item-ready': (data: KitchenItemNotification) => void;
  
  // General notifications
  'notification:toast': (data: ToastNotification) => void;
  'notification:alert': (data: AlertNotification) => void;
};

// Client to Server events
export type ClientToServerEvents = {
  // Room management
  'join:restaurant': (restaurantId: string) => void;
  'leave:restaurant': (restaurantId: string) => void;
  'join:organization': (organizationId: string) => void;
  'leave:organization': (organizationId: string) => void;
  'join:kitchen': (restaurantId: string) => void;
  'join:delivery': (organizationId: string) => void;
  
  // Driver events
  'driver:location': (data: DriverLocationPayload) => void;
  'driver:status': (data: DriverStatusPayload) => void;
  
  // Order events
  'order:accept': (orderId: string) => void;
  'order:reject': (data: RejectOrderPayload) => void;
  
  // Table events
  'table:status': (data: TableStatusPayload) => void;
};

// Inter-server events (for scaling)
export type InterServerEvents = {
  ping: () => void;
}

// Socket data
export interface SocketData {
  userId: string;
  organizationId?: string;
  restaurantId?: string;
  role: string;
  driverId?: string;
}

// ==================== Notification Interfaces ====================

interface BaseNotification {
  id: string;
  timestamp: Date;
  restaurantId?: string;
  organizationId?: string;
}

export interface OrderNotification extends BaseNotification {
  type: 'order:new';
  orderId: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'DRIVE_THRU';
  customerName: string;
  total: number;
  itemCount: number;
  tableNumber?: string;
  deliveryAddress?: string;
  priority: 'normal' | 'high' | 'urgent';
}

export interface OrderUpdateNotification extends BaseNotification {
  type: 'order:updated';
  orderId: string;
  orderNumber: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  updatedBy: string;
}

export interface OrderStatusNotification extends BaseNotification {
  type: 'order:status';
  orderId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  estimatedTime?: number;
}

export interface OrderCancelledNotification extends BaseNotification {
  type: 'order:cancelled';
  orderId: string;
  orderNumber: string;
  reason?: string;
  refunded: boolean;
}

export interface ReservationNotification extends BaseNotification {
  type: 'reservation:new';
  reservationId: string;
  guestName: string;
  partySize: number;
  date: string;
  time: string;
  phone: string;
  specialRequests?: string;
}

export interface ReservationUpdateNotification extends BaseNotification {
  type: 'reservation:updated';
  reservationId: string;
  guestName: string;
  changes: Record<string, { old: unknown; new: unknown }>;
}

export interface ReservationReminderNotification extends BaseNotification {
  type: 'reservation:reminder';
  reservationId: string;
  guestName: string;
  partySize: number;
  time: string;
  minutesUntil: number;
}

export interface DeliveryAssignedNotification extends BaseNotification {
  type: 'delivery:assigned';
  deliveryId: string;
  orderId: string;
  orderNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  estimatedPickup: number;
}

export interface DeliveryLocationUpdate extends BaseNotification {
  type: 'delivery:location';
  deliveryId: string;
  orderId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: Date;
}

export interface DeliveryStatusNotification extends BaseNotification {
  type: 'delivery:status';
  deliveryId: string;
  orderId: string;
  status: string;
  driverId?: string;
  driverName?: string;
}

export interface DriverStatusNotification extends BaseNotification {
  type: 'driver:status';
  driverId: string;
  driverName: string;
  status: 'online' | 'offline' | 'busy';
  isAvailable: boolean;
}

export interface DriverLocationUpdate extends BaseNotification {
  type: 'driver:location';
  driverId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  batteryLevel?: number;
}

export interface TableStatusNotification extends BaseNotification {
  type: 'table:status';
  tableId: string;
  tableNumber: string;
  oldStatus: string;
  newStatus: string;
  partySize?: number;
  serverName?: string;
}

export interface QRScanNotification extends BaseNotification {
  type: 'table:qr-scan';
  tableId: string;
  tableNumber: string;
  sessionId: string;
  customerId?: string;
}

export interface WaitlistNotification extends BaseNotification {
  type: 'waitlist:update';
  waitlistId: string;
  guestName: string;
  partySize: number;
  status: string;
  estimatedWait?: number;
  position?: number;
}

export interface KitchenOrderNotification extends BaseNotification {
  type: 'kitchen:order';
  orderId: string;
  orderNumber: string;
  orderType: string;
  items: KitchenOrderItem[];
  priority: 'normal' | 'high' | 'urgent';
  timer: number; // seconds since order placed
}

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  modifiers?: string[];
}

export interface KitchenItemNotification extends BaseNotification {
  type: 'kitchen:item-ready';
  orderId: string;
  orderNumber: string;
  itemId: string;
  itemName: string;
  quantity: number;
}

export interface ToastNotification extends BaseNotification {
  type: 'notification:toast';
  title: string;
  message: string;
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

export interface AlertNotification extends BaseNotification {
  type: 'notification:alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionLabel?: string;
}

// ==================== Payload Interfaces ====================

export interface DriverLocationPayload {
  lat: number;
  lng: number;
  accuracy?: number;
  batteryLevel?: number;
  speed?: number;
}

export interface DriverStatusPayload {
  status: 'online' | 'offline' | 'busy';
  isAvailable: boolean;
}

export interface RejectOrderPayload {
  orderId: string;
  reason: string;
}

export interface TableStatusPayload {
  tableId: string;
  status: string;
  partySize?: number;
}

// ==================== Socket Room Names ====================

export const SocketRooms = {
  restaurant: (id: string) => `restaurant:${id}`,
  organization: (id: string) => `organization:${id}`,
  kitchen: (restaurantId: string) => `kitchen:${restaurantId}`,
  delivery: (organizationId: string) => `delivery:${organizationId}`,
  driver: (driverId: string) => `driver:${driverId}`,
  user: (userId: string) => `user:${userId}`,
  admin: (organizationId: string) => `admin:${organizationId}`,
};

// ==================== Event Names (for non-TypeScript clients) ====================

export const SocketEvents = {
  // Server to Client
  ORDER_NEW: 'order:new',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS: 'order:status',
  ORDER_CANCELLED: 'order:cancelled',
  RESERVATION_NEW: 'reservation:new',
  RESERVATION_UPDATED: 'reservation:updated',
  RESERVATION_REMINDER: 'reservation:reminder',
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_LOCATION: 'delivery:location',
  DELIVERY_STATUS: 'delivery:status',
  DRIVER_STATUS: 'driver:status',
  DRIVER_LOCATION: 'driver:location',
  TABLE_STATUS: 'table:status',
  TABLE_QR_SCAN: 'table:qr-scan',
  WAITLIST_UPDATE: 'waitlist:update',
  KITCHEN_ORDER: 'kitchen:order',
  KITCHEN_ITEM_READY: 'kitchen:item-ready',
  NOTIFICATION_TOAST: 'notification:toast',
  NOTIFICATION_ALERT: 'notification:alert',
  
  // Client to Server
  JOIN_RESTAURANT: 'join:restaurant',
  LEAVE_RESTAURANT: 'leave:restaurant',
  JOIN_ORGANIZATION: 'join:organization',
  LEAVE_ORGANIZATION: 'leave:organization',
  JOIN_KITCHEN: 'join:kitchen',
  JOIN_DELIVERY: 'join:delivery',
};
