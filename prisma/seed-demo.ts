// ============================================
// Restaurant OS - Complete Demo Data Seed
// ============================================

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// African currencies
const currencies = [
  { code: 'XOF', name: 'Franc CFA BCEAO', symbol: 'FCFA', decimalPlaces: 0 },
  { code: 'XAF', name: 'Franc CFA BEAC', symbol: 'FCFA', decimalPlaces: 0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', decimalPlaces: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimalPlaces: 2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', decimalPlaces: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', decimalPlaces: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimalPlaces: 2 },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', decimalPlaces: 0 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', decimalPlaces: 0 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', decimalPlaces: 2 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimalPlaces: 0 },
];

// African countries
const countries = [
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', currencyCode: 'XOF' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', currencyCode: 'XOF' },
  { code: 'ML', name: 'Mali', dialCode: '+223', currencyCode: 'XOF' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', currencyCode: 'XOF' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', currencyCode: 'GNF' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', currencyCode: 'XAF' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', currencyCode: 'KES' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', currencyCode: 'NGN' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', currencyCode: 'GHS' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', currencyCode: 'ZAR' },
  { code: 'MA', name: 'Morocco', dialCode: '+212', currencyCode: 'MAD' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', currencyCode: 'EGP' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', currencyCode: 'RWF' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', currencyCode: 'TZS' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', currencyCode: 'UGX' },
];

// Demo menu items with African cuisine
const menuItems = [
  // Plats principaux
  { name: 'Attieké Poisson Grillé', description: 'Semoule de manioc accompagnée de poisson grillé et sauce tomate', price: 3500, category: 'Plats Principaux', isPopular: true },
  { name: 'Kedjenou de Poulet', description: 'Poulet braisé aux légumes dans une sauce épaisse', price: 4500, category: 'Plats Principaux', isPopular: true },
  { name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 4000, category: 'Plats Principaux', isPopular: true },
  { name: 'Garba', description: 'Attieké avec poisson frit et piment', price: 2500, category: 'Plats Principaux', isPopular: true },
  { name: 'Foutou Banane', description: 'Pâte de banane plantain avec sauce graine', price: 3500, category: 'Plats Principaux' },
  { name: 'Riz Gras', description: 'Riz à la viande et légumes', price: 3000, category: 'Plats Principaux' },
  { name: 'Alloco', description: 'Banane plantain frite', price: 1500, category: 'Accompagnements' },
  { name: 'Fried Plantain', description: 'Sweet plantain fried to perfection', price: 1500, category: 'Accompagnements' },
  { name: 'Jollof Rice', description: 'Spiced rice cooked in tomato sauce', price: 2500, category: 'Plats Principaux', isPopular: true },
  { name: 'Suya', description: 'Grilled spiced meat skewers', price: 2000, category: 'Grillades', isPopular: true },
  { name: 'Poulet Braisé', description: 'Poulet grillé mariné aux épices', price: 3500, category: 'Grillades' },
  { name: 'Brochettes de Poisson', description: 'Poisson grillé en brochettes', price: 3000, category: 'Grillades' },
  // Boissons
  { name: 'Jus de Bissap', description: 'Jus naturel d\'hibiscus', price: 1000, category: 'Boissons', isPopular: true },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre frais', price: 1000, category: 'Boissons' },
  { name: 'Jus de Baobab', description: 'Jus de fruit de baobab', price: 1200, category: 'Boissons' },
  { name: 'Café Touba', description: 'Café épicé sénégalais', price: 800, category: 'Boissons' },
  { name: 'Ataya', description: 'Thé vert à la menthe', price: 500, category: 'Boissons' },
  { name: 'Bière Locale', description: 'Bière locale fraîche', price: 1500, category: 'Boissons' },
  // Desserts
  { name: 'Banane Flambée', description: 'Banane plantain flambée au rhum', price: 2000, category: 'Desserts' },
  { name: 'Fruit de la Passion', description: 'Frais de saison', price: 1500, category: 'Desserts' },
];

