// ============================================
// Restaurant OS - Restaurant Users API
// Allows RESTAURANT_ADMIN to manage users within their restaurant
// GET, POST, PATCH, DELETE for user management
// ============================================

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { authenticateRequest } from '@/lib/auth-middleware';
import { hasPermission } from '@/lib/auth-helpers';
import { hash } from 'bcryptjs';

// Allowed staff-level roles for restaurant users
const ALLOWED_ROLES = ['STAFF', 'KITCHEN', 'DRIVER', 'RESTAURANT_MANAGER'];

// GET /api/restaurant-users?restaurantId=X
// Returns all users linked to this restaurant (RestaurantAdmin table + staff profiles)
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return apiError('restaurantId est requis', 400);
    }

    // Non-super-admin must be admin of the specified restaurant
    if (currentUser.role !== 'SUPER_ADMIN') {
      const isAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId,
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isAdmin) {
        return apiError('Accès non autorisé à ce restaurant', 403);
      }
    }

    // Get all restaurant admins
    const admins = await db.restaurantAdmin.findMany({
      where: { restaurantId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get all staff profiles linked to this restaurant
    const staffProfiles = await db.staffProfile.findMany({
      where: {
        restaurantId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Combine and deduplicate users
    const userMap = new Map<string, any>();

    // Add admins
    for (const admin of admins) {
      const user = admin.user;
      if (user) {
        userMap.set(user.id, {
          ...user,
          roleInRestaurant: admin.role,
          linkId: admin.id,
          linkType: 'admin',
          linkedAt: admin.createdAt,
        });
      }
    }

    // Add staff profiles
    for (const profile of staffProfiles) {
      if (profile.user) {
        userMap.set(profile.user.id, {
          ...profile.user,
          roleInRestaurant: profile.role,
          linkId: profile.id,
          linkType: 'staff',
          linkedAt: profile.createdAt,
        });
      }
    }

    const users = Array.from(userMap.values());

    return apiSuccess({ users });
  });
}

// POST /api/restaurant-users
// Creates a new user for the restaurant with the given role
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;

    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER'])) {
      return apiError('Accès non autorisé', 403);
    }

    const body = await request.json();
    const {
      restaurantId,
      email,
      password,
      firstName,
      lastName,
      role,
    } = body;

    // Validation
    if (!restaurantId || !email || !password || !firstName || !lastName) {
      return apiError('restaurantId, email, password, firstName et lastName sont requis', 400);
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return apiError(`Rôle invalide. Rôles autorisés: ${ALLOWED_ROLES.join(', ')}`, 400);
    }

    if (password.length < 8) {
      return apiError('Le mot de passe doit contenir au moins 8 caractères', 400);
    }

    // Non-super-admin must be admin of the specified restaurant
    if (currentUser.role !== 'SUPER_ADMIN') {
      const isAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId,
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isAdmin) {
        return apiError('Accès non autorisé à ce restaurant', 403);
      }
    }

    // Verify restaurant exists and get org
    const restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, organizationId: true, name: true },
    });

    if (!restaurant) {
      return apiError('Restaurant non trouvé', 404);
    }

    // Check if email already taken
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return apiError('Un compte avec cet email existe déjà', 409);
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: role,
        isActive: true,
        language: 'fr',
      },
    });

    // Link user to organization
    try {
      await db.organizationUser.create({
        data: {
          organizationId: restaurant.organizationId,
          userId: user.id,
          role: 'member',
          acceptedAt: new Date(),
        },
      });
    } catch {
      // User might already be in the org, ignore unique constraint error
    }

    // Create staff profile for the restaurant
    const staffProfile = await db.staffProfile.create({
      data: {
        userId: user.id,
        organizationId: restaurant.organizationId,
        restaurantId,
        firstName,
        lastName,
        email: email.toLowerCase(),
        phone: '',
        role,
      },
    });

    // If driver role, also create a Driver profile
    if (role === 'DRIVER') {
      try {
        await db.driver.create({
          data: {
            organizationId: restaurant.organizationId,
            userId: user.id,
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone: '',
          },
        });
      } catch {
        // Driver profile might already exist for this user
      }
    }

    return apiSuccess(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
        },
        staffProfile,
      },
      'Utilisateur créé avec succès',
      201
    );
  });
}

