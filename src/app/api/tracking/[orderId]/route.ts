// Order Tracking API - Real-time order status and delivery GPS tracking
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// Demo tracking data
const DEMO_TRACKING: Record<string, any> = {
  'demo-ord-1': {
    orderId: 'demo-ord-1',
    orderNumber: 'ORD-2024-0145',
    status: 'PREPARING',
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 15 * 60000), note: 'Commande reçue' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 14 * 60000), note: 'Commande confirmée' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 10 * 60000), note: 'En préparation' },
    ],
    estimatedReadyTime: new Date(Date.now() + 10 * 60000),
    estimatedDeliveryTime: null,
    restaurant: {
      name: 'KFM DELICE',
      address: 'Conakry, Kaloum',
      phone: '+224 622 12 34 56',
      coordinates: { lat: 9.6412, lng: -13.5784 },
    },
    customer: {
      name: 'Amadou Diallo',
      phone: '+224 622 12 34 57',
    },
    delivery: null,
    items: [
      { name: 'Thiéboudienne', quantity: 2 },
      { name: 'Jus de Bissap', quantity: 2 },
    ],
    total: 15000,
    paymentMethod: 'Orange Money',
    paymentStatus: 'PAID',
  },
  'demo-ord-2': {
    orderId: 'demo-ord-2',
    orderNumber: 'ORD-2024-0144',
    status: 'OUT_FOR_DELIVERY',
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 45 * 60000), note: 'Commande reçue' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 44 * 60000), note: 'Commande confirmée' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 40 * 60000), note: 'En préparation' },
      { status: 'READY', timestamp: new Date(Date.now() - 15 * 60000), note: 'Commande prête' },
      { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 10 * 60000), note: 'En livraison' },
    ],
    estimatedReadyTime: new Date(Date.now() - 15 * 60000),
    estimatedDeliveryTime: new Date(Date.now() + 5 * 60000),
    restaurant: {
      name: 'KFM DELICE',
      address: 'Conakry, Kaloum',
      phone: '+224 622 12 34 56',
      coordinates: { lat: 9.6412, lng: -13.5784 },
    },
    customer: {
      name: 'Fatou Sylla',
      phone: '+224 622 65 43 21',
      address: 'Conakry, Dixinn',
    },
    delivery: {
      status: 'IN_TRANSIT',
      driver: {
        id: 'driver-1',
        name: 'Mamadou Touré',
        phone: '+224 622 11 11 11',
        avatar: null,
        vehicleType: 'motorcycle',
        rating: 4.8,
      },
      currentLocation: { lat: 9.6350, lng: -13.5850 },
      lastLocationUpdate: new Date(Date.now() - 1 * 60000),
      distanceRemaining: 2.5,
      timeRemaining: 5,
      pickupLocation: { lat: 9.6412, lng: -13.5784, address: 'Conakry, Kaloum' },
      dropoffLocation: { lat: 9.6289, lng: -13.5956, address: 'Conakry, Dixinn' },
      trackingEvents: [
        { event: 'DRIVER_ASSIGNED', timestamp: new Date(Date.now() - 12 * 60000), note: 'Livreur assigné' },
        { event: 'DRIVER_ARRIVED', timestamp: new Date(Date.now() - 10 * 60000), note: 'Livreur arrivé au restaurant' },
        { event: 'PICKED_UP', timestamp: new Date(Date.now() - 8 * 60000), note: 'Commande récupérée' },
        { event: 'IN_TRANSIT', timestamp: new Date(Date.now() - 8 * 60000), note: 'En route' },
      ],
    },
    items: [
      { name: 'Yassa Poulet', quantity: 1 },
      { name: 'Attiéké', quantity: 2 },
    ],
    total: 12500,
    paymentMethod: 'MTN MoMo',
    paymentStatus: 'PAID',
  },
  'demo-ord-3': {
    orderId: 'demo-ord-3',
    orderNumber: 'ORD-2024-0143',
    status: 'DELIVERED',
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 90 * 60000), note: 'Commande reçue' },
      { status: 'CONFIRMED', timestamp: new Date(Date.now() - 89 * 60000), note: 'Commande confirmée' },
      { status: 'PREPARING', timestamp: new Date(Date.now() - 85 * 60000), note: 'En préparation' },
      { status: 'READY', timestamp: new Date(Date.now() - 60 * 60000), note: 'Commande prête' },
      { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 55 * 60000), note: 'En livraison' },
      { status: 'DELIVERED', timestamp: new Date(Date.now() - 30 * 60000), note: 'Livrée' },
    ],
    estimatedReadyTime: new Date(Date.now() - 60 * 60000),
    estimatedDeliveryTime: new Date(Date.now() - 30 * 60000),
    restaurant: {
      name: 'KFM DELICE',
      address: 'Conakry, Kaloum',
      phone: '+224 622 12 34 56',
      coordinates: { lat: 9.6412, lng: -13.5784 },
    },
    customer: {
      name: 'Ibrahima Keita',
      phone: '+224 622 11 12 22',
    },
    delivery: {
      status: 'DELIVERED',
      driver: {
        id: 'driver-2',
        name: 'Fatou Sow',
        phone: '+224 622 22 22 22',
        avatar: null,
        vehicleType: 'motorcycle',
        rating: 4.6,
      },
      deliveredAt: new Date(Date.now() - 30 * 60000),
      deliveryProof: {
        type: 'signature',
        timestamp: new Date(Date.now() - 30 * 60000),
      },
    },
    items: [
      { name: 'Kedjenou', quantity: 2 },
      { name: 'Alloco', quantity: 3 },
    ],
    total: 18500,
    paymentMethod: 'Cash',
    paymentStatus: 'PAID',
  },
};

// GET /api/tracking/[orderId] - Get order tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  return withErrorHandler(async () => {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const demo = searchParams.get('demo');

    // Return demo data for demo mode or if orderId starts with 'demo'
    if (demo === 'true' || orderId.startsWith('demo')) {
      const tracking = DEMO_TRACKING[orderId];
      
      if (!tracking) {
        // Generate a generic tracking response for any demo order
        const genericTracking = {
          orderId,
          orderNumber: orderId.replace('demo-ord-', 'ORD-2024-'),
          status: 'CONFIRMED',
          statusHistory: [
            { status: 'PENDING', timestamp: new Date(Date.now() - 10 * 60000), note: 'Commande reçue' },
            { status: 'CONFIRMED', timestamp: new Date(Date.now() - 9 * 60000), note: 'Commande confirmée' },
          ],
          estimatedReadyTime: new Date(Date.now() + 15 * 60000),
          estimatedDeliveryTime: null,
          restaurant: {
            name: 'KFM DELICE',
            address: 'Conakry, Kaloum',
            phone: '+224 622 12 34 56',
            coordinates: { lat: 9.6412, lng: -13.5784 },
          },
          customer: {
            name: 'Client',
            phone: '+224 6XX XXX XXX',
          },
          delivery: null,
          items: [],
          total: 0,
          paymentMethod: 'Orange Money',
          paymentStatus: 'PAID',
        };
        
        return apiSuccess(genericTracking);
      }
      
      return apiSuccess(tracking);
    }

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
      // Fallback to demo data
      return apiSuccess(DEMO_TRACKING['demo-ord-1']);
    }
  });
}
