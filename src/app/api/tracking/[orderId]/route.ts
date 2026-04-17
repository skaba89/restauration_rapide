// Order Tracking API - Real-time order status and delivery GPS tracking
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/tracking/[orderId] - Get order tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  return withErrorHandler(async () => {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);

    // Fetch real order data - try by ID first, then by orderNumber
    try {
      let order = await db.order.findUnique({
        where: { id: orderId },
        include: {
          restaurant: {
            select: {
              name: true,
              address: true,
              phone: true,
              latitude: true,
              longitude: true,
            },
          },
          items: {
            select: {
              itemName: true,
              quantity: true,
            },
          },
          delivery: {
            include: {
              driver: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  avatar: true,
                  vehicleType: true,
                  rating: true,
                  currentLat: true,
                  currentLng: true,
                  lastLocationAt: true,
                },
              },
              trackingEvents: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          payments: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
      
      // If not found by ID, try by orderNumber
      if (!order) {
        order = await db.order.findFirst({
          where: { 
            OR: [
              { orderNumber: orderId },
              { orderNumber: { equals: orderId.toUpperCase() } },
              { orderNumber: { equals: orderId.toUpperCase().replace('ORD-', 'FAC-') } },
              { orderNumber: { equals: orderId.toUpperCase().replace('FAC-', 'ORD-') } },
            ]
          },
          include: {
            restaurant: {
              select: {
                name: true,
                address: true,
                phone: true,
                latitude: true,
                longitude: true,
              },
            },
            items: {
              select: {
                itemName: true,
                quantity: true,
              },
            },
            delivery: {
              include: {
                driver: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    avatar: true,
                    vehicleType: true,
                    rating: true,
                    currentLat: true,
                    currentLng: true,
                    lastLocationAt: true,
                  },
                },
                trackingEvents: {
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
            payments: true,
            statusHistory: {
              orderBy: { createdAt: 'asc' },
            },
          },
        });
      }

      if (!order) {
        return apiError('Commande non trouvée', 404);
      }

      // Transform data for tracking response
      const tracking = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusHistory: order.statusHistory.map(h => ({
          status: h.status,
          timestamp: h.createdAt,
          note: h.notes,
        })),
        estimatedReadyTime: order.readyAt || new Date(Date.now() + 15 * 60000),
        estimatedDeliveryTime: order.delivery?.deliveredAt || null,
        restaurant: {
          name: order.restaurant.name,
          address: order.restaurant.address,
          phone: order.restaurant.phone,
          coordinates: {
            lat: order.restaurant.latitude,
            lng: order.restaurant.longitude,
          },
        },
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
          address: order.deliveryAddress,
        },
        delivery: order.delivery ? {
          status: order.delivery.status,
          driver: order.delivery.driver ? {
            id: order.delivery.driver.id,
            name: `${order.delivery.driver.firstName} ${order.delivery.driver.lastName}`,
            phone: order.delivery.driver.phone,
            avatar: order.delivery.driver.avatar,
            vehicleType: order.delivery.driver.vehicleType,
            rating: order.delivery.driver.rating,
          } : null,
          currentLocation: order.delivery.driver?.currentLat ? {
            lat: order.delivery.driver.currentLat,
            lng: order.delivery.driver.currentLng,
          } : null,
          lastLocationUpdate: order.delivery.driver?.lastLocationAt,
          distanceRemaining: order.delivery.distance,
          timeRemaining: order.delivery.estimatedTime,
          pickupLocation: {
            lat: order.delivery.pickupLat,
            lng: order.delivery.pickupLng,
            address: order.delivery.pickupAddress,
          },
          dropoffLocation: {
            lat: order.delivery.dropoffLat,
            lng: order.delivery.dropoffLng,
            address: order.delivery.dropoffAddress,
          },
          trackingEvents: order.delivery.trackingEvents.map(e => ({
            event: e.event,
            timestamp: e.createdAt,
            note: e.notes,
          })),
        } : null,
        items: order.items.map(i => ({
          name: i.itemName,
          quantity: i.quantity,
        })),
        total: order.total,
        paymentMethod: order.payments?.[0]?.method || 'CASH',
        paymentStatus: order.paymentStatus,
      };

      return apiSuccess(tracking);
    } catch (error) {
      return apiSuccess([]);
    }
  });
}