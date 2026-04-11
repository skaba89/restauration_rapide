// ============================================
// Setup Admin API - Create Super Admin User
// SECURITY: Only works if no SUPER_ADMIN exists OR if authenticated as SUPER_ADMIN
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth-helpers';
import { generateSlug } from '@/lib/utils-helpers';
import { withAdminAuth, AuthenticatedUser } from '@/lib/auth-middleware';
import { registrationRateLimiter } from '@/lib/rate-limiter';

// Configuration de l'admin par défaut
const ADMIN_CONFIG = {
  email: 'admin@kfm-delice.com',
  password: 'KFM@Admin2024!',
  firstName: 'Super',
  lastName: 'Admin',
  phone: '+224620000000',
};

// GET - Vérifier si l'admin existe déjà (Rate limited)
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await registrationRateLimiter(request);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  
  try {
    const existingAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    return NextResponse.json({
      success: true,
      adminExists: !!existingAdmin,
      adminEmail: existingAdmin?.email || null,
    });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}

// POST - Créer l'admin et l'organisation
// SECURITY: Only allowed if no SUPER_ADMIN exists
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await registrationRateLimiter(request);
  if (!rateLimitResult.success) {
    return rateLimitResult.response;
  }
  
  try {
    const body = await request.json().catch(() => ({}));
    
    // Utiliser les config par défaut ou les valeurs fournies
    const email = body.email || ADMIN_CONFIG.email;
    const password = body.password || ADMIN_CONFIG.password;
    const firstName = body.firstName || ADMIN_CONFIG.firstName;
    const lastName = body.lastName || ADMIN_CONFIG.lastName;
    const phone = body.phone || ADMIN_CONFIG.phone;
    const organizationName = body.organizationName || 'KFM DELICE';
    const restaurantName = body.restaurantName || 'KFM DELICE Restaurant';

    // Vérifier si un super admin existe déjà
    const existingAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Un Super Admin existe déjà',
        admin: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
          role: existingAdmin.role,
        },
        credentials: {
          email: existingAdmin.email,
          password: '******** (déjà défini)',
        },
      });
    }

    // Hasher le mot de passe
    const passwordHash = await hashPassword(password);

    // Créer l'utilisateur Super Admin
    const admin = await db.user.create({
      data: {
        email,
        phone,
        passwordHash,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: new Date(),
        phoneVerified: new Date(),
        language: 'fr',
        timezone: 'Africa/Conakry',
      },
    });

    // Créer ou récupérer le pays (Guinée)
    let country = await db.country.findFirst({
      where: { code: 'GN' },
    });

    if (!country) {
      country = await db.country.create({
        data: {
          code: 'GN',
          name: 'Guinée',
          dialCode: '+224',
          defaultLanguage: 'fr',
          timezone: 'Africa/Conakry',
          taxIncluded: true,
          defaultTaxRate: 0,
          mobileMoneyEnabled: true,
          isActive: true,
        },
      });
    }

    // Créer ou récupérer la devise (GNF)
    let currency = await db.currency.findFirst({
      where: { code: 'GNF' },
    });

    if (!currency) {
      currency = await db.currency.create({
        data: {
          code: 'GNF',
          name: 'Franc Guinéen',
          symbol: 'GNF',
          decimalPlaces: 0,
          isActive: true,
        },
      });
    }

    // Créer l'organisation
    const orgSlug = generateSlug(organizationName);
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug: orgSlug,
        email: admin.email,
        phone: admin.phone,
        address: 'Conakry, Kaloum',
        city: 'Conakry',
        countryId: country.id,
        currencyId: currency.id,
        isActive: true,
        settings: {
          create: {
            minOrderAmount: 0,
            maxDeliveryRadius: 15,
            defaultDeliveryFee: 5000,
            orderPrepTime: 20,
          },
        },
      },
    });

    // Associer l'admin à l'organisation
    await db.organizationUser.create({
      data: {
        userId: admin.id,
        organizationId: organization.id,
        role: 'OWNER',
      },
    });

    // Créer le restaurant
    const restaurantSlug = generateSlug(restaurantName);
    const restaurant = await db.restaurant.create({
      data: {
        organizationId: organization.id,
        name: restaurantName,
        slug: restaurantSlug,
        email: admin.email,
        phone: admin.phone,
        address: 'Conakry, Kaloum',
        city: 'Conakry',
        countryId: country.id,
        currencyId: currency.id,
        isActive: true,
        settings: {
          create: {
            minOrderAmount: 0,
            deliveryFee: 5000,
            maxDeliveryRadius: 15,
            preparationTime: 20,
          },
        },
      },
    });

    // Créer l'admin restaurant
    await db.restaurantAdmin.create({
      data: {
        userId: admin.id,
        restaurantId: restaurant.id,
        role: 'OWNER',
        isDefault: true,
        isActive: true,
      },
    });

    // Créer des catégories de menu par défaut
    const defaultCategories = [
      { name: 'Entrées', description: 'Entrées et apéritifs', position: 1 },
      { name: 'Plats Principaux', description: 'Plats principaux', position: 2 },
      { name: 'Grillades', description: 'Viandes et poissons grillés', position: 3 },
      { name: 'Accompagnements', description: 'Frites, riz, légumes', position: 4 },
      { name: 'Boissons', description: 'Boissons fraîches et chaudes', position: 5 },
      { name: 'Desserts', description: 'Desserts et glaces', position: 6 },
    ];

    for (const cat of defaultCategories) {
      await db.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: cat.name,
          description: cat.description,
          position: cat.position,
          isActive: true,
        },
      });
    }

    // Créer des méthodes de paiement
    const paymentMethods = [
      { name: 'Orange Money', code: 'ORANGE_MONEY', type: 'MOBILE_MONEY', icon: 'orange', isActive: true },
      { name: 'MTN MoMo', code: 'MTN_MOMO', type: 'MOBILE_MONEY', icon: 'mtn', isActive: true },
      { name: 'Wave', code: 'WAVE', type: 'MOBILE_MONEY', icon: 'wave', isActive: true },
      { name: 'Espèces', code: 'CASH', type: 'CASH', icon: 'cash', isActive: true },
      { name: 'Carte Bancaire', code: 'CARD', type: 'CARD', icon: 'card', isActive: false },
    ];

    for (const method of paymentMethods) {
      await db.paymentMethod.create({
        data: {
          restaurantId: restaurant.id,
          ...method,
        },
      });
    }

    // Créer une zone de livraison par défaut
    await db.deliveryZone.create({
      data: {
        restaurantId: restaurant.id,
        name: 'Zone Centrale Conakry',
        description: 'Zone de livraison principale',
        fee: 5000,
        minOrderAmount: 0,
        estimatedTime: 30,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Super Admin créé avec succès!',
      admin: {
        id: admin.id,
        email: admin.email,
        phone: admin.phone,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
      },
      credentials: {
        email: email,
        password: password,
        note: 'Conservez ces identifiants en lieu sûr!',
      },
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'admin' },
      { status: 500 }
    );
  }
}
