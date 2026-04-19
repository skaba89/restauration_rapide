// Restaurant Admins API - Manage restaurant-specific administrators
// All endpoints require authentication
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { hash } from 'bcryptjs';
import { authenticateRequest, withAuth } from '@/lib/auth-middleware';
import { hasPermission } from '@/lib/auth-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// GET /api/restaurant-admins - List admins for a restaurant or user's restaurants
// Query ?userId=X — Returns all restaurants where user is a RestaurantAdmin
// Query ?restaurantId=X — Returns all admins for a restaurant
// SUPER_ADMIN can see all restaurants/admins without being one
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    // Auth check
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const userId = searchParams.get('userId');

    // --- Get all restaurants where user is admin ---
    if (userId) {
      // Non-SUPER_ADMIN can only query their own restaurants
      if (currentUser.role !== 'SUPER_ADMIN' && currentUser.id !== userId) {
        return apiError('Accès non autorisé', 403);
      }

      const adminAccess = await db.restaurantAdmin.findMany({
        where: {
          userId,
          isActive: true,
        },
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              city: true,
              isActive: true,
              isOpen: true,
              domain: true,
              subdomain: true,
              primaryColor: true,
              isMultiLocation: true,
              parentRestaurantId: true,
              _count: {
                select: {
                  orders: { where: { status: 'PENDING' } },
                  restaurantAdmins: true,
                },
              },
            },
          },
        },
        orderBy: { isDefault: 'desc' },
      });

      return apiSuccess({
        restaurants: adminAccess.map((a) => ({
          ...a.restaurant,
          role: a.role,
          isDefault: a.isDefault,
          adminId: a.id,
          pendingOrders: a.restaurant._count.orders,
          adminsCount: a.restaurant._count.restaurantAdmins,
        })),
      });
    }

    // --- Get all admins for a restaurant ---
    if (restaurantId) {
      // SUPER_ADMIN can see all admins; others must be an admin of this restaurant
      if (currentUser.role !== 'SUPER_ADMIN') {
        const isRestaurantAdmin = await db.restaurantAdmin.findFirst({
          where: {
            restaurantId,
            userId: currentUser.id,
            isActive: true,
          },
        });
        if (!isRestaurantAdmin) {
          return apiError('Accès non autorisé à ce restaurant', 403);
        }
      }

      const admins = await db.restaurantAdmin.findMany({
        where: { restaurantId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return apiSuccess({ admins });
    }

    return apiError('restaurantId ou userId est requis', 400);
  });
}

