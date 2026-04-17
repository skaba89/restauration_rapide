// Public Restaurant API - Get restaurant by slug with full menu data
// Auto-creates SimpleMenuItem table if missing for persistence
// Falls back to demo store when database is unavailable
import { NextRequest, NextResponse } from 'next/server';
import { db, ensureDbConnection } from '@/lib/db';
import { ensureSimpleMenuItemTable } from '@/lib/db-setup';
import { getDemoMenuByCategory } from '@/lib/demo-menu-store';

// Default KFM DELICE restaurant info
const DEFAULT_RESTAURANT = {
  id: 'kfm-delice-default',
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  description: 'Restaurant fast-food guinéen - Saveurs authentiques de Guinée, Côte d\'Ivoire et Sénégal',
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
  settings: {
    acceptsCash: true,
    acceptsMobileMoney: true,
    acceptsCard: false,
    deliveryEnabled: true,
    minOrderAmount: 10000,
    defaultDeliveryFee: 5000,
  },
  hours: [
    { dayOfWeek: 0, openTime: '10:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 1, openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 2, openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 3, openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 4, openTime: '08:00', closeTime: '22:00', isClosed: false },
    { dayOfWeek: 5, openTime: '08:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 6, openTime: '09:00', closeTime: '23:00', isClosed: false },
  ],
  deliveryZones: [
    { id: 'zone-ratoma', name: 'Ratoma', baseFee: 5000, minTime: 15, maxTime: 30 },
    { id: 'zone-nongo', name: 'Nongo', baseFee: 3000, minTime: 10, maxTime: 25 },
    { id: 'zone-kaloum', name: 'Kaloum', baseFee: 5000, minTime: 20, maxTime: 45 },
    { id: 'zone-dixinn', name: 'Dixinn', baseFee: 5000, minTime: 25, maxTime: 50 },
    { id: 'zone-matam', name: 'Matam', baseFee: 6000, minTime: 30, maxTime: 55 },
    { id: 'zone-matoto', name: 'Matoto', baseFee: 6000, minTime: 30, maxTime: 55 },
  ],
};

// Build categories from SimpleMenuItem DB records
function buildCategoriesFromDb(items: any[]) {
  const categoryMap = new Map<string, any[]>();
  const categoryOrder = ['Plats Ivoiriens', 'Plats Sénégalais', 'Plats Guinéens', 'Grillades', 'Fast Food', 'Boissons', 'Autres'];

  for (const item of items) {
    if (!item.isAvailable) continue;
    const cat = item.category || 'Autres';
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push({
      id: item.id,
      name: item.name,
      slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: item.description || '',
      image: item.image,
      price: item.price,
      discountPrice: null,
      prepTime: item.preparationTime,
      calories: null,
      isAvailable: item.isAvailable,
      isFeatured: item.isPopular || false,
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

  // Show known categories in order first, then any new categories added via admin
  const orderedCategories = categoryOrder
    .filter(name => categoryMap.has(name))
    .map((name, index) => ({
      id: `cat-${index}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: `Spécialités ${name.toLowerCase()}`,
      image: null,
      icon: null,
      items: categoryMap.get(name) || [],
    }));

  // Add any categories not in the predefined order (e.g. added by admin)
  const extraCategories: any[] = [];
  categoryMap.forEach((items, name) => {
    if (!categoryOrder.includes(name)) {
      extraCategories.push({
        id: `cat-${orderedCategories.length + extraCategories.length}`,
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description: `Spécialités ${name.toLowerCase()}`,
        image: null,
        icon: null,
        items,
      });
    }
  });

  return [...orderedCategories, ...extraCategories];
}

// GET /api/public/restaurant/[slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug requis', code: 'MISSING_SLUG' }, { status: 400 });
    }

    if (slug !== 'kfm-delice') {
      return NextResponse.json({ success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Try to read SimpleMenuItem from database (auto-creates table if needed)
    // Use ensureDbConnection with 3s timeout (same as other fixed APIs)
    const dbReady = await ensureDbConnection(3000);
    if (dbReady && db) {
      try {
        const tableReady = await ensureSimpleMenuItemTable();
        if (tableReady) {
          const items = await db.simpleMenuItem.findMany({
            where: { isAvailable: true },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
          });

          if (items.length > 0) {
            // Build menu from SimpleMenuItem table data
            const categories = buildCategoriesFromDb(items);
            const defaultRestaurant = {
              ...DEFAULT_RESTAURANT,
              menus: [{
                id: 'main-menu',
                name: 'Menu Principal',
                slug: 'menu-principal',
                description: 'Menu complet KFM DELICE',
                menuType: 'main',
                categories,
              }],
            };

            return NextResponse.json({
              success: true,
              data: defaultRestaurant,
              timestamp: new Date().toISOString(),
              source: 'database',
            }, {
              headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
              },
            });
          }
        }
      } catch (dbError) {
        console.warn('SimpleMenuItem query error, using demo fallback:', dbError);
      }

      // Also try the full restaurant hierarchy (for multi-tenant future)
      try {
        const restaurant = await db.restaurant.findFirst({
          where: { slug, isActive: true },
          select: {
            id: true, name: true, slug: true, description: true, logo: true,
            coverImage: true, phone: true, email: true, address: true, city: true,
            district: true, isOpen: true, isBusy: true, acceptsDelivery: true,
            acceptsTakeaway: true, acceptsDineIn: true, deliveryFee: true,
            minOrderAmount: true, deliveryTime: true, rating: true, reviewCount: true,
            organizationId: true,
            organization: { select: { currency: { select: { code: true, symbol: true, name: true } } } },
            settings: true,
            hours: { orderBy: { dayOfWeek: 'asc' } },
            deliveryZones: { where: { isActive: true }, orderBy: { name: 'asc' } },
            menus: {
              where: { isActive: true }, orderBy: { sortOrder: 'asc' },
              select: {
                id: true, name: true, slug: true, description: true, menuType: true,
                categories: {
                  where: { isActive: true }, orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true, name: true, slug: true, description: true, image: true, icon: true,
                    items: {
                      where: { isAvailable: true }, orderBy: { sortOrder: 'asc' },
                      select: {
                        id: true, name: true, slug: true, description: true, image: true,
                        price: true, discountPrice: true, prepTime: true, calories: true,
                        isAvailable: true, isFeatured: true, isPopular: true, isNew: true,
                        isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true,
                        isSpicy: true, spicyLevel: true, rating: true, reviewCount: true,
                        variants: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, price: true, isDefault: true } },
                        options: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, required: true, multiSelect: true, maxSelect: true, values: { orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, price: true, isDefault: true } } } },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (restaurant && restaurant.menus.length > 0) {
          const formattedRestaurant = {
            ...restaurant,
            currency: restaurant.organization?.currency || { code: 'GNF', symbol: 'GNF', name: 'Franc Guinéen' },
            organization: undefined,
            settings: restaurant.settings as any,
            hours: restaurant.hours.map((h: any) => ({ dayOfWeek: h.dayOfWeek, openTime: h.openTime, closeTime: h.closeTime, isClosed: h.isClosed })),
            deliveryZones: restaurant.deliveryZones.map((z: any) => ({ id: z.id, name: z.name, baseFee: z.baseFee, minTime: z.minTime, maxTime: z.maxTime })),
            menus: restaurant.menus.map((menu: any) => ({
              ...menu,
              categories: menu.categories.map((cat: any) => ({ ...cat, items: cat.items.map((item: any) => ({ ...item, variants: item.variants || [], options: item.options || [] })) })),
            })),
          };

          return NextResponse.json({ success: true, data: formattedRestaurant, timestamp: new Date().toISOString() }, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' },
          });
        }
      } catch (dbError) {
        console.warn('Restaurant hierarchy query error:', dbError);
      }
    }

    // Fall back to demo store
    const defaultRestaurant = {
      ...DEFAULT_RESTAURANT,
      menus: [{
        id: 'main-menu',
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet KFM DELICE',
        menuType: 'main',
        categories: getDemoMenuByCategory(),
      }],
    };

    return NextResponse.json({ success: true, data: defaultRestaurant, timestamp: new Date().toISOString(), source: 'default' }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate', 'Pragma': 'no-cache', 'Expires': '0' },
    });
  } catch (error) {
    console.error('Error in public restaurant API:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur', code: 'SERVER_ERROR' }, { status: 500 });
  }
}
