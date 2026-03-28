// Real-time Service Types for Restaurant OS

// ============================================
// Authentication & Connection Types
// ============================================

export interface AuthPayload {
  token: string;
  organizationId: string;
  restaurantId?: string;
  userId: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'manager' | 'cashier' | 'kitchen' | 'driver' | 'customer';

export interface SocketData {
  userId: string;
  organizationId: string;
  restaurantId?: string;
  role: UserRole;
  authenticated: boolean;
  connectedAt: Date;
  driverId?: string;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus = 'created' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface OrderCreatedEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  customerId?: string;
  type: 'dine-in' | 'takeout' | 'delivery';
  tableId?: string;
  items: OrderItemInfo[];
  total: number;
  notes?: string;
  timestamp: Date;
}

export interface OrderItemInfo {
  productId: string;
  name: string;
  quantity: number;
  notes?: string;
}

export interface OrderStatusUpdateEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  estimatedTime?: number; // in minutes
  customerId?: string;
  timestamp: Date;
  updatedBy: string;
}

export interface OrderModifiedEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  modifications: string[];
  customerId?: string;
  timestamp: Date;
}

// ============================================
// Delivery Types
// ============================================

export type DeliveryStatus = 'assigned' | 'picked_up' | 'in_transit' | 'arriving' | 'delivered' | 'failed';

export interface DriverLocation {
  driverId: string;
  organizationId: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface DeliveryAssignedEvent {
  deliveryId: string;
  organizationId: string;
  restaurantId: string;
  orderId: string;
  orderNumber: string;
  driverId: string;
  driverName: string;
  pickupAddress: AddressInfo;
  deliveryAddress: AddressInfo;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  timestamp: Date;
}

export interface AddressInfo {
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  instructions?: string;
}

export interface DeliveryStatusUpdateEvent {
  deliveryId: string;
  organizationId: string;
  orderId: string;
  orderNumber: string;
  driverId: string;
  previousStatus: DeliveryStatus;
  newStatus: DeliveryStatus;
  customerId?: string;
  lat?: number;
  lng?: number;
  timestamp: Date;
  notes?: string;
}

export interface DeliveryTrackingEvent {
  deliveryId: string;
  orderId: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  lat: number;
  lng: number;
  heading?: number;
  status: DeliveryStatus;
  estimatedArrival?: Date;
  timestamp: Date;
}

// ============================================
// Reservation Types
// ============================================

export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

export interface ReservationCreatedEvent {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string;
  tableName?: string;
  specialRequests?: string;
  timestamp: Date;
}

export interface ReservationStatusUpdateEvent {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  previousStatus: ReservationStatus;
  newStatus: ReservationStatus;
  customerId?: string;
  tableId?: string;
  timestamp: Date;
  updatedBy: string;
  notes?: string;
}

export interface ReservationModifiedEvent {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  customerId?: string;
  changes: string[];
  timestamp: Date;
}

// ============================================
// Table Types
// ============================================

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';

export interface TableStatusUpdateEvent {
  tableId: string;
  organizationId: string;
  restaurantId: string;
  tableName: string;
  tableNumber: number;
  previousStatus: TableStatus;
  newStatus: TableStatus;
  capacity: number;
  currentGuests?: number;
  orderId?: string;
  reservationId?: string;
  timestamp: Date;
  updatedBy: string;
}

export interface TableAssignedEvent {
  tableId: string;
  organizationId: string;
  restaurantId: string;
  tableName: string;
  tableNumber: number;
  orderId: string;
  orderNumber: string;
  guestCount: number;
  timestamp: Date;
}

// ============================================
// Kitchen Display Types
// ============================================

export type KitchenOrderPriority = 'normal' | 'high' | 'urgent';

export interface KitchenOrderEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  orderType: 'dine-in' | 'takeout' | 'delivery';
  tableNumber?: number;
  tableName?: string;
  items: KitchenOrderItem[];
  priority: KitchenOrderPriority;
  estimatedPrepTime?: number;
  notes?: string;
  createdAt: Date;
  timestamp: Date;
}

export interface KitchenOrderItem {
  productId: string;
  name: string;
  quantity: number;
  category?: string;
  modifications?: string[];
  notes?: string;
  ready?: boolean;
}

export interface KitchenOrderItemReadyEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  productId: string;
  productName: string;
  quantity: number;
  timestamp: Date;
}

export interface KitchenOrderCompleteEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  orderNumber: string;
  completedAt: Date;
  timestamp: Date;
}

// ============================================
// Room Management Types
// ============================================

export interface RoomInfo {
  type: 'organization' | 'restaurant' | 'order' | 'delivery' | 'driver' | 'table' | 'kitchen' | 'customer';
  id: string;
  organizationId: string;
  restaurantId?: string;
}

// Room name generators
export const RoomNames = {
  organization: (orgId: string) => `org:${orgId}`,
  restaurant: (orgId: string, restId: string) => `org:${orgId}:restaurant:${restId}`,
  role: (orgId: string, role: UserRole) => `org:${orgId}:role:${role}`,
  order: (orderId: string) => `order:${orderId}`,
  orderCustomer: (orderId: string) => `order:${orderId}:customer`,
  delivery: (deliveryId: string) => `delivery:${deliveryId}`,
  deliveryTracking: (deliveryId: string) => `delivery:${deliveryId}:tracking`,
  driver: (driverId: string) => `driver:${driverId}`,
  driverOrganization: (orgId: string) => `org:${orgId}:drivers`,
  table: (tableId: string) => `table:${tableId}`,
  kitchen: (orgId: string, restId: string) => `kitchen:${orgId}:${restId}`,
  customer: (customerId: string) => `customer:${customerId}`,
  reservation: (reservationId: string) => `reservation:${reservationId}`,
};

// ============================================
// Event Names
// ============================================

export const EventNames = {
  // Connection events
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'auth:error',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_MODIFIED: 'order:modified',
  
  // Delivery events
  DRIVER_LOCATION: 'driver:location',
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_STATUS_CHANGED: 'delivery:status',
  DELIVERY_TRACKING: 'delivery:tracking',
  
  // Reservation events
  RESERVATION_CREATED: 'reservation:created',
  RESERVATION_UPDATED: 'reservation:updated',
  RESERVATION_STATUS_CHANGED: 'reservation:status',
  RESERVATION_CANCELLED: 'reservation:cancelled',
  
  // Table events
  TABLE_STATUS_CHANGED: 'table:status',
  TABLE_ASSIGNED: 'table:assigned',
  TABLE_RELEASED: 'table:released',
  
  // Kitchen events
  KITCHEN_NEW_ORDER: 'kitchen:new-order',
  KITCHEN_ORDER_UPDATED: 'kitchen:order-updated',
  KITCHEN_ITEM_READY: 'kitchen:item-ready',
  KITCHEN_ORDER_COMPLETE: 'kitchen:order-complete',
  
  // Room management
  JOIN_ORGANIZATION: 'join:organization',
  JOIN_RESTAURANT: 'join:restaurant',
  JOIN_ORDER: 'join:order',
  JOIN_DELIVERY: 'join:delivery',
  JOIN_DRIVER: 'join:driver',
  JOIN_KITCHEN: 'join:kitchen',
  JOIN_CUSTOMER: 'join:customer',
  
  JOINED: 'joined',
  ERROR: 'error',
  
  // Tracking
  TRACK_ORDER: 'track:order',
  TRACK_DELIVERY: 'track:delivery',
  
  // Heartbeat
  PING: 'ping',
  PONG: 'pong',
};
