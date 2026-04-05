// Setup Database and Seed - Call this once after deployment
import { NextResponse } from 'next/server';

export async function GET() {
  const result = {
    timestamp: new Date().toISOString(),
    steps: [] as string[],
    errors: [] as string[],
    success: false,
  };

  try {
    // Check DATABASE_URL
    result.steps.push('Checking DATABASE_URL...');
    if (!process.env.DATABASE_URL) {
      result.errors.push('DATABASE_URL is not set');
      return NextResponse.json(result, { status: 500 });
    }
    result.steps.push(`✓ DATABASE_URL found`);

    try {
      const { db } = await import('@/lib/db');
      const bcrypt = await import('bcryptjs');

      const BCRYPT_SALT_ROUNDS = 12;

      // Create currencies
      const gnf = await db.currency.upsert({
        where: { code: 'GNF' },
        update: { name: 'Franc Guinéen', symbol: 'GNF', decimalPlaces: 0, isActive: true },
        create: { code: 'GNF', name: 'Franc Guinéen', symbol: 'GNF', decimalPlaces: 0, isActive: true },
      });
      result.steps.push(`✓ Currency GNF`);

      await db.currency.upsert({
        where: { code: 'XOF' },
        update: { name: 'Franc CFA', symbol: 'FCFA', decimalPlaces: 0, isActive: true },
        create: { code: 'XOF', name: 'Franc CFA', symbol: 'FCFA', decimalPlaces: 0, isActive: true },
      });
      result.steps.push(`✓ Currency XOF`);

      // Create country
      const guinea = await db.country.upsert({
        where: { code: 'GN' },
        update: { name: 'Guinée', dialCode: '+224', currencyId: gnf.id },
        create: {
          code: 'GN',
          name: 'Guinée',
          dialCode: '+224',
          currencyId: gnf.id,
          defaultLanguage: 'fr',
          timezone: 'Africa/Conakry',
          taxIncluded: true,
          mobileMoneyEnabled: true,
        },
      });
      result.steps.push(`✓ Country Guinea`);

      // Create organization
      const org = await db.organization.upsert({
        where: { slug: 'kfm-delice-org' },
        update: {
          name: 'KFM DELICE',
          email: 'contact@kfm-delice.com',
          phone: '+224622000000',
          city: 'Conakry',
          countryId: guinea.id,
          currencyId: gnf.id,
          plan: 'BUSINESS',
          isActive: true,
        },
        create: {
          name: 'KFM DELICE',
          slug: 'kfm-delice-org',
          email: 'contact@kfm-delice.com',
          phone: '+224622000000',
          city: 'Conakry',
          countryId: guinea.id,
          currencyId: gnf.id,
          plan: 'BUSINESS',
          isActive: true,
        },
      });
      result.steps.push(`✓ Organization`);

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
        },
      });
      result.steps.push(`✓ Organization settings`);

      // Create admin user
      const hashedPassword = await bcrypt.hash('KfmDelice2024!', BCRYPT_SALT_ROUNDS);
      let user = await db.user.findUnique({ where: { email: 'kfm.delice@guinee.com' } });
      
      if (!user) {
        user = await db.user.create({
          data: {
            email: 'kfm.delice@guinee.com',
            phone: '+224622000001',
            passwordHash: hashedPassword,
            firstName: 'KFM',
            lastName: 'DELICE',
            role: 'ORG_ADMIN',
            isActive: true,
          },
        });
        result.steps.push(`✓ Admin user created`);
      } else {
        await db.user.update({
          where: { id: user.id },
          data: { passwordHash: hashedPassword, isActive: true },
        });
        result.steps.push(`✓ Admin user updated`);
      }

      // Link user to organization
      await db.organizationUser.upsert({
        where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
        update: { role: 'admin' },
        create: { organizationId: org.id, userId: user.id, role: 'admin' },
      });
      result.steps.push(`✓ User linked to org`);

      // Create restaurant
      let restaurant = await db.restaurant.findFirst({
        where: { slug: 'kfm-delice', organizationId: org.id },
      });

      if (restaurant) {
        restaurant = await db.restaurant.update({
          where: { id: restaurant.id },
          data: {
            name: 'KFM DELICE',
            description: 'Restaurant fast-food guinéen - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
            phone: '+224622000000',
            address: 'Kaloum, Conakry',
            city: 'Conakry',
            district: 'Kaloum',
            countryId: guinea.id,
            restaurantType: 'restaurant',
            cuisines: JSON.stringify(['Guinéenne', 'Ivoirienne', 'Sénégalaise', 'Fast Food']),
            priceRange: 2,
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
        result.steps.push(`✓ Restaurant updated`);
      } else {
        restaurant = await db.restaurant.create({
          data: {
            organizationId: org.id,
            name: 'KFM DELICE',
            slug: 'kfm-delice',
            description: 'Restaurant fast-food guinéen - Saveurs de Guinée, Côte d\'Ivoire et Sénégal',
            phone: '+224622000000',
            address: 'Kaloum, Conakry',
            city: 'Conakry',
            district: 'Kaloum',
            countryId: guinea.id,
            restaurantType: 'restaurant',
            cuisines: JSON.stringify(['Guinéenne', 'Ivoirienne', 'Sénégalaise', 'Fast Food']),
            priceRange: 2,
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
        result.steps.push(`✓ Restaurant created`);
      }

      // Create menu
      let menu = await db.menu.findFirst({ where: { restaurantId: restaurant.id } });
      if (!menu) {
        menu = await db.menu.create({
          data: {
            restaurantId: restaurant.id,
            name: 'Menu Principal',
            slug: 'menu-principal',
            description: 'Menu complet KFM DELICE',
            isActive: true,
            sortOrder: 1,
          },
        });
        result.steps.push(`✓ Menu created`);
      } else {
        result.steps.push(`✓ Menu exists`);
      }

      // Create categories
      const categories = [
        { name: 'Plats Ivoiriens', order: 1 },
        { name: 'Plats Sénégalais', order: 2 },
        { name: 'Plats Guinéens', order: 3 },
        { name: 'Grillades', order: 4 },
        { name: 'Fast Food', order: 5 },
        { name: 'Boissons', order: 6 },
      ];

      const categoryMap: Record<string, string> = {};
      for (const cat of categories) {
        const existing = await db.menuCategory.findFirst({
          where: { menuId: menu.id, name: cat.name },
        });
        if (existing) {
          categoryMap[cat.name] = existing.id;
        } else {
          const created = await db.menuCategory.create({
            data: {
              menuId: menu.id,
              name: cat.name,
              slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
              sortOrder: cat.order,
              isActive: true,
            },
          });
          categoryMap[cat.name] = created.id;
        }
      }
      result.steps.push(`✓ Categories (${Object.keys(categoryMap).length})`);

      // Create menu items
      const menuItems = [
        { name: 'Attieké Poisson', desc: 'Semoule de manioc avec poisson grillé', price: 45000, cat: 'Plats Ivoiriens', time: 20 },
        { name: 'Alloco Sauce Graine', desc: 'Bananes plantains frites sauce graine', price: 25000, cat: 'Plats Ivoiriens', time: 15 },
        { name: 'Garba', desc: 'Attieké avec poisson frit', price: 30000, cat: 'Plats Ivoiriens', time: 15 },
        { name: 'Thiéboudienne', desc: 'Riz au poisson et légumes', price: 45000, cat: 'Plats Sénégalais', time: 45 },
        { name: 'Yassa Poulet', desc: 'Poulet mariné au citron', price: 40000, cat: 'Plats Sénégalais', time: 30 },
        { name: 'Mafé', desc: 'Ragoût sauce arachide', price: 40000, cat: 'Plats Sénégalais', time: 35 },
        { name: 'Poulet Yassa GN', desc: 'Poulet mariné guinéen', price: 45000, cat: 'Plats Guinéens', time: 35 },
        { name: 'Konkoé', desc: 'Pâte manioc sauce arachide', price: 30000, cat: 'Plats Guinéens', time: 30 },
        { name: 'Mix Grill', desc: 'Assortiment de grillades', price: 65000, cat: 'Grillades', time: 30 },
        { name: 'Poulet Braisé', desc: 'Demi-poulet grillé', price: 35000, cat: 'Grillades', time: 30 },
        { name: 'Burger KFM', desc: 'Burger maison spécial', price: 25000, cat: 'Fast Food', time: 15 },
        { name: 'Chawarma Poulet', desc: 'Chawarma au poulet', price: 20000, cat: 'Fast Food', time: 10 },
        { name: 'Jus de Bissap', desc: 'Jus naturel d\'hibiscus', price: 4000, cat: 'Boissons', time: 3 },
        { name: 'Jus de Gingembre', desc: 'Jus de gingembre frais', price: 4000, cat: 'Boissons', time: 3 },
      ];

      let itemCount = 0;
      for (const item of menuItems) {
        const categoryId = categoryMap[item.cat];
        if (!categoryId) continue;

        const existing = await db.menuItem.findFirst({
          where: { categoryId, name: item.name },
        });
        if (!existing) {
          await db.menuItem.create({
            data: {
              categoryId,
              name: item.name,
              slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
              description: item.desc,
              price: item.price,
              prepTime: item.time,
              isAvailable: true,
              isPopular: true,
            },
          });
          itemCount++;
        }
      }
      result.steps.push(`✓ Menu items (${itemCount} new)`);

      // Create delivery zones
      const zones = [
        { name: 'Kaloum', fee: 5000, min: 10000, t1: 20, t2: 45 },
        { name: 'Dixinn', fee: 5000, min: 10000, t1: 25, t2: 50 },
        { name: 'Ratoma', fee: 5000, min: 10000, t1: 25, t2: 50 },
        { name: 'Matam', fee: 6000, min: 10000, t1: 30, t2: 55 },
        { name: 'Matoto', fee: 6000, min: 10000, t1: 30, t2: 55 },
      ];

      let zoneCount = 0;
      for (const z of zones) {
        const existing = await db.deliveryZone.findFirst({
          where: { restaurantId: restaurant.id, name: z.name },
        });
        if (!existing) {
          await db.deliveryZone.create({
            data: {
              restaurantId: restaurant.id,
              name: z.name,
              description: `Zone ${z.name}`,
              baseFee: z.fee,
              minOrder: z.min,
              minTime: z.t1,
              maxTime: z.t2,
              isActive: true,
            },
          });
          zoneCount++;
        }
      }
      result.steps.push(`✓ Delivery zones (${zoneCount} new)`);

      result.success = true;
      result.steps.push('');
      result.steps.push('🎉 SETUP COMPLETE!');
      result.steps.push('');
      result.steps.push('📧 Email: kfm.delice@guinee.com');
      result.steps.push('🔑 Password: KfmDelice2024!');
      result.steps.push('');
      result.steps.push('🔗 Try: /menu/kfm-delice');

    } catch (dbError: any) {
      result.errors.push(`Database error: ${dbError.message}`);
      console.error('DB Error:', dbError);
    }

  } catch (error: any) {
    result.errors.push(`Error: ${error.message}`);
    console.error('Error:', error);
  }

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
