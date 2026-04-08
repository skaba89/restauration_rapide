// WebSocket server client for emitting events from API routes
// This allows the Next.js API to communicate with the WebSocket server

type SocketType = any;

let socket: SocketType | null = null;
let socketIO: typeof import('socket.io-client') | null = null;

// WebSocket server URL
const WS_URL = process.env.WEBSOCKET_URL || 'http://localhost:3003';

// Lazy load socket.io-client
async function getSocketIO() {
  if (!socketIO) {
    socketIO = await import('socket.io-client');
  }
  return socketIO;
}

// Get or create socket connection
async function getSocket(): Promise<SocketType | null> {
  if (!socket || !socket.connected) {
    try {
      const { io } = await getSocketIO();
      socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on('connect', () => {
        console.log('[WS Client] Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        console.log('[WS Client] Disconnected from WebSocket server');
      });

      socket.on('connect_error', (error: Error) => {
        console.error('[WS Client] Connection error:', error.message);
      });
    } catch (error) {
      console.error('[WS Client] Failed to load socket.io-client:', error);
      return null;
    }
  }

  return socket;
}

// Emit order created event
export async function emitOrderCreated(data: {
  orderId: string;
  orderNumber: string;
  organizationId: string;
  restaurantId: string;
  orderType: string;
  customerName: string;
  total: number;
  itemCount: number;
  tableNumber?: string;
  deliveryAddress?: string;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('order:created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('[WS Client] Emitted order:created:', data.orderNumber);
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit order:created:', error);
  }
}

// Emit order status update event
export async function emitOrderStatusUpdate(data: {
  orderId: string;
  orderNumber: string;
  organizationId: string;
  restaurantId: string;
  status: string;
  oldStatus?: string;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('order:updated', {
        ...data,
        timestamp: new Date(),
      });
      console.log('[WS Client] Emitted order:updated:', data.orderNumber, '->', data.status);
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit order:updated:', error);
  }
}

// Emit reservation created event
export async function emitReservationCreated(data: {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  guestName: string;
  partySize: number;
  date: string;
  time: string;
  phone: string;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('reservation:created', {
        ...data,
        timestamp: new Date(),
      });
      console.log('[WS Client] Emitted reservation:created:', data.reservationId);
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit reservation:created:', error);
  }
}

// Emit delivery status update
export async function emitDeliveryStatusUpdate(data: {
  deliveryId: string;
  orderId: string;
  organizationId: string;
  driverId?: string;
  status: string;
  lat?: number;
  lng?: number;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('delivery:status', {
        ...data,
        timestamp: new Date(),
      });
      console.log('[WS Client] Emitted delivery:status:', data.deliveryId, '->', data.status);
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit delivery:status:', error);
  }
}

// Emit driver location update
export async function emitDriverLocation(data: {
  driverId: string;
  organizationId: string;
  lat: number;
  lng: number;
  accuracy?: number;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('driver:location', {
        ...data,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit driver:location:', error);
  }
}

// Emit table status update
export async function emitTableStatusUpdate(data: {
  organizationId: string;
  restaurantId: string;
  tableId: string;
  status: string;
}) {
  try {
    const socket = await getSocket();
    if (socket) {
      socket.emit('table:updated', {
        ...data,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('[WS Client] Failed to emit table:updated:', error);
  }
}

// Export a function to disconnect the socket (useful for cleanup)
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
}

export default {
  emitOrderCreated,
  emitOrderStatusUpdate,
  emitReservationCreated,
  emitDeliveryStatusUpdate,
  emitDriverLocation,
  emitTableStatusUpdate,
  disconnectSocket,
};
