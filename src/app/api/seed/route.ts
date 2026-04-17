// Seed API - Initialize KFM DELICE data in database
// SECURITY (P1): POST is now protected with withAdminAuth
// SECURITY (P1): Passwords are no longer returned in API responses
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { withAdminAuth } from '@/lib/auth-middleware';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// GET /api/seed - Check database status
export async function GET() {
  return withErrorHandler(async () => {
    // Check if restaurant exists
    const restaurant = await db.restaurant.findFirst({
      where: { slug: 'kfm-delice' },
      include: {
        menus: {
          include: {
            categories: {
              include: {
                _count: { select: { items: true } }
              }
            }
          }
        }
      }
    });

    if (!restaurant) {
      return apiSuccess({
        status: 'not_initialized',
        message: 'Le restaurant KFM DELICE n\'existe pas dans la base de données',
        needsSetup: true
      });
    }

    const totalCategories = await db.menuCategory.count({
      where: { menu: { restaurantId: restaurant.id } }
    });
    const totalItems = await db.menuItem.count({
      where: { category: { menu: { restaurantId: restaurant.id } } }
    });

    return apiSuccess({
      status: 'initialized',
      message: 'Le restaurant existe',
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        menus: restaurant.menus.map(m => ({
          id: m.id,
          name: m.name,
          categories: m.categories.length
        }))
      },
      stats: {
        menus: restaurant.menus.length,
        categories: totalCategories,
        items: totalItems
      },
      needsSetup: false
    });
  });
}

// POST /api/seed - Run seed script (protected)
export const POST = withAdminAuth(async (request: NextRequest) => {
  return withErrorHandler(async () => {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // Check if already initialized
    const existingRestaurant = await db.restaurant.findFirst({
      where: { slug: 'kfm-delice' }
    });

    if (existingRestaurant && !force) {
      return apiError('Le restaurant existe déjà. Utilisez force: true pour réinitialiser.', 400);
    }

    // Run seed
    const result = await runSeed();
    return apiSuccess(result);
  })();
});

