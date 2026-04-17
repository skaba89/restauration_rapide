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

    // Try to use database
    if (isDatabaseAvailable() && db) {
      try {
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

        // If no restaurants found, return demo data
        if (restaurants.length === 0) {
          return apiSuccess({ restaurants: getDemoRestaurants() });
        }

        return apiSuccess({ restaurants });
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Fall through to demo data
      }
    }

    // Fallback: Return demo data structure
    return apiSuccess({ restaurants: getDemoRestaurants() });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return apiError('Erreur lors du chargement des menus', 500);
  }
}

// Demo data helper
function getDemoRestaurants() {
  return [{
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
      categories: [
        {
          id: 'cat-1',
          name: 'Plats principaux',
          slug: 'plats-principaux',
          description: 'Nos plats principaux',
          image: null,
          icon: '🍖',
          isActive: true,
          sortOrder: 0,
          items: [
            {
              id: 'item-1',
              name: 'Riz Gras',
              slug: 'riz-gras',
              description: 'Riz gras avec viande',
              image: null,
              price: 5000,
              discountPrice: null,
              prepTime: 15,
              isAvailable: true,
              isFeatured: true,
              isPopular: true,
              isNew: false,
              sortOrder: 0,
            },
            {
              id: 'item-2',
              name: 'Attiéké Poisson',
              slug: 'attieke-poisson',
              description: 'Attiéké avec poisson frit',
              image: null,
              price: 4500,
              discountPrice: null,
              prepTime: 20,
              isAvailable: true,
              isFeatured: false,
              isPopular: true,
              isNew: false,
              sortOrder: 1,
            },
          ],
          _count: { items: 2 },
        },
        {
          id: 'cat-2',
          name: 'Boissons',
          slug: 'boissons',
          description: 'Boissons fraîches',
          image: null,
          icon: '🥤',
          isActive: true,
          sortOrder: 1,
          items: [
            {
              id: 'item-3',
              name: 'Jus de Bissap',
              slug: 'jus-bissap',
              description: 'Jus de bissap naturel',
              image: null,
              price: 1000,
              discountPrice: null,
              prepTime: 5,
              isAvailable: true,
              isFeatured: false,
              isPopular: false,
              isNew: true,
              sortOrder: 0,
            },
          ],
          _count: { items: 1 },
        },
      ],
      _count: { categories: 2 },
    }],
  }];
}

// POST /api/admin/menus - Create a new menu
export const POST = withAdminAuth(async (request: NextRequest) => {
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

    // Check if database is available
    if (!isDatabaseAvailable() || !db) {
      // Return mock created menu for demo mode
      const mockMenu = {
        id: `menu-${Date.now()}`,
        name,
        slug: `${slug}-${Date.now()}`,
        description: description || null,
        menuType: menuType || 'main',
        isActive: isActive ?? true,
        sortOrder: 1,
        restaurantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return apiSuccess(mockMenu, 'Menu créé (mode démo)', 201);
    }

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
