// Admin Menu by ID API - Update and Delete
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// PUT /api/admin/menus/[id] - Update a menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, menuType, isActive } = body;

    // Check for demo mode
    if (!isDatabaseAvailable() || !db) {
      // Return mock updated menu for demo mode
      const mockMenu = {
        id,
        name: name || 'Updated Menu',
        slug: name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'updated-menu',
        description: description || null,
        menuType: menuType || 'main',
        isActive: isActive ?? true,
        updatedAt: new Date().toISOString(),
      };
      return apiSuccess(mockMenu, 'Menu mis à jour (mode démo)');
    }

    const menu = await db.menu.update({
      where: { id },
      data: {
        name,
        description: description || null,
        menuType,
        isActive,
      },
    });

    return apiSuccess(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    return apiError('Erreur lors de la mise à jour du menu', 500);
  }
}

// DELETE /api/admin/menus/[id] - Delete a menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check for demo mode
    if (!isDatabaseAvailable() || !db) {
      return apiSuccess({ success: true, id }, 'Menu supprimé (mode démo)');
    }

    // Delete all items in categories first
    const categories = await db.menuCategory.findMany({
      where: { menuId: id },
      select: { id: true },
    });

    for (const cat of categories) {
      await db.menuItem.deleteMany({
        where: { categoryId: cat.id },
      });
    }

    // Delete all categories
    await db.menuCategory.deleteMany({
      where: { menuId: id },
    });

    // Delete the menu
    await db.menu.delete({
      where: { id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    console.error('Error deleting menu:', error);
    return apiError('Erreur lors de la suppression du menu', 500);
  }
}
