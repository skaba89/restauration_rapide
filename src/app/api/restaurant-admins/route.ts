// Restaurant Admins API - Manage restaurant-specific administrators
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { hash } from 'bcryptjs';
import { NextRequest } from 'next/server';

// GET /api/restaurant-admins - List admins for a restaurant or user's restaurants
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const userId = searchParams.get('userId');

    // Get all restaurants where user is admin
    if (userId) {
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
        restaurants: adminAccess.map(a => ({
          ...a.restaurant,
          role: a.role,
          isDefault: a.isDefault,
          adminId: a.id,
          pendingOrders: a.restaurant._count.orders,
          adminsCount: a.restaurant._count.restaurantAdmins,
        })),
      });
    }

    // Get all admins for a restaurant
    if (restaurantId) {
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
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
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

    // Create new restaurant with admin
    if (createRestaurant && restaurantName && organizationId) {
      // Generate slug if not provided
      const slug = restaurantSlug || restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Generate subdomain
      const subdomain = slug;

      // Check if slug exists
      const existingRestaurant = await db.restaurant.findFirst({
        where: { organizationId, slug },
      });

      if (existingRestaurant) {
        return apiError('Un restaurant avec ce nom existe déjà dans cette organisation', 409);
      }

      // Get or create country
      let country;
      if (countryId) {
        country = await db.country.findUnique({ where: { id: countryId } });
      }
      if (!country) {
        country = await db.country.findFirst({ where: { code: 'GN' } }) ||
          await db.country.create({
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

      // Get organization's currency
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
          subdomain,
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

      // Create default menu
      await db.menu.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Menu Principal',
          slug: 'menu-principal',
          description: 'Notre menu principal',
          isActive: true,
        },
      });

      // Add current user as admin if userId provided
      if (userId) {
        await db.restaurantAdmin.create({
          data: {
            restaurantId: restaurant.id,
            userId,
            role: 'admin',
            isDefault: true,
          },
        });
      }

      return apiSuccess({
        restaurant,
        message: 'Restaurant créé avec succès',
      }, 'Restaurant créé avec succès', 201);
    }

    // Add existing user as admin to restaurant
    if (!restaurantId || (!email && !userId)) {
      return apiError('restaurantId et email (ou userId) sont requis');
    }

    // Find user
    let user = userId ? await db.user.findUnique({ where: { id: userId } }) : null;
    if (!user && email) {
      user = await db.user.findUnique({ where: { email } });
    }

    if (!user) {
      // Create new user if email provided
      if (!email) {
        return apiError('Utilisateur non trouvé. Fournir un email pour créer un compte.', 404);
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await hash(tempPassword, 10);

      user = await db.user.create({
        data: {
          email,
          passwordHash,
          role: 'RESTAURANT_ADMIN',
          firstName: '',
          lastName: '',
        },
      });

      // TODO: Send email with temporary password
    }

    // Check if already admin
    const existingAdmin = await db.restaurantAdmin.findUnique({
      where: {
        restaurantId_userId: {
          restaurantId,
          userId: user.id,
        },
      },
    });

    if (existingAdmin) {
      if (existingAdmin.isActive) {
        return apiError('Cet utilisateur est déjà admin de ce restaurant', 409);
      }
      // Reactivate
      const admin = await db.restaurantAdmin.update({
        where: { id: existingAdmin.id },
        data: {
          isActive: true,
          role,
          permissions,
        },
      });
      return apiSuccess(admin, 'Admin réactivé avec succès');
    }

    // Create admin
    const admin = await db.restaurantAdmin.create({
      data: {
        restaurantId,
        userId: user.id,
        role,
        permissions,
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

    return apiSuccess(admin, 'Admin ajouté avec succès', 201);
  });
}

// PATCH /api/restaurant-admins - Update admin role/permissions
export async function PATCH(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, role, permissions, isDefault, isActive } = body;

    if (!id) {
      return apiError('ID est requis');
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

// DELETE /api/restaurant-admins - Remove admin from restaurant
export async function DELETE(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    // Soft delete by setting isActive to false
    await db.restaurantAdmin.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Admin supprimé');
  });
}
