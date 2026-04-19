// Orders API - Order CRUD with status workflow, loyalty points, stock management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { withAuth, withAdminAuth } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';
import { generateOrderNumber, calculateLoyaltyPoints } from '@/lib/utils-helpers';
import { broadcastNewOrder, broadcastOrderStatusChange, broadcastOrderCancellation, broadcastDriverAssignment } from '@/lib/sync-engine';

// Both kitchen and admin read/write from the same source of truth

// GET /api/orders - List orders with pagination (authenticated users)
export const GET = withAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const restaurantId = searchParams.get('restaurantId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const orderType = searchParams.get('orderType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');

    const statusList = status ? status.split(',').map(s => s.trim()) : null;

    const where = {
      ...(restaurantId && { restaurantId }),
      ...(organizationId && { restaurant: { organizationId } }),
      ...(statusList && { status: { in: statusList } }),
      ...(customerId && { customerId }),
      ...(orderType && { orderType }),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
      ...(search && {
        OR: [
          { orderNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
        ],
      }),
    };

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: {
              menuItem: {
                select: { id: true, name: true, image: true, price: true },
              },
            },
          },
          delivery: {
            include: { driver: true },
          },
          payments: true,
          table: {
            select: { id: true, number: true },
          },
        },
      }),
      db.order.count({ where }),
    ]);

    return apiSuccess({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
});

