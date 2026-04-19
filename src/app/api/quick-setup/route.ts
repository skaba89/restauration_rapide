// Quick Setup API - Create KFM DELICE Admin User
// SECURITY (P1): Protected with admin auth, credentials no longer in response
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

// GET /api/quick-setup - Disabled, use POST with auth
export function GET() {
  return NextResponse.json(
    { success: false, error: 'Utilisez POST avec authentification admin' },
    { status: 405 }
  );
}

// POST /api/quick-setup - Protected
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    // Passwords from environment variables
    const adminPwd = process.env.SEED_ADMIN_PASSWORD || 'KfmDelice2024!';
    const hashedPassword = await bcrypt.hash(adminPwd, 12);

    // 1. Create currencies
    const gnf = await db.currency.upsert({
      where: { code: 'GNF' },
      update: { name: 'Franc Guinéen (FGN)', symbol: 'FGN' },
      create: { code: 'GNF', name: 'Franc Guinéen (FGN)', symbol: 'FGN', isActive: true },
    });

    // 2. Create Guinea country
    const guinea = await db.country.upsert({
      where: { code: 'GN' },
      update: { name: 'Guinée' },
      create: {
        code: 'GN',
        name: 'Guinée',
        dialCode: '+224',
        currencyId: gnf.id,
        defaultLanguage: 'fr',
        timezone: 'Africa/Conakry',
      },
    });

    // 3. Create organization
    const org = await db.organization.upsert({
      where: { slug: 'kfm-delice-org' },
      update: { name: 'KFM DELICE' },
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

    // 4. Create admin user (password never returned)
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
    } else {
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedPassword, isActive: true },
      });
    }

    // 5. Link user to org
    await db.organizationUser.upsert({
      where: { organizationId_userId: { organizationId: org.id, userId: user.id } },
      update: { role: 'admin' },
      create: { organizationId: org.id, userId: user.id, role: 'admin' },
    });

    // 6. Create restaurant
    const existingRestaurant = await db.restaurant.findFirst({
      where: { organizationId: org.id },
    });

    let restaurant = existingRestaurant;
    if (!restaurant) {
      restaurant = await db.restaurant.create({
        data: {
          organizationId: org.id,
          name: 'KFM DELICE',
          slug: 'kfm-delice',
          description: 'Restaurant guinéen',
          phone: '+224622000000',
          address: 'Kaloum, Conakry',
          city: 'Conakry',
          countryId: guinea.id,
          restaurantType: 'restaurant',
          priceRange: 2,
          acceptsDelivery: true,
          isActive: true,
          isOpen: true,
        },
      });
    }

    // 7. Create menu
    let menu = await db.menu.findFirst({ where: { restaurantId: restaurant.id } });
    if (!menu) {
      menu = await db.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Menu Principal',
          slug: 'menu-principal',
          isActive: true,
        },
      });
    }

    // SECURITY: No credentials in response
    return NextResponse.json({
      success: true,
      message: 'KFM DELICE créé avec succès!',
      restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
      loginUrl: '/login',
      menuUrl: '/menu/kfm-delice',
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erreur'
    }, { status: 500 });
  }
});
