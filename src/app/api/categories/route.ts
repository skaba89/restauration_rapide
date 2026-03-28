// Categories API - MenuCategory management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';

// GET /api/categories - List categories
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const restaurantId = searchParams.get('restaurantId');
    const menuId = searchParams.get('menuId');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    // Require menuId or restaurantId
    if (!menuId && !restaurantId) {
      return apiError('menuId ou restaurantId est requis');
    }

    const where = {
      ...(menuId && { menuId }),
      ...(restaurantId && {
        menu: { restaurantId },
      }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && { name: { contains: search } }),
    };

    const [categories, total] = await Promise.all([
      db.menuCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: { items: { where: { isAvailable: true } } },
          },
          menu: {
            select: { id: true, name: true, restaurantId: true },
          },
        },
      }),
      db.menuCategory.count({ where }),
    ]);

    return apiSuccess({
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/categories - Create category
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      menuId,
      name,
      description,
      image,
      icon,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!name) {
      return apiError('Le nom est requis');
    }

    if (!menuId) {
      return apiError('menuId est requis');
    }

    // Check menu exists
    const menu = await db.menu.findUnique({ where: { id: menuId } });
    if (!menu) {
      return apiError('Menu non trouvé', 404);
    }

    const slug = generateSlug(name);

    const existing = await db.menuCategory.findFirst({
      where: { menuId, slug },
    });

    const category = await db.menuCategory.create({
      data: {
        menuId,
        name,
        slug: existing ? `${slug}-${Date.now()}` : slug,
        description,
        image,
        icon,
        isActive,
        sortOrder,
      },
    });

    return apiSuccess(category, 'Catégorie créée avec succès', 201);
  });
}

// PATCH /api/categories - Update category
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    // Check category exists
    const existing = await db.menuCategory.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Catégorie non trouvée', 404);
    }

    // Generate new slug if name changed
    if (updateData.name && updateData.name !== existing.name) {
      const slug = generateSlug(updateData.name);
      const slugExists = await db.menuCategory.findFirst({
        where: { menuId: existing.menuId, slug, id: { not: id } },
      });
      updateData.slug = slugExists ? `${slug}-${Date.now()}` : slug;
    }

    const category = await db.menuCategory.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(category, 'Catégorie mise à jour');
  });
}

// DELETE /api/categories - Delete category
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    // Check category exists
    const existing = await db.menuCategory.findUnique({ where: { id } });
    if (!existing) {
      return apiError('Catégorie non trouvée', 404);
    }

    // Check if category has items
    const itemsCount = await db.menuItem.count({ where: { categoryId: id } });
    if (itemsCount > 0) {
      // Soft delete - just deactivate
      await db.menuCategory.update({
        where: { id },
        data: { isActive: false },
      });
      return apiSuccess({ deleted: false, deactivated: true }, 'Catégorie désactivée (contient des articles)');
    }

    await db.menuCategory.delete({ where: { id } });
    return apiSuccess({ deleted: true }, 'Catégorie supprimée');
  });
}
