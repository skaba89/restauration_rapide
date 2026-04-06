// Admin Items API - Create item
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// POST /api/admin/items - Create a new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      discountPrice,
      prepTime,
      image,
      isAvailable,
      isFeatured,
      isPopular,
      isNew,
      categoryId,
    } = body;

    if (!name || !price || !categoryId) {
      return apiError('Le nom, le prix et la catégorie sont requis', 400);
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Get the max sortOrder for this category
    const maxSort = await db.menuItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const item = await db.menuItem.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        image: image || null,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        isNew: isNew ?? false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        categoryId,
      },
    });

    return apiSuccess(item);
  } catch (error) {
    console.error('Error creating item:', error);
    return apiError('Erreur lors de la création du plat', 500);
  }
}
