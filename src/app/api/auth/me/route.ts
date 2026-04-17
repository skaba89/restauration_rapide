// ============================================
// Current user endpoint - Database-only
// ============================================
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { authenticateRequest } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

// GET /api/auth/me - Get current user with restaurant access
export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    // Get organization restaurants from DB
    let restaurants: any[] = [];
    try {
      const { db } = await import('@/lib/db');
      if (db && user.organizations.length > 0) {
        const orgIds = user.organizations.map(org => org.id);
        
        // Get restaurants from the user's organizations
        const orgRestaurants = await db.restaurant.findMany({
          where: {
            organizationId: { in: orgIds },
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            subdomain: true,
            domain: true,
            primaryColor: true,
            organizationId: true,
          },
        });

        restaurants = orgRestaurants.map(r => ({
          ...r,
          role: user.organizations.find(o => o.id === r.organizationId)?.role || 'STAFF',
        }));
      }
    } catch (error) {
      console.error('[AUTH/ME] Error fetching restaurants:', error);
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
