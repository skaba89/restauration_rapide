// Public Orders API - Create orders from public menu pages
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// Generate a unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}-${random}`;
}

// POST /api/public/orders - Create a new order from public menu
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      restaurantId,
      orderType,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryZoneId,
      deliveryNotes,
      paymentMethod,
      notes,
      items,
      subtotal,
      deliveryFee,
      total,
    } = body;

    // Validation
    if (!restaurantId) {
      return apiError('Restaurant ID est requis', 400);
    }
    if (!customerName || !customerPhone) {
      return apiError('Le nom et le téléphone sont requis', 400);
    }
    if (!items || items.length === 0) {
      return apiError('Au moins un article est requis', 400);
    }

    // Check if restaurant exists and is active
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Get the default currency (GNF for Guinea)
    let currency = await db.currency.findFirst({
      where: { code: 'GNF' },
    });

    if (!currency) {
      // Create default currency if not exists
      currency = await db.currency.create({
        data: {
          code: 'GNF',
          symbol: 'GNF',
          name: 'Franc Guinéen',
          decimalPlaces: 0,
          isActive: true,
        },
      });
    }

    // Create the order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        restaurantId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        orderType: orderType as any || 'DELIVERY',
        source: 'web',
        status: 'PENDING',
        paymentStatus: 'PENDING',
        deliveryAddress: deliveryAddress || null,
        deliveryCity: deliveryCity || null,
        deliveryZoneId: deliveryZoneId || null,
        deliveryNotes: deliveryNotes || null,
        deliveryFee: deliveryFee || 0,
        subtotal: subtotal || 0,
        total: total || 0,
        currencyId: currency.id,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            menuItemId: item.menuItemId,
            itemName: item.name,
            itemImage: item.image || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            variantId: item.variantId || null,
            variantName: item.variantName || null,
            options: item.options ? JSON.stringify(item.options) : null,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Create status history
    await db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        notes: 'Commande créée depuis le menu public',
      },
    });

    // Create payment record
    await db.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        currencyId: currency.id,
        method: paymentMethod === 'MOBILE_MONEY' ? 'ORANGE_MONEY' : (paymentMethod as any) || 'CASH',
        status: 'PENDING',
        phoneNumber: customerPhone,
      },
    });

    return apiSuccess({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt,
    }, 'Commande créée avec succès', 201);
  });
}
