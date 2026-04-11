// Public Restaurants API - List active restaurants
// No authentication required
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/public/restaurants - List active restaurants
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const city = searchParams.get('city');
    const search = searchParams.get('search');

    const where = {
      isActive: true,
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const restaurants = await db.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { isOpen: 'desc' },
        { rating: 'desc' },
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        phone: true,
        address: true,
        city: true,
        district: true,
        isOpen: true,
        isBusy: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: true,
        minOrderAmount: true,
        deliveryTime: true,
        rating: true,
        reviewCount: true,
        organization: {
          select: {
            currency: {
              select: {
                code: true,
                symbol: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { menus: true },
        },
      },
    });

    const total = await db.restaurant.count({ where });

    return apiSuccess({
      data: restaurants.map(r => ({
        ...r,
        currency: r.organization.currency,
        hasMenu: r._count.menus > 0,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}
