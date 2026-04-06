// Admin Menus API - Get all restaurants with menus
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/admin/menus - Get all restaurants with their menus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const isActive = searchParams.get('isActive');

    // Try to use database
    if (isDatabaseAvailable() && db) {
      const where: any = {};
      
      if (restaurantId) {
        where.restaurantId = restaurantId;
      }
      if (isActive !== null && isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const menus = await db.menu.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              _count: {
                select: { items: true },
              },
            },
          },
          _count: {
            select: { categories: true },
          },
        },
      });

      return apiSuccess({ menus, total: menus.length });
    }

    // Fallback: Return demo data structure
    const restaurants = [{
      id: 'demo-restaurant-1',
      name: 'KFM DELICE',
      slug: 'kfm-delice',
      menus: [{
        id: 'menu-1',
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet KFM DELICE',
        isActive: true,
        menuType: 'main',
        sortOrder: 1,
        categories: [],
        _count: { categories: 5 },
      }],
    }];

    return apiSuccess({ restaurants });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return apiError('Erreur lors du chargement des menus', 500);
  }
}

// POST /api/admin/menus - Create a new menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, menuType, isActive, restaurantId } = body;

    if (!name || !restaurantId) {
      return apiError('Le nom et le restaurant sont requis', 400);
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Get the max sortOrder for this restaurant
    const maxSort = await db.menu.aggregate({
      where: { restaurantId },
      _max: { sortOrder: true },
    });

    const menu = await db.menu.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        description: description || null,
        menuType: menuType || 'main',
        isActive: isActive ?? true,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        restaurantId,
      },
    });

    return apiSuccess(menu);
  } catch (error) {
    console.error('Error creating menu:', error);
    return apiError('Erreur lors de la création du menu', 500);
  }
}
