// Admin Menus API - Get all restaurants with menus
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// GET /api/admin/menus - Get all restaurants with their menus
export async function GET() {
  try {
    const restaurants = await db.restaurant.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        menus: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            menuType: true,
            sortOrder: true,
            categories: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                image: true,
                icon: true,
                isActive: true,
                sortOrder: true,
                items: {
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: true,
                    image: true,
                    price: true,
                    discountPrice: true,
                    prepTime: true,
                    isAvailable: true,
                    isFeatured: true,
                    isPopular: true,
                    isNew: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

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
