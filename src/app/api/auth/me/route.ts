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

    let restaurants: any[] = [];
    try {
      const { db } = await import('@/lib/db');
      if (db) {
        // Method 1: Restaurants from organization membership
        if (user.organizations.length > 0) {
          const orgIds = user.organizations.map(org => org.id);
          const orgRestaurants = await db.restaurant.findMany({
            where: {
              organizationId: { in: orgIds },
              isActive: true,
            },
            select: {
              id: true, name: true, slug: true, logo: true,
              subdomain: true, domain: true, primaryColor: true,
              organizationId: true, city: true, phone: true, address: true,
              isActive: true, isOpen: true,
            },
          });
          restaurants = orgRestaurants.map(r => ({
            ...r,
            role: user.organizations.find(o => o.id === r.organizationId)?.role || 'STAFF',
          }));
        }

        // Method 2: Restaurants from RestaurantAdmin junction (more specific)
        const adminLinks = await db.restaurantAdmin.findMany({
          where: { userId: user.id, isActive: true },
          include: {
            restaurant: {
              select: {
                id: true, name: true, slug: true, logo: true,
                subdomain: true, domain: true, primaryColor: true,
                organizationId: true, city: true, phone: true, address: true,
                isActive: true, isOpen: true,
              },
            },
          },
        });

        if (adminLinks.length > 0) {
          const existingIds = new Set(restaurants.map(r => r.id));
          for (const link of adminLinks) {
            if (!existingIds.has(link.restaurant.id)) {
              restaurants.push({
                ...link.restaurant,
                role: link.role,
                isDefault: link.isDefault,
                adminId: link.id,
              });
            } else {
              // Update existing entry with admin-specific data
              const existing = restaurants.find(r => r.id === link.restaurant.id);
              if (existing && link.isDefault) {
                existing.isDefault = true;
                existing.adminId = link.id;
              }
            }
          }
        }
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
