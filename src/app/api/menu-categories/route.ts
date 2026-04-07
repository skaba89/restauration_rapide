// Menu Categories API - CRUD Operations
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';
import { NextRequest } from 'next/server';

// Demo categories for fallback
const DEMO_CATEGORIES = [
  { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux', description: 'Nos spécialités principales', icon: 'utensils', isActive: true, sortOrder: 1 },
  { id: 'demo-cat-2', name: 'Accompagnements', slug: 'accompagnements', description: 'Frites et accompagnements', icon: 'cookie', isActive: true, sortOrder: 2 },
  { id: 'demo-cat-3', name: 'Boissons', slug: 'boissons', description: 'Jus frais et boissons', icon: 'cup', isActive: true, sortOrder: 3 },
  { id: 'demo-cat-4', name: 'Desserts', slug: 'desserts', description: 'Nos desserts maison', icon: 'cake', isActive: true, sortOrder: 4 },
];

// GET /api/menu-categories - List all categories
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');
    const restaurantId = searchParams.get('restaurantId');
    const demo = searchParams.get('demo');

    // Return demo data if requested or no IDs provided
    if (demo === 'true' || (!menuId && !restaurantId)) {
      return apiSuccess(DEMO_CATEGORIES);
    }

    // If we have a menuId, get categories for that menu
    if (menuId) {
      const categories = await db.menuCategory.findMany({
        where: { menuId },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { items: true } }
        }
      });
      return apiSuccess(categories);
    }

    // If we have a restaurantId, get all categories for that restaurant
    if (restaurantId) {
      const menus = await db.menu.findMany({
        where: { restaurantId },
        select: { id: true }
      });
      const menuIds = menus.map(m => m.id);
      
      const categories = await db.menuCategory.findMany({
        where: { menuId: { in: menuIds } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { items: true } }
        }
      });
      return apiSuccess(categories);
    }

    return apiSuccess([]);
  });
}

// POST /api/menu-categories - Create a new category
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { menuId, name, description, icon, isActive, sortOrder } = body;

    if (!menuId || !name) {
      return apiError('menuId et name sont requis', 400);
    }

    // Check if menu exists
    const menu = await db.menu.findUnique({
      where: { id: menuId }
    });

    if (!menu) {
      return apiError('Menu non trouvé', 404);
    }

    const slug = generateSlug(name);

    // Check for duplicate slug in this menu
    const existingCategory = await db.menuCategory.findFirst({
      where: { menuId, slug }
    });

    const category = await db.menuCategory.create({
      data: {
        menuId,
        name,
        slug: existingCategory ? `${slug}-${Date.now()}` : slug,
        description: description || null,
        icon: icon || null,
        isActive: isActive ?? true,
        sortOrder: sortOrder ?? 0,
      },
      include: {
        _count: { select: { items: true } }
      }
    });

    return apiSuccess(category, 201);
  });
}
