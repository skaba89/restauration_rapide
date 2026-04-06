// Public Restaurant API - Get restaurant by slug with full menu data
// IMPORTANT: This API returns demo data for kfm-delice WITHOUT requiring database connection
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

// Helper function to extract slug from URL
function extractSlugFromUrl(url: string): string | null {
  const match = url.match(/\/api\/public\/restaurant\/([^/?]+)/);
  return match ? match[1] : null;
}

// GET /api/public/restaurant/[slug] - Get restaurant with menus for public view
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // STEP 1: Check URL first for kfm-delice (fastest path - no async needed)
  const url = request.url || '';
  const urlSlug = extractSlugFromUrl(url);
  
  if (urlSlug === 'kfm-delice' || url.includes('kfm-delice')) {
    return NextResponse.json({ success: true, data: DEMO_RESTAURANT });
  }

  // STEP 2: Try to get slug from params
  let slug: string = urlSlug || '';
  
  try {
    const resolvedParams = await params;
    slug = resolvedParams?.slug || slug;
  } catch (paramError) {
    console.error('Error resolving params:', paramError);
    // slug already has value from URL extraction
  }

  // STEP 3: Check slug again for kfm-delice
  if (slug === 'kfm-delice') {
    return NextResponse.json({ success: true, data: DEMO_RESTAURANT });
  }

  // STEP 4: If no slug, return error
  if (!slug) {
    return NextResponse.json(
      { success: false, error: 'Slug manquant', code: 'MISSING_SLUG' },
      { status: 400 }
    );
  }

  // STEP 5: For other restaurants, return not found (demo mode)
  return NextResponse.json(
    { success: false, error: 'Restaurant non trouvé', code: 'NOT_FOUND' },
    { status: 404 }
  );
}
