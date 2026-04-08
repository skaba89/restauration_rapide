// Fix Admin Password - Temporary endpoint to reset admin password
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamic imports to avoid build issues
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');

    const prisma = new PrismaClient();

    // New password
    const newPassword = 'AdminKFM2024!';
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update admin user
    const result = await prisma.user.updateMany({
      where: {
        email: 'admin@kfm-delice.com'
      },
      data: {
        passwordHash,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });

    await prisma.$disconnect();

    if (result.count > 0) {
      return NextResponse.json({
        success: true,
        message: 'Admin password updated successfully',
        credentials: {
          email: 'admin@kfm-delice.com',
          password: newPassword,
          role: 'SUPER_ADMIN'
        }
      });
    }

    // If admin doesn't exist, create it
    const newUser = await prisma.user.create({
      data: {
        email: 'admin@kfm-delice.com',
        phone: '+224622000001',
        passwordHash,
        role: 'SUPER_ADMIN',
        firstName: 'Super',
        lastName: 'Admin',
        language: 'fr',
        timezone: 'Africa/Conakry',
        isActive: true,
      }
    });

    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: 'Admin user created',
      credentials: {
        email: 'admin@kfm-delice.com',
        password: newPassword,
        role: 'SUPER_ADMIN'
      }
    });

  } catch (error: any) {
    console.error('Fix admin error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
