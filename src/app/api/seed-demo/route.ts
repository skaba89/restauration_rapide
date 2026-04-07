// Seed Demo Users - Call this endpoint to create demo users
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Demo users to create
    const demoUsers = [
      {
        email: 'demo@kfm-delice.com',
        phone: '+224622000099',
        password: 'demo123',
        role: 'ORG_ADMIN',
        firstName: 'Demo',
        lastName: 'User',
      },
      {
        email: 'contact@kfm-delice.com',
        phone: '+224623217240',
        password: 'KfmDelice2024!',
        role: 'ORG_ADMIN',
        firstName: 'KFM',
        lastName: 'DELICE',
      },
      {
        email: 'admin@kfm-delice.com',
        phone: '+224622000001',
        password: 'AdminKFM2024!',
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
      },
    ];

    const results = [];

    for (const userData of demoUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 12);

      try {
        const user = await prisma.user.upsert({
          where: { email: userData.email },
          update: {
            passwordHash,
            role: userData.role as any,
            isActive: true,
          },
          create: {
            email: userData.email,
            phone: userData.phone,
            passwordHash,
            role: userData.role as any,
            firstName: userData.firstName,
            lastName: userData.lastName,
            language: 'fr',
            timezone: 'Africa/Conakry',
            isActive: true,
          },
        });

        results.push({
          email: userData.email,
          password: userData.password,
          role: userData.role,
          status: 'created/updated',
          userId: user.id,
        });
      } catch (e: any) {
        results.push({
          email: userData.email,
          error: e.message,
        });
      }
    }

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Demo users seeded successfully',
      users: results,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
