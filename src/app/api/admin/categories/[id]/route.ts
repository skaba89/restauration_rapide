// Admin Category by ID API - Update and Delete
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, icon, image, isActive } = body;

    if (!isDatabaseAvailable() || !db) {
      return apiError('Base de données indisponible. Veuillez réessayer plus tard.', 503);
    }

    const category = await db.menuCategory.update({
      where: { id },
      data: {
        name,
        description: description || null,
        icon: icon || '🍽️',
        image: image || null,
        isActive,
      },
    });

    return apiSuccess(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return apiError('Erreur lors de la mise à jour de la catégorie', 500);
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isDatabaseAvailable() || !db) {
      return apiError('Base de données indisponible. Veuillez réessayer plus tard.', 503);
    }

    // Delete all items in the category first
    await db.menuItem.deleteMany({
      where: { categoryId: id },
    });

    // Delete the category
    await db.menuCategory.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return apiError('Erreur lors de la suppression de la catégorie', 500);
  }
}
