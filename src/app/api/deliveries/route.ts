// Deliveries API - Delivery management with auto-assign and demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { calculateDistance } from '@/lib/utils-helpers';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

// Demo deliveries data
const DEMO_DELIVERIES = [
  {
    id: 'demo-del-1',
    orderId: 'demo-ord-4',
    organizationId: 'demo-org-1',
    pickupAddress: 'Restaurant Chez Maman, Cocovy',
    dropoffAddress: 'Plateau, Rue du Commerce',
    dropoffNotes: 'Pres de la pharmacie',
    status: 'PICKED_UP',
    deliveryFee: 500,
    driverEarning: 350,
    tip: 0,
    distance: 4.5,
    estimatedTime: 25,
    assignedAt: new Date(Date.now() - 35 * 60 * 1000),
    pickedUpAt: new Date(Date.now() - 30 * 60 * 1000),
    driver: {
      id: 'demo-driver-1',
      firstName: 'Amadou',
      lastName: 'Touré',
      phone: '+2250700000100',
      avatar: null,
      vehicleType: 'motorcycle',
      vehiclePlate: 'AB 1234 CD',
      currentLat: 5.3264,
      currentLng: -4.0125,
      isAvailable: false,
    },
    order: {
      orderNumber: 'ORD-2024-0142',
      customerName: 'Diallo Fatou',
      customerPhone: '+2250700000004',
      total: 6500,
      restaurant: { name: 'Restaurant Chez Maman', address: 'Cocovy, Abidjan', phone: '+2250700000001' },
      items: [{ itemName: 'Thiéboudienne', quantity: 1 }],
    },
    createdAt: new Date(Date.now() - 40 * 60 * 1000),
  },
  {
    id: 'demo-del-2',
    orderId: 'demo-ord-new',
    organizationId: 'demo-org-1',
    pickupAddress: 'Restaurant Chez Maman, Cocovy',
    dropoffAddress: 'Yopougon, Sicogi',
    dropoffNotes: 'Maison verte',
    status: 'PENDING',
    deliveryFee: 600,
    driverEarning: 420,
    tip: 0,
    distance: 8.2,
    estimatedTime: 35,
    driver: null,
    order: {
      orderNumber: 'ORD-2024-0146',
      customerName: 'Bamba Ismaël',
      customerPhone: '+2250700000006',
      total: 15500,
      restaurant: { name: 'Restaurant Chez Maman', address: 'Cocovy, Abidjan', phone: '+2250700000001' },
      items: [{ itemName: 'Garba', quantity: 3 }, { itemName: 'Jus de Gingembre', quantity: 3 }],
    },
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'demo-del-3',
    orderId: 'demo-ord-completed',
    organizationId: 'demo-org-1',
    pickupAddress: 'Restaurant Chez Maman, Cocovy',
    dropoffAddress: 'Treichville, Rue 12',
    status: 'DELIVERED',
    deliveryFee: 450,
    driverEarning: 315,
    tip: 500,
    distance: 3.8,
    estimatedTime: 20,
    actualTime: 22,
    assignedAt: new Date(Date.now() - 90 * 60 * 1000),
    pickedUpAt: new Date(Date.now() - 85 * 60 * 1000),
    deliveredAt: new Date(Date.now() - 65 * 60 * 1000),
    driver: {
      id: 'demo-driver-2',
      firstName: 'Ibrahim',
      lastName: 'Koné',
      phone: '+2250700000101',
      avatar: null,
      vehicleType: 'motorcycle',
      vehiclePlate: 'AB 5678 EF',
      currentLat: 5.3125,
      currentLng: -4.0234,
      isAvailable: true,
    },
    order: {
      orderNumber: 'ORD-2024-0140',
      customerName: 'Koffi Emmanuel',
      customerPhone: '+2250700000007',
      total: 8500,
      restaurant: { name: 'Restaurant Chez Maman', address: 'Cocovy, Abidjan', phone: '+2250700000001' },
      items: [{ itemName: 'Attieké Poisson', quantity: 1 }],
    },
    createdAt: new Date(Date.now() - 95 * 60 * 1000),
  },
  {
    id: 'demo-del-4',
    orderId: 'demo-ord-search',
    organizationId: 'demo-org-1',
    pickupAddress: 'Restaurant Chez Maman, Cocovy',
    dropoffAddress: 'Marcory, Zone 4',
    status: 'SEARCHING_DRIVER',
    deliveryFee: 550,
    driverEarning: 385,
    tip: 0,
    distance: 5.5,
    estimatedTime: 28,
    driver: null,
    order: {
      orderNumber: 'ORD-2024-0147',
      customerName: 'Adjoua Rose',
      customerPhone: '+2250700000008',
      total: 12500,
      restaurant: { name: 'Restaurant Chez Maman', address: 'Cocovy, Abidjan', phone: '+2250700000001' },
      items: [{ itemName: 'Foutou Banane', quantity: 2 }],
    },
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
];

// GET /api/deliveries - List deliveries
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const orderId = searchParams.get('orderId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization specified
    if (demo === 'true' || (!organizationId && !driverId && !orderId)) {
      let filteredDeliveries = [...DEMO_DELIVERIES];
      
      // Apply filters
      if (status) {
        filteredDeliveries = filteredDeliveries.filter(d => d.status === status);
      }
      if (driverId) {
        filteredDeliveries = filteredDeliveries.filter(d => d.driver?.id === driverId);
      }
      if (orderId) {
        filteredDeliveries = filteredDeliveries.filter(d => d.orderId === orderId);
      }
      if (dateFrom) {
        filteredDeliveries = filteredDeliveries.filter(d => new Date(d.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        filteredDeliveries = filteredDeliveries.filter(d => new Date(d.createdAt) <= new Date(dateTo));
      }

      const total = filteredDeliveries.length;
      const paginatedDeliveries = filteredDeliveries.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedDeliveries,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const where = {
      ...(organizationId && { organizationId }),
      ...(driverId && { driverId }),
      ...(status && { status: status as DeliveryStatus }),
      ...(orderId && { orderId }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    };

    const [deliveries, total] = await Promise.all([
      db.delivery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          driver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
              vehicleType: true,
              vehiclePlate: true,
              currentLat: true,
              currentLng: true,
              isAvailable: true,
            },
          },
          order: {
            include: {
              customer: true,
              items: { take: 5 },
              restaurant: { select: { name: true, address: true, phone: true } },
            },
          },
          trackingEvents: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      }),
      db.delivery.count({ where }),
    ]);

    return apiSuccess({
      data: deliveries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/deliveries - Create delivery or auto-assign
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      action,
      deliveryId,
      orderId,
      organizationId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      dropoffNotes,
      dropoffLandmark,
      deliveryFee,
      tip = 0,
    } = body;

    // Auto-assign delivery to nearest driver
    if (action === 'auto-assign' || deliveryId) {
      const targetDeliveryId = deliveryId || orderId;
      
      if (!targetDeliveryId) {
        return apiError('deliveryId est requis');
      }

      const delivery = await db.delivery.findUnique({
        where: targetDeliveryId.startsWith('ord') ? { orderId: targetDeliveryId } : { id: targetDeliveryId },
      });

      if (!delivery) {
        return apiError('Livraison non trouvée', 404);
      }

      if (delivery.driverId) {
        return apiError('Cette livraison est déjà assignée', 400);
      }

      // Find available drivers
      const availableDrivers = await db.driver.findMany({
        where: {
          organizationId: delivery.organizationId,
          isActive: true,
          isAvailable: true,
          currentLat: { not: null },
          currentLng: { not: null },
        },
      });

      if (availableDrivers.length === 0) {
        // Update status to searching
        await db.delivery.update({
          where: { id: delivery.id },
          data: { status: 'SEARCHING_DRIVER' },
        });
        return apiError('Aucun livreur disponible', 404);
      }

      // Find nearest driver
      let nearestDriver = availableDrivers[0];
      let minDistance = Infinity;

      for (const driver of availableDrivers) {
        if (driver.currentLat && driver.currentLng && delivery.pickupLat && delivery.pickupLng) {
          const distance = calculateDistance(
            driver.currentLat,
            driver.currentLng,
            delivery.pickupLat,
            delivery.pickupLng
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestDriver = driver;
          }
        }
      }

      // Assign delivery
      const updatedDelivery = await db.delivery.update({
        where: { id: delivery.id },
        data: {
          driverId: nearestDriver.id,
          status: 'DRIVER_ASSIGNED',
          assignedAt: new Date(),
        },
        include: {
          driver: true,
          order: {
            include: {
              items: true,
              restaurant: true,
            },
          },
        },
      });

      // Mark driver as unavailable
      await db.driver.update({
        where: { id: nearestDriver.id },
        data: {
          isAvailable: false,
          status: 'busy',
        },
      });

      // Create tracking event
      await db.deliveryTrackingEvent.create({
        data: {
          deliveryId: delivery.id,
          event: 'DRIVER_ASSIGNED',
          notes: `Assigné à ${nearestDriver.firstName} ${nearestDriver.lastName}`,
        },
      });

      return apiSuccess(updatedDelivery, `Assigné à ${nearestDriver.firstName}`);
    }

    // Create new delivery
    if (!orderId || !organizationId || !pickupAddress || !dropoffAddress) {
      return apiError('orderId, organizationId, pickupAddress et dropoffAddress sont requis');
    }

    const delivery = await db.delivery.create({
      data: {
        orderId,
        organizationId,
        pickupAddress,
        pickupLat,
        pickupLng,
        dropoffAddress,
        dropoffLat,
        dropoffLng,
        dropoffNotes,
        dropoffLandmark,
        deliveryFee: deliveryFee || 0,
        driverEarning: (deliveryFee || 0) * 0.7,
        tip,
        status: 'PENDING',
      },
    });

    return apiSuccess(delivery, 'Livraison créée', 201);
  });
}

