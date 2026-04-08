// ============================================
// Initialize Demo Users Endpoint
// Creates/updates demo accounts for KFM DELICE
// ============================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

// Demo users configuration
const DEMO_USERS = [
  {
    email: 'admin@kfm-delice.com',
    password: 'AdminKFM2024!',
    phone: '+224 623 21 72 40',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    isActive: true,
  },
  {
    email: 'demo@kfm-delice.com',
    password: 'demo123',
    phone: '+224 622 000 000',
    firstName: 'Admin',
    lastName: 'Demo',
    role: 'ORG_ADMIN',
    isActive: true,
  },
  {
    email: 'contact@kfm-delice.com',
    password: 'KfmDelice2024!',
    phone: '+224 623 21 72 41',
    firstName: 'KFM',
    lastName: 'DELICE',
    role: 'ORG_ADMIN',
    isActive: true,
  },
  {
    email: 'amadou@kfm-delice.com',
    password: 'kfm2024!',
    phone: '+224 622 111 222',
    firstName: 'Amadou',
    lastName: 'Diallo',
    role: 'RESTAURANT_MANAGER',
    isActive: true,
  },
];

// GET /api/init-demo - Get demo account info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Demo initialization endpoint',
    accounts: DEMO_USERS.map(u => ({
      email: u.email,
      role: u.role,
      password: u.password,
    })),
  });
}

// POST /api/init-demo - Initialize demo users in database
export async function POST() {
  try {
    // Check if database is available
    if (!db) {
      return NextResponse.json({
        success: true,
        message: 'Mode démo - Base de données non disponible. Utilisez les comptes intégrés.',
        accounts: DEMO_USERS.map(u => ({
          email: u.email,
          role: u.role,
          password: u.password,
        })),
      });
    }

    const results = [];

    for (const userData of DEMO_USERS) {
      try {
        // Check if user exists
        const existingUser = await db.user.findUnique({
          where: { email: userData.email },
        });

        const passwordHash = await bcrypt.hash(userData.password, BCRYPT_SALT_ROUNDS);

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
