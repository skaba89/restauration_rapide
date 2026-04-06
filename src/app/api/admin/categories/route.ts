// Admin Categories API - List and Create categories
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/admin/categories - List categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const menuId = searchParams.get('menuId');
    const isActive = searchParams.get('isActive');

    if (!isDatabaseAvailable() || !db) {
      return apiSuccess({ data: [], total: 0, page, limit });
    }

    const where: any = {};

    if (menuId) {
      where.menuId = menuId;
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [categories, total] = await Promise.all([
      db.menuCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              restaurantId: true,
            },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      db.menuCategory.count({ where }),
    ]);

    return apiSuccess({ data: categories, total, page, limit });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return apiError('Erreur lors du chargement des catégories', 500);
  }
}

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