// POST /api/orders - Create order with stock decrement and loyalty points (authenticated users)
export const POST = withAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
    const body = await request.json();
    const {
      restaurantId,
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      orderType = 'DELIVERY',
      source = 'web',
      tableId,
      tableNumber,
      items,
      deliveryAddress,
      deliveryCity,
      deliveryDistrict,
      deliveryLandmark,
      deliveryLat,
      deliveryLng,
      deliveryNotes,
      deliveryFee = 0,
      scheduledAt,
      asap = true,
      discount = 0,
      discountCode,
      notes,
      paymentMethod,
      loyaltyPointsUsed = 0,
    } = body;

    // Validation
    if (!restaurantId || !customerName || !customerPhone || !items?.length) {
      return apiError('restaurant, client et articles sont requis');
    }

    // Get restaurant and organization settings
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        organization: {
          include: { settings: true },
        },
      },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé');
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number; options?: string }) => {
        let itemTotal = item.unitPrice * item.quantity;
        // Add options price if present
        if (item.options) {
          try {
            const options = JSON.parse(item.options);
            if (Array.isArray(options)) {
              itemTotal += options.reduce((optSum: number, opt: { price?: number }) => optSum + (opt.price || 0), 0) * item.quantity;
            }
          } catch { /* ignore parse errors */ }
        }
        return sum + itemTotal;
      },
      0
    );

    const tax = 0; // Tax included in price for African markets
    const loyaltyDiscount = loyaltyPointsUsed * (restaurant.organization.settings?.pointValue || 10);
    const total = Math.max(0, subtotal - discount - loyaltyDiscount + deliveryFee + tax);

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Calculate loyalty points to earn
    const loyaltyPointsEarned = restaurant.organization.settings?.loyaltyEnabled
      ? calculateLoyaltyPoints(total, restaurant.organization.settings.pointsPerAmount || 1)
      : 0;

    // Get or create currency
    let currency = await db.currency.findFirst({ where: { id: restaurant.organization.currencyId } });
    if (!currency) {
      currency = await db.currency.create({
        data: {
          code: 'GNF',
          name: 'Franc Guinéen (FGN)',
          symbol: 'FGN',
          decimalPlaces: 0,
          isActive: true,
        },
      });
    }

    // Create order with items
    const order = await db.order.create({
      data: {
        orderNumber,
        restaurantId,
        customerId,
        customerName,
        customerPhone,
        customerEmail,
        orderType: orderType as string,
        source,
        tableId,
        tableNumber,
        deliveryAddress,
        deliveryCity,
        deliveryDistrict,
        deliveryLandmark,
        deliveryLat,
        deliveryLng,
        deliveryNotes,
        deliveryFee,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        asap,
        subtotal,
        discount,
        discountCode,
        tax,
        total,
        currencyId: currency.id,
        loyaltyPointsEarned,
        loyaltyPointsUsed,
        notes,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: {
            menuItemId?: string;
            itemName: string;
            itemImage?: string;
            quantity: number;
            unitPrice: number;
            variantId?: string;
            variantName?: string;
            options?: string;
            notes?: string;
          }) => ({
            menuItemId: item.menuItemId,
            itemName: item.itemName,
            itemImage: item.itemImage,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            variantId: item.variantId,
            variantName: item.variantName,
            options: item.options,
            notes: item.notes,
            status: 'pending',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create delivery if delivery type
    if (orderType === 'DELIVERY' && deliveryAddress) {
      await db.delivery.create({
        data: {
          orderId: order.id,
          organizationId: restaurant.organizationId,
          pickupAddress: restaurant.address,
          pickupLat: restaurant.latitude,
          pickupLng: restaurant.longitude,
          dropoffAddress: deliveryAddress,
          dropoffLat: deliveryLat,
          dropoffLng: deliveryLng,
          dropoffNotes: deliveryNotes,
          dropoffLandmark: deliveryLandmark,
          deliveryFee,
          driverEarning: deliveryFee * 0.7, // 70% to driver
          status: 'PENDING',
        },
      });
    }

    // Update customer stats if exists
    if (customerId) {
      const customer = await db.customerProfile.findUnique({ where: { id: customerId } });
      if (customer) {
        await db.customerProfile.update({
          where: { id: customerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
            lastOrderAt: new Date(),
            loyaltyPoints: { increment: loyaltyPointsEarned - loyaltyPointsUsed },
            lifetimePoints: { increment: loyaltyPointsEarned },
          },
        });

        // Create loyalty transaction for points earned
        if (loyaltyPointsEarned > 0) {
          await db.loyaltyTransaction.create({
            data: {
              organizationId: restaurant.organizationId,
              customerId,
              points: loyaltyPointsEarned,
              type: 'earn',
              description: `Points gagnés - Commande #${orderNumber}`,
              referenceType: 'order',
              referenceId: order.id,
              balanceAfter: customer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
            },
          });
        }
      }
    }

    // Decrement stock for menu items (only if trackInventory is enabled)
    for (const item of items) {
      if (item.menuItemId) {
        try {
          const menuItem = await db.menuItem.findUnique({
            where: { id: item.menuItemId },
            select: { trackInventory: true },
          });
          if (menuItem?.trackInventory) {
            await db.menuItem.update({
              where: { id: item.menuItemId },
              data: {
                quantity: { decrement: item.quantity },
                orderCount: { increment: 1 },
              },
            });
          }
        } catch (stockErr) {
          console.error(`[ORDER] Stock update failed for item ${item.menuItemId}:`, stockErr);
          // Don't fail the order creation for stock tracking issues
        }
      }
    }

    // Create payment if method specified
    if (paymentMethod) {
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: total,
          currencyId: currency.id,
          method: paymentMethod,
          status: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
        },
      });
    }

    // Create status history
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Commande créée',
      },
    });

    // Broadcast new order to all roles (admin, cuisinier, client, public)
    try {
      await broadcastNewOrder({
        orderId: order.id,
        orderNumber: order.orderNumber,
        restaurantId,
        customerName,
        customerPhone,
        orderType: orderType as string,
        items: items.map((item: { itemName: string; quantity: number }) => ({
          name: item.itemName,
          quantity: item.quantity,
        })),
        total,
        deliveryAddress,
        tableNumber: tableNumber || undefined,
        notes,
      });
    } catch (syncError) {
      console.error('Sync broadcast error:', syncError);
      // Don't fail the request if broadcast fails
    }

    return apiSuccess(order, 'Commande créée avec succès', 201);
  });
});

