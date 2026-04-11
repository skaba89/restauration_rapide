// Current user endpoint - supports both Bearer token and cookies
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { validateSession } from '@/lib/auth-helpers';
import { NextRequest } from 'next/server';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    // Try Bearer token first
    const authHeader = request.headers.get('authorization');
    let token = authHeader?.replace('Bearer ', '');

    // Try cookie if no Bearer token
    if (!token) {
      token = request.cookies.get('session_token')?.value ||
              request.cookies.get('token')?.value;
    }

    if (!token) {
      return apiError('Non autorisé', 401);
    }

    const session = await validateSession(token);

    if (!session) {
      return apiError('Session invalide ou expirée', 401);
    }

    // Get restaurant admin access
    const restaurantAdmins = await db.restaurantAdmin.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            subdomain: true,
            domain: true,
            primaryColor: true,
          },
        },
      },
      orderBy: { isDefault: 'desc' },
    });

    return apiSuccess({
      user: {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone,
        role: session.user.role,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        avatar: session.user.avatar,
        language: session.user.language,
        isActive: session.user.isActive,
        organizations: (session.user.organizationUsers || []).map(ou => ({
          id: ou.organization.id,
          name: ou.organization.name,
          slug: ou.organization.slug,
          role: ou.role,
        })),
        restaurants: (restaurantAdmins || []).map(ra => ({
          id: ra.restaurant.id,
          name: ra.restaurant.name,
          slug: ra.restaurant.slug,
          logo: ra.restaurant.logo,
          subdomain: ra.restaurant.subdomain,
          domain: ra.restaurant.domain,
          primaryColor: ra.restaurant.primaryColor,
          role: ra.role,
          isDefault: ra.isDefault,
        })),
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  });
}
