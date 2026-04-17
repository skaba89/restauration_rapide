// ============================================
// Initialize Demo Users Endpoint
// Creates/updates demo accounts for KFM DELICE
//
// SECURITY: This endpoint requires DEMO_MODE=true to be set in environment
// variables. Demo credentials must be configured via environment variables:
//   DEMO_ADMIN_PASSWORD - Password for admin accounts (fallback: random hash)
//   DEMO_USER_PASSWORD  - Password for non-admin accounts (fallback: random hash)
//
// When DEMO_MODE is not 'true', this endpoint returns 404.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_SALT_ROUNDS = 12;

// Helper: generate a random unusable hash at runtime (never a hardcoded string)
function generateRandomPasswordHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Helper: get password for a given role from env vars, with random hash fallback
function getPasswordForRole(role: string): string {
  if (role === 'SUPER_ADMIN') {
    return process.env.DEMO_ADMIN_PASSWORD || generateRandomPasswordHash();
  }
  // Non-admin roles (ORG_ADMIN, RESTAURANT_MANAGER, etc.)
  return process.env.DEMO_USER_PASSWORD || generateRandomPasswordHash();
}

// Demo users configuration - passwords loaded from environment variables at runtime
const DEMO_USERS = [
  {
    email: 'admin@kfm-delice.com',
    phone: '+224 623 21 72 40',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
  },
  {
    email: 'demo@kfm-delice.com',
    phone: '+224 622 000 000',
    firstName: 'Admin',
    lastName: 'Demo',
    role: 'ORG_ADMIN',
    isActive: true,
  },
  {
    email: 'contact@kfm-delice.com',
    phone: '+224 623 21 72 41',
    firstName: 'KFM',
    lastName: 'DELICE',
    role: 'ORG_ADMIN',
    isActive: true,
  },
  {
    email: 'amadou@kfm-delice.com',
    phone: '+224 622 111 222',
    firstName: 'Amadou',
    lastName: 'Diallo',
    role: 'RESTAURANT_MANAGER',
    isActive: true,
  },
];

// Gate: return 404 if demo mode is not enabled
function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

// GET /api/init-demo - Get demo account info (email + role only, NO passwords)
export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({
      success: false,
      error: 'Not found',
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: 'Demo initialization endpoint',
    accounts: DEMO_USERS.map(u => ({
      email: u.email,
      role: u.role,
    })),
  });
}

// POST /api/init-demo - Initialize demo users in database
export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({
      success: false,
      error: 'Not found',
    }, { status: 404 });
  }

  try {
    // Check if database is available
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Mode démo - Base de données non disponible. Utilisez les comptes intégrés.',
        accounts: DEMO_USERS.map(u => ({
          email: u.email,
          role: u.role,
        })),
      });
    }

    const results: Array<{ email: string; action: string; role?: string; error?: string }> = [];

    for (const userData of DEMO_USERS) {
      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: userData.email },
        });

        // Load password from environment variable or generate random hash
        const password = getPasswordForRole(userData.role);
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        if (existingUser) {
          // Update existing user
          const updated = await db.user.update({
            where: { email: userData.email },
            data: {
              passwordHash,
              phone: userData.phone,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role as any,
              isActive: userData.isActive,
              isLocked: false,
            },
          });
          results.push({ email: updated.email, action: 'updated', role: updated.role });
        } else {
          // Create new user
          const created = await db.user.create({
            data: {
              email: userData.email,
              passwordHash,
              phone: userData.phone,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role as any,
              isActive: userData.isActive,
            },
          });
          results.push({ email: created.email, action: 'created', role: created.role });
        }
      } catch (error) {
        console.error(`Error processing user ${userData.email}:`, error);
        results.push({ email: userData.email, action: 'error', error: String(error) });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateurs de démo initialisés avec succès',
      results,
    });
  } catch (error) {
    console.error('Init demo error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de l\'initialisation des utilisateurs de démo',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
