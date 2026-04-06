// Admin Categories API - Create category
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, icon, image, isActive, menuId } = body;

    if (!name || !menuId) {
      return apiError('Le nom et le menu sont requis', 400);
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Get the max sortOrder for this menu
    const maxSort = await db.menuCategory.aggregate({
      where: { menuId },
      _max: { sortOrder: true },
    });

    const category = await db.menuCategory.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        description: description || null,
        icon: icon || '🍽️',
        image: image || null,
        isActive: isActive ?? true,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        menuId,
      },
    });

    return apiSuccess(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return apiError('Erreur lors de la création de la catégorie', 500);
  }
}
