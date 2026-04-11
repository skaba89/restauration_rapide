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

    // Check for demo mode
    if (!isDatabaseAvailable() || !db) {
      // Return mock updated category for demo mode
      const mockCategory = {
        id,
        name: name || 'Updated Category',
        slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'updated-category',
        description: description || null,
        icon: icon || '🍽️',
        image: image || null,
        isActive: isActive ?? true,
        updatedAt: new Date().toISOString(),
      };
      return apiSuccess(mockCategory, 'Catégorie mise à jour (mode démo)');
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

    // Check for demo mode
    if (!isDatabaseAvailable() || !db) {
      return apiSuccess({ success: true, id }, 'Catégorie supprimée (mode démo)');
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