// PATCH /api/orders - Update order status with workflow (authenticated users)
export const PATCH = withAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
    const body = await request.json();
    const { id, status, internalNotes, cancellationReason, paymentStatus } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { delivery: true },
    });

    if (!order) {
      return apiError('Commande non trouvée', 404);
    }

    const updateData: Record<string, unknown> = {
      ...(status && { status }),
      ...(internalNotes !== undefined && { internalNotes }),
      ...(cancellationReason && { cancellationReason }),
      ...(paymentStatus && { paymentStatus }),
    };

    // Update timestamps based on status workflow
    const statusTimestamps: Record<string, string> = {
      CONFIRMED: 'confirmedAt',
      PREPARING: 'preparingAt',
      READY: 'readyAt',
      OUT_FOR_DELIVERY: 'pickedUpAt',
      DELIVERED: 'deliveredAt',
      COMPLETED: 'completedAt',
      CANCELLED: 'cancelledAt',
    };

    if (status && statusTimestamps[status]) {
      updateData[statusTimestamps[status]] = new Date();
    }

    const updatedOrder = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        delivery: { include: { driver: true } },
        payments: true,
      },
    });

    // Create status history
    if (status) {
      await db.orderStatusHistory.create({
        data: {
          orderId: id,
          status,
          notes: internalNotes,
        },
      });

      // Broadcast status change to all roles (admin, cuisinier, driver, client)
      try {
        if (status === 'CANCELLED') {
          await broadcastOrderCancellation({
            orderId: id,
            orderNumber: updatedOrder.orderNumber,
            restaurantId: order.restaurantId,
            customerName: order.customerName as string | undefined,
            reason: cancellationReason as string | undefined,
          });
        } else {
          await broadcastOrderStatusChange({
            orderId: id,
            orderNumber: updatedOrder.orderNumber,
            restaurantId: order.restaurantId,
            status,
            previousStatus: order.status as string,
            customerName: order.customerName as string | undefined,
            customerPhone: order.customerPhone as string | undefined,
            orderType: order.orderType as string | undefined,
            total: Number(order.total),
          });
        }
      } catch (syncError) {
        console.error('Sync broadcast error:', syncError);
      }
    }

    // Update delivery status if applicable
    if (status && order.delivery) {
      const deliveryStatusMap: Record<string, string> = {
        CONFIRMED: 'PENDING',
        PREPARING: 'PENDING',
        READY: 'PENDING',
        OUT_FOR_DELIVERY: 'PICKED_UP',
        DELIVERED: 'DELIVERED',
        CANCELLED: 'CANCELLED',
      };

      if (deliveryStatusMap[status]) {
        await db.delivery.update({
          where: { id: order.delivery.id },
          data: { status: deliveryStatusMap[status] },
        });
      }
    }

    // Update payment status if completed
    if (status === 'COMPLETED' && order.paymentStatus !== 'PAID') {
      await db.order.update({
        where: { id },
        data: { paymentStatus: 'PAID' },
      });
    }

    return apiSuccess(updatedOrder, 'Commande mise à jour');
  });
});

// DELETE /api/orders - Cancel order (admin only)
export const DELETE = withAdminAuth(async (request: NextRequest, user) => {
  return withErrorHandler<any>(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return apiError('ID est requis');
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true, delivery: true },
    });

    if (!order) {
      return apiError('Commande non trouvée', 404);
    }

    if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
      return apiError('Impossible d\'annuler une commande terminée', 400);
    }

    // Cancel order
    await db.order.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
    });

    // Restore stock for menu items
    for (const item of order.items) {
      if (item.menuItemId) {
        await db.menuItem.update({
          where: { id: item.menuItemId },
          data: { quantity: { increment: item.quantity } },
        });
      }
    }

    // Update delivery if exists
    if (order.delivery) {
      await db.delivery.update({
        where: { id: order.delivery.id },
        data: { status: 'CANCELLED' },
      });
    }

    return apiSuccess({ cancelled: true }, 'Commande annulée');
  });
});