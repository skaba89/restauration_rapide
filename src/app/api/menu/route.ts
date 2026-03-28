// Menu API - Menu management with demo support
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { generateSlug } from '@/lib/utils-helpers';

// Demo menu data
const DEMO_MENUS = [
  {
    id: 'demo-menu-1',
    name: 'Menu Principal',
    slug: 'menu-principal',
    description: 'Notre menu principal avec tous nos plats',
    isActive: true,
    menuType: 'main',
    categories: [
      {
        id: 'demo-cat-1',
        name: 'Plats Principaux',
        slug: 'plats-principaux',
        description: 'Nos spécialités principales',
        image: null,
        icon: 'utensils',
        isActive: true,
        sortOrder: 1,
        _count: { items: 6 },
        items: [
          { id: 'demo-1', name: 'Attieké Poisson Grillé', price: 8000, isAvailable: true, isFeatured: true, isPopular: true, image: null, description: 'Attieké accompagné de poisson grillé', prepTime: 20 },
          { id: 'demo-2', name: 'Kedjenou de Poulet', price: 7000, isAvailable: true, isFeatured: true, isPopular: true, image: null, description: 'Poulet braisé aux légumes', prepTime: 25 },
          { id: 'demo-3', name: 'Thiéboudienne', price: 7000, isAvailable: true, isFeatured: false, isPopular: true, image: null, description: 'Riz rouge au poisson', prepTime: 30 },
          { id: 'demo-5', name: 'Riz Gras', price: 5000, isAvailable: true, isFeatured: false, isPopular: false, image: null, description: 'Riz sauté à la viande', prepTime: 20 },
          { id: 'demo-9', name: 'Garba', price: 3500, isAvailable: true, isFeatured: true, isPopular: true, image: null, description: 'Attiéké au thon et piment', prepTime: 15 },
          { id: 'demo-10', name: 'Foutou Banane', price: 6000, isAvailable: true, isFeatured: false, isPopular: false, image: null, description: 'Pâte de banane plantain', prepTime: 30 },
        ],
      },
      {
        id: 'demo-cat-2',
        name: 'Accompagnements',
        slug: 'accompagnements',
        description: 'Frites et accompagnements',
        image: null,
        icon: 'cookie',
        isActive: true,
        sortOrder: 2,
        _count: { items: 2 },
        items: [
          { id: 'demo-4', name: 'Alloco Sauce Graine', price: 5000, isAvailable: true, isFeatured: false, isPopular: true, image: null, description: 'Bananes plantain frites avec sauce', prepTime: 15 },
          { id: 'demo-8', name: 'Banane Plantain Frite', price: 2000, isAvailable: true, isFeatured: false, isPopular: false, image: null, description: 'Bananes plantain frites', prepTime: 10 },
        ],
      },
      {
        id: 'demo-cat-3',
        name: 'Boissons',
        slug: 'boissons',
        description: 'Jus frais et boissons',
        image: null,
        icon: 'cup',
        isActive: true,
        sortOrder: 3,
        _count: { items: 2 },
        items: [
          { id: 'demo-6', name: 'Jus de Bissap', price: 1500, isAvailable: true, isFeatured: false, isPopular: true, image: null, description: 'Jus frais d\'hibiscus', prepTime: 5 },
          { id: 'demo-7', name: 'Jus de Gingembre', price: 1500, isAvailable: true, isFeatured: false, isPopular: false, image: null, description: 'Jus de gingembre frais', prepTime: 5 },
        ],
      },
    ],
  },
];

// GET /api/menu - List menus with categories and items
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const menuId = searchParams.get('menuId');
    const isActive = searchParams.get('isActive');
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no restaurantId/menuId
    if (demo === 'true' || (!restaurantId && !menuId)) {
      if (menuId) {
        const menu = DEMO_MENUS.find(m => m.id === menuId);
        if (!menu) {
          return apiError('Menu non trouvé', 404);
        }
        return apiSuccess(menu);
      }
      return apiSuccess(DEMO_MENUS);
    }

    // Get single menu with full details
    if (menuId) {
      const menu = await db.menu.findUnique({
        where: { id: menuId },
        include: {
          categories: {
            where: isActive !== null ? { isActive: isActive === 'true' } : undefined,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
              items: {
                where: isActive !== null ? { isAvailable: isActive === 'true' } : undefined,
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                include: {
                  variants: { orderBy: { sortOrder: 'asc' } },
                  options: {
                    include: { values: { orderBy: { sortOrder: 'asc' } } },
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
              _count: { select: { items: true } },
            },
          },
          restaurant: {
            select: { id: true, name: true, organizationId: true },
          },
        },
      });

      if (!menu) {
        return apiError('Menu non trouvé', 404);
      }

      return apiSuccess(menu);
    }

    // List menus for restaurant
    const menus = await db.menu.findMany({
      where: {
        restaurantId,
        ...(isActive !== null && { isActive: isActive === 'true' }),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            _count: { select: { items: { where: { isAvailable: true } } } },
          },
        },
        _count: {
          select: { categories: true },
        },
      },
    });

    return apiSuccess(menus);
  });
}