// POST /api/restaurant-admins - Add admin to restaurant or create new restaurant with admin
// Requires SUPER_ADMIN, ORG_ADMIN, or RESTAURANT_ADMIN role
// Mode 1: createRestaurant — Creates restaurant + default menu + links user as RestaurantAdmin
// Mode 2: addAdmin — Adds existing/new user as admin to a restaurant
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    // Auth check
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;
    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'ORG_ADMIN', 'RESTAURANT_ADMIN'])) {
      return apiError('Accès non autorisé', 403);
    }

    const body = await request.json();
    const {
      restaurantId,
      email,
      role = 'admin',
      permissions,
      userId,
      // For creating new restaurant with admin
      createRestaurant,
      restaurantName,
      restaurantSlug,
      restaurantPhone,
      restaurantAddress,
      restaurantCity,
      countryId,
      organizationId,
    } = body;

    // ===== Mode 1: Create new restaurant with admin =====
    if (createRestaurant && restaurantName && organizationId) {
      // ORG_ADMIN and RESTAURANT_ADMIN can only create within their own organization
      if (currentUser.role !== 'SUPER_ADMIN') {
        const belongsToOrg = currentUser.organizations.some(
          (org) => org.id === organizationId
        );
        if (!belongsToOrg) {
          return apiError('Accès non autorisé à cette organisation', 403);
        }
      }

      // Generate slug from name
      const slug =
        restaurantSlug ||
        restaurantName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Check uniqueness within organization
      const existingRestaurant = await db.restaurant.findFirst({
        where: { organizationId, slug },
      });

      if (existingRestaurant) {
        return apiError(
          'Un restaurant avec ce nom existe déjà dans cette organisation',
          409
        );
      }

      // Get or create country (default Guinea)
      let country;
      if (countryId) {
        country = await db.country.findUnique({ where: { id: countryId } });
      }
      if (!country) {
        country =
          (await db.country.findFirst({ where: { code: 'GN' } })) ||
          (await db.country.create({
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
          }));
      }

      // Get organization info (for currency)
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
        include: { currency: true },
      });

      if (!organization) {
        return apiError('Organisation non trouvée', 404);
      }

      // Create restaurant
      const restaurant = await db.restaurant.create({
        data: {
          organizationId,
          name: restaurantName,
          slug,
          subdomain: slug,
          phone: restaurantPhone || '',
          address: restaurantAddress || '',
          city: restaurantCity || 'Conakry',
          countryId: country.id,
          acceptsDelivery: true,
          acceptsTakeaway: true,
          acceptsDineIn: true,
          isOpen: true,
        },
      });

      // Create default menu "Menu Principal"
      await db.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Menu Principal',
          slug: 'menu-principal',
          description: 'Notre menu principal',
          isActive: true,
        },
      });

      // Link the requesting user (or specified userId) as RestaurantAdmin
      const adminUserId = userId || currentUser.id;

      // If the admin user isn't already in the org, add them
      if (currentUser.role !== 'SUPER_ADMIN') {
        const existingOrgUser = await db.organizationUser.findUnique({
          where: {
            organizationId_userId: {
              organizationId,
              userId: adminUserId,
            },
          },
        });
        if (!existingOrgUser) {
          await db.organizationUser.create({
            data: {
              organizationId,
              userId: adminUserId,
              role: 'ORG_MEMBER',
            },
          });
        }
      }

      const adminLink = await db.restaurantAdmin.create({
        data: {
          restaurantId: restaurant.id,
          userId: adminUserId,
          role: 'admin',
          isDefault: true,
          invitedBy: currentUser.id,
          invitedAt: new Date(),
          acceptedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
            },
          },
        },
      });

      return apiSuccess(
        {
          restaurant,
          admin: adminLink,
        },
        'Restaurant créé avec succès',
        201
      );
    }

    // ===== Mode 2: Add admin to existing restaurant =====
    if (!restaurantId || (!email && !userId)) {
      return apiError('restaurantId et email (ou userId) sont requis', 400);
    }

    // Verify the current user has access to this restaurant
    if (currentUser.role !== 'SUPER_ADMIN') {
      const isRestaurantAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId,
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isRestaurantAdmin) {
        return apiError('Accès non autorisé à ce restaurant', 403);
      }
    }

    // Verify the restaurant exists
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Find user by userId or email
    let targetUser = userId
      ? await db.user.findUnique({ where: { id: userId } })
      : null;
    if (!targetUser && email) {
      targetUser = await db.user.findUnique({ where: { email } });
    }

    let isNewUser = false;

    if (!targetUser) {
      // Create new user if email provided
      if (!email) {
        return apiError(
          'Utilisateur non trouvé. Fournir un email pour créer un compte.',
          404
        );
      }

      // Generate cryptographically secure temporary password
      const tempPassword = randomBytes(4).toString('hex'); // 8 hex chars
      const passwordHash = await hash(tempPassword, 10);

      targetUser = await db.user.create({
        data: {
          email,
          passwordHash,
          role: 'RESTAURANT_ADMIN',
          firstName: '',
          lastName: '',
        },
      });

      isNewUser = true;

      // TODO: Send email with temporary password
    }

    // Check if already admin of this restaurant
    const existingAdmin = await db.restaurantAdmin.findUnique({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId: targetUser.id,
        },
      },
    });

    if (existingAdmin) {
      if (existingAdmin.isActive) {
        return apiError(
          'Cet utilisateur est déjà admin de ce restaurant',
          409
        );
      }
      // Reactivate the previously soft-deleted admin
      const admin = await db.restaurantAdmin.update({
        where: { id: existingAdmin.id },
        data: {
          isActive: true,
          role,
          permissions,
          invitedBy: currentUser.id,
          invitedAt: new Date(),
          acceptedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
              phone: true,
            },
          },
        },
      });
      return apiSuccess(admin, 'Admin réactivé avec succès');
    }

    // Create new RestaurantAdmin entry
    const admin = await db.restaurantAdmin.create({
      data: {
        restaurantId,
        userId: targetUser.id,
        role,
        permissions,
        invitedBy: currentUser.id,
        invitedAt: new Date(),
        ...(isNewUser ? {} : { acceptedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    return apiSuccess(
      { admin, isNewUser },
      'Admin ajouté avec succès',
      201
    );
  });
}

// PATCH /api/restaurant-admins - Update admin role/permissions
// Requires authentication; non-SUPER_ADMIN must be admin of the same restaurant
export async function PATCH(request: NextRequest) {
  return withErrorHandler(async () => {
    // Auth check
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;
    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'ORG_ADMIN', 'RESTAURANT_ADMIN'])) {
      return apiError('Accès non autorisé', 403);
    }

    const body = await request.json();
    const { id, role, permissions, isDefault, isActive } = body;

    if (!id) {
      return apiError('ID est requis', 400);
    }

    // Verify the target admin entry exists
    const targetAdmin = await db.restaurantAdmin.findUnique({
      where: { id },
    });

    if (!targetAdmin) {
      return apiError('Admin non trouvé', 404);
    }

    // Non-SUPER_ADMIN must be admin of the same restaurant to edit
    if (currentUser.role !== 'SUPER_ADMIN') {
      const isSameRestaurantAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId: targetAdmin.restaurantId,
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isSameRestaurantAdmin) {
        return apiError(
          'Accès non autorisé — vous devez être admin de ce restaurant',
          403
        );
      }
    }

    // Prevent users from deactivating their own admin access
    if (isActive === false && targetAdmin.userId === currentUser.id) {
      return apiError('Vous ne pouvez pas désactiver votre propre accès', 400);
    }

    // Prevent users from deactivating the last admin of a restaurant
    if (isActive === false) {
      const activeAdminsCount = await db.restaurantAdmin.count({
        where: {
          restaurantId: targetAdmin.restaurantId,
          isActive: true,
          id: { not: id },
        },
      });
      if (activeAdminsCount === 0) {
        return apiError(
          'Impossible de désactiver le dernier admin du restaurant',
          400
        );
      }
    }

    const admin = await db.restaurantAdmin.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(permissions !== undefined && { permissions }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // If setting as default, unset other defaults for this user
    if (isDefault) {
      await db.restaurantAdmin.updateMany({
        where: {
          userId: admin.userId,
          id: { not: id },
        },
        data: { isDefault: false },
      });
    }

    return apiSuccess(admin, 'Admin mis à jour');
  });
}