// PATCH /api/deliveries - Update delivery status and location
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      driverId,
      status,
      lat,
      lng,
      accuracy,
      proofType,
      proofOtp,
      proofPhotoUrl,
      proofSignature,
      notes,
      failureReason,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const delivery = await db.delivery.findUnique({
      where: { id },
      include: { order: true },
    });

    if (!delivery) {
      return apiError('Livraison non trouvée', 404);
    }

    const updateData: Record<string, unknown> = {};

    // Handle driver assignment
    if (driverId !== undefined) {
      updateData.driverId = driverId;
      updateData.assignedAt = new Date();
    }

    // Handle status updates
    if (status) {
      updateData.status = status;
      const statusTimestamps: Record<string, string> = {
        DRIVER_ARRIVED_PICKUP: 'driverArrivedAt',
        PICKED_UP: 'pickedUpAt',
        DELIVERED: 'deliveredAt',
        FAILED: 'failedAt',
      };
      if (statusTimestamps[status]) {
        updateData[statusTimestamps[status]] = new Date();
      }
    }

    // Handle proof of delivery
    if (proofType) {
      updateData.proofType = proofType;
      updateData.proofOtp = proofOtp;
      updateData.proofPhotoUrl = proofPhotoUrl;
      updateData.proofSignature = proofSignature;
      if (lat && lng) {
        updateData.proofLat = lat;
        updateData.proofLng = lng;
      }
    }

    // Handle notes and failures
    if (notes !== undefined) updateData.notes = notes;
    if (failureReason) updateData.failureReason = failureReason;

    const updatedDelivery = await db.delivery.update({
      where: { id },
      data: updateData,
      include: {
        driver: true,
        order: true,
      },
    });

    // Create tracking event if location provided
    if (lat !== undefined && lng !== undefined) {
      await db.deliveryTrackingEvent.create({
        data: {
          deliveryId: id,
          event: status || 'LOCATION_UPDATE',
          lat,
          lng,
          notes: accuracy ? `Accuracy: ${accuracy}m` : undefined,
        },
      });
    }

    // Update order status based on delivery status
    if (status) {
      const orderStatusMap: Record<string, OrderStatus> = {
        DRIVER_ASSIGNED: OrderStatus.CONFIRMED,
        PICKED_UP: OrderStatus.OUT_FOR_DELIVERY,
        DELIVERED: OrderStatus.DELIVERED,
        FAILED: OrderStatus.CANCELLED,
      };

      if (orderStatusMap[status] && delivery.order) {
        await db.order.update({
          where: { id: delivery.order.id },
          data: {
            status: orderStatusMap[status],
            ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          },
        });
      }
    }

    // Update driver availability when delivered or failed
    if ((status === 'DELIVERED' || status === 'FAILED' || status === 'CANCELLED') && delivery.driverId) {
      await db.driver.update({
        where: { id: delivery.driverId },
        data: { isAvailable: true, status: 'online' },
      });

      // Update driver stats
      if (status === 'DELIVERED') {
        await db.driver.update({
          where: { id: delivery.driverId },
          data: {
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: delivery.driverEarning + delivery.tip },
          },
        });

        // Create driver earning
        await db.driverEarning.create({
          data: {
            driverId: delivery.driverId,
            deliveryId: id,
            type: 'delivery_fee',
            amount: delivery.driverEarning,
            description: `Livraison #${delivery.order?.orderNumber || id}`,
          },
        });

        if (delivery.tip > 0) {
          await db.driverEarning.create({
            data: {
              driverId: delivery.driverId,
              deliveryId: id,
              type: 'tip',
              amount: delivery.tip,
              description: `Pourboire - Livraison #${delivery.order?.orderNumber || id}`,
            },
          });
        }
      }
    }

    return apiSuccess(updatedDelivery, 'Livraison mise à jour');
  });
}
