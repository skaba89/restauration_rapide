// ============================================
// KFM DELICE - Restaurant Setup Script
// Production configuration for Guinea
// Plats Ivoiriens, Sénégalais et Guinéens
// ============================================

import { db } from '../src/lib/db';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

// KFM DELICE Configuration
const KFM_DELICE = {
  name: 'KFM DELICE',
  slug: 'kfm-delice',
  slogan: 'Les saveurs de l\'Afrique de l\'Ouest',
  description: 'Restaurant fast-food guinéen offrant des plats traditionnels ivoiriens, sénégalais et guinéens avec une qualité exceptionnelle.',
  phone: '+224622000000',
  email: 'contact@kfm-delice.com',
  address: 'Kaloum, Conakry',
  city: 'Conakry',
  district: 'Kaloum',
  cuisine: ['Guinéenne', 'Ivoirienne', 'Sénégalaise', 'Fast Food', 'Africaine'],
  color: '#FF6B35',
  priceRange: 2,
  openHours: {
    monday: { open: '08:00', close: '22:00' },
    tuesday: { open: '08:00', close: '22:00' },
    wednesday: { open: '08:00', close: '22:00' },
    thursday: { open: '08:00', close: '22:00' },
    friday: { open: '08:00', close: '23:00' },
    saturday: { open: '09:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' },
  },
};

// Admin user for KFM DELICE
const KFM_ADMIN = {
  email: 'kfm.delice@guinee.com',
  password: 'KfmDelice2024!',
  phone: '+224622000001',
  firstName: 'KFM',
  lastName: 'DELICE',
};

