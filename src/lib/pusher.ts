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

// Channel names
export const CHANNELS = {
  ORDERS: (organizationId: string) => `orders-${organizationId}`,
  DELIVERIES: (organizationId: string) => `deliveries-${organizationId}`,
  KITCHEN: (restaurantId: string) => `kitchen-${restaurantId}`,
  DRIVER: (driverId: string) => `driver-${driverId}`,
  NOTIFICATIONS: (userId: string) => `notifications-${userId}`,
} as const;

// Event names
export const EVENTS = {
  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CANCELLED: 'order:cancelled',
  
  // Deliveries
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_STATUS_CHANGED: 'delivery:status_changed',
  DRIVER_LOCATION_UPDATED: 'driver:location_updated',
  
  // Kitchen
  KITCHEN_ORDER_NEW: 'kitchen:order_new',
  KITCHEN_ORDER_READY: 'kitchen:order_ready',
  
  // Notifications
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read',
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
      throw error;
    }
  },
};

// Export type for pusher instance
export type PusherInstance = typeof pusher;
