import { createServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

// Types
interface JoinData {
  organizationId: string;
  restaurantId?: string;
  role: 'admin' | 'manager' | 'staff' | 'driver' | 'customer';
  userId?: string;
}

interface OrderEvent {
  orderId: string;
  organizationId: string;
  restaurantId: string;
  status: string;
  orderNumber: string;
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

interface DriverLocation {
  driverId: string;
  organizationId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: Date;
}

interface ReservationEvent {
  reservationId: string;
  organizationId: string;
  restaurantId: string;
  status: string;
  timestamp: Date;
}

// Create HTTP server and Socket.io
const httpServer = createServer();
const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/',
});

// Connection tracking
const connectedUsers = new Map<string, { organizationId: string; role: string; userId?: string }>();
const driverSockets = new Map<string, string>(); // driverId -> socketId
const organizationRooms = new Map<string, Set<string>>(); // organizationId -> Set of socketIds

io.on('connection', (socket: Socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // ============================================
  // JOIN ROOMS
  // ============================================
  socket.on('join:organization', (data: JoinData) => {
    const { organizationId, restaurantId, role, userId } = data;

    // Store user info
    connectedUsers.set(socket.id, { organizationId, role, userId });

    // Join organization room
    socket.join(`org:${organizationId}`);

    // Track organization members
    if (!organizationRooms.has(organizationId)) {
      organizationRooms.set(organizationId, new Set());
    }
    organizationRooms.get(organizationId)!.add(socket.id);

    // Join role-specific room
    socket.join(`org:${organizationId}:${role}`);

    // Join restaurant-specific room if provided
    if (restaurantId) {
      socket.join(`org:${organizationId}:restaurant:${restaurantId}`);
      socket.join(`org:${organizationId}:restaurant:${restaurantId}:${role}`);
    }

    // Track driver socket
    if (role === 'driver' && userId) {
      driverSockets.set(userId, socket.id);
    }

    console.log(`[WS] ${socket.id} joined org:${organizationId} as ${role}`);
    socket.emit('joined', { organizationId, restaurantId, role });
  });

  // Customer tracking order
  socket.on('track:order', (data: { orderId: string }) => {
    socket.join(`order:${data.orderId}:tracking`);
    console.log(`[WS] ${socket.id} tracking order:${data.orderId}`);
  });

  // Customer tracking delivery
  socket.on('track:delivery', (data: { deliveryId: string }) => {
    socket.join(`delivery:${data.deliveryId}:tracking`);
    console.log(`[WS] ${socket.id} tracking delivery:${data.deliveryId}`);
  });

  // ============================================
  // ORDER EVENTS
  // ============================================
  socket.on('order:created', (data: OrderEvent) => {
    const { organizationId, restaurantId, orderId, orderNumber, status } = data;

    // Notify organization admins and managers
    io.to(`org:${organizationId}:admin`)
      .to(`org:${organizationId}:manager`)
      .emit('order:created', data);

    // Notify restaurant staff
    if (restaurantId) {
      io.to(`org:${organizationId}:restaurant:${restaurantId}:staff`)
        .emit('order:new', data);
    }

    // Notify available drivers if delivery
    io.to(`org:${organizationId}:driver`).emit('order:available', {
      orderId,
      orderNumber,
      timestamp: new Date(),
    });

    console.log(`[WS] Order created: ${orderNumber}`);
  });

  socket.on('order:updated', (data: OrderEvent) => {
    const { organizationId, restaurantId, orderId, status } = data;

    // Notify organization
    io.to(`org:${organizationId}`).emit('order:updated', data);

    // Notify customer tracking
    io.to(`order:${orderId}:tracking`).emit('order:status', {
      orderId,
      status,
      timestamp: new Date(),
    });

    console.log(`[WS] Order ${orderId} updated: ${status}`);
  });

  // ============================================
  // DELIVERY EVENTS
  // ============================================
  socket.on('delivery:assigned', (data: DeliveryEvent) => {
    const { deliveryId, organizationId, driverId } = data;

    // Notify the assigned driver
    if (driverId && driverSockets.has(driverId)) {
      const driverSocketId = driverSockets.get(driverId)!;
      io.to(driverSocketId).emit('delivery:assigned', data);
    }

    // Notify organization managers
    io.to(`org:${organizationId}:admin`)
      .to(`org:${organizationId}:manager`)
      .emit('delivery:assigned', data);

    console.log(`[WS] Delivery ${deliveryId} assigned to driver ${driverId}`);
  });

  socket.on('delivery:status', (data: DeliveryEvent) => {
    const { deliveryId, organizationId, status } = data;

    // Notify organization
    io.to(`org:${organizationId}`).emit('delivery:updated', data);

    // Notify customer tracking
    io.to(`delivery:${deliveryId}:tracking`).emit('delivery:status', {
      deliveryId,
      status,
      timestamp: new Date(),
    });

    console.log(`[WS] Delivery ${deliveryId} status: ${status}`);
  });

  // ============================================
  // DRIVER LOCATION
  // ============================================
  socket.on('driver:location', (data: DriverLocation) => {
    const { driverId, organizationId, lat, lng, accuracy } = data;

    // Broadcast to organization admins and managers
    io.to(`org:${organizationId}:admin`)
      .to(`org:${organizationId}:manager`)
      .emit('driver:location', {
        driverId,
        lat,
        lng,
        accuracy,
        timestamp: new Date(),
      });

    // Broadcast to customers tracking this driver's deliveries
    socket.broadcast.to(`driver:${driverId}:tracking`).emit('driver:location', {
      lat,
      lng,
      accuracy,
      timestamp: new Date(),
    });
  });

  // ============================================
  // RESERVATION EVENTS
  // ============================================
  socket.on('reservation:created', (data: ReservationEvent) => {
    const { organizationId, restaurantId } = data;

    // Notify organization
    io.to(`org:${organizationId}:admin`)
      .to(`org:${organizationId}:manager`)
      .emit('reservation:created', data);

    // Notify restaurant staff
    if (restaurantId) {
      io.to(`org:${organizationId}:restaurant:${restaurantId}:staff`)
        .emit('reservation:new', data);
    }

    console.log(`[WS] Reservation created: ${data.reservationId}`);
  });

  socket.on('reservation:updated', (data: ReservationEvent) => {
    const { organizationId, reservationId, status } = data;

    io.to(`org:${organizationId}`).emit('reservation:updated', data);

    console.log(`[WS] Reservation ${reservationId} updated: ${status}`);
  });

  // ============================================
  // TABLE EVENTS
  // ============================================
  socket.on('table:updated', (data: {
    organizationId: string;
    restaurantId: string;
    tableId: string;
    status: string;
  }) => {
    const { organizationId, restaurantId, tableId, status } = data;

    io.to(`org:${organizationId}:restaurant:${restaurantId}`)
      .emit('table:updated', { tableId, status, timestamp: new Date() });
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================
  socket.on('notification:send', (data: {
    userId?: string;
    organizationId?: string;
    title: string;
    message: string;
    type: string;
  }) => {
    if (data.userId) {
      // Find user's socket and send notification
      const userEntry = Array.from(connectedUsers.entries())
        .find(([_, info]) => info.userId === data.userId);
      
      if (userEntry) {
        io.to(userEntry[0]).emit('notification', data);
      }
    } else if (data.organizationId) {
      io.to(`org:${data.organizationId}`).emit('notification', data);
    }
  });

  // ============================================
  // KITCHEN DISPLAY SYSTEM
  // ============================================
  socket.on('kds:item_started', (data: {
    organizationId: string;
    restaurantId: string;
    orderId: string;
    itemId: string;
  }) => {
    io.to(`org:${data.organizationId}:restaurant:${data.restaurantId}:kitchen`)
      .emit('kds:update', { ...data, status: 'preparing', timestamp: new Date() });
  });

  socket.on('kds:item_completed', (data: {
    organizationId: string;
    restaurantId: string;
    orderId: string;
    itemId: string;
  }) => {
    io.to(`org:${data.organizationId}:restaurant:${data.restaurantId}:kitchen`)
      .emit('kds:update', { ...data, status: 'ready', timestamp: new Date() });
  });

  // ============================================
  // DISCONNECT
  // ============================================
  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);

    // Get user info
    const userInfo = connectedUsers.get(socket.id);
    
    if (userInfo) {
      // Remove from organization tracking
      const orgMembers = organizationRooms.get(userInfo.organizationId);
      if (orgMembers) {
        orgMembers.delete(socket.id);
        if (orgMembers.size === 0) {
          organizationRooms.delete(userInfo.organizationId);
        }
      }

      // Remove driver tracking
      if (userInfo.role === 'driver' && userInfo.userId) {
        driverSockets.delete(userInfo.userId);
      }

      connectedUsers.delete(socket.id);
    }
  });
});

// Start server
const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`[WS] Restaurant OS WebSocket server running on port ${PORT}`);
});

export { io };
