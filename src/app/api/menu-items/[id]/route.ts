// Menu Item API - Single item operations
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';
import { NextRequest } from 'next/server';

// GET /api/menu-items/[id] - Get a single menu item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const item = await db.menuItem.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, menuId: true }
        },
        variants: true,
        options: {
          include: { values: true }
        }
      }
    });

    if (!item) {
      return apiError('Article non trouvé', 404);
    }

    return apiSuccess(item);
  });
}

// PUT /api/menu-items/[id] - Update a menu item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const {
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
      categoryId,
    } = body;

    const existingItem = await db.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return apiError('Article non trouvé', 404);
    }

    const updateData: Record<string, unknown> = {};

    if (name) {
      updateData.name = name;
      const slug = generateSlug(name);
      // Check for duplicate slug
      const duplicate = await db.menuItem.findFirst({
        where: { 
          categoryId: categoryId || existingItem.categoryId, 
          slug,
          id: { not: id }
        }
      });
      updateData.slug = duplicate ? `${slug}-${Date.now()}` : slug;
    }
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? parseFloat(discountPrice) : null;
    if (costPrice !== undefined) updateData.costPrice = costPrice ? parseFloat(costPrice) : null;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (isNew !== undefined) updateData.isNew = isNew;
    if (isVegetarian !== undefined) updateData.isVegetarian = isVegetarian;
    if (isVegan !== undefined) updateData.isVegan = isVegan;
    if (isHalal !== undefined) updateData.isHalal = isHalal;
    if (isGlutenFree !== undefined) updateData.isGlutenFree = isGlutenFree;
    if (isSpicy !== undefined) updateData.isSpicy = isSpicy;
    if (spicyLevel !== undefined) updateData.spicyLevel = spicyLevel;
    if (calories !== undefined) updateData.calories = calories;
    if (categoryId) updateData.categoryId = categoryId;

    const item = await db.menuItem.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return apiSuccess(item);
  });
}

// DELETE /api/menu-items/[id] - Delete a menu item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;

    const item = await db.menuItem.findUnique({
      where: { id }
    });

    if (!item) {
      return apiError('Article non trouvé', 404);
    }

    // Delete related data first
    await db.menuItemVariant.deleteMany({ where: { menuItemId: id } });
    await db.menuItemOptionValue.deleteMany({
      where: { option: { menuItemId: id } }
    });
    await db.menuItemOption.deleteMany({ where: { menuItemId: id } });
    await db.menuItemAllergen.deleteMany({ where: { menuItemId: id } });
    await db.menuItemIngredient.deleteMany({ where: { menuItemId: id } });

    // Delete the item
    await db.menuItem.delete({
      where: { id }
    });

    return apiSuccess({ message: 'Article supprimé avec succès' });
  });
}

// PATCH /api/menu-items/[id] - Toggle availability
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const { isAvailable } = body;

    const existingItem = await db.menuItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return apiError('Article non trouvé', 404);
    }

    const item = await db.menuItem.update({
      where: { id },
      data: { isAvailable: isAvailable ?? !existingItem.isAvailable },
      include: {
        category: {
          select: { id: true, name: true }
        }
      }
    });

    return apiSuccess(item);
  });
}