// Menu items for KFM DELICE - Mix of cuisines
const MENU_ITEMS = [
  // ============================================
  // PLATS IVOIRIENS
  // ============================================
  { name: 'Attieké Poisson Grillé', description: 'Semoule de manioc avec poisson grillé, sauce tomate et légumes frais', price: 45000, category: 'Plats Ivoiriens', prepTime: 20, isPopular: true },
  { name: 'Alloco Sauce Graine', description: 'Bananes plantains frites avec sauce graine de palme et poisson fumé', price: 25000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true },
  { name: 'Kedjenou de Poulet', description: 'Poulet braisé en cocotte fermée avec légumes et épices', price: 50000, category: 'Plats Ivoiriens', prepTime: 30, isNew: true },
  { name: 'Foutou Banane', description: 'Pâte de banane plantain avec sauce aubergine ou arachide', price: 30000, category: 'Plats Ivoiriens', prepTime: 25 },
  { name: 'Garba', description: 'Attieké avec poisson frit, oignons et piment', price: 30000, category: 'Plats Ivoiriens', prepTime: 15, isPopular: true },
  { name: 'Riz Gras Ivoirien', description: 'Riz aux tomates fraîches, légumes et viande ou poisson', price: 25000, category: 'Plats Ivoiriens', prepTime: 20 },
  { name: 'Foutou Ignames', description: 'Pâte d\'igname avec sauce graine ou arachide', price: 30000, category: 'Plats Ivoiriens', prepTime: 25 },
  { name: 'Poisson Braisé Ivoirien', description: 'Poisson entier grillé aux épices ivoiriennes', price: 55000, category: 'Plats Ivoiriens', prepTime: 25, isPopular: true },
  { name: 'Gari Foro', description: 'Semoule de manioc fermentée avec sauce', price: 20000, category: 'Plats Ivoiriens', prepTime: 10 },

  // ============================================
  // PLATS SÉNÉGALAIS
  // ============================================
  { name: 'Thiéboudienne', description: 'Riz au poisson et légumes, plat national sénégalais', price: 45000, category: 'Plats Sénégalais', prepTime: 45, isPopular: true },
  { name: 'Yassa Poulet', description: 'Poulet mariné au citron et oignons caramélisés', price: 40000, category: 'Plats Sénégalais', prepTime: 30, isPopular: true },
  { name: 'Mafé', description: 'Ragoût de viande à la sauce d\'arachide crémeuse', price: 40000, category: 'Plats Sénégalais', prepTime: 35, isPopular: true },
  { name: 'Dibi', description: 'Grillades d\'agneau aux épices sénégalaises', price: 60000, category: 'Plats Sénégalais', prepTime: 25, isNew: true },
  { name: 'Thiou au Poisson', description: 'Ragoût de poisson épicé aux légumes', price: 45000, category: 'Plats Sénégalais', prepTime: 30 },
  { name: 'Ceebu Jën', description: 'Riz rouge au poisson et légumes', price: 45000, category: 'Plats Sénégalais', prepTime: 40 },
  { name: 'Pastels', description: 'Beignets de poisson croustillants', price: 20000, category: 'Plats Sénégalais', prepTime: 20 },
  { name: 'Thiébou Yapp', description: 'Riz à la viande et légumes', price: 40000, category: 'Plats Sénégalais', prepTime: 35 },
  { name: 'Domoda', description: 'Ragoût de viande à la sauce arachide avec riz', price: 40000, category: 'Plats Sénégalais', prepTime: 35 },

  // ============================================
  // PLATS GUINÉENS
  // ============================================
  { name: 'Poulet Yassa Guinéen', description: 'Poulet mariné au citron et oignons, style guinéen', price: 45000, category: 'Plats Guinéens', prepTime: 35, isPopular: true },
  { name: 'Fou Fou Guinéen', description: 'Ragoût de fonio aux arachides et légumes', price: 35000, category: 'Plats Guinéens', prepTime: 40, isPopular: true },
  { name: 'Riz Gras Guinéen', description: 'Riz aux tomates fraîches, légumes et viande', price: 25000, category: 'Plats Guinéens', prepTime: 25 },
  { name: 'Konkoé', description: 'Pâte de manioc avec sauce aux arachides', price: 30000, category: 'Plats Guinéens', prepTime: 30, isPopular: true },
  { name: 'Tô Maïs', description: 'Boule de maïs avec sauce tomate et viande', price: 20000, category: 'Plats Guinéens', prepTime: 20 },
  { name: 'Poisson Braisé Guinéen', description: 'Poisson entier grillé aux épices locales', price: 50000, category: 'Plats Guinéens', prepTime: 30, isPopular: true },
  { name: 'Sauce Feuilles', description: 'Feuilles de patate douce avec viande fumée', price: 35000, category: 'Plats Guinéens', prepTime: 35 },
  { name: 'Maffi Guinéen', description: 'Viande en sauce arachide épicée', price: 40000, category: 'Plats Guinéens', prepTime: 40 },
  { name: 'Soupe Kansi', description: 'Soupe traditionnelle guinéenne', price: 25000, category: 'Plats Guinéens', prepTime: 30, isNew: true },
  
  // ============================================
  // GRILLADES
  // ============================================
  { name: 'Mix Grill', description: 'Assortiment de grillades (poulet, bœuf, agneau)', price: 65000, category: 'Grillades', prepTime: 30, isPopular: true },
  { name: 'Brochettes de Bœuf', description: '5 brochettes de bœuf marinées aux épices', price: 30000, category: 'Grillades', prepTime: 20 },
  { name: 'Poulet Braisé', description: 'Demi-poulet grillé aux épices africaines', price: 35000, category: 'Grillades', prepTime: 30, isPopular: true },
  { name: 'Poisson Grillé Entier', description: 'Poisson entier grillé au feu de bois', price: 50000, category: 'Grillades', prepTime: 25 },
  { name: 'Côtes d\'Agneau', description: 'Côtes d\'agneau grillées aux herbes', price: 55000, category: 'Grillades', prepTime: 25 },
  { name: 'Brochettes de Poisson', description: 'Brochettes de poisson mariné', price: 35000, category: 'Grillades', prepTime: 20 },
  { name: 'Chèvre Braisé', description: 'Viande de chèvre grillée aux épices', price: 45000, category: 'Grillades', prepTime: 35, isNew: true },

  // ============================================
  // FAST FOOD
  // ============================================
  { name: 'Burger KFM', description: 'Burger maison avec viande fraîche et sauce spéciale', price: 25000, category: 'Fast Food', prepTime: 15, isPopular: true },
  { name: 'Chawarma Poulet', description: 'Chawarma au poulet grillé avec sauce blanche', price: 20000, category: 'Fast Food', prepTime: 10, isPopular: true },
  { name: 'Chawarma Viande', description: 'Chawarma à la viande épicée', price: 22000, category: 'Fast Food', prepTime: 10 },
  { name: 'Sandwich Poulet', description: 'Sandwich au poulet pané avec frites', price: 18000, category: 'Fast Food', prepTime: 12 },
  { name: 'Tacos KFM', description: 'Tacos garnis au choix (poulet, viande, mixte)', price: 22000, category: 'Fast Food', prepTime: 15, isNew: true },
  { name: 'Wrap Poulet', description: 'Wrap au poulet grillé et légumes frais', price: 18000, category: 'Fast Food', prepTime: 10 },
  { name: 'Double Burger', description: 'Double burger avec fromage et bacon', price: 35000, category: 'Fast Food', prepTime: 18, isNew: true },
  { name: 'Hot Dog KFM', description: 'Hot dog garni maison', price: 15000, category: 'Fast Food', prepTime: 8 },

  // ============================================
  // ACCOMPAGNEMENTS
  // ============================================
  { name: 'Alloco', description: 'Bananes plantain frites croustillantes', price: 7000, category: 'Accompagnements', prepTime: 10, isPopular: true },
  { name: 'Frites', description: 'Frites de pommes de terre maison', price: 6000, category: 'Accompagnements', prepTime: 10 },
  { name: 'Riz Blanc', description: 'Riz blanc parfumé', price: 5000, category: 'Accompagnements', prepTime: 15 },
  { name: 'Attieké', description: 'Semoule de manioc fermentée', price: 8000, category: 'Accompagnements', prepTime: 5 },
  { name: 'Salade', description: 'Salade fraîche de saison', price: 6000, category: 'Accompagnements', prepTime: 5 },
  { name: 'Fonio', description: 'Fonio traditionnel guinéen', price: 8000, category: 'Accompagnements', prepTime: 20 },
  { name: 'Igname Pilée', description: 'Pâte d\'igname traditionnelle', price: 7000, category: 'Accompagnements', prepTime: 15 },

  // ============================================
  // BOISSONS
  // ============================================
  { name: 'Jus de Bissap', description: 'Jus naturel de fleur d\'hibiscus', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true },
  { name: 'Jus de Gingembre', description: 'Jus de gingembre frais et épicé', price: 4000, category: 'Boissons', prepTime: 3, isPopular: true },
  { name: 'Jus de Baobab', description: 'Jus de fruit de baobab', price: 5000, category: 'Boissons', prepTime: 3, isNew: true },
  { name: 'Café Touba', description: 'Café épicé sénégalais traditionnel', price: 3000, category: 'Boissons', prepTime: 5 },
  { name: 'Ataya', description: 'Thé à la menthe guinéen', price: 3000, category: 'Boissons', prepTime: 10 },
  { name: 'Eau Minérale', description: 'Eau minérale naturelle', price: 2000, category: 'Boissons', prepTime: 0 },
  { name: 'Soda', description: 'Boisson gazeuse (Coca, Fanta, Sprite)', price: 3000, category: 'Boissons', prepTime: 0 },
  { name: 'Jus d\'Orange', description: 'Jus d\'orange frais pressé', price: 5000, category: 'Boissons', prepTime: 5 },
  { name: 'Bouye', description: 'Jus de fruit de baobab traditionnel', price: 5000, category: 'Boissons', prepTime: 5, isNew: true },
  { name: 'Lait Caillé', description: 'Lait caillé traditionnel', price: 4000, category: 'Boissons', prepTime: 3 },
  { name: 'Dèguè', description: 'Boisson à base de mil et lait', price: 4500, category: 'Boissons', prepTime: 5 },

  // ============================================
  // DESSERTS
  // ============================================
  { name: 'Fruits de Saison', description: 'Assiette de fruits frais de saison', price: 6000, category: 'Desserts', prepTime: 5 },
  { name: 'Banane Caramel', description: 'Bananes flambées au caramel', price: 8000, category: 'Desserts', prepTime: 10, isNew: true },
  { name: 'Gâteau Maison', description: 'Gâteau fait maison du jour', price: 7000, category: 'Desserts', prepTime: 5 },
  { name: 'Pastèque Fraîche', description: 'Tranches de pastèque fraîche', price: 4000, category: 'Desserts', prepTime: 5 },
  { name: 'Thiakry', description: 'Dessert sénégalais au mil et lait', price: 6000, category: 'Desserts', prepTime: 5, isNew: true },
  { name: 'Glaces Artisanales', description: 'Glaces faites maison', price: 6000, category: 'Desserts', prepTime: 5 },
  { name: 'Beignets', description: 'Beignets africains sucrés', price: 5000, category: 'Desserts', prepTime: 10 },
];

