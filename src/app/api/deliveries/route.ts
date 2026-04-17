// Deliveries API - Delivery management with auto-assign and demo support
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { calculateDistance } from '@/lib/utils-helpers';
import { DeliveryStatusSchema, DeliveryQuerySchema, isValidStatusTransition } from '@/lib/validations/delivery';
import { DeliveryStatus, OrderStatus } from '@prisma/client';

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

    // Validate status with Zod schema if provided
    const validatedStatus = status ? DeliveryStatusSchema.safeParse(status) : undefined;
    if (status && !validatedStatus?.success) {
      return apiError('Statut de livraison invalide', 400);
    }

    const where = {
      ...(organizationId && { organizationId }),
      ...(driverId && { driverId }),
      ...(validatedStatus?.success && { status: validatedStatus.data }),
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
    
    // Validate action type if provided
    const validActions = ['auto-assign', 'create', 'update-status', 'cancel'];
    if (body.action && !validActions.includes(body.action)) {
      return apiError(`Action invalide. Actions supportées: ${validActions.join(', ')}`, 400);
    }

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