// Current user endpoint - supports demo sessions AND DB sessions
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { authenticateRequest } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    // authenticateRequest checks demo in-memory sessions FIRST, then DB sessions
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    // Try to get restaurant admin access from DB (if available)
    let restaurants: any[] = [];
    try {
      const { db } = await import('@/lib/db');
      if (db) {
        const restaurantAdmins = await db.restaurantAdmin.findMany({
          where: {
            userId: user.id,
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
        restaurants = (restaurantAdmins || []).map((ra: any) => ({
          id: ra.restaurant.id,
          name: ra.restaurant.name,
          slug: ra.restaurant.slug,
          logo: ra.restaurant.logo,
          subdomain: ra.restaurant.subdomain,
          domain: ra.restaurant.domain,
          primaryColor: ra.restaurant.primaryColor,
          role: ra.role,
          isDefault: ra.isDefault,
        }));
      }
    } catch {
      // DB unavailable - skip restaurant data (demo mode)
    }

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        language: user.language,
        isActive: user.isActive,
        organizations: user.organizations || [],
        restaurants,
      },
      session: {
        id: authResult.sessionId,
      },
    });
  });
}
