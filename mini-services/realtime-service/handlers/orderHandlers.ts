// Order Event Handlers for Restaurant OS Real-time Service

import { Server, Socket } from 'socket.io';
import {
  OrderStatus,
  OrderCreatedEvent,
  OrderStatusUpdateEvent,
  OrderModifiedEvent,
  EventNames,
  RoomNames,
  SocketData,
} from '../types';

// Store order status for quick lookup
const orderStatusMap = new Map<string, OrderStatus>();

// Store order to customer mapping
const orderCustomerMap = new Map<string, string>();

// Store order to restaurant mapping
const orderRestaurantMap = new Map<string, { organizationId: string; restaurantId: string }>();

/**
 * Register order event handlers
 */
export function registerOrderHandlers(io: Server, socket: Socket) {
  const socketData = socket.data as SocketData;

  // ============================================
  // Order Created Event
  // ============================================
  socket.on(EventNames.ORDER_CREATED, (data: OrderCreatedEvent) => {
    console.log(`[Order] Order created: ${data.orderId} - ${data.orderNumber}`);

    // Store order metadata
    orderStatusMap.set(data.orderId, 'created');
    orderRestaurantMap.set(data.orderId, {
      organizationId: data.organizationId,
      restaurantId: data.restaurantId,
    });

    if (data.customerId) {
      orderCustomerMap.set(data.orderId, data.customerId);
    }

    // Emit to organization-wide room
    io.to(RoomNames.organization(data.organizationId)).emit(EventNames.ORDER_CREATED, data);

    // Emit to restaurant-specific room
    io.to(RoomNames.restaurant(data.organizationId, data.restaurantId)).emit(EventNames.ORDER_CREATED, data);

    // Emit to kitchen display for this restaurant
    io.to(RoomNames.kitchen(data.organizationId, data.restaurantId)).emit(EventNames.KITCHEN_NEW_ORDER, {
      orderId: data.orderId,
      organizationId: data.organizationId,
      restaurantId: data.restaurantId,
      orderNumber: data.orderNumber,
      orderType: data.type,
      tableNumber: data.tableId ? undefined : undefined, // Would lookup table number
      tableName: undefined,
      items: data.items.map(item => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        notes: item.notes,
        ready: false,
      })),
      priority: 'normal' as const,
      notes: data.notes,
      createdAt: data.timestamp,
      timestamp: new Date(),
    });

    // Emit to customer if they're connected
    if (data.customerId) {
      io.to(RoomNames.customer(data.customerId)).emit(EventNames.ORDER_CREATED, data);
    }

    // If delivery order, notify available drivers
    if (data.type === 'delivery') {
      io.to(RoomNames.driverOrganization(data.organizationId)).emit('order:new-delivery', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        organizationId: data.organizationId,
        restaurantId: data.restaurantId,
        timestamp: data.timestamp,
      });
    }
  });

  // ============================================
  // Order Status Update Event
  // ============================================
  socket.on(EventNames.ORDER_STATUS_CHANGED, (data: OrderStatusUpdateEvent) => {
    console.log(`[Order] Status update: ${data.orderId} - ${data.previousStatus} -> ${data.newStatus}`);

    // Update stored status
    orderStatusMap.set(data.orderId, data.newStatus);

    // Emit to organization-wide room
    io.to(RoomNames.organization(data.organizationId)).emit(EventNames.ORDER_STATUS_CHANGED, data);

    // Emit to restaurant-specific room
    io.to(RoomNames.restaurant(data.organizationId, data.restaurantId)).emit(EventNames.ORDER_STATUS_CHANGED, data);

    // Emit to order-specific room (for real-time tracking)
    io.to(RoomNames.order(data.orderId)).emit(EventNames.ORDER_STATUS_CHANGED, data);

    // Emit to customer-specific room
    if (data.customerId) {
      io.to(RoomNames.customer(data.customerId)).emit(EventNames.ORDER_STATUS_CHANGED, data);
    }

    // Notify kitchen when order status changes
    if (data.newStatus === 'preparing') {
      io.to(RoomNames.kitchen(data.organizationId, data.restaurantId)).emit(EventNames.KITCHEN_ORDER_UPDATED, {
        orderId: data.orderId,
        status: data.newStatus,
        estimatedTime: data.estimatedTime,
      });
    }

    // When order is ready, notify relevant parties
    if (data.newStatus === 'ready') {
      // Notify customer
      io.to(RoomNames.orderCustomer(data.orderId)).emit('order:ready', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        timestamp: new Date(),
      });

      // For takeout/delivery, notify customer directly
      if (data.customerId) {
        io.to(RoomNames.customer(data.customerId)).emit('order:ready', {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          timestamp: new Date(),
        });
      }
    }

    // When order is delivered
    if (data.newStatus === 'delivered') {
      io.to(RoomNames.orderCustomer(data.orderId)).emit('order:delivered', {
        orderId: data.orderId,
        orderNumber: data.orderNumber,
        timestamp: new Date(),
      });

      // Cleanup maps after delivery
      setTimeout(() => {
        orderStatusMap.delete(data.orderId);
        orderCustomerMap.delete(data.orderId);
        orderRestaurantMap.delete(data.orderId);
      }, 3600000); // Cleanup after 1 hour
    }

    // When order is cancelled
    if (data.newStatus === 'cancelled') {
      io.to(RoomNames.order(data.orderId)).emit(EventNames.ORDER_CANCELLED, data);
      
      if (data.customerId) {
        io.to(RoomNames.customer(data.customerId)).emit(EventNames.ORDER_CANCELLED, data);
      }
    }
  });

  // ============================================
  // Order Modified Event
  // ============================================
  socket.on(EventNames.ORDER_MODIFIED, (data: OrderModifiedEvent) => {
    console.log(`[Order] Order modified: ${data.orderId} - Changes: ${data.changes.join(', ')}`);

    // Emit to order room
    io.to(RoomNames.order(data.orderId)).emit(EventNames.ORDER_MODIFIED, data);

    // Emit to kitchen
    const restaurantInfo = orderRestaurantMap.get(data.orderId);
    if (restaurantInfo) {
      io.to(RoomNames.kitchen(restaurantInfo.organizationId, restaurantInfo.restaurantId))
        .emit(EventNames.KITCHEN_ORDER_UPDATED, {
          orderId: data.orderId,
          modifications: data.changes,
          timestamp: data.timestamp,
        });
    }

    // Notify customer
    if (data.customerId) {
      io.to(RoomNames.customer(data.customerId)).emit(EventNames.ORDER_MODIFIED, data);
    }
  });

  // ============================================
  // Join Order Room (for tracking)
  // ============================================
  socket.on(EventNames.TRACK_ORDER, (data: { orderId: string }) => {
    console.log(`[Order] Client ${socket.id} tracking order: ${data.orderId}`);

    socket.join(RoomNames.order(data.orderId));
    socket.join(RoomNames.orderCustomer(data.orderId));

    // Send current status if available
    const currentStatus = orderStatusMap.get(data.orderId);
    if (currentStatus) {
      socket.emit(EventNames.ORDER_STATUS_CHANGED, {
        orderId: data.orderId,
        newStatus: currentStatus,
        timestamp: new Date(),
      });
    }
  });

  // ============================================
  // Leave Order Room
  // ============================================
  socket.on('leave:order', (data: { orderId: string }) => {
    socket.leave(RoomNames.order(data.orderId));
    socket.leave(RoomNames.orderCustomer(data.orderId));
  });
}