// Demo customers
const demoCustomers = [
  { firstName: 'Kouamé', lastName: 'Jean', email: 'kouame.jean@email.com', phone: '+2250700000001' },
  { firstName: 'Aya', lastName: 'Marie', email: 'aya.marie@email.com', phone: '+2250700000002' },
  { firstName: 'Koné', lastName: 'Ibrahim', email: 'kone.ibrahim@email.com', phone: '+2250700000003' },
  { firstName: 'Diallo', lastName: 'Fatou', email: 'diallo.fatou@email.com', phone: '+2250700000004' },
  { firstName: 'Touré', lastName: 'Amadou', email: 'toure.amadou@email.com', phone: '+2250700000005' },
  { firstName: 'Bamba', lastName: 'Ismaël', email: 'bamba.ismael@email.com', phone: '+2250700000006' },
  { firstName: 'Koffi', lastName: 'Emmanuel', email: 'koffi.emmanuel@email.com', phone: '+2250700000007' },
  { firstName: 'Adjoua', lastName: 'Rose', email: 'adjoua.rose@email.com', phone: '+2250700000008' },
  { firstName: 'Ouattara', lastName: 'Moussa', email: 'ouattara.moussa@email.com', phone: '+2250700000009' },
  { firstName: 'Yao', lastName: 'Béatrice', email: 'yao.beatrice@email.com', phone: '+2250700000010' },
];

// Demo drivers
const demoDrivers = [
  { firstName: 'Amadou', lastName: 'Touré', phone: '+2250700000100', email: 'amadou.toure@driver.com', vehicleType: 'motorcycle', vehiclePlate: 'AB-123-CD' },
  { firstName: 'Ibrahim', lastName: 'Koné', phone: '+2250700000101', email: 'ibrahim.kone@driver.com', vehicleType: 'motorcycle', vehiclePlate: 'AB-456-EF' },
  { firstName: 'Moussa', lastName: 'Diallo', phone: '+2250700000102', email: 'moussa.diallo@driver.com', vehicleType: 'scooter', vehiclePlate: 'AB-789-GH' },
  { firstName: 'Seydou', lastName: 'Bamba', phone: '+2250700000103', email: 'seydou.bamba@driver.com', vehicleType: 'bicycle', vehiclePlate: null },
  { firstName: 'Yao', lastName: 'Kouassi', phone: '+2250700000104', email: 'yao.kouassi@driver.com', vehicleType: 'motorcycle', vehiclePlate: 'AB-012-IJ' },
  { firstName: 'Aïssata', lastName: 'Traoré', phone: '+2250700000105', email: 'aissata.traore@driver.com', vehicleType: 'motorcycle', vehiclePlate: 'AB-345-KL' },
  { firstName: 'Jean-Baptiste', lastName: 'Kouakou', phone: '+2250700000106', email: 'jb.kouakou@driver.com', vehicleType: 'car', vehiclePlate: 'AB-678-MN' },
  { firstName: 'Fatoumata', lastName: 'Sylla', phone: '+2250700000107', email: 'fatoumata.sylla@driver.com', vehicleType: 'motorcycle', vehiclePlate: 'AB-901-OP' },
];

