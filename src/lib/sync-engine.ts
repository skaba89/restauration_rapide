// ============================================
// Restaurant OS - Central Synchronization Engine
// Broadcasts real-time events to all roles:
// Admin, Cuisinier, Driver, Client, Page Publique
// ============================================

import { pusher } from '@/lib/pusher';

// Unified channel names (consistent with client-side use-pusher.ts)
export const SYNC_CHANNELS = {
  // Global order channel - all roles listen here
  ORDERS: (restaurantId: string) => `restaurant-${restaurantId}-orders`,
  // Individual order tracking - clients and drivers listen here
  ORDER_STATUS: (orderId: string) => `order-${orderId}-status`,
  // Kitchen display channel - cuisiniers listen here
  KITCHEN: (restaurantId: string) => `kitchen-${restaurantId}`,
  // Driver channel - individual driver gets delivery updates
  DRIVER: (driverId: string) => `driver-${driverId}`,
  // Notifications channel - per-user notifications
  USER_NOTIFICATIONS: (userId: string) => `user-${userId}-notifications`,
  // Public channel - public page and unauthenticated visitors
  PUBLIC: (restaurantId: string) => `public-${restaurantId}`,
} as const;

// Unified event types
export const SYNC_EVENTS = {
  // Order lifecycle events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CANCELLED: 'order:cancelled',
  ORDER_ASSIGNED_DRIVER: 'order:driver_assigned',

  // Kitchen events
  KITCHEN_NEW_ORDER: 'kitchen:new_order',
  KITCHEN_STATUS_CHANGED: 'kitchen:status_changed',
  KITCHEN_ITEM_READY: 'kitchen:item_ready',

  // Delivery events
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_STATUS_CHANGED: 'delivery:status_changed',
  DELIVERY_LOCATION_UPDATE: 'delivery:location_update',

  // Customer events
  CUSTOMER_ORDER_UPDATE: 'customer:order_update',

  // Driver events
  DRIVER_NEW_DELIVERY: 'driver:new_delivery',
  DRIVER_ORDER_READY: 'driver:order_ready',
} as const;

// Default restaurant ID for demo mode
const DEFAULT_RESTAURANT_ID = 'demo-rest-1';

/**
 * Broadcast order status change to ALL relevant channels
 * This is the main synchronization function that keeps all roles in sync.
 */
export async function broadcastOrderStatusChange(data: {
  orderId: string;
  orderNumber: string;
  restaurantId?: string;
  status: string;
  previousStatus?: string;
  customerName?: string;
  customerPhone?: string;
  driverId?: string;
  driverName?: string;
  orderType?: string;
  items?: Array<{ name: string; quantity: number }>;
  total?: number;
  notes?: string;
  updatedAt?: string;
}) {
  const restaurantId = data.restaurantId || DEFAULT_RESTAURANT_ID;

  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
    restaurantId,
  };

  // 1. Broadcast to global orders channel (admin + all roles)
  await pusher.trigger(
    SYNC_CHANNELS.ORDERS(restaurantId),
    SYNC_EVENTS.ORDER_STATUS_CHANGED,
    payload
  );

  // 2. Broadcast to individual order channel (client tracking page)
  await pusher.trigger(
    SYNC_CHANNELS.ORDER_STATUS(data.orderId),
    SYNC_EVENTS.ORDER_STATUS_CHANGED,
    payload
  );

  // 3. Broadcast to kitchen channel (cuisinier display)
  await pusher.trigger(
    SYNC_CHANNELS.KITCHEN(restaurantId),
    SYNC_EVENTS.KITCHEN_STATUS_CHANGED,
    payload
  );

  // 4. Broadcast to driver channel if driver is assigned
  if (data.driverId) {
    await pusher.trigger(
      SYNC_CHANNELS.DRIVER(data.driverId),
      SYNC_EVENTS.DRIVER_ORDER_READY,
      payload
    );
  }

  // 5. Broadcast to public channel
  await pusher.trigger(
    SYNC_CHANNELS.PUBLIC(restaurantId),
    SYNC_EVENTS.ORDER_UPDATED,
    payload
  );
}

/**
 * Broadcast new order to all relevant channels
 */
