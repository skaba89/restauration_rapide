/**
 * Seed script for KFM DELICE restaurant
 * Creates organization, restaurant, menu, categories, and menu items
 * Based on demo data structure
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting KFM DELICE seed...\n');

  // 1. Check if currency exists, create if not
  let currency = await prisma.currency.findFirst({
    where: { code: 'GNF' }
  });

  if (!currency) {
    currency = await prisma.currency.create({
      data: {
        code: 'GNF',
        name: 'Franc Guinéen',
        symbol: 'FG',
        decimalPlaces: 0,
        isActive: true,
      }
    });
    console.log('✅ Created currency: GNF');
  } else {
    console.log('ℹ️  Currency GNF already exists');
  }

  // 2. Check if country exists, create if not
  let country = await prisma.country.findFirst({
    where: { code: 'GN' }
  });

  if (!country) {
    country = await prisma.country.create({
      data: {
        code: 'GN',
        name: 'Guinée',
        dialCode: '+224',
        currencyId: currency.id,
        defaultLanguage: 'fr',
        timezone: 'Africa/Conakry',
        mobileMoneyEnabled: true,
      }
    });
    console.log('✅ Created country: Guinea');
  } else {
    console.log('ℹ️  Country GN already exists');
  }

  // 3. Check if organization exists, create if not
  let organization = await prisma.organization.findFirst({
    where: { slug: 'kfm-delice' }
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        email: 'contact@kfm-delice.com',
        phone: '+224 620 00 00 00',
        address: 'Conakry, Guinée',
        city: 'Conakry',
        countryId: country.id,
        currencyId: currency.id,
        plan: 'PROFESSIONAL',
        isActive: true,
      }
    });
    console.log('✅ Created organization: KFM DELICE');
  } else {
    console.log('ℹ️  Organization KFM DELICE already exists');
  }

  // 4. Create organization settings if not exists
  const existingSettings = await prisma.organizationSettings.findFirst({
    where: { organizationId: organization.id }
  });

  if (!existingSettings) {
    await prisma.organizationSettings.create({
      data: {
        organizationId: organization.id,
        acceptsCash: true,
        acceptsMobileMoney: true,
        acceptsCard: false,
        deliveryEnabled: true,
        minOrderAmount: 0,
        defaultDeliveryFee: 2000,
        orderPrepTime: 20,
        reservationEnabled: true,
      }
    });
    console.log('✅ Created organization settings');
  }

  // 5. Check if restaurant exists, create if not
  let restaurant = await prisma.restaurant.findFirst({
    where: { slug: 'kfm-delice' }
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        organizationId: organization.id,
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        description: 'Restaurant de cuisine africaine et ivoirienne. Attieké, Kedjenou, Thiéboudienne et plus encore.',
        phone: '+224 620 00 00 00',
        email: 'contact@kfm-delice.com',
        address: 'Kaloum, Conakry',
        city: 'Conakry',
        countryId: country.id,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        acceptsReservations: true,
        deliveryFee: 2000,
        minOrderAmount: 0,
        deliveryTime: 30,
        rating: 4.5,
        reviewCount: 128,
        isOpen: true,
        isBusy: false,
      }
    });
    console.log('✅ Created restaurant: KFM DELICE');
  } else {
    console.log('ℹ️  Restaurant KFM DELICE already exists');
  }

  // 6. Check if menu exists, create if not
  let menu = await prisma.menu.findFirst({
    where: { restaurantId: restaurant.id }
  });

  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Notre menu principal avec tous nos délicieux plats',
        isActive: true,
        menuType: 'main',
        sortOrder: 0,
      }
    });
    console.log('✅ Created menu: Menu Principal');
  } else {
    console.log('ℹ️  Menu already exists');
  }

  // 7. Create menu categories and items
  const categoriesData = [
    {
      name: 'Plats Principaux',
      slug: 'plats-principaux',
      description: 'Nos spécialités principales',
      icon: 'utensils',
      sortOrder: 1,
      items: [
        { name: 'Attieké Poisson Grillé', slug: 'attieke-poisson-grille', price: 8000, description: 'Attieké traditionnel avec poisson grillé et sauce tomate', prepTime: 20, isPopular: true },
        { name: 'Kedjenou de Poulet', slug: 'kedjenou-poulet', price: 7000, description: 'Poulet braisé aux légumes, cuit à l\'étouffée', prepTime: 25, isPopular: true },
        { name: 'Thiéboudienne', slug: 'thieboudienne', price: 7000, description: 'Riz rouge au poisson et légumes, spécialité sénégalaise', prepTime: 30, isNew: true },
        { name: 'Garba', slug: 'garba', price: 3500, description: 'Attiéké au thon et piment', prepTime: 15, isPopular: true },
        { name: 'Riz Gras', slug: 'riz-gras', price: 5000, description: 'Riz sauté à la viande', prepTime: 20 },
        { name: 'Foutou Banane', slug: 'foutou-banane', price: 6000, description: 'Pâte de banane plantain avec sauce', prepTime: 30 },
        { name: 'Foutou Igname', slug: 'foutou-igname', price: 6000, description: 'Pâte d\'igname avec sauce arachide ou graine', prepTime: 30 },
        { name: 'Plat du Jour', slug: 'plat-du-jour', price: 5500, description: 'Demandez notre spécialité du jour', prepTime: 20, isNew: true },
      ]
    },
    {
      name: 'Accompagnements',
      slug: 'accompagnements',
      description: 'Frites et accompagnements',
      icon: 'salad',
      sortOrder: 2,
      items: [
        { name: 'Alloco Sauce Graine', slug: 'alloco-sauce-graine', price: 5000, description: 'Bananes plantain frites avec sauce graine', prepTime: 15, isPopular: true },
        { name: 'Banane Plantain Frite', slug: 'banane-plantain-frite', price: 2000, description: 'Bananes plantain frites croustillantes', prepTime: 10 },
        { name: 'Ignan Pimenté', slug: 'ignan-pimente', price: 500, description: 'Sauce pimentée maison', prepTime: 5, isPopular: true },
        { name: 'Attieké (seul)', slug: 'attieke-seul', price: 1500, description: 'Attieké sans accompagnement', prepTime: 5 },
        { name: 'Riz Blanc', slug: 'riz-blanc', price: 1000, description: 'Riz blanc nature', prepTime: 5 },
      ]
    },
    {
      name: 'Boissons',
      slug: 'boissons',
      description: 'Jus frais et boissons',
      icon: 'coffee',
      sortOrder: 3,
      items: [
        { name: 'Jus de Bissap', slug: 'jus-bissap', price: 1500, description: 'Jus naturel de fleur d\'hibiscus rafraîchissant', prepTime: 5, isPopular: true },
        { name: 'Jus de Gingembre', slug: 'jus-gingembre', price: 1500, description: 'Jus de gingembre frais et piquant', prepTime: 5 },
        { name: 'Jus de Baobab', slug: 'jus-baobab', price: 2000, description: 'Jus de fruit de baobab', prepTime: 5, isNew: true },
        { name: 'Jus de Mangue', slug: 'jus-mangue', price: 2000, description: 'Jus de mangue fraîche', prepTime: 5, isPopular: true },
        { name: 'Eau Minérale', slug: 'eau-minerale', price: 1000, description: 'Eau minérale 50cl', prepTime: 1 },
        { name: 'Coca-Cola', slug: 'coca-cola', price: 1500, description: 'Coca-Cola 33cl', prepTime: 1 },
        { name: 'Fanta', slug: 'fanta', price: 1500, description: 'Fanta Orange 33cl', prepTime: 1 },
      ]
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Nos desserts maison',
      icon: 'cake',
      sortOrder: 4,
      items: [
        { name: 'Banane Caramel', slug: 'banane-caramel', price: 3000, description: 'Bananes poêlées au caramel', prepTime: 10, isNew: true },
        { name: 'Fruit de Saison', slug: 'fruit-saison', price: 2000, description: 'Assortiment de fruits frais de saison', prepTime: 5 },
        { name: 'Glaces (2 boules)', slug: 'glaces', price: 2500, description: 'Glaces au choix: vanille, chocolat, fraise', prepTime: 3 },
      ]
    },
  ];

  // Create categories and items
  for (const catData of categoriesData) {
    // Check if category exists
    let category = await prisma.menuCategory.findFirst({
      where: { menuId: menu.id, slug: catData.slug }
    });

    if (!category) {
      category = await prisma.menuCategory.create({
        data: {
          menuId: menu.id,
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          icon: catData.icon,
          isActive: true,
          sortOrder: catData.sortOrder,
        }
      });
      console.log(`✅ Created category: ${catData.name}`);
    } else {
      console.log(`ℹ️  Category ${catData.name} already exists`);
    }

    // Create items for this category
    for (const itemData of catData.items) {
      const existingItem = await prisma.menuItem.findFirst({
        where: { categoryId: category.id, slug: itemData.slug }
      });

      if (!existingItem) {
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            name: itemData.name,
            slug: itemData.slug,
            description: itemData.description,
            price: itemData.price,
            prepTime: itemData.prepTime,
            isAvailable: true,
            isPopular: itemData.isPopular || false,
            isNew: itemData.isNew || false,
            isFeatured: itemData.isPopular || false,
            itemType: 'food',
            trackInventory: false,
          }
        });
        console.log(`   ✅ Created item: ${itemData.name}`);
      } else {
        console.log(`   ℹ️  Item ${itemData.name} already exists`);
      }
    }
  }

  // 8. Create admin user if not exists
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@kfm-delice.com' }
  });

  if (!existingAdmin) {
    // Import bcrypt for password hashing
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('KFM@Admin2024!', 12);

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@kfm-delice.com',
        passwordHash,
        firstName: 'Admin',
        lastName: 'KFM DELICE',
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      }
    });

    // Create restaurant admin link
    await prisma.restaurantAdmin.create({
      data: {
        restaurantId: restaurant.id,
        userId: adminUser.id,
        role: 'admin',
        isDefault: true,
        isActive: true,
      }
    });

    // Create organization user link
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: adminUser.id,
        role: 'owner',
        acceptedAt: new Date(),
      }
    });

    console.log('✅ Created admin user: admin@kfm-delice.com');
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // Summary
  console.log('\n📊 Summary:');
  const totalCategories = await prisma.menuCategory.count({ where: { menuId: menu.id } });
  const totalItems = await prisma.menuItem.count({
    where: { category: { menuId: menu.id } }
  });

  console.log(`   - Restaurant: ${restaurant.name}`);
  console.log(`   - Menu: ${menu.name}`);
  console.log(`   - Categories: ${totalCategories}`);
  console.log(`   - Items: ${totalItems}`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n🔑 Admin credentials:');
  console.log('   Email: admin@kfm-delice.com');
  console.log('   Password: KFM@Admin2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
