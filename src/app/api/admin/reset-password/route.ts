// Admin API - Reset admin password
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import bcrypt from 'bcryptjs';

// POST /api/admin/reset-password - Reset admin password
export async function POST() {
  return withErrorHandler(async () => {
    const passwordHash = await bcrypt.hash('KFM@Admin2024!', 12);
    
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
        await db.restaurantAdmin.create({
          data: {
            restaurantId: restaurant.id,
            userId: adminUser.id,
            role: 'admin',
            isDefault: true,
            isActive: true,
          },
        });

        const org = await db.organization.findFirst({
          where: { slug: 'kfm-delice' },
        });

        if (org) {
          await db.organizationUser.create({
            data: {
              organizationId: org.id,
              userId: adminUser.id,
              role: 'owner',
              acceptedAt: new Date(),
            },
          });
        }
      }

      return apiSuccess({
        message: 'Admin créé avec succès',
        credentials: {
          email: 'admin@kfm-delice.com',
          password: 'KFM@Admin2024!',
        },
      });
    }

    return apiSuccess({
      message: 'Mot de passe admin réinitialisé avec succès',
      credentials: {
        email: 'admin@kfm-delice.com',
        password: 'KFM@Admin2024!',
      },
    });
  });
}
