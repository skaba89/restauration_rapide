// ============================================
// Restaurant OS - First Launch Setup API
// Creates the first admin user + organization + restaurant
// Only works when NO users exist in the database
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import { createSession, createRefreshToken, getClientInfo } from '@/lib/auth-helpers';

// Helper for JSON responses
function json(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/setup - Check if setup is needed
export async function GET() {
  try {
    if (!db) {
      return json(false, {
        needsSetup: true,
        reason: 'no_database',
        message: 'Aucune base de données configurée. Veuillez configurer DATABASE_URL.',
      });
    }

    // Check if any users exist
    const userCount = await db.user.count();

    if (userCount === 0) {
      return json(true, {
        needsSetup: true,
        message: 'Premier lancement - création du compte administrateur requise.',
      });
    }

    return json(true, {
      needsSetup: false,
      userCount,
      message: 'L\'application est déjà configurée. Utilisez la page de connexion.',
    });
  } catch (error: any) {
    console.error('[SETUP] Check error:', error);
    return json(false, {
      needsSetup: true,
      reason: 'db_error',
      message: 'Erreur de connexion à la base de données: ' + (error.message || 'Unknown'),
    }, 500);
  }
}

// POST /api/setup - Create first admin user + organization + restaurant
export async function POST(request: Request) {
  try {
    if (!db) {
      return json(false, {
        error: 'Aucune base de données configurée. Configurez DATABASE_URL dans les variables d\'environnement Render.',
        hint: 'Render > Databases > Create PostgreSQL, puis ajoutez DATABASE_URL dans Environment.',
      }, 400);
    }

    // Security: Only allow setup when no users exist
    const userCount = await db.user.count();
    if (userCount > 0) {
      return json(false, {
        error: 'L\'application est déjà configurée. Utilisez la page de connexion.',
      }, 403);
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      restaurantName,
      restaurantSlug,
      restaurantPhone,
      restaurantCity,
      restaurantAddress,
      countryName = 'Guinée',
      currencyCode = 'GNF',
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return json(false, {
        error: 'Nom, prénom, email et mot de passe sont requis.',
      }, 400);
    }

    if (!restaurantName) {
      return json(false, {
        error: 'Le nom du restaurant est requis.',
      }, 400);
    }

    if (password.length < 8) {
      return json(false, {
        error: 'Le mot de passe doit contenir au moins 8 caractères.',
      }, 400);
    }

    const slug = restaurantSlug || restaurantName.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 1. Create or find Currency first (Country requires it)
    let currency = await db.currency.findFirst({ where: { code: currencyCode } });
    if (!currency) {
      currency = await db.currency.create({
        data: {
          name: currencyCode === 'GNF' ? 'Franc Guinéen (FGN)' : currencyCode,
          code: currencyCode,
          symbol: currencyCode === 'GNF' ? 'FGN' : currencyCode,
          decimalPlaces: currencyCode === 'GNF' ? 0 : 2,
          isActive: true,
        },
      });
    }

    // 2. Create or find Country
    let country = await db.country.findFirst({ where: { code: countryName.substring(0, 2).toLowerCase() } });
    if (!country) {
      country = await db.country.create({
        data: {
          name: countryName,
          code: countryName.substring(0, 2).toLowerCase(),
          dialCode: '+224',
          currencyId: currency.id,
          defaultLanguage: 'fr',
          timezone: 'Africa/Conakry',
          isActive: true,
        },
      });
    }

    // 3. Create the admin user
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase().trim(),
        phone: phone || null,
        passwordHash: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: new Date(),
      },
    });

    // 4. Create Organization
    const org = await db.organization.create({
      data: {
        name: restaurantName.trim(),
        slug,
        email: email.toLowerCase().trim(),
        phone: restaurantPhone || phone || '',
        address: restaurantAddress || '',
        city: restaurantCity || 'Conakry',
        countryId: country.id,
        currencyId: currency.id,
        isActive: true,
      },
    });

    // 5. Link user to organization as admin
    await db.organizationUser.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        role: 'ADMIN',
        acceptedAt: new Date(),
      },
    });

    // 6. Create Restaurant
    const restaurant = await db.restaurant.create({
      data: {
        organizationId: org.id,
        name: restaurantName.trim(),
        slug,
        phone: restaurantPhone || phone || '',
        email: email.toLowerCase().trim(),
        address: restaurantAddress || '',
        city: restaurantCity || 'Conakry',
        countryId: country.id,
        acceptsDelivery: true,
        acceptsTakeaway: true,
        acceptsDineIn: true,
        acceptsReservations: true,
        isActive: true,
        isOpen: true,
      },
    });

    // 7. Create default menu
    const menu = await db.menu.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Menu Principal',
        slug: 'menu-principal',
        isActive: true,
        menuType: 'main',
      },
    });

    // 8. Create default operating hours
    const days = [0, 1, 2, 3, 4, 5, 6];
    await db.restaurantHour.createMany({
      data: days.map(day => ({
        restaurantId: restaurant.id,
        dayOfWeek: day,
        openTime: '08:00',
        closeTime: '22:00',
        isClosed: false,
      })),
    });

    // 9. Create default delivery zone
    await db.deliveryZone.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Zone par défaut',
        baseFee: 0,
        minOrder: 0,
        minTime: 15,
        maxTime: 45,
        isActive: true,
        sortOrder: 0,
      },
    });

    // 10. Create default restaurant settings
    await db.restaurantSettings.create({
      data: {
        restaurantId: restaurant.id,
        orderPrepTime: 20,
      },
    });

    // 11. Create default organization settings
    await db.organizationSettings.create({
      data: {
        organizationId: org.id,
        acceptsCash: true,
        acceptsMobileMoney: true,
        deliveryEnabled: true,
        selfDelivery: true,
        loyaltyEnabled: true,
      },
    });

    // 12. Create session for auto-login
    const { ipAddress, userAgent } = getClientInfo(request);
    const session = await createSession(user.id, ipAddress, userAgent);
    const refreshToken = await createRefreshToken(user.id);

    console.log('[SETUP] First launch setup completed:', {
      userId: user.id,
      orgId: org.id,
      restaurantId: restaurant.id,
      email: user.email,
    });

    return json(true, {
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
        },
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
        token: session.token,
        refreshToken: refreshToken.token,
        expiresAt: session.expiresAt,
      },
      message: 'Configuration terminée ! Votre restaurant est prêt.',
    }, 201);
  } catch (error: any) {
    console.error('[SETUP] Error:', error);

    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'champ';
      return json(false, {
        error: `Un compte avec ce ${field} existe déjà.`,
      }, 409);
    }

    return json(false, {
      error: 'Erreur lors de la configuration: ' + (error.message || 'Erreur inconnue'),
    }, 500);
  }
}
