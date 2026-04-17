// Public Menu API - Unified menu data endpoint for all clients (POS, public pages, admin)
// Uses the correct Prisma schema: Restaurant -> Menu -> MenuCategory -> MenuItem
import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection, markDatabaseUnavailable, getDatabaseStatus } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { buildCategoriesFromSimpleMenuItems } from '@/lib/menu-builders';

// Cache-Control headers to prevent stale data in browsers and service workers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantSlug = searchParams.get('restaurantSlug');
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantSlug && !restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant slug or ID is required' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // ---- DATABASE PATH ----
    // Use async connection check with 3s timeout for public endpoints
    const dbReady = await ensureDbConnection(3000);

    if (dbReady && db) {
      try {
        // 1. Try SimpleMenuItem (flat table used by admin menu CRUD)
        try {
          const tableReady = await ensureSimpleMenuItemTable();
          if (tableReady) {
            const items = await db.simpleMenuItem.findMany({
              where: { isAvailable: true },
              orderBy: [{ category: 'asc' }, { name: 'asc' }],
            });

            if (items.length > 0) {
              const categories = buildCategoriesFromSimpleMenuItems(items);

              // Get restaurant info if available
              let restaurantInfo: any = null;
              try {
                restaurantInfo = await db.restaurant.findFirst({
                  where: restaurantSlug
                    ? { slug: restaurantSlug }
                    : restaurantId
                      ? { id: restaurantId }
                      : {},
                  select: {
                    id: true, name: true, slug: true, description: true,
                    logo: true, coverImage: true, phone: true, email: true,
                    address: true, city: true, district: true,
                    isOpen: true, isBusy: true, acceptsDelivery: true,
                    acceptsTakeaway: true, acceptsDineIn: true,
                    deliveryFee: true, minOrderAmount: true, deliveryTime: true,
                    rating: true, reviewCount: true,
                    organization: { select: { currency: { select: { code: true, symbol: true, name: true } } } },
                  },
                });
              } catch (_) {
                // Restaurant lookup is optional - continue with defaults
              }

              return NextResponse.json({
                success: true,
                data: {
                  restaurant: {
                    id: restaurantInfo?.id || 'kfm-delice-default',
                    name: restaurantInfo?.name || 'KFM DELICE',
                    slug: restaurantInfo?.slug || restaurantSlug || 'kfm-delice',
                    description: restaurantInfo?.description || 'Restaurant fast-food guinéen',
                    logo: restaurantInfo?.logo || null,
                    coverImage: restaurantInfo?.coverImage || null,
                    phone: restaurantInfo?.phone || '+224623217240',
                    address: restaurantInfo?.address || 'Nongo',
                    city: restaurantInfo?.city || 'Conakry',
                    isOpen: restaurantInfo?.isOpen ?? true,
                    acceptsDelivery: restaurantInfo?.acceptsDelivery ?? true,
                    acceptsTakeaway: restaurantInfo?.acceptsTakeaway ?? true,
                    acceptsDineIn: restaurantInfo?.acceptsDineIn ?? true,
                    deliveryFee: restaurantInfo?.deliveryFee ?? 5000,
                    minOrderAmount: restaurantInfo?.minOrderAmount ?? 10000,
                    deliveryTime: restaurantInfo?.deliveryTime ?? 30,
                    rating: restaurantInfo?.rating ?? 4.5,
                    reviewCount: restaurantInfo?.reviewCount ?? 0,
                    currency: restaurantInfo?.organization?.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
                  },
                  categories,
                  menus: [{
                    id: 'main-menu',
                    name: 'Menu Principal',
                    slug: 'menu-principal',
                    description: 'Menu complet',
                    menuType: 'main',
                    categories,
                  }],
                },
                timestamp: new Date().toISOString(),
                source: 'simple-menu-items',
              }, { headers: NO_CACHE_HEADERS });
            }
          }
        } catch (simpleMenuError) {
          console.warn('[PUBLIC MENU] SimpleMenuItem query failed, trying full hierarchy:', simpleMenuError);
          markDatabaseUnavailable();
        }

        // 2. Try full Menu -> MenuCategory -> MenuItem hierarchy
        const restaurant = await db.restaurant.findFirst({
          where: restaurantSlug
            ? { slug: restaurantSlug, isActive: true }
            : restaurantId
              ? { id: restaurantId, isActive: true }
              : {},
          include: {
            organization: { select: { currency: { select: { code: true, symbol: true, name: true } } } },
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
                        variants: { orderBy: { sortOrder: 'asc' } },
                        options: {
                          orderBy: { sortOrder: 'asc' },
                          include: { values: { orderBy: { sortOrder: 'asc' } } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (restaurant && restaurant.menus.length > 0) {
          // Flatten categories across all menus for POS compatibility
          const allCategories = restaurant.menus.flatMap(menu =>
            menu.categories.map(cat => ({
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
                imageUrl: item.image,
                price: item.price,
                discountPrice: item.discountPrice,
                costPrice: item.costPrice,
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
                variants: item.variants || [],
                options: item.options || [],
              })),
            }))
          );

          return NextResponse.json({
            success: true,
            data: {
              restaurant: {
                id: restaurant.id,
                name: restaurant.name,
                slug: restaurant.slug,
                description: restaurant.description,
                logo: restaurant.logo,
                coverImage: restaurant.coverImage,
                phone: restaurant.phone || '',
                email: restaurant.email || null,
                address: restaurant.address || '',
                city: restaurant.city || '',
                district: restaurant.district || null,
                isOpen: restaurant.isOpen,
                isBusy: restaurant.isBusy || false,
                acceptsDelivery: restaurant.acceptsDelivery,
                acceptsTakeaway: restaurant.acceptsTakeaway,
                acceptsDineIn: restaurant.acceptsDineIn,
                deliveryFee: restaurant.deliveryFee || 0,
                minOrderAmount: restaurant.minOrderAmount || 0,
                deliveryTime: restaurant.deliveryTime || 30,
                rating: restaurant.rating || 0,
                reviewCount: restaurant.reviewCount || 0,
                currency: restaurant.organization?.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
              },
              categories: allCategories,
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
                    imageUrl: item.image,
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
                    variants: item.variants || [],
                    options: item.options || [],
                  })),
                })),
              })),
            },
            timestamp: new Date().toISOString(),
            source: 'menu-hierarchy',
          }, { headers: NO_CACHE_HEADERS });
        }
      } catch (dbError) {
        console.warn('[PUBLIC MENU] Database menu query failed:', dbError);
        markDatabaseUnavailable();
      }
    }

    // No data available in database
    return NextResponse.json({
      success: false,
      error: 'Menu non disponible',
      source: 'database',
    }, { status: 404, headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('[PUBLIC MENU 500]', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      dbStatus: getDatabaseStatus(),
      hasDb: !!db,
    });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
