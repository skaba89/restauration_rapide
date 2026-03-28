// Products API - Product/Menu Items with demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';

// Demo products data
const DEMO_PRODUCTS = [
  {
    id: 'demo-prod-1',
    name: 'Attieké Poisson Grillé',
    slug: 'attieke-poisson-grille',
    description: 'Attieké accompagné de poisson grillé et sauce tomate',
    price: 8000,
    image: null,
    isAvailable: true,
    isFeatured: true,
    isPopular: true,
    isNew: false,
    itemType: 'food',
    prepTime: 20,
    calories: 450,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
  {
    id: 'demo-prod-2',
    name: 'Kedjenou de Poulet',
    slug: 'kedjenou-de-poulet',
    description: 'Poulet braisé aux légumes dans une sauce riche',
    price: 7000,
    image: null,
    isAvailable: true,
    isFeatured: true,
    isPopular: true,
    isNew: false,
    itemType: 'food',
    prepTime: 25,
    calories: 520,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
  {
    id: 'demo-prod-3',
    name: 'Thiéboudienne',
    slug: 'thieboudienne',
    description: 'Riz rouge au poisson et légumes, spécialité sénégalaise',
    price: 7000,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: true,
    isNew: false,
    itemType: 'food',
    prepTime: 30,
    calories: 600,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
  {
    id: 'demo-prod-4',
    name: 'Alloco Sauce Graine',
    slug: 'alloco-sauce-graine',
    description: 'Bananes plantain frites avec sauce graine aux poissons',
    price: 5000,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: true,
    isNew: false,
    itemType: 'food',
    prepTime: 15,
    calories: 380,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-2', name: 'Accompagnements', slug: 'accompagnements' },
  },
  {
    id: 'demo-prod-5',
    name: 'Riz Gras',
    slug: 'riz-gras',
    description: 'Riz sauté à la viande et légumes',
    price: 5000,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    isNew: false,
    itemType: 'food',
    prepTime: 20,
    calories: 420,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
  {
    id: 'demo-prod-6',
    name: 'Jus de Bissap',
    slug: 'jus-de-bissap',
    description: 'Jus frais d\'hibiscus rafraîchissant',
    price: 1500,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: true,
    isNew: false,
    itemType: 'drink',
    prepTime: 5,
    calories: 120,
    isVegetarian: true,
    isHalal: true,
    category: { id: 'demo-cat-3', name: 'Boissons', slug: 'boissons' },
  },
  {
    id: 'demo-prod-7',
    name: 'Jus de Gingembre',
    slug: 'jus-de-gingembre',
    description: 'Jus de gingembre frais et piquant',
    price: 1500,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    isNew: false,
    itemType: 'drink',
    prepTime: 5,
    calories: 80,
    isVegetarian: true,
    isHalal: true,
    category: { id: 'demo-cat-3', name: 'Boissons', slug: 'boissons' },
  },
  {
    id: 'demo-prod-8',
    name: 'Banane Plantain Frite',
    slug: 'banane-plantain-frite',
    description: 'Bananes plantain frites croustillantes',
    price: 2000,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    isNew: false,
    itemType: 'side',
    prepTime: 10,
    calories: 250,
    isVegetarian: true,
    isHalal: true,
    category: { id: 'demo-cat-2', name: 'Accompagnements', slug: 'accompagnements' },
  },
  {
    id: 'demo-prod-9',
    name: 'Garba',
    slug: 'garba',
    description: 'Attiéké au thon et piment - street food ivoirienne',
    price: 3500,
    image: null,
    isAvailable: true,
    isFeatured: true,
    isPopular: true,
    isNew: true,
    itemType: 'food',
    prepTime: 15,
    calories: 380,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
  {
    id: 'demo-prod-10',
    name: 'Foutou Banane',
    slug: 'foutou-banane',
    description: 'Pâte de banane plantain avec sauce graine',
    price: 6000,
    image: null,
    isAvailable: true,
    isFeatured: false,
    isPopular: false,
    isNew: false,
    itemType: 'food',
    prepTime: 30,
    calories: 500,
    isVegetarian: false,
    isHalal: true,
    category: { id: 'demo-cat-1', name: 'Plats Principaux', slug: 'plats-principaux' },
  },
];

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
    const demo = searchParams.get('demo');

    // Return demo data if demo mode
    if (demo === 'true' || (!organizationId && !restaurantId)) {
      let filteredProducts = [...DEMO_PRODUCTS];
      
      // Apply filters
      if (isAvailable !== null) {
        filteredProducts = filteredProducts.filter(p => p.isAvailable === (isAvailable === 'true'));
      }
      if (isFeatured === 'true') {
        filteredProducts = filteredProducts.filter(p => p.isFeatured);
      }
      if (isPopular === 'true') {
        filteredProducts = filteredProducts.filter(p => p.isPopular);
      }
      if (itemType) {
        filteredProducts = filteredProducts.filter(p => p.itemType === itemType);
      }
      if (categoryId) {
        filteredProducts = filteredProducts.filter(p => p.category.id === categoryId);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.description?.toLowerCase().includes(searchLower)
        );
      }
      if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
      }
      if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
      }

      const total = filteredProducts.length;
      const paginatedProducts = filteredProducts.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

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
