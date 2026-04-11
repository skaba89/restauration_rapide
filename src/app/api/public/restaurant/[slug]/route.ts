// Public Restaurant API - Get restaurant by slug with full menu data
// This API fetches from the database for real-time menu synchronization
// Falls back to default data if database is empty
import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';

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

// Default menu items
const DEFAULT_MENU_ITEMS = [
  // PLATS IVOIRIENS
  { id: '1', name: 'Attieké Poisson Grillé', slug: 'attieke-poisson', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', price: 45000, category: 'Plats Ivoiriens', prepTime: 20, isPopular: true, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' },
  { id: '2', name: 'Alloco Sauce Graine', slug: 'alloco-sauce', description: 'Bananes plantains frites avec sauce graine de palme', price: 25000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80' },
  { id: '3', name: 'Garba', slug: 'garba', description: 'Attieké avec poisson frit, oignons et piment', price: 30000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&q=80' },
  
  // PLATS SÉNÉGALAIS
  { id: '4', name: 'Thiéboudienne', slug: 'thieboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 45000, category: 'Plats Sénégalais', prepTime: 45, isPopular: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80' },
  { id: '5', name: 'Yassa Poulet', slug: 'yassa-poulet', description: 'Poulet mariné au citron et oignons caramélisés', price: 40000, category: 'Plats Sénégalais', prepTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '6', name: 'Mafé', slug: 'mafe', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', price: 40000, category: 'Plats Sénégalais', prepTime: 35, isPopular: true, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80' },
  
  // PLATS GUINÉENS
  { id: '7', name: 'Poulet Yassa Guinéen', slug: 'poulet-yassa-gn', description: 'Poulet mariné au citron style guinéen', price: 45000, category: 'Plats Guinéens', prepTime: 35, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '8', name: 'Konkoé', slug: 'konkoe', description: 'Pâte de manioc avec sauce aux arachides', price: 30000, category: 'Plats Guinéens', prepTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80' },
  
  // GRILLADES
  { id: '9', name: 'Mix Grill', slug: 'mix-grill', description: 'Assortiment de grillades (poulet, bœuf, agneau)', price: 65000, category: 'Grillades', prepTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' },
  { id: '10', name: 'Poulet Braisé', slug: 'poulet-braise', description: 'Demi-poulet grillé aux épices africaines', price: 35000, category: 'Grillades', prepTime: 30, isPopular: true, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80' },
  { id: '11', name: 'Brochettes de Bœuf', slug: 'brochettes-boeuf', description: '5 brochettes de bœuf marinées aux épices', price: 30000, category: 'Grillades', prepTime: 20, image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
  
  // FAST FOOD
  { id: '12', name: 'Burger KFM', slug: 'burger-kfm', description: 'Burger maison avec viande fraîche et sauce spéciale', price: 25000, category: 'Fast Food', prepTime: 15, isPopular: true, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80' },
  { id: '13', name: 'Chawarma Poulet', slug: 'chawarma-poulet', description: 'Chawarma au poulet grillé avec sauce blanche', price: 20000, category: 'Fast Food', prepTime: 10, isPopular: true, image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&q=80' },
  { id: '14', name: 'Chawarma Viande', slug: 'chawarma-viande', description: 'Chawarma à la viande épicée', price: 22000, category: 'Fast Food', prepTime: 10, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&q=80' },
  
  // BOISSONS
  { id: '15', name: 'Jus de Bissap', slug: 'jus-bissap', description: 'Jus naturel de fleur d\'hibiscus', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80' },
  { id: '16', name: 'Jus de Gingembre', slug: 'jus-gingembre', description: 'Jus de gingembre frais et épicé', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80' },
  { id: '17', name: 'Jus de Baobab', slug: 'jus-baobab', description: 'Jus de fruit de baobab', price: 5000, category: 'Boissons', prepTime: 3, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80' },
  { id: '18', name: 'Ataya', slug: 'ataya', description: 'Thé à la menthe guinéen', price: 3000, category: 'Boissons', prepTime: 10, image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80' },
];

// Build categories from items
function buildCategories(items: typeof DEFAULT_MENU_ITEMS) {
  const categoryMap = new Map<string, typeof items>();
  
  for (const item of items) {
    const cat = item.category;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    categoryMap.get(cat)!.push({
      ...item,
      isAvailable: true,
      isFeatured: item.isPopular || false,
      isNew: false,
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
      discountPrice: null,
      calories: null,
    });
  }
  
  const categoryOrder = ['Plats Ivoiriens', 'Plats Sénégalais', 'Plats Guinéens', 'Grillades', 'Fast Food', 'Boissons'];
  
  return categoryOrder
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
}

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

    // Only support kfm-delice for now
    if (slug !== 'kfm-delice') {
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if database is available
    if (isDatabaseAvailable() && db) {
      try {
        // Try to fetch restaurant from database
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

        if (restaurant && restaurant.menus.length > 0) {
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
    }

    // Fall back to default data
    const defaultRestaurant = {
      ...DEFAULT_RESTAURANT,
      menus: [{
        id: 'main-menu',
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet KFM DELICE',
        menuType: 'main',
        categories: buildCategories(DEFAULT_MENU_ITEMS),
      }],
    };

    return NextResponse.json({ 
      success: true, 
      data: defaultRestaurant,
      timestamp: new Date().toISOString(),
      source: 'default',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error in public restaurant API:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
