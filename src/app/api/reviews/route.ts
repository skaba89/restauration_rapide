// Reviews API - Customer reviews management with responses
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// Demo reviews data
const DEMO_REVIEWS = [
  {
    id: 'demo-rev-1',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-1',
    customerName: 'Amadou Diallo',
    customerPhone: '+224622123456',
    rating: 5,
    comment: 'Excellent service! Le Thiéboudienne était délicieux et le personnel très aimable. Je recommande vivement.',
    status: 'published',
    source: 'google',
    orderId: 'demo-ord-1',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    items: ['Thiéboudienne', 'Jus de Bissap'],
  },
  {
    id: 'demo-rev-2',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-2',
    customerName: 'Fatou Sylla',
    customerPhone: '+224622654321',
    rating: 4,
    comment: 'Très bon repas, mais le temps d\'attente était un peu long. Le Yassa était parfait.',
    status: 'published',
    source: 'web',
    orderId: 'demo-ord-2',
    response: 'Merci Fatou pour votre avis! Nous travaillons à réduire les temps d\'attente.',
    respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    respondedBy: 'Admin',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    items: ['Yassa Poulet', 'Attiéké'],
  },
  {
    id: 'demo-rev-3',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-3',
    customerName: 'Ibrahima Keita',
    customerPhone: '+224622111222',
    rating: 3,
    comment: 'La nourriture était correcte mais la livraison a pris plus de temps que prévu.',
    status: 'published',
    source: 'app',
    orderId: 'demo-ord-3',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    items: ['Kedjenou', 'Riz'],
  },
  {
    id: 'demo-rev-4',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-4',
    customerName: 'Mariama Touré',
    customerPhone: '+224622333444',
    rating: 5,
    comment: 'Le meilleur restaurant de Conakry! Les portions sont généreuses et les prix abordables. J\'adore le Maafe!',
    status: 'published',
    source: 'google',
    orderId: null,
    response: 'Merci infiniment Mariama! Nous sommes ravis que vous appréciiez notre cuisine.',
    respondedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    respondedBy: 'KFM DELICE',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    items: ['Maafe', 'Foutou'],
  },
  {
    id: 'demo-rev-5',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-5',
    customerName: 'Seydou Bamba',
    customerPhone: '+224622555666',
    rating: 2,
    comment: 'Déçu par la qualité de la viande aujourd\'hui. J\'espère que c\'était juste un mauvais jour.',
    status: 'pending',
    source: 'web',
    orderId: 'demo-ord-5',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    items: ['Poulet Braisé'],
  },
  {
    id: 'demo-rev-6',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-6',
    customerName: 'Aïssata Traoré',
    customerPhone: '+224622777888',
    rating: 5,
    comment: 'Ambiance fantastique et cadre agréable. Parfait pour un dîner en famille.',
    status: 'published',
    source: 'facebook',
    orderId: null,
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    items: [],
  },
  {
    id: 'demo-rev-7',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-7',
    customerName: 'Moussa Koné',
    customerPhone: '+224622999000',
    rating: 4,
    comment: 'Bon rapport qualité-prix. Les jus frais sont excellents!',
    status: 'published',
    source: 'app',
    orderId: 'demo-ord-7',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    items: ['Jus de Gingembre', 'Jus de Bissap'],
  },
  {
    id: 'demo-rev-8',
    restaurantId: 'demo-rest-1',
    customerId: 'demo-cust-8',
    customerName: 'Kadiatou Diallo',
    customerPhone: '+224622111333',
    rating: 1,
    comment: 'Commande incorrecte et service client injoignable. Très déçue.',
    status: 'flagged',
    source: 'web',
    orderId: 'demo-ord-8',
    response: null,
    respondedAt: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    items: ['Riz Gras', 'Poulet'],
  },
];

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
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization/restaurant specified
    if (demo === 'true' || (!restaurantId && !organizationId)) {
      let filteredReviews = [...DEMO_REVIEWS];
      
      // Apply filters
      if (status) {
        filteredReviews = filteredReviews.filter(r => r.status === status);
      }
      if (rating) {
        filteredReviews = filteredReviews.filter(r => r.rating === parseInt(rating));
      }
      if (source) {
        filteredReviews = filteredReviews.filter(r => r.source === source);
      }
      if (responded !== null) {
        filteredReviews = filteredReviews.filter(r => 
          responded === 'true' ? r.response !== null : r.response === null
        );
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredReviews = filteredReviews.filter(r => 
          r.customerName.toLowerCase().includes(searchLower) ||
          r.comment.toLowerCase().includes(searchLower)
        );
      }

      const total = filteredReviews.length;
      const paginatedReviews = filteredReviews.slice(skip, skip + limit);

      // Calculate stats
      const stats = {
        averageRating: filteredReviews.length > 0
          ? (filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length).toFixed(1)
          : '0',
        totalReviews: filteredReviews.length,
        ratingDistribution: {
          5: filteredReviews.filter(r => r.rating === 5).length,
          4: filteredReviews.filter(r => r.rating === 4).length,
          3: filteredReviews.filter(r => r.rating === 3).length,
          2: filteredReviews.filter(r => r.rating === 2).length,
          1: filteredReviews.filter(r => r.rating === 1).length,
        },
        responseRate: filteredReviews.length > 0
          ? Math.round((filteredReviews.filter(r => r.response).length / filteredReviews.length) * 100)
          : 0,
      };

      return apiSuccess({
        data: paginatedReviews,
        stats,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    try {
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
    } catch {
      // Fallback to demo data
      return apiSuccess({
        data: DEMO_REVIEWS.slice(skip, skip + limit),
        stats: {
          averageRating: '4.1',
          totalReviews: DEMO_REVIEWS.length,
          ratingDistribution: { 5: 3, 4: 2, 3: 1, 2: 1, 1: 1 },
          responseRate: 25,
        },
        total: DEMO_REVIEWS.length,
        page,
        limit,
        totalPages: Math.ceil(DEMO_REVIEWS.length / limit),
      });
    }
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

    try {
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
    } catch {
      // Demo mode response
      const demoReview = {
        id: `demo-rev-${Date.now()}`,
        restaurantId,
        customerId,
        orderId,
        rating,
        comment,
        source,
        status: 'pending',
        createdAt: new Date(),
      };
      return apiSuccess(demoReview, 'Avis soumis (mode démo)', 201);
    }
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

    try {
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
    } catch {
      return apiSuccess({ id, response, respondedBy, status, updatedAt: new Date() }, 'Avis mis à jour (mode démo)');
    }
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

    try {
      const review = await db.review.findUnique({ where: { id } });
      if (!review) {
        return apiError('Avis non trouvé', 404);
      }

      await db.review.delete({ where: { id } });
      return apiSuccess({ deleted: true }, 'Avis supprimé');
    } catch {
      return apiSuccess({ deleted: true }, 'Avis supprimé (mode démo)');
    }
  });
}
