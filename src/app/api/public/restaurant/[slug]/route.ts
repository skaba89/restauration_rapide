// Public Restaurant API - Get restaurant by slug with full menu data
import { NextRequest, NextResponse } from 'next/server';

// Fallback currency for when database doesn't have one
const DEFAULT_CURRENCY = {
  code: 'GNF',
  symbol: 'GNF',
  name: 'Franc Guinéen',
};

// GET /api/public/restaurant/[slug] - Get restaurant with menus for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Dynamic import to handle potential Prisma initialization issues
    const { db } = await import('@/lib/db');

    // Try to fetch restaurant with all relations
    let restaurant;
    try {
      restaurant = await db.restaurant.findUnique({
        where: { slug, isActive: true },
        include: {
          hours: {
            orderBy: { dayOfWeek: 'asc' },
          },
          deliveryZones: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
          settings: true,
          menus: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              categories: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                include: {
                  items: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                      variants: {
                        orderBy: { sortOrder: 'asc' },
                      },
                      options: {
                        orderBy: { sortOrder: 'asc' },
                        include: {
                          values: {
                            orderBy: { sortOrder: 'asc' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          organization: {
            include: {
              settings: true,
              currency: true,
            },
          },
        },
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return a generic error without exposing database details
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.',
          code: 'DB_ERROR'
        },
        { status: 503 }
      );
    }

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get currency with fallback
    const currency = restaurant.organization?.currency || DEFAULT_CURRENCY;

    // Transform data for public view
    const publicData = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      logo: restaurant.logo,
      coverImage: restaurant.coverImage,
      phone: restaurant.phone,
      email: restaurant.email,
      address: restaurant.address,
      city: restaurant.city,
      district: restaurant.district,
      isOpen: restaurant.isOpen,
      isBusy: restaurant.isBusy,
      acceptsDelivery: restaurant.acceptsDelivery,
      acceptsTakeaway: restaurant.acceptsTakeaway,
      acceptsDineIn: restaurant.acceptsDineIn,
      deliveryFee: restaurant.deliveryFee,
      minOrderAmount: restaurant.minOrderAmount || restaurant.settings?.minOrderAmount || 0,
      deliveryTime: restaurant.deliveryTime,
      rating: restaurant.rating,
      reviewCount: restaurant.reviewCount,
      currency: currency,
      settings: restaurant.settings ? {
        acceptsCash: restaurant.settings.loyaltyEnabled ?? true,
        acceptsMobileMoney: true,
        acceptsCard: false,
        deliveryEnabled: restaurant.acceptsDelivery,
        minOrderAmount: restaurant.settings.minOrderAmount || 0,
        defaultDeliveryFee: restaurant.settings.deliveryFee || 0,
      } : {
        acceptsCash: true,
        acceptsMobileMoney: true,
        acceptsCard: false,
        deliveryEnabled: restaurant.acceptsDelivery,
        minOrderAmount: restaurant.minOrderAmount,
        defaultDeliveryFee: restaurant.deliveryFee,
      },
      hours: restaurant.hours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
      deliveryZones: restaurant.deliveryZones.map(z => ({
        id: z.id,
        name: z.name,
        baseFee: z.baseFee,
        minTime: z.minTime,
        maxTime: z.maxTime,
      })),
      menus: restaurant.menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        slug: menu.slug,
        description: menu.description,
        menuType: menu.menuType,
        categories: menu.categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          icon: cat.icon,
          items: cat.items.map(item => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            image: item.image,
            price: item.price,
            discountPrice: item.discountPrice,
            prepTime: item.prepTime,
            calories: item.calories,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            isPopular: item.isPopular,
            isNew: item.isNew,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            isHalal: item.isHalal,
            isGlutenFree: item.isGlutenFree,
            isSpicy: item.isSpicy,
            spicyLevel: item.spicyLevel,
            rating: item.rating,
            reviewCount: item.reviewCount,
            variants: (item.variants || []).map((v: any) => ({
              id: v.id,
              name: v.name,
              price: v.price,
              isDefault: v.isDefault,
            })),
            options: (item.options || []).map((opt: any) => ({
              id: opt.id,
              name: opt.name,
              required: opt.required,
              multiSelect: opt.multiSelect,
              maxSelect: opt.maxSelect,
              values: (opt.values || []).map((val: any) => ({
                id: val.id,
                name: val.name,
                price: val.price,
                isDefault: val.isDefault,
              })),
            })),
          })),
        })),
      })),
      organizationId: restaurant.organizationId,
    };

    return NextResponse.json({ success: true, data: publicData });
  } catch (error) {
    console.error('Unexpected error in restaurant API:', error);
    
    // Log the full error for debugging but return a safe message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors du chargement du restaurant',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
