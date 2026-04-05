// Pusher Configuration for Real-time Features
// Free tier: 200k messages/day, 100 concurrent connections

import Pusher from 'pusher';

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID || '',
  key: process.env.PUSHER_KEY || '',
  secret: process.env.PUSHER_SECRET || '',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
  useTLS: true,
});

// Channel names for Restaurant OS
export const CHANNELS = {
  // Order updates
  ORDERS: (restaurantId: string) => `restaurant-${restaurantId}-orders`,
  ORDER_STATUS: (orderId: string) => `order-${orderId}-status`,
  
  // Delivery tracking
  DELIVERY: (deliveryId: string) => `delivery-${deliveryId}`,
  DRIVER_LOCATION: (driverId: string) => `driver-${driverId}-location`,
  
  // Kitchen display
  KITCHEN: (restaurantId: string) => `kitchen-${restaurantId}`,
  
  // Reservations
  RESERVATIONS: (restaurantId: string) => `restaurant-${restaurantId}-reservations`,
  
  // Notifications
  USER_NOTIFICATIONS: (userId: string) => `user-${userId}-notifications`,
} as const;

// Event types
export const EVENTS = {
  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CANCELLED: 'order:cancelled',
  
  // Delivery
  DRIVER_ASSIGNED: 'delivery:driver_assigned',
  DRIVER_LOCATION_UPDATE: 'delivery:location_update',
  DELIVERY_STATUS_CHANGED: 'delivery:status_changed',
  
  // Kitchen
  NEW_ORDER_ITEM: 'kitchen:new_item',
  ITEM_READY: 'kitchen:item_ready',
  
  // Reservations
  RESERVATION_CREATED: 'reservation:created',
  RESERVATION_UPDATED: 'reservation:updated',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
} as const;

// Helper function to trigger events
export async function triggerEvent(
  channel: string,
  event: string,
  data: unknown
) {
  try {
    await pusher.trigger(channel, event, data);
    return { success: true };
  } catch (error) {
    console.error('Pusher trigger error:', error);
    return { success: false, error };
  }
}