// DELETE /api/restaurant-admins - Soft delete admin (set isActive: false)
// Requires authentication; non-SUPER_ADMIN must be admin of the same restaurant
export async function DELETE(request: NextRequest) {
  return withErrorHandler(async () => {
    // Auth check
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;
    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'ORG_ADMIN', 'RESTAURANT_ADMIN'])) {
      return apiError('Accès non autorisé', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis', 400);
    }

    // Verify the target admin entry exists
    const targetAdmin = await db.restaurantAdmin.findUnique({
      where: { id },
    });

    if (!targetAdmin) {
      return apiError('Admin non trouvé', 404);
    }

    // Prevent self-deletion
    if (targetAdmin.userId === currentUser.id) {
      return apiError('Vous ne pouvez pas supprimer votre propre accès', 400);
    }

    // Non-SUPER_ADMIN must be admin of the same restaurant
    if (currentUser.role !== 'SUPER_ADMIN') {
      const isSameRestaurantAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId: targetAdmin.restaurantId,
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isSameRestaurantAdmin) {
        return apiError(
          'Accès non autorisé — vous devez être admin de ce restaurant',
          403
        );
      }
    }

    // Prevent deleting the last active admin of the restaurant
    const activeAdminsCount = await db.restaurantAdmin.count({
      where: {
        restaurantId: targetAdmin.restaurantId,
        isActive: true,
        id: { not: id },
      },
    });
    if (activeAdminsCount === 0) {
      return apiError(
        'Impossible de supprimer le dernier admin du restaurant',
        400
      );
    }

    // Soft delete by setting isActive to false
    await db.restaurantAdmin.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Admin supprimé');
  });
}