/**
 * Get current order status
 */
export function getOrderStatus(orderId: string): OrderStatus | undefined {
  return orderStatusMap.get(orderId);
}

/**
 * Get order customer ID
 */
export function getOrderCustomer(orderId: string): string | undefined {
  return orderCustomerMap.get(orderId);
}

/**
 * Get order restaurant info
 */
export function getOrderRestaurant(orderId: string): { organizationId: string; restaurantId: string } | undefined {
  return orderRestaurantMap.get(orderId);
}

/**
 * Broadcast order update to all relevant rooms
 */
export function broadcastOrderUpdate(
  io: Server,
  orderId: string,
  event: string,
  data: any
) {
  const restaurantInfo = orderRestaurantMap.get(orderId);
  if (!restaurantInfo) return;

  // Emit to all relevant rooms
  io.to(RoomNames.order(orderId)).emit(event, data);
  io.to(RoomNames.organization(restaurantInfo.organizationId)).emit(event, data);

  const customerId = orderCustomerMap.get(orderId);
  if (customerId) {
    io.to(RoomNames.customer(customerId)).emit(event, data);
  }
}

/**
 * Cleanup order data
 */
export function cleanupOrder(orderId: string) {
  orderStatusMap.delete(orderId);
  orderCustomerMap.delete(orderId);
  orderRestaurantMap.delete(orderId);
}
