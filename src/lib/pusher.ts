// ============================================
// Restaurant OS - Pusher Real-time Service
// WebSocket integration for real-time updates
// ============================================

// Pusher configuration
const PUSHER_APP_ID = process.env.PUSHER_APP_ID;
const PUSHER_KEY = process.env.PUSHER_KEY;
const PUSHER_SECRET = process.env.PUSHER_SECRET;
const PUSHER_CLUSTER = process.env.PUSHER_CLUSTER || 'eu';

// Check if Pusher is configured
const isPusherConfigured = PUSHER_APP_ID && PUSHER_KEY && PUSHER_SECRET;

// Lazy-loaded Pusher instance
let _pusher: InstanceType<typeof import('pusher').default> | null = null;

/**
 * Get Pusher instance (lazy load)
 */
async function getPusherInstance() {
  if (!isPusherConfigured) {
    return null;
  }
  
  if (!_pusher) {
    try {
      const Pusher = (await import('pusher')).default;
      _pusher = new Pusher({
        appId: PUSHER_APP_ID!,
        key: PUSHER_KEY!,
        secret: PUSHER_SECRET!,
        cluster: PUSHER_CLUSTER,
        useTLS: true,
      });
    } catch (error) {
      console.warn('Pusher not available:', error);
      return null;
    }
  }
  
  return _pusher;
}

// Channel names (must match pusher-server.ts and use-pusher.ts conventions)
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

// Event names (must match pusher-server.ts and use-pusher.ts conventions)
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

/**
 * Mock pusher for development
 */
const mockPusher = {
  trigger: async (channel: string, event: string, data: unknown) => {
    console.log(`[Mock Pusher] Channel: ${channel}, Event: ${event}`, data);
    return { success: true };
  },
};

/**
 * Pusher wrapper with fallback
 */
export const pusher = {
  async trigger(channel: string, event: string, data: unknown) {
    const instance = await getPusherInstance();
    
    if (!instance) {
      return mockPusher.trigger(channel, event, data);
    }
    
    try {
      await instance.trigger(channel, event, data);
      return { success: true };
    } catch (error) {
      console.error('Pusher trigger error:', error);
      return { success: false, error };
    }
  },
  
  // Trigger to multiple channels
  async triggerToChannels(channels: string[], event: string, data: unknown) {
    const instance = await getPusherInstance();
    
    if (!instance) {
      for (const channel of channels) {
        await mockPusher.trigger(channel, event, data);
      }
      return { success: true };
    }
    
    try {
      await instance.trigger(channels, event, data);
      return { success: true };
    } catch (error) {
      console.error('Pusher multi-trigger error:', error);
      return { success: false, error };
    }
  },
  
  // Authentication for private channels
  async authenticate(socketId: string, channel: string, userId?: string) {
    const instance = await getPusherInstance();
    
    if (!instance) {
      return { auth: 'mock-auth-token' };
    }
    
    try {
      const auth = instance.authenticate(socketId, channel);
      return auth;
    } catch (error) {
      console.error('Pusher auth error:', error);
      throw new Error(error instanceof Error ? error.message : 'Pusher error');
    }
  },
};

// Export type for pusher instance
export type PusherInstance = typeof pusher;
