// Admin Item by ID API - Update and Delete
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// PUT /api/admin/items/[id] - Update an item (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    } = body;

    const item = await db.menuItem.update({
      where: { id },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        image: image || null,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        isNew: isNew ?? false,
      },
    });

    return apiSuccess(item);
  } catch (error) {
    console.error('Error updating item:', error);
    return apiError('Erreur lors de la mise à jour du plat', 500);
  }
}

// PATCH /api/admin/items/[id] - Partial update (e.g., toggle availability)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const item = await db.menuItem.update({
      where: { id },
      data: body,
    });

    return apiSuccess(item);
  } catch (error) {
    console.error('Error patching item:', error);
    return apiError('Erreur lors de la mise à jour du plat', 500);
  }
}

// DELETE /api/admin/items/[id] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.menuItem.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return apiError('Erreur lors de la suppression du plat', 500);
  }
}