// Demo allergens
const allergens = [
  { name: 'Gluten', icon: '🌾', description: 'Contient du gluten' },
  { name: 'Arachides', icon: '🥜', description: 'Contient des arachides' },
  { name: 'Fruits de mer', icon: '🦐', description: 'Contient des fruits de mer' },
  { name: 'Lait', icon: '🥛', description: 'Contient du lait' },
  { name: 'Œufs', icon: '🥚', description: 'Contient des œufs' },
  { name: 'Soja', icon: '🫘', description: 'Contient du soja' },
  { name: 'Poisson', icon: '🐟', description: 'Contient du poisson' },
  { name: 'Sésame', icon: '🌱', description: 'Contient du sésame' },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data (order matters due to foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.orderItem.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.payment.deleteMany().catch(() => {});
  await prisma.delivery.deleteMany().catch(() => {});
  await prisma.reservation.deleteMany().catch(() => {});
  await prisma.menuItem.deleteMany().catch(() => {});
  await prisma.menuCategory.deleteMany().catch(() => {});
  await prisma.menu.deleteMany().catch(() => {});
  await prisma.driver.deleteMany().catch(() => {});
  await prisma.customerProfile.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});
  await prisma.allergen.deleteMany().catch(() => {});
  await prisma.restaurant.deleteMany().catch(() => {});
  await prisma.organization.deleteMany().catch(() => {});
  await prisma.country.deleteMany().catch(() => {});
  await prisma.currency.deleteMany().catch(() => {});

  // Create currencies
  console.log('💰 Creating currencies...');
  for (const currency of currencies) {
    await prisma.currency.create({ data: currency });
  }

  // Create countries
  console.log('🌍 Creating countries...');
  for (const country of countries) {
    const currency = await prisma.currency.findUnique({
      where: { code: country.currencyCode },
    });
    await prisma.country.create({
      data: {
        code: country.code,
        name: country.name,
        dialCode: country.dialCode,
        currencyId: currency?.id,
        isActive: true,
      },
    });
  }

  // Create allergens
  console.log('⚠️ Creating allergens...');
  for (const allergen of allergens) {
    await prisma.allergen.create({ data: allergen });
  }

  // Get Côte d'Ivoire and XOF currency
  const ciCountry = await prisma.country.findUnique({ where: { code: 'CI' } });
  const xofCurrency = await prisma.currency.findUnique({ where: { code: 'XOF' } });

  if (!ciCountry || !xofCurrency) {
    throw new Error('Country or currency not found');
  }

  // Create organization
  console.log('🏢 Creating organization...');
  const organization = await prisma.organization.create({
    data: {
      name: 'Restaurant OS Demo',
      slug: 'restaurant-os-demo',
      email: 'contact@restaurant-os.com',
      phone: '+2250700000000',
      city: 'Abidjan',
      countryId: ciCountry.id,
      currencyId: xofCurrency.id,
      plan: 'BUSINESS',
      settings: {
        create: {
          minOrderAmount: 500,
          maxDeliveryRadius: 15,
          defaultDeliveryFee: 500,
          orderPrepTime: 20,
          loyaltyEnabled: true,
          pointsPerAmount: 1,
          pointValue: 10,
          acceptsMobileMoney: true,
          acceptsCash: true,
        },
      },
    },
  });

  // Create restaurant
  console.log('🍽️ Creating restaurant...');
  const restaurant = await prisma.restaurant.create({
    data: {
      organizationId: organization.id,
      name: 'Le Petit Maquis',
      slug: 'le-petit-maquis',
      description: 'Cuisine ivoirienne authentique dans un cadre convivial',
      phone: '+2250700000000',
      email: 'contact@lepetitmaquis.com',
      address: 'Cocody, Riviera 2',
      city: 'Abidjan',
      countryId: ciCountry.id,
      latitude: 5.3599,
      longitude: -4.0083,
      restaurantType: 'restaurant',
      priceRange: 2,
      indoorCapacity: 40,
      outdoorCapacity: 20,
      acceptsReservations: true,
      acceptsDelivery: true,
      acceptsTakeaway: true,
      deliveryFee: 500,
      minOrderAmount: 500,
      maxDeliveryRadius: 10,
    },
  });

  // Create menu and categories
  console.log('📋 Creating menu...');
  const menu = await prisma.menu.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Menu Principal',
      slug: 'menu-principal',
      description: 'Notre menu complet',
      isActive: true,
      menuType: 'main',
    },
  });

  // Create menu categories
  const categoryNames = [...new Set(menuItems.map(item => item.category))];
  const categories: Record<string, any> = {};
  
  for (let i = 0; i < categoryNames.length; i++) {
    const cat = await prisma.menuCategory.create({
      data: {
        menuId: menu.id,
        name: categoryNames[i],
        slug: categoryNames[i].toLowerCase().replace(/\s+/g, '-'),
        sortOrder: i,
        isActive: true,
      },
    });
    categories[categoryNames[i]] = cat;
  }

  // Create menu items
  console.log('🍕 Creating menu items...');
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    const fishAllergen = await prisma.allergen.findFirst({ where: { name: 'Poisson' } });
    
    await prisma.menuItem.create({
      data: {
        categoryId: categories[item.category].id,
        name: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        description: item.description,
        price: item.price,
        currencyId: xofCurrency.id,
        isAvailable: true,
        isPopular: item.isPopular || false,
        isFeatured: item.isPopular || false,
        itemType: item.category === 'Boissons' ? 'drink' : item.category === 'Desserts' ? 'dessert' : 'food',
        prepTime: 15,
        sortOrder: i,
        // Add fish allergen to fish dishes
        allergens: item.name.toLowerCase().includes('poisson') && fishAllergen ? {
          create: {
            allergenId: fishAllergen.id,
          },
        } : undefined,
      },
    });
  }

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@restaurant-os.com',
      phone: '+2250700000999',
      passwordHash: adminPassword,
      role: 'ORG_ADMIN',
      firstName: 'Admin',
      lastName: 'Restaurant OS',
      language: 'fr',
      isActive: true,
    },
  });

  // Link admin to organization
  await prisma.organizationUser.create({
    data: {
      organizationId: organization.id,
      userId: admin.id,
      role: 'admin',
      acceptedAt: new Date(),
    },
  });

  // Create demo customers
  console.log('👥 Creating customers...');
  for (const customer of demoCustomers) {
    const user = await prisma.user.create({
      data: {
        email: customer.email,
        phone: customer.phone,
        passwordHash: await bcrypt.hash('Customer123!', SALT_ROUNDS),
        role: 'CUSTOMER',
        firstName: customer.firstName,
        lastName: customer.lastName,
        language: 'fr',
        isActive: true,
      },
    });

    await prisma.customerProfile.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        phone: customer.phone,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        loyaltyPoints: Math.floor(Math.random() * 500),
        lifetimePoints: Math.floor(Math.random() * 1000),
        totalOrders: Math.floor(Math.random() * 20),
        totalSpent: Math.floor(Math.random() * 100000),
      },
    });
  }

  // Create demo drivers
  console.log('🚗 Creating drivers...');
  for (const driver of demoDrivers) {
    await prisma.driver.create({
      data: {
        organizationId: organization.id,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        email: driver.email,
        vehicleType: driver.vehicleType,
        vehiclePlate: driver.vehiclePlate,
        isActive: true,
        isAvailable: Math.random() > 0.5,
        status: Math.random() > 0.3 ? 'online' : 'offline',
        isVerified: Math.random() > 0.2,
        totalDeliveries: Math.floor(Math.random() * 500),
        totalEarnings: Math.floor(Math.random() * 500000),
        rating: 3.5 + Math.random() * 1.5,
        reviewCount: Math.floor(Math.random() * 100),
        wallet: {
          create: {
            balance: Math.floor(Math.random() * 50000),
            pending: Math.floor(Math.random() * 10000),
          },
        },
      },
    });
  }

  // Create demo orders
  console.log('📦 Creating orders...');
  const menuItemsList = await prisma.menuItem.findMany({
    include: { category: true },
  });

  const customers = await prisma.customerProfile.findMany();
  const drivers = await prisma.driver.findMany();

  const orderStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
  const orderTypes = ['DINE_IN', 'TAKEAWAY', 'DELIVERY'];

  for (let i = 0; i < 20; i++) {
    const status = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
    const orderType = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    
    // Random items
    const itemCount = 1 + Math.floor(Math.random() * 4);
    const selectedItems = [];
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const item = menuItemsList[Math.floor(Math.random() * menuItemsList.length)];
      const quantity = 1 + Math.floor(Math.random() * 2);
      selectedItems.push({ item, quantity });
      subtotal += item.price * quantity;
    }

    const deliveryFee = orderType === 'DELIVERY' ? 500 : 0;
    const total = subtotal + deliveryFee;

    const orderNumber = `ORD-2024-${String(1000 + i).padStart(4, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        restaurantId: restaurant.id,
        customerId: customer.id,
        customerName: `${customer.user?.firstName || ''} ${customer.user?.lastName || ''}`.trim(),
        customerPhone: customer.user?.phone || '',
        customerEmail: customer.user?.email || '',
        orderType: orderType as any,
        source: ['web', 'app', 'pos', 'phone'][Math.floor(Math.random() * 4)],
        status: status as any,
        paymentStatus: ['PAID', 'PENDING', 'PAID', 'PAID'][Math.floor(Math.random() * 4)] as any,
        subtotal,
        total,
        deliveryFee,
        currencyId: xofCurrency.id,
        deliveryAddress: orderType === 'DELIVERY' ? 'Cocody, Abidjan' : null,
        deliveryCity: orderType === 'DELIVERY' ? 'Abidjan' : null,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        items: {
          create: selectedItems.map(({ item, quantity }) => ({
            menuItemId: item.id,
            itemName: item.name,
            itemImage: item.image,
            quantity,
            unitPrice: item.price,
            totalPrice: item.price * quantity,
            status: 'pending',
          })),
        },
      },
    });

    // Create delivery for delivery orders
    if (orderType === 'DELIVERY' && drivers.length > 0) {
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      await prisma.delivery.create({
        data: {
          orderId: order.id,
          organizationId: organization.id,
          driverId: driver.id,
          pickupAddress: restaurant.address,
          dropoffAddress: 'Cocody, Abidjan',
          status: ['PENDING', 'PICKED_UP', 'DELIVERED'][Math.floor(Math.random() * 3)] as any,
          deliveryFee: 500,
          driverEarning: 350,
          distance: 1 + Math.random() * 5,
          estimatedTime: 15 + Math.floor(Math.random() * 20),
        },
      });
    }
  }

  // Create tables
  console.log('🪑 Creating tables...');
  for (let i = 1; i <= 15; i++) {
    await prisma.table.create({
      data: {
        restaurantId: restaurant.id,
        number: `T${i}`,
        capacity: 2 + (i % 4) * 2,
        status: 'AVAILABLE',
        isActive: true,
      },
    });
  }

  // Create reservations
  console.log('📅 Creating reservations...');
  const tables = await prisma.table.findMany();
  const reservationStatuses = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'];

  for (let i = 0; i < 10; i++) {
    const status = reservationStatuses[Math.floor(Math.random() * reservationStatuses.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const table = tables[Math.floor(Math.random() * tables.length)];
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 7));

    await prisma.reservation.create({
      data: {
        restaurantId: restaurant.id,
        customerId: customer.id,
        guestName: `${customer.user?.firstName || ''} ${customer.user?.lastName || ''}`.trim(),
        guestPhone: customer.user?.phone || '',
        guestEmail: customer.user?.email || '',
        partySize: 1 + Math.floor(Math.random() * 6),
        date,
        time: `${12 + Math.floor(Math.random() * 8)}:${Math.random() > 0.5 ? '00' : '30'}`,
        status: status as any,
        source: ['web', 'phone', 'app'][Math.floor(Math.random() * 3)],
        occasion: ['birthday', 'anniversary', 'business', null][Math.floor(Math.random() * 4)],
        tables: {
          create: {
            tableId: table.id,
          },
        },
      },
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('');
  console.log('📝 Demo credentials:');
  console.log('  Admin: admin@restaurant-os.com / Admin123!');
  console.log('  Customer: kouame.jean@email.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
