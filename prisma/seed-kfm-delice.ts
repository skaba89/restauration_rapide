// ============================================
// KFM DELICE - Restaurant Guinée
// Configuration et données de démonstration
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🇬🇳 Configuration KFM DELICE - Guinée...\n');

  // 1. Récupérer la Guinée et la devise GNF
  const guinea = await prisma.country.findUnique({
    where: { code: 'GN' }
  });

  const gnfCurrency = await prisma.currency.findUnique({
    where: { code: 'GNF' }
  });

  if (!guinea || !gnfCurrency) {
    throw new Error('Guinée ou devise GNF non trouvée');
  }

  console.log('✅ Guinée trouvée:', guinea.name);
  console.log('✅ Devise trouvée:', gnfCurrency.symbol, '-', gnfCurrency.name);

  // 2. Créer l'organisation KFM DELICE
  const organization = await prisma.organization.upsert({
    where: { slug: 'kfm-delice' },
    update: {},
    create: {
      name: 'KFM DELICE',
      slug: 'kfm-delice',
      email: 'contact@kfm-delice.com',
      phone: '+224622000000',
      address: 'Kaloum, Conakry',
      city: 'Conakry',
      countryId: guinea.id,
      currencyId: gnfCurrency.id,
      plan: 'PROFESSIONAL',
      isActive: true,
    },
  });

  console.log('\n✅ Organisation créée:', organization.name);

  // 3. Créer les paramètres de l'organisation
  await prisma.organizationSettings.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: {
      organizationId: organization.id,
      minOrderAmount: 50000, // 50,000 GNF
      maxDeliveryRadius: 15,
      defaultDeliveryFee: 15000, // 15,000 GNF
      autoAcceptOrders: false,
      orderPrepTime: 25,
      reservationEnabled: true,
      autoConfirmReservations: true,
      defaultTableTime: 90,
      noShowFee: 25000,
      acceptsCash: true,
      acceptsMobileMoney: true,
      acceptsCard: false,
      deliveryEnabled: true,
      selfDelivery: true,
      loyaltyEnabled: true,
      pointsPerAmount: 1,
      pointValue: 1000, // 1,000 GNF par point
    },
  });

  console.log('✅ Paramètres organisation créés');

  // 4. Créer la marque
  const brand = await prisma.brand.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'kfm-delice',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      name: 'KFM DELICE',
      slug: 'kfm-delice',
      description: 'Restaurant Fast Food Moderne à Conakry',
      colors: JSON.stringify({
        primary: '#FF6B35',
        secondary: '#2E86AB',
        accent: '#A23B72',
      }),
      isActive: true,
    },
  });

  console.log('✅ Marque créée:', brand.name);

  // 5. Créer le restaurant principal
  const restaurant = await prisma.restaurant.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'kfm-delice-conakry',
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      brandId: brand.id,
      name: 'KFM DELICE - Conakry',
      slug: 'kfm-delice-conakry',
      description: 'Fast food moderne proposant des burgers, poulet frit, pizzas et plats guinéens authentiques',
      email: 'conakry@kfm-delice.com',
      phone: '+224622000001',
      address: 'Avenue de la République, Kaloum',
      city: 'Conakry',
      district: 'Kaloum',
      countryId: guinea.id,
      latitude: 9.6412,
      longitude: -13.5784,
      restaurantType: 'fast_food',
      cuisines: JSON.stringify(['Guinéenne', 'Fast Food', 'Burgers', 'Poulet', 'Pizza']),
      priceRange: 2,
      indoorCapacity: 60,
      outdoorCapacity: 30,
      totalCapacity: 90,
      acceptsReservations: true,
      acceptsWalkins: true,
      acceptsDelivery: true,
      acceptsTakeaway: true,
      acceptsDineIn: true,
      hasParking: true,
      hasWifi: true,
      hasTerrace: true,
      deliveryFee: 15000,
      minOrderAmount: 50000,
      maxDeliveryRadius: 15,
      deliveryTime: 35,
      paymentMethods: JSON.stringify(['cash', 'orange_money', 'mtn_momo']),
      isActive: true,
      isOpen: true,
    },
  });

  console.log('✅ Restaurant créé:', restaurant.name);

  // 6. Créer les horaires d'ouverture
  const hours = [
    { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', isClosed: false }, // Dimanche
    { dayOfWeek: 1, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Lundi
    { dayOfWeek: 2, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Mardi
    { dayOfWeek: 3, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Mercredi
    { dayOfWeek: 4, openTime: '10:00', closeTime: '23:00', isClosed: false }, // Jeudi
    { dayOfWeek: 5, openTime: '10:00', closeTime: '00:00', isClosed: false }, // Vendredi
    { dayOfWeek: 6, openTime: '10:00', closeTime: '00:00', isClosed: false }, // Samedi
  ];

  for (const hour of hours) {
    await prisma.restaurantHour.upsert({
      where: {
        restaurantId_dayOfWeek: {
          restaurantId: restaurant.id,
          dayOfWeek: hour.dayOfWeek,
        }
      },
      update: hour,
      create: {
        restaurantId: restaurant.id,
        ...hour,
      },
    });
  }

  console.log('✅ Horaires d\'ouverture créés');

  // 7. Créer les zones de livraison
  const deliveryZones = [
    { name: 'Kaloum', baseFee: 10000, minTime: 15, maxTime: 25 },
    { name: 'Dixinn', baseFee: 15000, minTime: 20, maxTime: 35 },
    { name: 'Ratoma', baseFee: 20000, minTime: 25, maxTime: 45 },
    { name: 'Matam', baseFee: 20000, minTime: 25, maxTime: 45 },
    { name: 'Matoto', baseFee: 25000, minTime: 30, maxTime: 50 },
  ];

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: {
        restaurantId_name: {
          restaurantId: restaurant.id,
          name: zone.name,
        }
      },
      update: zone,
      create: {
        restaurantId: restaurant.id,
        ...zone,
        isActive: true,
      },
    });
  }

  console.log('✅ Zones de livraison créées');

  // 8. Créer le menu principal
  const menu = await prisma.menu.upsert({
    where: {
      restaurantId_slug: {
        restaurantId: restaurant.id,
        slug: 'menu-principal',
      }
    },
    update: {},
    create: {
      restaurantId: restaurant.id,
      name: 'Menu Principal',
      slug: 'menu-principal',
      description: 'Notre menu complet',
      isActive: true,
      menuType: 'main',
    },
  });

  console.log('✅ Menu créé:', menu.name);

  // 9. Créer les catégories avec produits
  const categories = [
    {
      name: 'Burgers',
      slug: 'burgers',
      description: 'Nos délicieux burgers faits maison',
      items: [
        { name: 'Burger Classique', desc: 'Steak 150g, salade, tomate, oignon, sauce maison', price: 45000, prep: 15 },
        { name: 'Burger Double', desc: 'Double steak 300g, fromage, bacon, salade, sauce', price: 65000, prep: 18 },
        { name: 'Burger Poulet', desc: 'Poulet pané, salade, tomate, mayo', price: 40000, prep: 15 },
        { name: 'Burger Guinéen', desc: 'Steak 150g, attiéké, alloco, sauce pimentée', price: 55000, prep: 20, isPopular: true },
        { name: 'Cheese Burger', desc: 'Steak 150g, double fromage, oignons caramélisés', price: 50000, prep: 15 },
      ],
    },
    {
      name: 'Poulet Frit',
      slug: 'poulet-frit',
      description: 'Poulet mariné et frit à la perfection',
      items: [
        { name: 'Poulet Entier', desc: 'Poulet entier frit, frites, salade', price: 75000, prep: 25, isPopular: true },
        { name: 'Demi Poulet', desc: 'Demi poulet frit, frites, salade', price: 45000, prep: 20 },
        { name: 'Poulet Wings (6 pcs)', desc: '6 ailes de poulet croustillantes, sauce au choix', price: 35000, prep: 15 },
        { name: 'Poulet Tenders (5 pcs)', desc: '5 tenders de poulet panés, sauce', price: 30000, prep: 12 },
        { name: 'Poulet Péri-Péri', desc: 'Poulet épicé à la portugaise, frites', price: 50000, prep: 25 },
      ],
    },
    {
      name: 'Plats Guinéens',
      slug: 'plats-guineens',
      description: 'Spécialités traditionnelles guinéennes',
      items: [
        { name: 'Riz Gras', desc: 'Riz aux tomates, légumes, viande ou poisson', price: 35000, prep: 25, isPopular: true },
        { name: 'Poulet Yassa', desc: 'Poulet mariné au citron, oignons caramélisés, riz', price: 45000, prep: 30 },
        { name: 'Mafé', desc: 'Ragoût d\'arachide avec viande, riz', price: 40000, prep: 35 },
        { name: 'Fou Fou', desc: 'Pâte de manioc, sauce arachide ou gombo', price: 30000, prep: 30 },
        { name: 'Thiébou Dienne', desc: 'Riz rouge au poisson et légumes', price: 50000, prep: 40 },
        { name: 'Alloco Poisson', desc: 'Bananes plantain frites, poisson grillé, piment', price: 35000, prep: 20 },
      ],
    },
    {
      name: 'Pizzas',
      slug: 'pizzas',
      description: 'Pizzas fraîches au four',
      items: [
        { name: 'Pizza Margherita', desc: 'Sauce tomate, mozzarella, basilic', price: 50000, prep: 20 },
        { name: 'Pizza Reine', desc: 'Tomate, mozzarella, jambon, champignons', price: 60000, prep: 20, isPopular: true },
        { name: 'Pizza Calzone', desc: 'Pizza pliée, jambon, fromage, œuf', price: 65000, prep: 25 },
        { name: 'Pizza KFM Spéciale', desc: 'Tomate, mozzarella, poulet, poivrons, oignons', price: 75000, prep: 25 },
        { name: 'Pizza 4 Fromages', desc: 'Mozzarella, gorgonzola, chèvre, parmesan', price: 70000, prep: 20 },
      ],
    },
    {
      name: 'Accompagnements',
      slug: 'accompagnements',
      description: 'Frites, salades et plus',
      items: [
        { name: 'Frites Classiques', desc: 'Pommes de terre frites croustillantes', price: 15000, prep: 10 },
        { name: 'Frites Grandes', desc: 'Grande portion de frites', price: 20000, prep: 10 },
        { name: 'Alloco', desc: 'Bananes plantain frites', price: 15000, prep: 10, isPopular: true },
        { name: 'Salade Simple', desc: 'Laitue, tomate, oignon, vinaigrette', price: 15000, prep: 5 },
        { name: 'Coleslaw', desc: 'Salade de chou carotte', price: 12000, prep: 5 },
        { name: 'Riz Blanc', desc: 'Riz blanc nature', price: 10000, prep: 5 },
      ],
    },
    {
      name: 'Boissons',
      slug: 'boissons',
      description: 'Rafraîchissements',
      items: [
        { name: 'Coca-Cola 33cl', desc: 'Soda rafraîchissant', price: 8000, prep: 2 },
        { name: 'Fanta 33cl', desc: 'Orange ou ananas', price: 8000, prep: 2 },
        { name: 'Sprite 33cl', desc: 'Citron vert', price: 8000, prep: 2 },
        { name: 'Jus de Bissap', desc: 'Jus de fleur d\'hibiscus maison', price: 10000, prep: 3, isPopular: true },
        { name: 'Jus de Gingembre', desc: 'Jus de gingembre frais', price: 10000, prep: 3 },
        { name: 'Bouteille d\'Eau', desc: 'Eau minérale 50cl', price: 5000, prep: 1 },
        { name: 'Limonade Maison', desc: 'Citron, menthe, sucre', price: 12000, prep: 5 },
      ],
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Sucreries pour terminer',
      items: [
        { name: 'Glace 2 boules', desc: 'Vanille, chocolat ou fraise', price: 15000, prep: 3 },
        { name: 'Beignet Glacé', desc: 'Beignet garni de glace', price: 20000, prep: 8 },
        { name: 'Salade de Fruits', desc: 'Fruits de saison frais', price: 18000, prep: 5 },
        { name: 'Banane Flambée', desc: 'Banane caramélisée, glace vanille', price: 25000, prep: 10 },
      ],
    },
  ];

  for (const cat of categories) {
    const category = await prisma.menuCategory.upsert({
      where: {
        menuId_slug: {
          menuId: menu.id,
          slug: cat.slug,
        }
      },
      update: {},
      create: {
        menuId: menu.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
      },
    });

    for (const item of cat.items) {
      await prisma.menuItem.upsert({
        where: {
          categoryId_slug: {
            categoryId: category.id,
            slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          }
        },
        update: {},
        create: {
          categoryId: category.id,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: item.desc,
          price: item.price,
          currencyId: gnfCurrency.id,
          prepTime: item.prep,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isFeatured: item.isPopular || false,
        },
      });
    }
  }

  console.log('✅ Catégories et produits créés');

  // 10. Créer les tables du restaurant
  const tables = [
    { number: 'T1', capacity: 2 },
    { number: 'T2', capacity: 2 },
    { number: 'T3', capacity: 4 },
    { number: 'T4', capacity: 4 },
    { number: 'T5', capacity: 4 },
    { number: 'T6', capacity: 6 },
    { number: 'T7', capacity: 6 },
    { number: 'T8', capacity: 8 },
    { number: 'T9', capacity: 8 },
    { number: 'T10', capacity: 10 },
    { number: 'VIP1', capacity: 6 },
    { number: 'VIP2', capacity: 8 },
  ];

  for (const table of tables) {
    await prisma.table.upsert({
      where: {
        restaurantId_number: {
          restaurantId: restaurant.id,
          number: table.number,
        }
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        number: table.number,
        capacity: table.capacity,
        status: 'AVAILABLE',
        isVip: table.number.startsWith('VIP'),
        isActive: true,
      },
    });
  }

  console.log('✅ Tables créées:', tables.length);

  // 11. Créer l'utilisateur admin du restaurant
  const passwordHash = await bcrypt.hash('kfm2024!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kfm-delice.com' },
    update: {},
    create: {
      email: 'admin@kfm-delice.com',
      phone: '+224622000002',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'KFM DELICE',
      language: 'fr',
      timezone: 'Africa/Conakry',
      isActive: true,
    },
  });

  // Lier l'admin à l'organisation
  await prisma.organizationUser.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: adminUser.id,
      }
    },
    update: {},
    create: {
      organizationId: organization.id,
      userId: adminUser.id,
      role: 'owner',
      acceptedAt: new Date(),
    },
  });

  console.log('✅ Utilisateur admin créé');
  console.log('   Email: admin@kfm-delice.com');
  console.log('   Mot de passe: kfm2024!');

  // 12. Créer des membres du staff
  const staffMembers = [
    { firstName: 'Amadou', lastName: 'Diallo', role: 'manager', phone: '+224622000003' },
    { firstName: 'Fatou', lastName: 'Conde', role: 'server', phone: '+224622000004' },
    { firstName: 'Ibrahima', lastName: 'Sow', role: 'cook', phone: '+224622000005' },
    { firstName: 'Mariama', lastName: 'Bah', role: 'cashier', phone: '+224622000006' },
  ];

  for (const staff of staffMembers) {
    const staffPassHash = await bcrypt.hash('kfm2024!', 12);

    const staffUser = await prisma.user.upsert({
      where: { email: `${staff.firstName.toLowerCase()}@kfm-delice.com` },
      update: {},
      create: {
        email: `${staff.firstName.toLowerCase()}@kfm-delice.com`,
        phone: staff.phone,
        passwordHash: staffPassHash,
        role: 'STAFF',
        firstName: staff.firstName,
        lastName: staff.lastName,
        language: 'fr',
        timezone: 'Africa/Conakry',
        isActive: true,
      },
    });

    await prisma.staffProfile.upsert({
      where: {
        restaurantId_userId: {
          restaurantId: restaurant.id,
          userId: staffUser.id,
        }
      },
      update: {},
      create: {
        restaurantId: restaurant.id,
        userId: staffUser.id,
        position: staff.role,
        hourlyRate: staff.role === 'manager' ? 25000 : staff.role === 'cook' ? 20000 : 15000,
        isActive: true,
      },
    });
  }

  console.log('✅ Staff créé:', staffMembers.length, 'membres');

  // 13. Créer un livreur
  const driverPassHash = await bcrypt.hash('kfm2024!', 12);
  const driverUser = await prisma.user.upsert({
    where: { email: 'livreur@kfm-delice.com' },
    update: {},
    create: {
      email: 'livreur@kfm-delice.com',
      phone: '+224622000007',
      passwordHash: driverPassHash,
      role: 'DRIVER',
      firstName: 'Moussa',
      lastName: 'Camara',
      language: 'fr',
      timezone: 'Africa/Conakry',
      isActive: true,
    },
  });

  await prisma.driver.upsert({
    where: { phone: '+224622000007' },
    update: {},
    create: {
      organizationId: organization.id,
      userId: driverUser.id,
      firstName: 'Moussa',
      lastName: 'Camara',
      phone: '+224622000007',
      vehicleType: 'motorcycle',
      vehicleBrand: 'Honda',
      vehicleModel: 'CG 125',
      vehiclePlate: 'GN-1234-KL',
      vehicleColor: 'Rouge',
      isActive: true,
      isAvailable: true,
      status: 'available',
    },
  });

  console.log('✅ Livreur créé');

  // Résumé
  console.log('\n========================================');
  console.log('🎉 Configuration KFM DELICE terminée !');
  console.log('========================================');
  console.log('\n📊 Résumé:');
  console.log(`   - Organisation: ${organization.name}`);
  console.log(`   - Restaurant: ${restaurant.name}`);
  console.log(`   - Devise: ${gnfCurrency.name} (${gnfCurrency.symbol})`);
  console.log(`   - Adresse: ${restaurant.address}, ${restaurant.city}`);
  console.log(`   - Tables: ${tables.length}`);
  console.log(`   - Catégories: ${categories.length}`);
  console.log(`   - Staff: ${staffMembers.length + 1}`);
  console.log('\n🔐 Connexion Admin:');
  console.log('   Email: admin@kfm-delice.com');
  console.log('   Mot de passe: kfm2024!');
  console.log('\n📱 Mobile Money accepté:');
  console.log('   - Orange Money Guinée');
  console.log('   - MTN MoMo Guinée');
  console.log('   - Espèces');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
