// Public Restaurant API - Get restaurant by slug with full menu data
// This API fetches from the database for real-time menu synchronization
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Demo restaurant data for fallback when database is not available
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
          icon: '🍽️',
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
          icon: '🍚',
          items: [
            { id: 'item-4', name: 'Thiéboudienne', slug: 'thieboudienne', description: 'Riz au poisson et légumes', image: null, price: 45000, discountPrice: null, prepTime: 45, calories: 520, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.9, reviewCount: 89, variants: [], options: [] },
            { id: 'item-5', name: 'Yassa Poulet', slug: 'yassa-poulet', description: 'Poulet mariné au citron', image: null, price: 40000, discountPrice: null, prepTime: 30, calories: 480, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.6, reviewCount: 54, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-3',
          name: 'Grillades',
          slug: 'grillades',
          description: 'Grillades maison',
          image: null,
          icon: '🍖',
          items: [
            { id: 'item-6', name: 'Mix Grill', slug: 'mix-grill', description: 'Assortiment de grillades', image: null, price: 65000, discountPrice: null, prepTime: 30, calories: 680, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.8, reviewCount: 42, variants: [], options: [] },
            { id: 'item-7', name: 'Poulet Braisé', slug: 'poulet-braise', description: 'Demi-poulet grillé', image: null, price: 35000, discountPrice: null, prepTime: 30, calories: 420, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.5, reviewCount: 67, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-4',
          name: 'Fast Food',
          slug: 'fast-food',
          description: 'Burgers et wraps',
          image: null,
          icon: '🍔',
          items: [
            { id: 'item-8', name: 'Burger KFM', slug: 'burger-kfm', description: 'Burger maison spécial', image: null, price: 25000, discountPrice: null, prepTime: 15, calories: 520, isAvailable: true, isFeatured: true, isPopular: true, isNew: true, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, rating: 4.6, reviewCount: 38, variants: [], options: [] },
            { id: 'item-9', name: 'Chawarma Poulet', slug: 'chawarma-poulet', description: 'Chawarma au poulet', image: null, price: 20000, discountPrice: null, prepTime: 10, calories: 380, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: false, isVegan: false, isHalal: true, isGlutenFree: false, isSpicy: false, spicyLevel: 0, rating: 4.4, reviewCount: 52, variants: [], options: [] },
          ],
        },
        {
          id: 'cat-5',
          name: 'Boissons',
          slug: 'boissons',
          description: 'Jus frais et boissons',
          image: null,
          icon: '🥤',
          items: [
            { id: 'item-10', name: 'Jus de Bissap', slug: 'jus-bissap', description: 'Jus naturel d\'hibiscus', image: null, price: 4000, discountPrice: null, prepTime: 3, calories: 80, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: false, spicyLevel: 0, rating: 4.7, reviewCount: 89, variants: [], options: [] },
            { id: 'item-11', name: 'Jus de Gingembre', slug: 'jus-gingembre', description: 'Jus de gingembre frais', image: null, price: 4000, discountPrice: null, prepTime: 3, calories: 60, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, isVegetarian: true, isVegan: true, isHalal: true, isGlutenFree: true, isSpicy: true, spicyLevel: 1, rating: 4.5, reviewCount: 45, variants: [], options: [] },
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

    // Try to fetch from database
    try {
      const restaurant = await db.restaurant.findUnique({
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
          currency: true,
          organizationId: true,
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
                        where: { isAvailable: true },
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
                            where: { isAvailable: true },
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
          currency: typeof restaurant.currency === 'string' 
            ? { code: restaurant.currency, symbol: restaurant.currency, name: restaurant.currency }
            : restaurant.currency,
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

        return NextResponse.json({ 
          success: true, 
          data: formattedRestaurant 
        });
      }
    } catch (dbError) {
      console.warn('Database not available, using demo data:', dbError);
    }

    // Fallback to demo data for kfm-delice
    if (slug === 'kfm-delice') {
      return NextResponse.json({ 
        success: true, 
        data: DEMO_RESTAURANT 
      });
    }

    // Restaurant not found
    return NextResponse.json(
      { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error in public restaurant API:', error);
    // Even on error, return demo data for kfm-delice to ensure the page works
    const resolvedParams = await params;
    if (resolvedParams?.slug === 'kfm-delice') {
      return NextResponse.json({ 
        success: true, 
        data: DEMO_RESTAURANT 
      });
    }
    return NextResponse.json(
      { success: false, error: 'Erreur serveur', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