export async function broadcastNewOrder(data: {
  orderId: string;
  orderNumber: string;
  restaurantId?: string;
  customerName: string;
  customerPhone: string;
  orderType: string;
  items?: Array<{ name: string; quantity: number; unitPrice?: number }>;
  total?: number;
  deliveryAddress?: string;
  tableNumber?: string;
  notes?: string;
  priority?: string;
  estimatedTime?: number;
}) {
  const restaurantId = data.restaurantId || DEFAULT_RESTAURANT_ID;

  const payload = {
    ...data,
    status: 'PENDING',
    timestamp: new Date().toISOString(),
    restaurantId,
  };

  // 1. Global orders channel (admin sees it immediately)
  await pusher.trigger(
    SYNC_CHANNELS.ORDERS(restaurantId),
    SYNC_EVENTS.ORDER_CREATED,
    payload
  );

  // 2. Kitchen channel (cuisinier sees it immediately)
  await pusher.trigger(
    SYNC_CHANNELS.KITCHEN(restaurantId),
    SYNC_EVENTS.KITCHEN_NEW_ORDER,
    payload
  );

  // 3. Individual order channel (for client who just ordered)
  await pusher.trigger(
    SYNC_CHANNELS.ORDER_STATUS(data.orderId),
    SYNC_EVENTS.CUSTOMER_ORDER_UPDATE,
    payload
  );

  // 4. Public channel (live order count on landing page)
  await pusher.trigger(
    SYNC_CHANNELS.PUBLIC(restaurantId),
    SYNC_EVENTS.ORDER_CREATED,
    payload
  );
}

/**
 * Broadcast driver assignment
 */
export async function broadcastDriverAssignment(data: {
  orderId: string;
  orderNumber: string;
  restaurantId?: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  customerName?: string;
  deliveryAddress?: string;
  total?: number;
}) {
  const restaurantId = data.restaurantId || DEFAULT_RESTAURANT_ID;

  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
    restaurantId,
  };

  // 1. Orders channel (admin)
  await pusher.trigger(
    SYNC_CHANNELS.ORDERS(restaurantId),
    SYNC_EVENTS.ORDER_ASSIGNED_DRIVER,
    payload
  );

  // 2. Driver channel (driver sees new delivery)
  await pusher.trigger(
    SYNC_CHANNELS.DRIVER(data.driverId),
    SYNC_EVENTS.DRIVER_NEW_DELIVERY,
    payload
  );

  // 3. Order channel (client sees driver assigned)
  await pusher.trigger(
    SYNC_CHANNELS.ORDER_STATUS(data.orderId),
    SYNC_EVENTS.DELIVERY_ASSIGNED,
    payload
  );
}

/**
 * Broadcast order cancellation
 */
export async function broadcastOrderCancellation(data: {
  orderId: string;
  orderNumber: string;
  restaurantId?: string;
  customerName?: string;
  reason?: string;
}) {
  const restaurantId = data.restaurantId || DEFAULT_RESTAURANT_ID;

  const payload = {
    ...data,
    status: 'CANCELLED',
    timestamp: new Date().toISOString(),
    restaurantId,
  };

  // 1. Orders channel (admin)
  await pusher.trigger(
    SYNC_CHANNELS.ORDERS(restaurantId),
    SYNC_EVENTS.ORDER_CANCELLED,
    payload
  );

  // 2. Kitchen channel (cuisinier removes from display)
  await pusher.trigger(
    SYNC_CHANNELS.KITCHEN(restaurantId),
    SYNC_EVENTS.KITCHEN_STATUS_CHANGED,
    payload
  );

  // 3. Order channel (client sees cancellation)
  await pusher.trigger(
    SYNC_CHANNELS.ORDER_STATUS(data.orderId),
    SYNC_EVENTS.ORDER_CANCELLED,
    payload
  );
}

/**
 * Broadcast delivery location update (driver -> client tracking)
 */
export async function broadcastDeliveryLocation(data: {
  orderId: string;
  driverId: string;
  lat: number;
  lng: number;
  status?: string;
  etaMinutes?: number;
}) {
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  // Order channel (client tracking page sees driver movement)
  await pusher.trigger(
    SYNC_CHANNELS.ORDER_STATUS(data.orderId),
    SYNC_EVENTS.DELIVERY_LOCATION_UPDATE,
    payload
  );
}
