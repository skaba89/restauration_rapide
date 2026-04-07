// Admin API - Clear external image URLs to prevent timeout issues
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// POST /api/admin/clear-images - Clear all external image URLs
export async function POST() {
  return withErrorHandler(async () => {
    // Update all menu items to remove external image URLs
    const result = await db.menuItem.updateMany({
      where: {
        image: {
          contains: 'unsplash.com',
        },
      },
      data: {
        image: null,
      },
    });

    // Also clear restaurant images
    const restaurantResult = await db.restaurant.updateMany({
      where: {
        OR: [
          { logo: { contains: 'unsplash.com' } },
          { coverImage: { contains: 'unsplash.com' } },
        ],
      },
      data: {
        logo: null,
        coverImage: null,
      },
    });

    return apiSuccess({
      menuItemsUpdated: result.count,
      restaurantsUpdated: restaurantResult.count,
      message: `${result.count} images d'articles supprimées, ${restaurantResult.count} images de restaurant supprimées`,
    });
  });
}