async function runSeed() {
  // 1. Get or create currency
  let currency = await db.currency.findFirst({ where: { code: 'GNF' } });
  if (!currency) {
    currency = await db.currency.create({
      data: { code: 'GNF', name: 'Franc Guinéen', symbol: 'FG', decimalPlaces: 0, isActive: true }
    });
  }

  // 2. Get or create country
  let country = await db.country.findFirst({ where: { code: 'GN' } });
  if (!country) {
    country = await db.country.create({
      data: {
        code: 'GN', name: 'Guinée', dialCode: '+224', currencyId: currency.id,
        defaultLanguage: 'fr', timezone: 'Africa/Conakry', mobileMoneyEnabled: true
      }
    });
  }

  // 3. Get or create organization
  let organization = await db.organization.findFirst({ where: { slug: 'kfm-delice' } });
  if (!organization) {
    organization = await db.organization.create({
      data: {
        name: 'KFM DELICE', slug: 'kfm-delice', email: 'contact@kfm-delice.com',
        phone: '+224 620 00 00 00', address: 'Conakry, Guinée', city: 'Conakry',
        countryId: country.id, currencyId: currency.id, plan: 'PROFESSIONAL', isActive: true
      }
    });

    // Create settings
    await db.organizationSettings.create({
      data: {
        organizationId: organization.id, acceptsCash: true, acceptsMobileMoney: true,
        acceptsCard: false, deliveryEnabled: true, minOrderAmount: 0, defaultDeliveryFee: 2000
      }
    });
  }

  // 4. Get or create restaurant
  let restaurant = await db.restaurant.findFirst({ where: { slug: 'kfm-delice' } });
  if (!restaurant) {
    restaurant = await db.restaurant.create({
      data: {
        organizationId: organization.id, name: 'KFM DELICE', slug: 'kfm-delice',
        description: 'Restaurant de cuisine africaine - Attieké, Kedjenou, Thiéboudienne',
        phone: '+224 620 00 00 00', email: 'contact@kfm-delice.com',
        address: 'Kaloum, Conakry', city: 'Conakry', countryId: country.id,
        acceptsDelivery: true, acceptsTakeaway: true, acceptsDineIn: true,
        deliveryFee: 2000, deliveryTime: 30, rating: 4.5, reviewCount: 128, isOpen: true
      }
    });
  }

  // 5. Get or create menu
  let menu = await db.menu.findFirst({ where: { restaurantId: restaurant.id } });
  if (!menu) {
    menu = await db.menu.create({
      data: {
        restaurantId: restaurant.id, name: 'Menu Principal', slug: 'menu-principal',
        description: 'Notre menu principal', isActive: true, menuType: 'main', sortOrder: 0
      }
    });
  }

  // 6. Create categories and items
  // Note: Images are set to null to avoid external URL timeout issues on Render
  // The UI will display placeholder gradients instead

  const categoriesData = [
    {
      name: 'Plats Principaux', slug: 'plats-principaux', description: 'Nos spécialités principales', icon: 'utensils', sortOrder: 1,
      items: [
        { name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', price: 8000, description: 'Attieké traditionnel avec poisson grillé et sauce tomate', prepTime: 20, isPopular: true },
        { name: 'Kedjenou de Poulet', slug: 'kedjenou-poulet', price: 7000, description: 'Poulet braisé aux légumes, cuit à l\'étouffée', prepTime: 25, isPopular: true },
        { name: 'Thiéboudienne', slug: 'thieboudienne', price: 7000, description: 'Riz rouge au poisson et légumes', prepTime: 30, isNew: true },
        { name: 'Garba', slug: 'garba', price: 3500, description: 'Attiéké au thon et piment', prepTime: 15, isPopular: true },
        { name: 'Riz Gras', slug: 'riz-gras', price: 5000, description: 'Riz sauté à la viande', prepTime: 20 },
        { name: 'Foutou Banane', slug: 'foutou-banane', price: 6000, description: 'Pâte de banane plantain avec sauce', prepTime: 30 },
      ]
    },
    {
      name: 'Accompagnements', slug: 'accompagnements', description: 'Frites et accompagnements', icon: 'salad', sortOrder: 2,
      items: [
        { name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', price: 5000, description: 'Bananes plantain frites avec sauce graine', prepTime: 15, isPopular: true },
        { name: 'Banane Plantain Frite', slug: 'banane-plantain-frite', price: 2000, description: 'Bananes plantain frites', prepTime: 10 },
        { name: 'Ignan Pimenté', slug: 'ignan-pimente', price: 500, description: 'Sauce pimentée maison', prepTime: 5, isPopular: true },
      ]
    },
    {
      name: 'Boissons', slug: 'boissons', description: 'Jus frais et boissons', icon: 'coffee', sortOrder: 3,
      items: [
        { name: 'Jus de Bissap', slug: 'jus-bissap', price: 1500, description: 'Jus naturel de fleur d\'hibiscus', prepTime: 5, isPopular: true },
        { name: 'Jus de Gingembre', slug: 'jus-gingembre', price: 1500, description: 'Jus de gingembre frais', prepTime: 5 },
        { name: 'Jus de Mangue', slug: 'jus-mangue', price: 2000, description: 'Jus de mangue fraîche', prepTime: 5, isPopular: true },
      ]
    },
    {
      name: 'Desserts', slug: 'desserts', description: 'Nos desserts maison', icon: 'cake', sortOrder: 4,
      items: [
        { name: 'Banane Caramel', slug: 'banane-caramel', price: 3000, description: 'Bananes poêlées au caramel', prepTime: 10, isNew: true },
        { name: 'Fruit de Saison', slug: 'fruit-saison', price: 2000, description: 'Assortiment de fruits frais', prepTime: 5 },
      ]
    },
  ];

  let categoriesCreated = 0;
  let itemsCreated = 0;

  for (const catData of categoriesData) {
    let category = await db.menuCategory.findFirst({
      where: { menuId: menu.id, slug: catData.slug }
    });

    if (!category) {
      category = await db.menuCategory.create({
        data: {
          menuId: menu.id, name: catData.name, slug: catData.slug,
          description: catData.description, icon: catData.icon,
          isActive: true, sortOrder: catData.sortOrder
        }
      });
      categoriesCreated++;
    }

    for (const itemData of catData.items) {
      const existingItem = await db.menuItem.findFirst({
        where: { categoryId: category.id, slug: itemData.slug }
      });

      if (!existingItem) {
        await db.menuItem.create({
          data: {
            categoryId: category.id, name: itemData.name, slug: itemData.slug,
            description: itemData.description, price: itemData.price,
            prepTime: itemData.prepTime, isAvailable: true,
            isPopular: itemData.isPopular || false, isNew: itemData.isNew || false,
            isFeatured: itemData.isPopular || false, itemType: 'food', trackInventory: false,
            image: null, // No external images to avoid timeout issues
          }
        });
        itemsCreated++;
      }
    }
  }

  // 7. Create or update users (passwords from env vars)
  const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'KFM@Admin2024!';
  const driverPwd = process.env.SEED_DRIVER_PASSWORD || 'Driver@2024!';
  const customerPwd = process.env.SEED_CUSTOMER_PASSWORD || 'Client@2024!';
  const passwordHash = await bcrypt.hash(adminPwd, 12);
  const driverPasswordHash = await bcrypt.hash(driverPwd, 12);
  const customerPasswordHash = await bcrypt.hash(customerPwd, 12);

  // 7a. Create or update admin user
  const existingAdmin = await db.user.findFirst({ where: { email: 'admin@kfm-delice.com' } });
  let adminCreated = false;
  let adminUpdated = false;

  if (!existingAdmin) {
    const adminUser = await db.user.create({
      data: {
        email: 'admin@kfm-delice.com', passwordHash, firstName: 'Admin', lastName: 'KFM',
        role: 'SUPER_ADMIN', isActive: true, emailVerified: new Date()
      }
    });

    await db.restaurantAdmin.create({
      data: { restaurantId: restaurant.id, userId: adminUser.id, role: 'admin', isDefault: true, isActive: true }
    });

    await db.organizationUser.create({
      data: { organizationId: organization.id, userId: adminUser.id, role: 'owner', acceptedAt: new Date() }
    });

    adminCreated = true;
  } else {
    // Update existing admin - always update role to SUPER_ADMIN, password and ensure active
    await db.user.update({
      where: { id: existingAdmin.id },
      data: { role: 'SUPER_ADMIN', passwordHash, isActive: true },
    });
    adminUpdated = true;
  }

  // 8. Create or update demo driver user
  const existingDriver = await db.user.findFirst({ where: { email: 'driver@kfm-delice.com' } });
  let driverCreated = false;
  let driverUpdated = false;

  if (!existingDriver) {
    const driverUser = await db.user.create({
      data: {
        email: 'driver@kfm-delice.com', passwordHash: driverPasswordHash, firstName: 'Amadou', lastName: 'Diallo',
        phone: '+224620000001', role: 'DRIVER', isActive: true, emailVerified: new Date()
      }
    });

    // Create driver profile using the correct model name
    await db.driver.create({
      data: {
        userId: driverUser.id,
        organizationId: organization.id,
        firstName: 'Amadou',
        lastName: 'Diallo',
        phone: '+224620000001',
        email: 'driver@kfm-delice.com',
        isAvailable: true,
        isActive: true,
        isVerified: true,
        vehicleType: 'motorcycle',
        vehiclePlate: 'GN-1234-A',
      }
    });

    await db.organizationUser.create({
      data: { organizationId: organization.id, userId: driverUser.id, role: 'driver', acceptedAt: new Date() }
    });

    driverCreated = true;
  } else {
    // Update existing driver - always update password and ensure active
    await db.user.update({
      where: { id: existingDriver.id },
      data: { passwordHash: driverPasswordHash, isActive: true },
    });
    driverUpdated = true;
  }

  // 9. Create or update demo customer user
  const existingCustomer = await db.user.findFirst({ where: { email: 'client@kfm-delice.com' } });
  let customerCreated = false;

  if (!existingCustomer) {
    const customerUser = await db.user.create({
      data: {
        email: 'client@kfm-delice.com', passwordHash: customerPasswordHash, firstName: 'Fatou', lastName: 'Sylla',
        phone: '+224620000002', role: 'CUSTOMER', isActive: true, emailVerified: new Date()
      }
    });

    // Create customer profile
    await db.customerProfile.create({
      data: {
        userId: customerUser.id,
        organizationId: organization.id,
        firstName: 'Fatou',
        lastName: 'Sylla',
        phone: '+224620000002',
        email: 'client@kfm-delice.com',
      }
    });

    customerCreated = true;
  } else {
    // Update existing customer - always update password and ensure active
    await db.user.update({
      where: { id: existingCustomer.id },
      data: { passwordHash: customerPasswordHash, isActive: true },
    });
  }

  return {
    success: true,
    message: 'Base de données initialisée avec succès',
    restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
    menu: { id: menu.id, name: menu.name },
    stats: {
      categoriesCreated,
      itemsCreated,
      adminCreated,
      adminUpdated,
      driverCreated,
      driverUpdated,
      customerCreated
    },
    // SECURITY: credentials removed from response - use env vars or secure admin reset
  };
}