// POST /api/menu - Create menu or menu category or menu item
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { type, ...data } = body;

    // Create menu
    if (type === 'menu' || !type) {
      const {
        restaurantId,
        name,
        description,
        isActive = true,
        availableDays,
        availableStart,
        availableEnd,
        menuType = 'main',
        sortOrder = 0,
      } = data;

      if (!restaurantId || !name) {
        return apiError('restaurantId et nom sont requis');
      }

      const slug = generateSlug(name);

      // Check slug uniqueness
      const existing = await db.menu.findFirst({
        where: { restaurantId, slug },
      });

      const menu = await db.menu.create({
        data: {
          restaurantId,
          name,
          slug: existing ? `${slug}-${Date.now()}` : slug,
          description,
          isActive,
          availableDays: availableDays ? JSON.stringify(availableDays) : null,
          availableStart,
          availableEnd,
          menuType,
          sortOrder,
        },
      });

      return apiSuccess(menu, 'Menu créé avec succès', 201);
    }

    // Create category
    if (type === 'category') {
      const {
        menuId,
        name,
        description,
        image,
        icon,
        isActive = true,
        sortOrder = 0,
      } = data;

      if (!menuId || !name) {
        return apiError('menuId et nom sont requis');
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
    }

    // Create menu item
    if (type === 'item') {
      const {
        categoryId,
        name,
        description,
        image,
        images,
        price,
        discountPrice,
        costPrice,
        calories,
        prepTime,
        isAvailable = true,
        isFeatured = false,
        isPopular = false,
        isNew = false,
        itemType = 'food',
        isVegetarian = false,
        isVegan = false,
        isHalal = false,
        isGlutenFree = false,
        isSpicy = false,
        spicyLevel = 0,
        trackInventory = false,
        quantity = 0,
        lowStockThreshold = 5,
        sortOrder = 0,
        variants,
        options,
      } = data;

      if (!categoryId || !name || price === undefined) {
        return apiError('categoryId, nom et prix sont requis');
      }

      const slug = generateSlug(name);

      const existing = await db.menuItem.findFirst({
        where: { categoryId, slug },
      });

      const item = await db.menuItem.create({
        data: {
          categoryId,
          name,
          slug: existing ? `${slug}-${Date.now()}` : slug,
          description,
          image,
          images: images ? JSON.stringify(images) : null,
          price,
          discountPrice,
          costPrice,
          calories,
          prepTime,
          isAvailable,
          isFeatured,
          isPopular,
          isNew,
          itemType,
          isVegetarian,
          isVegan,
          isHalal,
          isGlutenFree,
          isSpicy,
          spicyLevel,
          trackInventory,
          quantity,
          lowStockThreshold,
          sortOrder,
          variants: variants ? {
            create: variants,
          } : undefined,
          options: options ? {
            create: options.map((opt: { name: string; required: boolean; multiSelect: boolean; values: { name: string; price: number }[] }) => ({
              name: opt.name,
              required: opt.required || false,
              multiSelect: opt.multiSelect || false,
              values: opt.values ? {
                create: opt.values,
              } : undefined,
            })),
          } : undefined,
        },
        include: {
          variants: true,
          options: { include: { values: true } },
        },
      });

      return apiSuccess(item, 'Article créé avec succès', 201);
    }

    return apiError('Type non reconnu');
  });
}

// PATCH /api/menu - Update menu/category/item
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { type, id, ...updateData } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    // Process JSON fields
    if (updateData.availableDays && Array.isArray(updateData.availableDays)) {
      updateData.availableDays = JSON.stringify(updateData.availableDays);
    }
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }

    if (type === 'menu') {
      const menu = await db.menu.update({
        where: { id },
        data: updateData,
      });
      return apiSuccess(menu, 'Menu mis à jour');
    }

    if (type === 'category') {
      const category = await db.menuCategory.update({
        where: { id },
        data: updateData,
      });
      return apiSuccess(category, 'Catégorie mise à jour');
    }

    if (type === 'item') {
      const item = await db.menuItem.update({
        where: { id },
        data: updateData,
      });
      return apiSuccess(item, 'Article mis à jour');
    }

    return apiError('Type non reconnu');
  });
}

// DELETE /api/menu - Delete menu/category/item
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'menu';
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    if (type === 'menu') {
      await db.menu.delete({ where: { id } });
      return apiSuccess({ deleted: true }, 'Menu supprimé');
    }

    if (type === 'category') {
      await db.menuCategory.delete({ where: { id } });
      return apiSuccess({ deleted: true }, 'Catégorie supprimée');
    }

    if (type === 'item') {
      await db.menuItem.update({
        where: { id },
        data: { isAvailable: false },
      });
      return apiSuccess({ deleted: true }, 'Article désactivé');
    }

    return apiError('Type non reconnu');
  });
}
