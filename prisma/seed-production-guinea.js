// ============================================
// KFM DELICE - Restaurant Guinée
// Configuration PRODUCTION (sans données de test)
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🇬🇳 Configuration KFM DELICE - Production Guinée...\n');

  // 1. Nettoyer les données de test existantes
  console.log('🧹 Nettoyage des données de test...');
  
  // Supprimer les organisations de test
  const testOrgs = await prisma.organization.findMany({
    where: {
      slug: { not: 'kfm-delice' }
    }
  });
  
  for (const org of testOrgs) {
    await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
  }
  console.log(`   ✅ ${testOrgs.length} organisations de test supprimées`);

  // 2. Récupérer la Guinée et la devise GNF
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

  // 3. Définir la Guinée comme pays par défaut (le premier dans la liste)
  await prisma.country.update({
    where: { id: guinea.id },
    data: { 
      isActive: true,
    }
  });

  // 4. Définir le GNF comme devise par défaut (le premier dans la liste)
  await prisma.currency.update({
    where: { id: gnfCurrency.id },
    data: { isActive: true }
  });

  // 5. Créer l'organisation KFM DELICE
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
      plan: 'BUSINESS',
      isActive: true,
    },
  });

  console.log('\n✅ Organisation créée:', organization.name);

  // 6. Créer les paramètres de l'organisation
  await prisma.organizationSettings.upsert({
    where: { organizationId: organization.id },
    update: {
      minOrderAmount: 50000,
      defaultDeliveryFee: 15000,
      acceptsCash: true,
      acceptsMobileMoney: true,
    },
    create: {
      organizationId: organization.id,
      minOrderAmount: 50000,
      maxDeliveryRadius: 15,
      defaultDeliveryFee: 15000,
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
      pointValue: 1000,
    },
  });

  console.log('✅ Paramètres organisation créés');

  // 7. Créer le restaurant principal
  const restaurant = await prisma.restaurant.upsert({
    where: {
      organizationId_slug: {
        organizationId: organization.id,
        slug: 'kfm-delice-conakry',
      }
    },
    update: {
      paymentMethods: JSON.stringify(['cash', 'orange_money', 'mtn_momo']),
    },
    create: {
      organizationId: organization.id,
      name: 'KFM DELICE - Conakry',
      slug: 'kfm-delice-conakry',
      description: 'Restaurant Fast Food Moderne à Conakry',
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

  // 8. Créer les horaires d'ouverture
  const hours = [
    { dayOfWeek: 0, openTime: '11:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 1, openTime: '10:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 2, openTime: '10:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 3, openTime: '10:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 4, openTime: '10:00', closeTime: '23:00', isClosed: false },
    { dayOfWeek: 5, openTime: '10:00', closeTime: '00:00', isClosed: false },
    { dayOfWeek: 6, openTime: '10:00', closeTime: '00:00', isClosed: false },
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

  // 9. Créer les zones de livraison pour toute la Guinée
  const guineaZones = [
    // Conakry et ses communes
    { name: 'Kaloum - Conakry', description: 'Commune de Kaloum, Conakry', baseFee: 10000, minTime: 15, maxTime: 25 },
    { name: 'Dixinn - Conakry', description: 'Commune de Dixinn, Conakry', baseFee: 15000, minTime: 20, maxTime: 35 },
    { name: 'Ratoma - Conakry', description: 'Commune de Ratoma, Conakry', baseFee: 20000, minTime: 25, maxTime: 45 },
    { name: 'Matam - Conakry', description: 'Commune de Matam, Conakry', baseFee: 20000, minTime: 25, maxTime: 45 },
    { name: 'Matoto - Conakry', description: 'Commune de Matoto, Conakry', baseFee: 25000, minTime: 30, maxTime: 50 },
    { name: 'Kaporo-Rails - Conakry', description: 'Quartier Kaporo-Rails, Conakry', baseFee: 25000, minTime: 30, maxTime: 50 },
    { name: 'Cimenterie - Conakry', description: 'Quartier Cimenterie, Conakry', baseFee: 25000, minTime: 30, maxTime: 50 },
    { name: 'Hamdallaye - Conakry', description: 'Quartier Hamdallaye, Conakry', baseFee: 20000, minTime: 25, maxTime: 40 },
    { name: 'Niger-Cite - Conakry', description: 'Quartier Niger-Cite, Conakry', baseFee: 20000, minTime: 25, maxTime: 40 },
    { name: 'Boulbinet - Conakry', description: 'Quartier Boulbinet, Conakry', baseFee: 12000, minTime: 15, maxTime: 30 },
    
    // Villes principales de Basse Guinée
    { name: 'Kamsar', description: 'Ville de Kamsar, Boké', baseFee: 50000, minTime: 60, maxTime: 120 },
    { name: 'Boké', description: 'Chef-lieu Boké', baseFee: 60000, minTime: 90, maxTime: 180 },
    { name: 'Boffa', description: 'Préfecture de Boffa', baseFee: 45000, minTime: 60, maxTime: 120 },
    { name: 'Fria', description: 'Ville de Fria', baseFee: 50000, minTime: 75, maxTime: 150 },
    { name: 'Télimélé', description: 'Préfecture de Télimélé', baseFee: 55000, minTime: 90, maxTime: 180 },
    
    // Villes de Moyenne Guinée
    { name: 'Labé', description: 'Chef-lieu Labé, Fouta Djallon', baseFee: 70000, minTime: 120, maxTime: 240 },
    { name: 'Pita', description: 'Préfecture de Pita', baseFee: 75000, minTime: 120, maxTime: 240 },
    { name: 'Dalaba', description: 'Préfecture de Dalaba', baseFee: 75000, minTime: 120, maxTime: 240 },
    { name: 'Mamou', description: 'Chef-lieu Mamou', baseFee: 60000, minTime: 90, maxTime: 180 },
    { name: 'Tougué', description: 'Préfecture de Tougué', baseFee: 85000, minTime: 150, maxTime: 300 },
    { name: 'Koubia', description: 'Préfecture de Koubia', baseFee: 90000, minTime: 180, maxTime: 360 },
    
    // Villes de Haute Guinée
    { name: 'Kankan', description: 'Chef-lieu Kankan, Haute Guinée', baseFee: 80000, minTime: 150, maxTime: 300 },
    { name: 'Kouroussa', description: 'Préfecture de Kouroussa', baseFee: 75000, minTime: 120, maxTime: 240 },
    { name: 'Siguiri', description: 'Préfecture de Siguiri, zone aurifère', baseFee: 90000, minTime: 180, maxTime: 360 },
    { name: 'Kérouané', description: 'Préfecture de Kérouané', baseFee: 95000, minTime: 180, maxTime: 360 },
    { name: 'Mandiana', description: 'Préfecture de Mandiana', baseFee: 100000, minTime: 200, maxTime: 400 },
    { name: 'Dabola', description: 'Préfecture de Dabola', baseFee: 70000, minTime: 120, maxTime: 240 },
    { name: 'Faranah', description: 'Chef-lieu Faranah', baseFee: 75000, minTime: 120, maxTime: 240 },
    
    // Villes de Guinée Forestière
    { name: 'Nzérékoré', description: 'Chef-lieu Nzérékoré, Guinée Forestière', baseFee: 85000, minTime: 150, maxTime: 300 },
    { name: 'Beyla', description: 'Préfecture de Beyla', baseFee: 95000, minTime: 180, maxTime: 360 },
    { name: 'Gueckédou', description: 'Préfecture de Gueckédou', baseFee: 90000, minTime: 180, maxTime: 360 },
    { name: 'Macenta', description: 'Préfecture de Macenta', baseFee: 90000, minTime: 180, maxTime: 360 },
    { name: 'Kissidougou', description: 'Préfecture de Kissidougou', baseFee: 80000, minTime: 150, maxTime: 300 },
    { name: 'Lola', description: 'Préfecture de Lola', baseFee: 95000, minTime: 180, maxTime: 360 },
    { name: 'Yomou', description: 'Préfecture de Yomou', baseFee: 100000, minTime: 200, maxTime: 400 },
    
    // Villes de Guinée Maritime
    { name: 'Coyah', description: 'Préfecture de Coyah', baseFee: 35000, minTime: 45, maxTime: 90 },
    { name: 'Dubréka', description: 'Préfecture de Dubréka', baseFee: 35000, minTime: 45, maxTime: 90 },
    { name: 'Forécariah', description: 'Préfecture de Forécariah', baseFee: 40000, minTime: 60, maxTime: 120 },
    { name: 'Kindia', description: 'Chef-lieu Kindia', baseFee: 40000, minTime: 60, maxTime: 120 },
  ];

  for (const zone of guineaZones) {
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

  console.log('✅ Zones de livraison créées:', guineaZones.length, 'villes de Guinée');

  // 10. Créer l'utilisateur admin
  const passwordHash = await bcrypt.hash('kfm2024!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kfm-delice.com' },
    update: {},
    create: {
      email: 'admin@kfm-delice.com',
      phone: '+224622000002',
      passwordHash,
      role: 'SUPER_ADMIN',
      firstName: 'Admin',
      lastName: 'KFM DELICE',
      language: 'fr',
      timezone: 'Africa/Conakry',
      isActive: true,
    },
  });

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

  // Résumé
  console.log('\n========================================');
  console.log('🎉 Configuration KFM DELICE terminée !');
  console.log('========================================');
  console.log('\n📊 Résumé:');
  console.log(`   - Organisation: ${organization.name}`);
  console.log(`   - Restaurant: ${restaurant.name}`);
  console.log(`   - Pays par défaut: Guinée 🇬🇳`);
  console.log(`   - Devise par défaut: Franc Guinéen (GNF)`);
  console.log(`   - Zones de livraison: ${guineaZones.length} villes de Guinée`);
  console.log('\n🔐 Connexion Admin:');
  console.log('   Email: admin@kfm-delice.com');
  console.log('   Mot de passe: kfm2024!');
  console.log('\n📱 Mobile Money Guinée:');
  console.log('   - Orange Money');
  console.log('   - MTN MoMo');
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
