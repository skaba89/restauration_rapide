// Public Restaurant API - Get restaurant by slug with full menu data
// This API fetches from the database for real-time menu synchronization
// Reads from SimpleMenuItem table (same as admin) for consistency
import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

// Default KFM DELICE restaurant info (can be edited in admin settings)
const DEFAULT_RESTAURANT_INFO = {
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  description: 'Restaurant fast-food guinéen - Saveurs authentiques',
  logo: null,
  coverImage: null,
  phone: '+224623217240',
  email: 'contact@kfm-delice.com',
  address: 'Nongo',
  city: 'Conakry',
  district: 'Ratoma',
  isOpen: true,
  isBusy: false,
  acceptsDelivery: true,
  acceptsTakeaway: true,
  acceptsDineIn: true,
  deliveryFee: 5000,
  minOrderAmount: 10000,
  deliveryTime: 30,
  rating: 4.5,
  reviewCount: 0,
  currency: {
    code: 'GNF',
    symbol: 'GNF',
    name: 'Franc Guinéen',
  },
};

// GET /api/public/restaurant/[slug] - Get restaurant with menus for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Resolve params
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      return NextResponse.json({
        success: false,
        error: 'Base de données non disponible',
        code: 'DB_UNAVAILABLE',
      }, { status: 503 });
    }

    // Try to fetch restaurant from database first
    try {
      const restaurant = await db.restaurant.findFirst({
        where: { 
          slug,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          coverImage: true,
          phone: true,
          email: true,
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
          organizationId: true,
          organization: {
            select: {
              currency: {
                select: {
                  code: true,
                  symbol: true,
                  name: true,
                }
              }
            }
          },
          settings: true,
          hours: {
            orderBy: { dayOfWeek: 'asc' },
          },
          deliveryZones: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
          },
          menus: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              menuType: true,
              categories: {
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' },
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  description: true,
                  image: true,
                  icon: true,
                  items: {
                    where: { isAvailable: true },
                    orderBy: { sortOrder: 'asc' },
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      description: true,
                      image: true,
                      price: true,
                      discountPrice: true,
                      prepTime: true,
                      calories: true,
                      isAvailable: true,
                      isFeatured: true,
                      isPopular: true,
                      isNew: true,
                      isVegetarian: true,
                      isVegan: true,
                      isHalal: true,
                      isGlutenFree: true,
                      isSpicy: true,
                      spicyLevel: true,
                      rating: true,
                      reviewCount: true,
                      variants: {
                        orderBy: { sortOrder: 'asc' },
                        select: {
                          id: true,
                          name: true,
                          price: true,
                          isDefault: true,
                        },
                      },
                      options: {
                        orderBy: { sortOrder: 'asc' },
                        select: {
                          id: true,
                          name: true,
                          required: true,
                          multiSelect: true,
                          maxSelect: true,
                          values: {
                            orderBy: { sortOrder: 'asc' },
                            select: {
                              id: true,
                              name: true,
                              price: true,
                              isDefault: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (restaurant) {
        // Transform database result to match expected format
        const formattedRestaurant = {
          ...restaurant,
          currency: restaurant.organization?.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
          organization: undefined,
          settings: restaurant.settings as any,
          hours: restaurant.hours.map((h: any) => ({
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
          deliveryZones: restaurant.deliveryZones.map((z: any) => ({
            id: z.id,
            name: z.name,
            baseFee: z.baseFee,
            minTime: z.minTime,
            maxTime: z.maxTime,
          })),
          menus: restaurant.menus.map((menu: any) => ({
            ...menu,
            categories: menu.categories.map((cat: any) => ({
              ...cat,
              items: cat.items.map((item: any) => ({
                ...item,
                variants: item.variants || [],
                options: item.options || [],
              })),
            })),
          })),
        };

        // Return with no-cache headers for real-time menu sync
        return NextResponse.json({ 
          success: true, 
          data: formattedRestaurant,
          timestamp: new Date().toISOString(),
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
      }
    } catch (dbError) {
      console.warn('Database query error:', dbError);
    }

    // If no restaurant found in database, try to use SimpleMenuItem data (admin menu)
    // This ensures the public menu shows what's in the admin
    if (slug === 'kfm-delice') {
      try {
        const menuItems = await db.simpleMenuItem.findMany({
          where: { isAvailable: true },
          orderBy: [
            { category: 'asc' },
            { name: 'asc' },
          ],
        });

        // Group items by category
        const categoryMap = new Map<string, any[]>();
        for (const item of menuItems) {
          const category = item.category || 'Autres';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)!.push({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/\s+/g, '-'),
            description: item.description || '',
            image: item.image,
            price: item.price,
            discountPrice: null,
            prepTime: item.preparationTime,
            calories: null,
            isAvailable: item.isAvailable,
            isFeatured: false,
            isPopular: item.isPopular,
            isNew: item.isNew,
            isVegetarian: false,
            isVegan: false,
            isHalal: true,
            isGlutenFree: false,
            isSpicy: false,
            spicyLevel: 0,
            rating: 0,
            reviewCount: 0,
            variants: [],
            options: [],
          });
        }

        // Build categories array
        const categories = Array.from(categoryMap.entries()).map(([name, items], index) => ({
          id: `cat-${index}`,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          image: null,
          icon: null,
          items,
        }));

        // Try to get restaurant settings from database
        let restaurantInfo = { ...DEFAULT_RESTAURANT_INFO };
        
        try {
          const savedSettings = await db.restaurantSettings.findFirst();
          if (savedSettings) {
            // Get the associated restaurant for address info
            const associatedRestaurant = await db.restaurant.findFirst({
              where: { id: savedSettings.restaurantId },
            });
            if (associatedRestaurant) {
              restaurantInfo = {
                ...restaurantInfo,
                name: associatedRestaurant.name || restaurantInfo.name,
                phone: associatedRestaurant.phone || restaurantInfo.phone,
                email: associatedRestaurant.email || restaurantInfo.email,
                address: associatedRestaurant.address || restaurantInfo.address,
                city: associatedRestaurant.city || restaurantInfo.city,
                district: associatedRestaurant.district || restaurantInfo.district,
                deliveryFee: associatedRestaurant.deliveryFee || restaurantInfo.deliveryFee,
                minOrderAmount: associatedRestaurant.minOrderAmount || restaurantInfo.minOrderAmount,
                isOpen: associatedRestaurant.isOpen,
                acceptsDelivery: associatedRestaurant.acceptsDelivery,
                acceptsTakeaway: associatedRestaurant.acceptsTakeaway,
                acceptsDineIn: associatedRestaurant.acceptsDineIn,
              };
            }
          }
        } catch {
          // Use default settings
        }

        // Build restaurant response from SimpleMenuItem data
        const restaurant = {
          id: 'simple-menu-restaurant',
          ...restaurantInfo,
          settings: {
            acceptsCash: true,
            acceptsMobileMoney: true,
            acceptsCard: false,
            deliveryEnabled: true,
            minOrderAmount: restaurantInfo.minOrderAmount,
            defaultDeliveryFee: restaurantInfo.deliveryFee,
          },
          hours: [
            { dayOfWeek: 0, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 1, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 2, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 3, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 4, openTime: '10:00', closeTime: '22:00', isClosed: false },
            { dayOfWeek: 5, openTime: '10:00', closeTime: '23:00', isClosed: false },
            { dayOfWeek: 6, openTime: '10:00', closeTime: '23:00', isClosed: false },
          ],
          deliveryZones: [
            { id: 'zone-1', name: 'Ratoma', baseFee: 3000, minTime: 15, maxTime: 30 },
            { id: 'zone-2', name: 'Nongo', baseFee: 2000, minTime: 10, maxTime: 25 },
            { id: 'zone-3', name: 'Kaloum', baseFee: 5000, minTime: 20, maxTime: 45 },
          ],
          menus: [{
            id: 'main-menu',
            name: 'Menu Principal',
            slug: 'menu-principal',
            description: 'Notre menu complet',
            menuType: 'main',
            categories,
          }],
          organizationId: 'default-org',
        };

        return NextResponse.json({ 
          success: true, 
          data: restaurant,
          timestamp: new Date().toISOString(),
          source: 'simple-menu',
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        });
      } catch (menuError) {
        console.error('Error fetching SimpleMenuItem data:', menuError);
      }
    }

    // Restaurant not found
    return NextResponse.json(
      { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in public restaurant API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
