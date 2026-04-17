// ============================================
// Restaurant OS - Initial Setup API
// Creates the SUPER_ADMIN account (one-time setup)
// Protected by SETUP_SECRET environment variable
// ============================================
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession, createRefreshToken, getClientInfo } from '@/lib/auth-helpers';

// The secret key required to create the super admin
// Set SETUP_SECRET env var in Render dashboard
const SETUP_SECRET = process.env.SETUP_SECRET || 'kfm-delice-setup-2024';

function json(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/auth/setup - Check if super admin exists
export async function GET() {
  try {
    if (!db) {
      return json(false, { error: 'Base de données non configurée' }, 503);
    }

    const superAdminCount = await db.user.count({
      where: { role: 'SUPER_ADMIN' },
    });

    return json(true, {
      data: {
        hasSuperAdmin: superAdminCount > 0,
        superAdminCount,
      },
    });
  } catch (error) {
    console.error('Setup GET error:', error);
    return json(false, { error: 'Erreur serveur' }, 500);
  }
}

// POST /api/auth/setup - Create SUPER_ADMIN (first-time setup)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupKey, email, password, firstName, lastName, phone } = body;

    // Validate setup key
    if (!setupKey || setupKey !== SETUP_SECRET) {
      return json(false, { error: 'Clé de setup invalide' }, 403);
    }

    // Validate required fields
    if (!email || !password) {
      return json(false, { error: 'Email et mot de passe sont requis' }, 400);
    }

    // Password strength check
    if (password.length < 8) {
      return json(false, { error: 'Le mot de passe doit contenir au moins 8 caractères' }, 400);
    }

    if (!db) {
      return json(false, { error: 'Base de données non configurée' }, 503);
    }

    // Check if any super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: { role: 'SUPER_ADMIN' },
    });

    if (existingSuperAdmin) {
      return json(false, {
        error: 'Un super administrateur existe déjà. Contactez votre administrateur.',
        existingAdmin: {
          email: existingSuperAdmin.email,
          createdAt: existingSuperAdmin.createdAt,
        },
      }, 409);
    }

    // Check if email is already taken
    const existingUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return json(false, { error: 'Un compte avec cet email existe déjà' }, 409);
    }

    // Create the super admin
    const hashedPassword = await hashPassword(password);
    const superAdmin = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: firstName || 'Super',
        lastName: lastName || 'Admin',
        phone: phone || null,
        role: 'SUPER_ADMIN',
        isActive: true,
        emailVerified: new Date(),
        language: 'fr',
        timezone: 'Africa/Conakry',
      },
    });

    // Create a default organization for the super admin
    const organization = await db.organization.create({
      data: {
        name: `${firstName || 'KFM'} DELICE`,
        slug: 'kfm-delice',
        email: email.toLowerCase(),
        phone: phone || '+224 000 000 000',
        city: 'Conakry',
        countryId: 'GN',
        currencyId: 'XOF',
        description: 'Organisation principale KFM DELICE',
        isActive: true,
        settings: {
          create: {
            acceptsCash: true,
            acceptsMobileMoney: true,
            acceptsCard: false,
            deliveryEnabled: true,
            selfDelivery: true,
            reservationEnabled: true,
            loyaltyEnabled: true,
          },
        },
      },
    });

    // Link super admin to the organization
    await db.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: superAdmin.id,
        role: 'admin',
        permissions: 'all',
        acceptedAt: new Date(),
      },
    });

    // Auto-login after setup
    const { ipAddress, userAgent } = getClientInfo(request);
    const session = await createSession(superAdmin.id, ipAddress, userAgent);
    const refreshToken = await createRefreshToken(superAdmin.id);

    console.log('[SETUP] Super admin created:', {
      id: superAdmin.id,
      email: superAdmin.email,
      organizationId: organization.id,
    });

    return json(true, {
      data: {
        user: {
          id: superAdmin.id,
          email: superAdmin.email,
          role: superAdmin.role,
          firstName: superAdmin.firstName,
          lastName: superAdmin.lastName,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
        },
        token: session.token,
        refreshToken: refreshToken.token,
        expiresAt: session.expiresAt,
      },
      message: 'Super administrateur créé avec succès',
    }, 201);
  } catch (error) {
    console.error('Setup POST error:', error);
    return json(false, {
      error: error instanceof Error ? error.message : 'Erreur serveur',
    }, 500);
  }
}
