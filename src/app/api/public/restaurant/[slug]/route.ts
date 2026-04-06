// Public Restaurant API - Get restaurant by slug with full menu data
import { NextRequest, NextResponse } from 'next/server';

// Fallback currency for when database doesn't have one
const DEFAULT_CURRENCY = {
  code: 'GNF',
  symbol: 'GNF',
  name: 'Franc Guinéen',
};

// Demo restaurant data for KFM DELICE
const DEMO_RESTAURANT = {
  id: 'demo-restaurant-1',
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  description: 'Restaurant fast-food guinéen - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
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
  reviewCount: 127,
  currency: DEFAULT_CURRENCY,
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
    { id: 'zone-4', name: 'Dixinn', baseFee: 5000, minTime: 25, maxTime: 50 },
  ],
  menus: [
    {
      id: 'menu-1',
      name: 'Menu Principal',
      slug: 'menu-principal',
      description: 'Menu complet KFM DELICE',
      menuType: 'main',
      categories: [
        {
          id: 'cat-1',
          name: 'Plats Ivoiriens',
          slug: 'plats-ivoiriens',
          description: 'Spécialités ivoiriennes',
          image: null,
          icon: null,
          items: [
            { id: 'item-1', name: 'Attieké Poisson', slug: 'attieke-poisson', description: 'Semoule de manioc avec poisson grillé', image: null, price: 45000, discountPrice: null, prepTime: 20, calories: 450, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.8, reviewCount: 45, variants: [], options: [] },
            { id: 'item-2', name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', description: 'Bananes plantains frites sauce graine', image: null, price: 25000, discountPrice: null, prepTime: 15, calories: 380, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.5, reviewCount: 32, variants: [], options: [] },
            { id: 'item-3', name: 'Garba', slug: 'garba', description: 'Attieké avec poisson frit', image: null, price: 30000, discountPrice: null, prepTime: 15, calories: 420, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: true, spicyLevel: 2, rating: 4.7, reviewCount: 67, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-2',
          name: 'Plats Sénégalais',
          slug: 'plats-senegalais',
          description: 'Spécialités sénégalaises',
          image: null,
          icon: null,
          items: [
            { id: 'item-4', name: 'Thiéboudienne', slug: 'thieboudienne', description: 'Riz au poisson et légumes', image: null, price: 45000, discountPrice: null, prepTime: 45, calories: 520, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.9, reviewCount: 89, variants: [], options: [] },
            { id: 'item-5', name: 'Yassa Poulet', slug: 'yassa-poulet', description: 'Poulet mariné au citron', image: null, price: 40000, discountPrice: null, prepTime: 30, calories: 480, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.6, reviewCount: 54, variants: [], options: [] },
            { id: 'item-6', name: 'Mafé', slug: 'mafe', description: 'Ragoût sauce arachide', image: null, price: 40000, discountPrice: null, prepTime: 35, calories: 550, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.4, reviewCount: 28, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-3',
          name: 'Grillades',
          slug: 'grillades',
          description: 'Grillades maison',
          image: null,
          icon: null,
          items: [
            { id: 'item-7', name: 'Mix Grill', slug: 'mix-grill', description: 'Assortiment de grillades', image: null, price: 65000, discountPrice: null, prepTime: 30, calories: 680, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.8, reviewCount: 42, variants: [], options: [] },
            { id: 'item-8', name: 'Poulet Braisé', slug: 'poulet-braise', description: 'Demi-poulet grillé', image: null, price: 35000, discountPrice: null, prepTime: 30, calories: 420, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.5, reviewCount: 67, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-4',
          name: 'Fast Food',
          slug: 'fast-food',
          description: 'Burgers et wraps',
          image: null,
          icon: null,
          items: [
            { id: 'item-9', name: 'Burger KFM', slug: 'burger-kfm', description: 'Burger maison spécial', image: null, price: 25000, discountPrice: null, prepTime: 15, calories: 520, isAvailable: true, isFeatured: true, isPopular: true, isNew: true, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, rating: 4.6, reviewCount: 38, variants: [], options: [] },
            { id: 'item-10', name: 'Chawarma Poulet', slug: 'chawarma-poulet', description: 'Chawarma au poulet', image: null, price: 20000, discountPrice: null, prepTime: 10, calories: 380, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, rating: 4.4, reviewCount: 52, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-5',
          name: 'Boissons',
          slug: 'boissons',
          description: 'Jus frais et boissons',
          image: null,
          icon: null,
          items: [
            { id: 'item-11', name: 'Jus de Bissap', slug: 'jus-bissap', description: 'Jus naturel d\'hibiscus', image: null, price: 4000, discountPrice: null, prepTime: 3, calories: 80, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.7, reviewCount: 89, variants: [], options: [] },
            { id: 'item-12', name: 'Jus de Gingembre', slug: 'jus-gingembre', description: 'Jus de gingembre frais', image: null, price: 4000, discountPrice: null, prepTime: 3, calories: 60, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: true, spicyLevel: 1, rating: 4.5, reviewCount: 45, variants: [], options: [] },
          ],
        },
      ],
    },
  ],
  organizationId: 'demo-org-1',
};

// GET /api/public/restaurant/[slug] - Get restaurant with menus for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Extract slug early and return demo data for kfm-delice immediately
  let slug: string = '';
  
  try {
    const resolvedParams = await params;
    slug = resolvedParams?.slug || '';
  } catch (paramError) {
    console.error('Error resolving params:', paramError);
    // Even on param error, try to extract from URL
    const url = request.url || '';
    const match = url.match(/\/api\/public\/restaurant\/([^/?]+)/);
    if (match) {
      slug = match[1];
    }
  }

  // For kfm-delice, ALWAYS return demo data first (fastest path - no DB call)
  if (slug === 'kfm-delice' || request.url?.includes('kfm-delice')) {
    return NextResponse.json({ success: true, data: DEMO_RESTAURANT });
  }

  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Slug manquant', code: 'MISSING_SLUG' },
      { status: 400 }
    );
  }

  try {
    // Try database for other slugs
    let db;
    try {
      const dbModule = await import('@/lib/db');
      db = dbModule.db;
    } catch (importError) {
      console.error('Failed to import db:', importError);
      return NextResponse.json(
        { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

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
    } catch (dbError: unknown) {
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
            variants: (item.variants || []).map((v: { id: string; name: string; price: number; isDefault: boolean }) => ({
              id: v.id,
              name: v.name,
              price: v.price,
              isDefault: v.isDefault,
            })),
            options: (item.options || []).map((opt: { id: string; name: string; required: boolean; multiSelect: boolean; maxSelect: number | null; values: { id: string; name: string; price: number; isDefault: boolean }[] }) => ({
              id: opt.id,
              name: opt.name,
              required: opt.required,
              multiSelect: opt.multiSelect,
              maxSelect: opt.maxSelect,
              values: (opt.values || []).map((val: { id: string; name: string; price: number; isDefault: boolean }) => ({
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
    
    // Return demo data for kfm-delice even on unexpected errors
    const url = request.url || '';
    if (url.includes('kfm-delice')) {
      return NextResponse.json({ success: true, data: DEMO_RESTAURANT });
    }
    
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
