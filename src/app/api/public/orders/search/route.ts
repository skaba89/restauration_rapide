// Public Orders Search API - Find orders by phone number
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/public/orders/search - Search orders by phone number
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || phone.length < 8) {
      return apiError('Numéro de téléphone invalide', 400);
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Search for orders with this phone number
    const orders = await db.order.findMany({
      where: {
        customerPhone: {
          contains: normalizedPhone,
        },
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        orderType: true,
        createdAt: true,
        restaurant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return apiSuccess({
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        orderType: order.orderType,
        createdAt: order.createdAt,
        restaurantName: order.restaurant.name,
        restaurantSlug: order.restaurant.slug,
      })),
    });
  });
}
