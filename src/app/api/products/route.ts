// Products API - Product/Menu Items with demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';

// GET /api/products - List products with pagination and filters
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const categoryId = searchParams.get('categoryId');
    const restaurantId = searchParams.get('restaurantId');
    const isActive = searchParams.get('isActive');
    const isAvailable = searchParams.get('isAvailable');
    const isFeatured = searchParams.get('isFeatured');
    const isPopular = searchParams.get('isPopular');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const itemType = searchParams.get('itemType');

    // Real database query
    // Try to find products through menu items if restaurantId is provided
    if (restaurantId) {
      const menuItems = await db.menuItem.findMany({
        where: {
          category: {
            menu: { restaurantId },
          },
          ...(isAvailable !== null && { isAvailable: isAvailable === 'true' }),
          ...(isFeatured && { isFeatured: isFeatured === 'true' }),
          ...(isPopular && { isPopular: isPopular === 'true' }),
          ...(itemType && { itemType }),
          ...(search && {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
          ...(minPrice && { price: { gte: parseFloat(minPrice) } }),
          ...(maxPrice && { price: { lte: parseFloat(maxPrice) } }),
        },
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          category: {
            include: { menu: true },
          },
          variants: true,
          options: {
            include: { values: true },
          },
        },
      });

      const total = await db.menuItem.count({
        where: {
          category: { menu: { restaurantId } },
          ...(isAvailable !== null && { isAvailable: isAvailable === 'true' }),
        },
      });

      return apiSuccess({
        data: menuItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // For backwards compatibility with organization-based products
    const [products, total] = await Promise.all([
      db.product?.findMany?.({
        where: {
          organizationId,
          ...(categoryId && { categoryId }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
          ...(search && {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } },
            ],
          }),
        },
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
        include: {
          category: true,
        },
      }) || [],
      db.product?.count?.({
        where: {
          organizationId,
          ...(categoryId && { categoryId }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
        },
      }) || 0,
    ]);

    return apiSuccess({
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/products - Create product
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      categoryId,
      name,
      description,
      image,
      images,
      price,
      discountPrice,
      costPrice,
      quantity = 0,
      unit = 'piece',
      preparationTime,
      isAvailable = true,
      isFeatured = false,
      isActive = true,
      minOrderQty = 1,
      maxOrderQty,
      trackInventory = false,
      lowStockThreshold = 5,
    } = body;

    // Validation
    if (!organizationId || !name || price === undefined) {
      return apiError('organizationId, nom et prix sont requis');
    }

    const slug = generateSlug(name);

    // Check if slug exists in organization (only if product model exists)
    const existing = await db.product?.findFirst?.({
      where: { organizationId, slug },
    });

    const product = await db.product?.create?.({
      data: {
        organizationId,
        categoryId,
        name,
        slug: existing ? `${slug}-${Date.now()}` : slug,
        description,
        image,
        images: images ? JSON.stringify(images) : null,
        price,
        discountPrice,
        costPrice,
        quantity,
        unit,
        preparationTime,
        isAvailable,
        isFeatured,
        isActive,
        minOrderQty,
        maxOrderQty,
        trackInventory,
        lowStockThreshold,
      },
      include: { category: true },
    });

    if (!product) {
      return apiError('Impossible de créer le produit - modèle non disponible', 500);
    }

    return apiSuccess(product, 'Produit créé avec succès', 201);
  });
}

// PATCH /api/products - Update product
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    // Process JSON fields
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }

    const product = await db.product?.update?.({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    if (!product) {
      return apiError('Produit non trouvé', 404);
    }

    return apiSuccess(product, 'Produit mis à jour');
  });
}

// DELETE /api/products - Delete product
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    await db.product?.update?.({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Produit désactivé');
  });
}