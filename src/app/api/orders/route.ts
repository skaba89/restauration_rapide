// Orders API - Order CRUD with status workflow, loyalty points, stock management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateOrderNumber, calculateLoyaltyPoints } from '@/lib/utils-helpers';

// Demo orders data
const DEMO_ORDERS = [
  {
    id: 'demo-ord-1',
    orderNumber: 'ORD-2024-0145',
    restaurantId: 'demo-rest-1',
    customerName: 'Kouamé Jean',
    customerPhone: '+2250700000001',
    customerEmail: 'kouame@email.com',
    orderType: 'DELIVERY',
    source: 'web',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    subtotal: 8000,
    total: 8500,
    deliveryFee: 500,
    deliveryAddress: 'Cocody, Riviera 3',
    deliveryCity: 'Abidjan',
    notes: 'Pas trop de piment',
    createdAt: new Date(),
    items: [
      { id: 'item-1', itemName: 'Attieké Poisson Grillé', quantity: 1, unitPrice: 8000, totalPrice: 8000, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-2',
    orderNumber: 'ORD-2024-0144',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-2',
    customerName: 'Aya Marie',
    customerPhone: '+2250700000002',
    customerEmail: 'aya@email.com',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: 'T5',
    status: 'PREPARING',
    paymentStatus: 'PENDING',
    subtotal: 4500,
    total: 4500,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    items: [
      { id: 'item-2', itemName: 'Alloco', quantity: 2, unitPrice: 2250, totalPrice: 4500, status: 'preparing' },
    ],
  },
  {
    id: 'demo-ord-3',
    orderNumber: 'ORD-2024-0143',
    restaurantId: 'demo-rest-1',
    customerName: 'Koné Ibrahim',
    customerPhone: '+2250700000003',
    orderType: 'TAKEAWAY',
    source: 'app',
    status: 'READY',
    paymentStatus: 'PAID',
    subtotal: 12000,
    total: 12000,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    items: [
      { id: 'item-3', itemName: 'Kedjenou de Poulet', quantity: 1, unitPrice: 7000, totalPrice: 7000, status: 'ready' },
      { id: 'item-4', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 2500, totalPrice: 5000, status: 'ready' },
    ],
  },
  {
    id: 'demo-ord-4',
    orderNumber: 'ORD-2024-0142',
    restaurantId: 'demo-rest-1',
    customerName: 'Diallo Fatou',
    customerPhone: '+2250700000004',
    orderType: 'DELIVERY',
    source: 'web',
    status: 'OUT_FOR_DELIVERY',
    paymentStatus: 'PAID',
    subtotal: 6000,
    total: 6500,
    deliveryFee: 500,
    deliveryAddress: 'Plateau, Rue du Commerce',
    deliveryCity: 'Abidjan',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    items: [
      { id: 'item-5', itemName: 'Thiéboudienne', quantity: 1, unitPrice: 6000, totalPrice: 6000, status: 'ready' },
    ],
    delivery: {
      id: 'del-1',
      status: 'PICKED_UP',
      driver: { id: 'driver-1', firstName: 'Amadou', lastName: 'Touré', phone: '+2250700000100' },
    },
  },
  {
    id: 'demo-ord-5',
    orderNumber: 'ORD-2024-0141',
    restaurantId: 'demo-rest-1',
    customerName: 'Touré Amadou',
    customerPhone: '+2250700000005',
    orderType: 'DINE_IN',
    source: 'pos',
    tableNumber: 'T12',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    subtotal: 10500,
    total: 10500,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    completedAt: new Date(Date.now() - 30 * 60 * 1000),
    items: [
      { id: 'item-6', itemName: 'Riz Gras', quantity: 1, unitPrice: 5000, totalPrice: 5000, status: 'served' },
      { id: 'item-7', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 2750, totalPrice: 5500, status: 'served' },
    ],
  },
  {
    id: 'demo-ord-6',
    orderNumber: 'ORD-2024-0140',
    restaurantId: 'demo-rest-1',
    customerName: 'Bamba Ismaël',
    customerPhone: '+2250700000006',
    orderType: 'DELIVERY',
    source: 'app',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    subtotal: 15000,
    total: 15500,
    deliveryFee: 500,
    deliveryAddress: 'Yopougon, Sicogi',
    deliveryCity: 'Abidjan',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    items: [
      { id: 'item-8', itemName: 'Garba', quantity: 3, unitPrice: 3500, totalPrice: 10500, status: 'pending' },
      { id: 'item-9', itemName: 'Jus de Gingembre', quantity: 3, unitPrice: 1500, totalPrice: 4500, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-7',
    orderNumber: 'ORD-2024-0139',
    restaurantId: 'demo-rest-1',
    customerName: 'Koffi Emmanuel',
    customerPhone: '+2250700000007',
    orderType: 'TAKEAWAY',
    source: 'web',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    subtotal: 3500,
    total: 3500,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    items: [
      { id: 'item-10', itemName: 'Garba', quantity: 1, unitPrice: 3500, totalPrice: 3500, status: 'pending' },
    ],
  },
  {
    id: 'demo-ord-8',
    orderNumber: 'ORD-2024-0138',
    restaurantId: 'demo-rest-1',
    customerName: 'Adjoua Rose',
    customerPhone: '+2250700000008',
    orderType: 'DELIVERY',
    source: 'phone',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    subtotal: 14000,
    total: 14000,
    cancellationReason: 'Client injoignable',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    cancelledAt: new Date(Date.now() - 55 * 60 * 1000),
    items: [
      { id: 'item-11', itemName: 'Foutou Banane', quantity: 2, unitPrice: 6000, totalPrice: 12000, status: 'cancelled' },
      { id: 'item-12', itemName: 'Jus de Bissap', quantity: 2, unitPrice: 1000, totalPrice: 2000, status: 'cancelled' },
    ],
  },
];

// GET /api/orders - List orders with pagination
export async function GET(request: Request) {
  return withErrorHandler(async () => {
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
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization/restaurant specified
    if (demo === 'true' || (!restaurantId && !organizationId)) {
      let filteredOrders = [...DEMO_ORDERS];
      
      // Apply filters
      if (status) {
        filteredOrders = filteredOrders.filter(o => o.status === status);
      }
      if (orderType) {
        filteredOrders = filteredOrders.filter(o => o.orderType === orderType);
      }
      if (customerId) {
        filteredOrders = filteredOrders.filter(o => o.customerId === customerId);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredOrders = filteredOrders.filter(o => 
          o.orderNumber.toLowerCase().includes(searchLower) || 
          o.customerName.toLowerCase().includes(searchLower) ||
          o.customerPhone.includes(search)
        );
      }
      if (dateFrom) {
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= new Date(dateFrom));
      }
      if (dateTo) {
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) <= new Date(dateTo));
      }

      const total = filteredOrders.length;
      const paginatedOrders = filteredOrders.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedOrders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const where = {
      ...(restaurantId && { restaurantId }),
      ...(organizationId && { restaurant: { organizationId } }),
      ...(status && { status }),
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
}

// POST /api/orders - Create order with stock decrement and loyalty points
export async function POST(request: Request) {
  return withErrorHandler(async () => {
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
          code: 'XOF',
          name: 'Franc CFA',
          symbol: 'FCFA',
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

    // Decrement stock for menu items
    for (const item of items) {
      if (item.menuItemId) {
        await db.menuItem.update({
          where: { id: item.menuItemId },
          data: {
            quantity: { decrement: item.quantity },
            orderCount: { increment: 1 },
          },
        });
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

    return apiSuccess(order, 'Commande créée avec succès', 201);
  });
}

// PATCH /api/orders - Update order status with workflow
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
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
}

// DELETE /api/orders - Cancel order
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const reason = searchParams.get('reason');

    if (!id) {
      return apiError('ID est requis');
    }

    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
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
}
