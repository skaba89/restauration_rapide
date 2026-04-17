// Reviews API - Customer reviews management with responses
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// GET /api/reviews - List reviews
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const restaurantId = searchParams.get('restaurantId');
    const organizationId = searchParams.get('organizationId');
    const status = searchParams.get('status');
    const rating = searchParams.get('rating');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const responded = searchParams.get('responded');

    if (!db) {
      return apiError('Base de données non disponible', 503);
    }

    const where = {
      ...(restaurantId && { restaurantId }),
      ...(organizationId && { restaurant: { organizationId } }),
      ...(status && { status }),
      ...(rating && { rating: parseInt(rating) }),
      ...(source && { source }),
      ...(responded !== null && {
        response: responded === 'true' ? { not: null } : null,
      }),
      ...(search && {
        OR: [
          { customerName: { contains: search } },
          { comment: { contains: search } },
        ],
      }),
    };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { firstName: true, lastName: true, phone: true },
          },
          order: {
            select: { orderNumber: true },
          },
        },
      }),
      db.review.count({ where }),
    ]);

    // Calculate stats
    const allReviews = await db.review.findMany({
      where: { restaurantId, ...(organizationId && { restaurant: { organizationId } }) },
      select: { rating: true, response: true },
    });

    const stats = {
      averageRating: allReviews.length > 0
        ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
        : '0',
      totalReviews: allReviews.length,
      ratingDistribution: {
        5: allReviews.filter(r => r.rating === 5).length,
        4: allReviews.filter(r => r.rating === 4).length,
        3: allReviews.filter(r => r.rating === 3).length,
        2: allReviews.filter(r => r.rating === 2).length,
        1: allReviews.filter(r => r.rating === 1).length,
      },
      responseRate: allReviews.length > 0
        ? Math.round((allReviews.filter(r => r.response).length / allReviews.length) * 100)
        : 0,
    };

    return apiSuccess({
      data: reviews,
      stats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  });
}

// POST /api/reviews - Create review
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      restaurantId,
      customerId,
      orderId,
      rating,
      comment,
      source = 'web',
    } = body;

    // Validation
    if (!restaurantId || !rating || rating < 1 || rating > 5) {
      return apiError('restaurant et note (1-5) sont requis');
    }

    if (!db) {
      return apiError('Base de données non disponible', 503);
    }

    const review = await db.review.create({
      data: {
        restaurantId,
        customerId,
        orderId,
        rating,
        comment,
        source,
        status: 'pending',
      },
    });

    // Update restaurant rating
    const reviews = await db.review.findMany({
      where: { restaurantId, status: 'published' },
      select: { rating: true },
    });

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.restaurant.update({
        where: { id: restaurantId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
      });
    }

    return apiSuccess(review, 'Avis soumis avec succès', 201);
  });
}

// PATCH /api/reviews - Update review (respond to review)
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { id, response, respondedBy, status } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    if (!db) {
      return apiError('Base de données non disponible', 503);
    }

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return apiError('Avis non trouvé', 404);
    }

    const updateData: Record<string, unknown> = {};

    if (response !== undefined) {
      updateData.response = response;
      updateData.respondedAt = response ? new Date() : null;
      updateData.respondedBy = response ? respondedBy : null;
    }

    if (status) {
      updateData.status = status;
    }

    const updatedReview = await db.review.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(updatedReview, 'Avis mis à jour');
  });
}

// DELETE /api/reviews - Delete review
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    if (!db) {
      return apiError('Base de données non disponible', 503);
    }

    const review = await db.review.findUnique({ where: { id } });
    if (!review) {
      return apiError('Avis non trouvé', 404);
    }

    await db.review.delete({ where: { id } });
    return apiSuccess({ deleted: true }, 'Avis supprimé');
  });
}
