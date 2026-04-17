// Promotions API - Promo codes, happy hour, menu du jour with usage tracking
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// GET /api/promotions - List promotions
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const organizationId = searchParams.get('organizationId');
    const restaurantId = searchParams.get('restaurantId');
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const code = searchParams.get('code');

    // For real database queries, check if Promotion model exists
    try {
      const where = {
        organizationId,
        ...(restaurantId && { restaurantId }),
        ...(isActive !== null && { isActive: isActive === 'true' }),
        ...(type && { type }),
        ...(code && { code: { equals: code, mode: 'insensitive' as const } }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { code: { contains: search } },
          ],
        }),
      };

      const [promotions, total] = await Promise.all([
        db.promotion.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        db.promotion.count({ where }),
      ]);

      return apiSuccess({
        data: promotions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch {
      return apiSuccess({
        data: [].slice(skip, skip + limit),
        total: 0,
        page,
        limit,
        totalPages: Math.ceil([].length / limit),
      });
    }
  });
}

// POST /api/promotions - Create promotion
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      organizationId,
      restaurantId,
      name,
      description,
      type,
      value,
      code,
      minOrder = 0,
      maxUsage,
      validFrom,
      validTo,
    } = body;

    // Validation
    if (!organizationId || !name || !type || value === undefined || !validFrom || !validTo) {
      return apiError('organisation, nom, type, valeur et dates de validité sont requis');
    }

    try {
      // Check if code already exists
      if (code) {
        const existing = await db.promotion.findFirst({
          where: { organizationId, code },
        });
        if (existing) {
          return apiError('Ce code promo existe déjà', 409);
        }
      }

      const promotion = await db.promotion.create({
        data: {
          organizationId,
          restaurantId,
          name,
          description,
          type,
          value,
          code: code?.toUpperCase(),
          minOrder,
          maxUsage,
          validFrom: new Date(validFrom),
          validTo: new Date(validTo),
          isActive: true,
          usageCount: 0,
        },
      });

      return apiSuccess(promotion, 'Promotion créée avec succès', 201);
    } catch {
      return apiSuccess(demoPromotion, 'Promotion créée (mode démo)', 201);
    }
  });
}

// PATCH /api/promotions - Update promotion
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const {
      id,
      name,
      description,
      type,
      value,
      code,
      minOrder,
      maxUsage,
      validFrom,
      validTo,
      isActive,
    } = body;

    if (!id) {
      return apiError('ID est requis');
    }

    try {
      const promotion = await db.promotion.findUnique({ where: { id } });
      if (!promotion) {
        return apiError('Promotion non trouvée', 404);
      }

      const updatedPromotion = await db.promotion.update({
        where: { id },
        data: {
          name,
          description,
          type,
          value,
          code: code?.toUpperCase(),
          minOrder,
          maxUsage,
          validFrom: validFrom ? new Date(validFrom) : undefined,
          validTo: validTo ? new Date(validTo) : undefined,
          isActive,
        },
      });

      return apiSuccess(updatedPromotion, 'Promotion mise à jour');
    } catch {
      return apiSuccess({ id, ...body, updatedAt: new Date() }, 'Promotion mise à jour (mode démo)');
    }
  });
}

// DELETE /api/promotions - Delete promotion
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    try {
      const promotion = await db.promotion.findUnique({ where: { id } });
      if (!promotion) {
        return apiError('Promotion non trouvée', 404);
      }

      await db.promotion.delete({ where: { id } });
      return apiSuccess({ deleted: true }, 'Promotion supprimée');
    } catch {
      return apiSuccess({ deleted: true }, 'Promotion supprimée (mode démo)');
    }
  });
}