// Menu Categories
const MENU_CATEGORIES = [
  { name: 'Plats Ivoiriens', description: 'Saveurs authentiques de Côte d\'Ivoire', order: 1, icon: 'flag-ivory-coast' },
  { name: 'Plats Sénégalais', description: 'Tradition culinaire sénégalaise', order: 2, icon: 'flag-senegal' },
  { name: 'Plats Guinéens', description: 'Spécialités traditionnelles de Guinée', order: 3, icon: 'flag-guinea' },
  { name: 'Grillades', description: 'Viandes et poissons grillés', order: 4, icon: 'flame' },
  { name: 'Fast Food', description: 'Burgers, chawarma et sandwiches', order: 5, icon: 'burger' },
  { name: 'Accompagnements', description: 'Frites, alloco, riz et plus', order: 6, icon: 'side-dish' },
  { name: 'Boissons', description: 'Jus naturels et boissons fraîches', order: 7, icon: 'cup' },
  { name: 'Desserts', description: 'Douceurs et fruits', order: 8, icon: 'cake' },
];

async function main() {
  console.log('🍽️ Configuration de KFM DELICE...\n');
  console.log('🌍 Restaurant multi-cuisines: Ivoirienne, Sénégalaise, Guinéenne\n');

  // 1. Get Guinea country and GNF currency
  console.log('📍 Récupération des données Guinée...');
  const guinea = await db.country.findUnique({ where: { code: 'GN' } });
  const gnf = await db.currency.findUnique({ where: { code: 'GNF' } });

  if (!guinea || !gnf) {
    throw new Error('Guinée ou Franc Guinéen non trouvé dans la base de données');
  }

  // 2. Create Organization
  console.log('🏢 Création de l\'organisation KFM DELICE...');
  const org = await db.organization.upsert({
    where: { slug: 'kfm-delice-org' },
    update: {
      name: KFM_DELICE.name,
      email: KFM_DELICE.email,
      phone: KFM_DELICE.phone,
      city: KFM_DELICE.city,
      countryId: guinea.id,
      currencyId: gnf.id,
      plan: 'BUSINESS',
      isActive: true,
    },
    create: {
      name: KFM_DELICE.name,
      slug: 'kfm-delice-org',
      email: KFM_DELICE.email,
      phone: KFM_DELICE.phone,
      city: KFM_DELICE.city,
      countryId: guinea.id,
      currencyId: gnf.id,
      plan: 'BUSINESS',
      isActive: true,
    },
  });

  // Create organization settings
  await db.organizationSettings.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      minOrderAmount: 10000,
      maxDeliveryRadius: 15,
      defaultDeliveryFee: 5000,
      orderPrepTime: 20,
      reservationEnabled: true,
      autoConfirmReservations: false,
      defaultTableTime: 90,
      noShowFee: 25000,
      acceptsCash: true,
      acceptsMobileMoney: true,
      acceptsCard: false,
      deliveryEnabled: true,
      loyaltyEnabled: true,
      pointsPerAmount: 100,
      pointValue: 500,
    },
  });

  // 3. Create Admin User
  console.log('👤 Création de l\'administrateur...');
  const hashedPassword = await bcrypt.hash(KFM_ADMIN.password, BCRYPT_SALT_ROUNDS);
  
  let user = await db.user.findUnique({ where: { email: KFM_ADMIN.email } });
  
  if (!user) {
    user = await db.user.create({
      data: {
        email: KFM_ADMIN.email,
        phone: KFM_ADMIN.phone,
        passwordHash: hashedPassword,
        firstName: KFM_ADMIN.firstName,
        lastName: KFM_ADMIN.lastName,
        role: 'ORG_ADMIN',
        isActive: true,
      },
    });
    console.log('  ✓ Utilisateur créé');
  } else {
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    console.log('  ✓ Mot de passe mis à jour');
  }

  // Link user to organization
  await db.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
    update: { role: 'admin' },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'admin',
    },
  });

  // 4. Create Restaurant
  console.log('🍽️ Création du restaurant...');
  
  let restaurant = await db.restaurant.findFirst({
    where: { slug: KFM_DELICE.slug, organizationId: org.id },
  });
  
  if (restaurant) {
    restaurant = await db.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name: KFM_DELICE.name,
        description: KFM_DELICE.description,
        phone: KFM_DELICE.phone,
        address: KFM_DELICE.address,
        city: KFM_DELICE.city,
        district: KFM_DELICE.district,
        countryId: guinea.id,
        restaurantType: 'restaurant',
        cuisines: JSON.stringify(KFM_DELICE.cuisine),
        priceRange: KFM_DELICE.priceRange,
        acceptsReservations: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: 5000,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        isActive: true,
        isOpen: true,
      },
    });
  } else {
    restaurant = await db.restaurant.create({
      data: {
        organizationId: org.id,
        name: KFM_DELICE.name,
        slug: KFM_DELICE.slug,
        description: KFM_DELICE.description,
        phone: KFM_DELICE.phone,
        address: KFM_DELICE.address,
        city: KFM_DELICE.city,
        district: KFM_DELICE.district,
        countryId: guinea.id,
        restaurantType: 'restaurant',
        cuisines: JSON.stringify(KFM_DELICE.cuisine),
        priceRange: KFM_DELICE.priceRange,
        acceptsReservations: true,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        deliveryFee: 5000,
        minOrderAmount: 10000,
        maxDeliveryRadius: 15,
        isActive: true,
        isOpen: true,
      },
    });
  }
  console.log(`  ✓ Restaurant: ${restaurant.name}`);

  // 5. Create Menu
  console.log('📋 Création du menu...');
  let menu = await db.menu.findFirst({
    where: { restaurantId: restaurant.id },
  });
  
  if (!menu) {
    menu = await db.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        description: 'Menu complet de KFM DELICE - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
        isActive: true,
        sortOrder: 1,
      },
    });
    console.log('  ✓ Menu créé');
  }

  // 6. Create Menu Categories
  console.log('📂 Création des catégories de menu...');
  const categoryMap: Record<string, string> = {};
  
  for (const cat of MENU_CATEGORIES) {
    const existing = await db.menuCategory.findFirst({
      where: { menuId: menu.id, name: cat.name },
    });
    
    if (!existing) {
      const created = await db.menuCategory.create({
        data: {
          menuId: menu.id,
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description,
          sortOrder: cat.order,
          isActive: true,
        },
      });
      categoryMap[cat.name] = created.id;
      console.log(`  ✓ ${cat.name}`);
    } else {
      categoryMap[cat.name] = existing.id;
    }
  }

  // 7. Create Menu Items
  console.log('🍕 Création des articles du menu...');
  let itemCount = 0;
  
  for (const item of MENU_ITEMS) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) continue;

    const existing = await db.menuItem.findFirst({
      where: { categoryId: categoryId, name: item.name },
    });

    if (!existing) {
      await db.menuItem.create({
        data: {
          categoryId: categoryId,
          name: item.name,
          slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: item.description,
          price: item.price,
          prepTime: item.prepTime,
          isAvailable: true,
          isPopular: item.isPopular || false,
          isNew: item.isNew || false,
        },
      });
      itemCount++;
    }
  }
  console.log(`  ✓ ${itemCount} articles créés`);

  // 8. Create Delivery Zones for Guinea
  console.log('🚚 Création des zones de livraison...');
  
  const guineaZones = [
    // Conakry - Communes
    { name: 'Kaloum', description: 'Commune de Kaloum, centre-ville', fee: 5000, minOrder: 10000, minTime: 20, maxTime: 45 },
    { name: 'Dixinn', description: 'Commune de Dixinn', fee: 5000, minOrder: 10000, minTime: 25, maxTime: 50 },
    { name: 'Ratoma', description: 'Commune de Ratoma', fee: 5000, minOrder: 10000, minTime: 25, maxTime: 50 },
    { name: 'Matam', description: 'Commune de Matam', fee: 6000, minOrder: 10000, minTime: 30, maxTime: 55 },
    { name: 'Matoto', description: 'Commune de Matoto', fee: 6000, minOrder: 10000, minTime: 30, maxTime: 55 },
    { name: 'Simbaya', description: 'Quartier Simbaya', fee: 7000, minOrder: 15000, minTime: 35, maxTime: 60 },
    { name: 'Yimbaya', description: 'Quartier Yimbaya', fee: 7000, minOrder: 15000, minTime: 35, maxTime: 60 },
    { name: 'Cosa', description: 'Quartier Cosa', fee: 7000, minOrder: 15000, minTime: 35, maxTime: 60 },
    { name: 'Nongo', description: 'Quartier Nongo', fee: 8000, minOrder: 15000, minTime: 40, maxTime: 65 },
    { name: 'Sonfonia', description: 'Quartier Sonfonia', fee: 8000, minOrder: 15000, minTime: 40, maxTime: 65 },
    // Villes de l'intérieur
    { name: 'Kamsar', description: 'Ville de Kamsar, Boké', fee: 50000, minOrder: 50000, minTime: 180, maxTime: 300 },
    { name: 'Boké', description: 'Ville de Boké', fee: 60000, minOrder: 50000, minTime: 240, maxTime: 360 },
    { name: 'Kindia', description: 'Ville de Kindia', fee: 30000, minOrder: 30000, minTime: 120, maxTime: 180 },
    { name: 'Mamou', description: 'Ville de Mamou', fee: 35000, minOrder: 35000, minTime: 150, maxTime: 240 },
    { name: 'Labé', description: 'Ville de Labé', fee: 40000, minOrder: 40000, minTime: 180, maxTime: 300 },
    { name: 'Kankan', description: 'Ville de Kankan', fee: 45000, minOrder: 45000, minTime: 240, maxTime: 360 },
    { name: 'Nzérékoré', description: 'Ville de Nzérékoré', fee: 50000, minOrder: 50000, minTime: 300, maxTime: 420 },
    { name: 'Fria', description: 'Ville de Fria', fee: 35000, minOrder: 30000, minTime: 150, maxTime: 240 },
    { name: 'Télimélé', description: 'Ville de Télimélé', fee: 32000, minOrder: 30000, minTime: 140, maxTime: 220 },
    { name: 'Pita', description: 'Ville de Pita', fee: 38000, minOrder: 35000, minTime: 170, maxTime: 280 },
  ];

  let zoneCount = 0;
  for (const zone of guineaZones) {
    const existing = await db.deliveryZone.findFirst({
      where: { restaurantId: restaurant.id, name: zone.name },
    });

    if (!existing) {
      await db.deliveryZone.create({
        data: {
          restaurantId: restaurant.id,
          name: zone.name,
          description: zone.description,
          baseFee: zone.fee,
          minOrder: zone.minOrder,
          minTime: zone.minTime,
          maxTime: zone.maxTime,
          isActive: true,
        },
      });
      zoneCount++;
    }
  }
  console.log(`  ✓ ${zoneCount} zones créées`);

  console.log('\n✅ Configuration terminée avec succès !\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                  🍽️ KFM DELICE - CONFIGURATION                ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('🔐 IDENTIFIANTS DE CONNEXION:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  📧 Email:      ${KFM_ADMIN.email}`);
  console.log(`  🔑 Mot de passe: ${KFM_ADMIN.password}`);
  console.log(`  📱 Téléphone:  ${KFM_ADMIN.phone}`);
  console.log('');
  console.log('📊 STATISTIQUES:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  🍕 Articles du menu:    ${itemCount}`);
  console.log(`  📂 Catégories:          ${MENU_CATEGORIES.length}`);
  console.log(`  🚚 Zones de livraison:  ${zoneCount}`);
  console.log('');
  console.log('🌐 URLS:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`  📱 Menu public:  /menu/${KFM_DELICE.slug}`);
  console.log(`  🔐 Admin:        /login`);
  console.log('');
  console.log('🍽️ CUISINES PROPOSÉES:');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('  🇨🇮 Plats Ivoiriens    - Attieké, Kedjenou, Alloco, Garba');
  console.log('  🇸🇳 Plats Sénégalais   - Thiéboudienne, Yassa, Mafé, Dibi');
  console.log('  🇬🇳 Plats Guinéens     - Fou Fou, Konkoé, Tô Maïs');
  console.log('  🍔 Fast Food          - Burgers, Chawarma, Tacos');
  console.log('  🔥 Grillades          - Poulet Braisé, Brochettes');
  console.log('═══════════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
