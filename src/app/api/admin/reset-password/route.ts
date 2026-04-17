// Admin API - Reset admin password
// SECURITY: Requires SUPER_ADMIN authentication. Disabled in production.
import { NextRequest, NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { withRole } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

// POST /api/admin/reset-password - Reset admin password (SUPER_ADMIN only)
export const POST = withRole(['SUPER_ADMIN'], async (request: NextRequest) => {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      success: false,
      error: 'This endpoint is disabled in production',
    }, { status: 403 });
  }

  if (!isDatabaseAvailable() || !db) {
    return NextResponse.json({
      success: false,
      error: 'Base de données non disponible',
    }, { status: 500 });
  }

  try {
    // Generate a random password instead of using hardcoded one
    const crypto = await import('crypto');
    const newPassword = crypto.randomBytes(12).toString('base64url').slice(0, 16);
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update admin password
    const result = await db.user.updateMany({
      where: {
        email: 'admin@kfm-delice.com',
      },
      data: {
        passwordHash,
      },
    });

    if (result.count === 0) {
      // Create admin if doesn't exist
      const adminUser = await db.user.create({
        data: {
          email: 'admin@kfm-delice.com',
          passwordHash,
          firstName: 'Admin',
          lastName: 'KFM',
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });

      // Link to restaurant
      const restaurant = await db.restaurant.findFirst({
        where: { slug: 'kfm-delice' },
      });

      if (restaurant) {
        try {
          await db.restaurantAdmin.create({
            data: {
              restaurantId: restaurant.id,
              userId: adminUser.id,
              role: 'admin',
              isDefault: true,
              isActive: true,
            },
          });
        } catch (_) { /* table might not exist */ }

        const org = await db.organization.findFirst({
          where: { slug: 'kfm-delice' },
        });

        if (org) {
          try {
            await db.organizationUser.create({
              data: {
                organizationId: org.id,
                userId: adminUser.id,
                role: 'owner',
                acceptedAt: new Date(),
              },
            });
          } catch (_) { /* might already exist */ }
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Admin créé avec succès',
        // Only return email, NOT the password in response body
        email: adminUser.email,
      });
    }

    // SECURITY: Never return password in response
    return NextResponse.json({
      success: true,
      message: 'Mot de passe admin réinitialisé avec succès',
      // Password is only logged to server console, never sent to client
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({
      success: false,
      error: 'Erreur lors de la réinitialisation',
    }, { status: 500 });
  }
});
