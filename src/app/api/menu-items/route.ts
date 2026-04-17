// Menu Items API - CRUD Operations
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';
import { NextRequest } from 'next/server';

// GET /api/menu-items - List all items
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const menuId = searchParams.get('menuId');
    const restaurantId = searchParams.get('restaurantId');
    const isAvailable = searchParams.get('isAvailable');

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