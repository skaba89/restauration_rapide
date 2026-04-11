// Menu Items API - CRUD Operations
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';
import { NextRequest } from 'next/server';

// Demo menu items for fallback
const DEMO_ITEMS = [
  { id: 'demo-1', categoryId: 'demo-cat-1', name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', price: 8000, description: 'Attieké accompagné de poisson grillé', image: null, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, prepTime: 20 },
  { id: 'demo-2', categoryId: 'demo-cat-1', name: 'Kedjenou de Poulet', slug: 'kedjenou-de-poulet', price: 7000, description: 'Poulet braisé aux légumes', image: null, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, prepTime: 25 },
  { id: 'demo-3', categoryId: 'demo-cat-1', name: 'Thiéboudienne', slug: 'thieboudienne', price: 7000, description: 'Riz rouge au poisson', image: null, isAvailable: true, isFeatured: false, isPopular: true, isNew: true, prepTime: 30 },
  { id: 'demo-4', categoryId: 'demo-cat-2', name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', price: 5000, description: 'Bananes plantain frites avec sauce', image: null, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, prepTime: 15 },
  { id: 'demo-5', categoryId: 'demo-cat-1', name: 'Riz Gras', slug: 'riz-gras', price: 5000, description: 'Riz sauté à la viande', image: null, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, prepTime: 20 },
  { id: 'demo-6', categoryId: 'demo-cat-3', name: 'Jus de Bissap', slug: 'jus-de-bissap', price: 1500, description: 'Jus frais d\'hibiscus', image: null, isAvailable: true, isFeatured: false, isPopular: true, isNew: false, prepTime: 5 },
  { id: 'demo-7', categoryId: 'demo-cat-3', name: 'Jus de Gingembre', slug: 'jus-de-gingembre', price: 1500, description: 'Jus de gingembre frais', image: null, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, prepTime: 5 },
  { id: 'demo-8', categoryId: 'demo-cat-2', name: 'Banane Plantain Frite', slug: 'banane-plantain-frite', price: 2000, description: 'Bananes plantain frites', image: null, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, prepTime: 10 },
  { id: 'demo-9', categoryId: 'demo-cat-1', name: 'Garba', slug: 'garba', price: 3500, description: 'Attiéké au thon et piment', image: null, isAvailable: true, isFeatured: true, isPopular: true, isNew: false, prepTime: 15 },
  { id: 'demo-10', categoryId: 'demo-cat-1', name: 'Foutou Banane', slug: 'foutou-banane', price: 6000, description: 'Pâte de banane plantain', image: null, isAvailable: true, isFeatured: false, isPopular: false, isNew: false, prepTime: 30 },
];

// GET /api/menu-items - List all items
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const menuId = searchParams.get('menuId');
    const restaurantId = searchParams.get('restaurantId');
    const isAvailable = searchParams.get('isAvailable');
    const demo = searchParams.get('demo');

    // Return demo data if requested or no IDs provided
    if (demo === 'true' || (!categoryId && !menuId && !restaurantId)) {
      let items = DEMO_ITEMS;
      if (categoryId) {
        items = items.filter(i => i.categoryId === categoryId);
      }
      if (isAvailable !== null) {
        items = items.filter(i => i.isAvailable === (isAvailable === 'true'));
      }
      return apiSuccess(items);
    }

    // Build filter
    const where: Record<string, unknown> = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (menuId) {
      where.category = { menuId };
    } else if (restaurantId) {
      where.category = {
        menu: { restaurantId }
      };
    }

    if (isAvailable !== null) {
      where.isAvailable = isAvailable === 'true';
    }

    const items = await db.menuItem.findMany({
      where,
      orderBy: [{ name: 'asc' }],
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return apiSuccess(items);
  });
}

// POST /api/menu-items - Create a new menu item
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      categoryId,
      name,
      description,
      image,
      price,
      discountPrice,
      costPrice,
      prepTime,
      isAvailable,
      isFeatured,
      isPopular,
      isNew,
      isVegetarian,
      isVegan,
      isHalal,
      isGlutenFree,
      isSpicy,
      spicyLevel,
      calories,
    } = body;

    if (!categoryId || !name || price === undefined) {
      return apiError('categoryId, name et price sont requis', 400);
    }

    // Check if category exists
    const category = await db.menuCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return apiError('Catégorie non trouvée', 404);
    }

    const slug = generateSlug(name);

    // Check for duplicate slug in this category
    const existingItem = await db.menuItem.findFirst({
      where: { categoryId, slug }
    });

    const item = await db.menuItem.create({
      data: {
        categoryId,
        name,
        slug: existingItem ? `${slug}-${Date.now()}` : slug,
        description: description || null,
        image: image || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        prepTime: prepTime || null,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        isNew: isNew ?? false,
        isVegetarian: isVegetarian ?? false,
        isVegan: isVegan ?? false,
        isHalal: isHalal ?? false,
        isGlutenFree: isGlutenFree ?? false,
        isSpicy: isSpicy ?? false,
        spicyLevel: spicyLevel || 0,
        calories: calories || null,
        itemType: 'food',
        trackInventory: false,
      },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return apiSuccess(item, 201);
  });
}