// PATCH /api/restaurant-users
// Update user (first name, last name, role, isActive)
export async function PATCH(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;

    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER'])) {
      return apiError('Accès non autorisé', 403);
    }

    const body = await request.json();
    const { id, firstName, lastName, role, isActive } = body;

    if (!id) {
      return apiError('ID est requis', 400);
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return apiError('Utilisateur non trouvé', 404);
    }

    // Find user's restaurant links to determine which restaurants they belong to
    const adminLinks = await db.restaurantAdmin.findMany({
      where: { userId: id },
      select: { restaurantId: true, id: true },
    });

    const staffProfiles = await db.staffProfile.findMany({
      where: { userId: id },
      select: { restaurantId: true, id: true },
    });

    const restaurantIds = [
      ...adminLinks.map((l) => l.restaurantId),
      ...staffProfiles.map((l) => l.restaurantId),
    ];

    // Non-super-admin must be admin of at least one of the user's restaurants
    if (currentUser.role !== 'SUPER_ADMIN' && restaurantIds.length > 0) {
      const isUserAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId: { in: restaurantIds },
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isUserAdmin) {
        return apiError('Accès non autorisé — vous devez être admin du même restaurant', 403);
      }
    }

    // Prevent deactivating yourself
    if (isActive === false && id === currentUser.id) {
      return apiError('Vous ne pouvez pas vous désactiver vous-même', 400);
    }

    // Update user
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role !== undefined && ALLOWED_ROLES.includes(role)) updateData.role = role;

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    // Also update staff profiles if role changed
    if (role !== undefined && staffProfiles.length > 0) {
      await db.staffProfile.updateMany({
        where: { userId: id },
        data: { role, isActive: isActive !== undefined ? isActive : true },
      });
    }

    return apiSuccess(updatedUser, 'Utilisateur mis à jour');
  });
}

// DELETE /api/restaurant-users?id=X
// Soft-delete (deactivate) a user. Only SUPER_ADMIN can fully delete.
export async function DELETE(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) return authResult.error;

    const currentUser = authResult.user;

    if (!hasPermission(currentUser.role, ['SUPER_ADMIN', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER'])) {
      return apiError('Accès non autorisé', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis', 400);
    }

    // Find the target user
    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return apiError('Utilisateur non trouvé', 404);
    }

    // Prevent deleting yourself
    if (id === currentUser.id) {
      return apiError('Vous ne pouvez pas vous supprimer vous-même', 400);
    }

    // Find user's restaurant links
    const adminLinks = await db.restaurantAdmin.findMany({
      where: { userId: id },
      select: { restaurantId: true },
    });

    const staffProfiles = await db.staffProfile.findMany({
      where: { userId: id },
      select: { restaurantId: true },
    });

    const restaurantIds = [
      ...adminLinks.map((l) => l.restaurantId),
      ...staffProfiles.map((l) => l.restaurantId),
    ];

    // Non-super-admin must be admin of the same restaurant
    if (currentUser.role !== 'SUPER_ADMIN' && restaurantIds.length > 0) {
      const isUserAdmin = await db.restaurantAdmin.findFirst({
        where: {
          restaurantId: { in: restaurantIds },
          userId: currentUser.id,
          isActive: true,
        },
      });
      if (!isUserAdmin) {
        return apiError('Accès non autorisé — vous devez être admin du même restaurant', 403);
      }
    }

    if (currentUser.role === 'SUPER_ADMIN') {
      // Full delete for super admin
      await db.user.delete({ where: { id } });
      return apiSuccess({ deleted: true }, 'Utilisateur supprimé définitivement');
    }

    // Soft delete: deactivate user and their links
    await db.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Deactivate staff profiles
    await db.staffProfile.updateMany({
      where: { userId: id },
      data: { isActive: false },
    });

    // Deactivate restaurant admin links
    await db.restaurantAdmin.updateMany({
      where: { userId: id },
      data: { isActive: false },
    });

    return apiSuccess({ deactivated: true }, 'Utilisateur désactivé');
  });
}
