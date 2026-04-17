// Admin Items API - List and Create items
import { db, isDatabaseAvailable } from '@/lib/db';
import { apiSuccess, apiError, getPaginationParams } from '@/lib/api-responses';
import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';

// GET /api/admin/items - List all menu items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const categoryId = searchParams.get('categoryId');
    const menuId = searchParams.get('menuId');
    const isAvailable = searchParams.get('isAvailable');
    const search = searchParams.get('search');

    if (!isDatabaseAvailable() || !db) {
      return apiError('Base de données indisponible. Veuillez réessayer plus tard.', 503);
    }

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (menuId) {
      where.category = { menuId };
    }
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      db.menuItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          category: {
            select: {
              id: true,
              name: true,
              menu: {
                select: {
                  id: true,
                  name: true,
                  restaurantId: true,
                },
              },
            },
          },
          variants: {
            orderBy: { sortOrder: 'asc' },
          },
          options: {
            include: {
              values: {
                orderBy: { sortOrder: 'asc' },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      db.menuItem.count({ where }),
    ]);

    return apiSuccess({ data: items, total, page, limit });
  } catch (error) {
    console.error('Error fetching items:', error);
    return apiError('Erreur lors du chargement des plats', 500);
  }
}

// POST /api/admin/items - Create a new menu item
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      discountPrice,
      prepTime,
      image,
      isAvailable,
      isFeatured,
      isPopular,
      isNew,
      categoryId,
    } = body;

    if (!name || !price || !categoryId) {
      return apiError('Le nom, le prix et la catégorie sont requis', 400);
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

    // Get the max sortOrder for this category
    const maxSort = await db.menuItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const item = await db.menuItem.create({
      data: {
        name,
        slug: `${slug}-${Date.now()}`,
        description: description || null,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        prepTime: prepTime ? parseInt(prepTime) : null,
        image: image || null,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
        isPopular: isPopular ?? false,
        isNew: isNew ?? false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        categoryId,
      },
    });

    return apiSuccess(item, 'Plat créé avec succès', 201);
  } catch (error) {
    console.error('Error creating item:', error);
    return apiError('Erreur lors de la création du plat', 500);
  }
});
