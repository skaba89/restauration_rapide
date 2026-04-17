// Admin Menus API - Get all restaurants with menus
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';
import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

// GET /api/admin/menus - Get all restaurants with their menus
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const isActive = searchParams.get('isActive');

    // Check database availability
    if (!isDatabaseAvailable() || !db) {
      return apiError('Base de données indisponible. Veuillez réessayer plus tard.', 503);
    }

    // Get restaurants with their menus
    const restaurants = await db.restaurant.findMany({
      where: {
        isActive: true,
        ...(restaurantId && { id: restaurantId }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        menus: {
          where: isActive !== null && isActive !== undefined ? { isActive: isActive === 'true' } : undefined,
          orderBy: { sortOrder: 'asc' },
          include: {
            categories: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                items: {
                  orderBy: { sortOrder: 'asc' },
                },
                _count: {
                  select: { items: true },
                },
              },
            },
            _count: {
              select: { categories: true },
            },
          },
        },
      },
    });

    return apiSuccess({ restaurants });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return apiError('Erreur lors du chargement des menus', 500);
  }
}

// POST /api/admin/menus - Create a new menu
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, description, menuType, isActive, restaurantId } = body;

    if (!name || !restaurantId) {
      return apiError('Le nom et le restaurant sont requis', 400);
    }

    // Check database availability
    if (!isDatabaseAvailable() || !db) {
      return apiError('Base de données indisponible. Veuillez réessayer plus tard.', 503);
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

    return apiSuccess(menu, 'Menu créé avec succès', 201);
  } catch (error) {
    console.error('Error creating menu:', error);
    return apiError('Erreur lors de la création du menu', 500);
  }
});
