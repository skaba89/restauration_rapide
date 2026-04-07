// Promotions API - Promo codes, happy hour, menu du jour with usage tracking
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// Demo promotions data
const DEMO_PROMOTIONS = [
  {
    id: 'demo-promo-1',
    name: 'Happy Hour',
    description: '20% de réduction sur toutes les commandes entre 14h et 17h',
    type: 'happy_hour',
    value: 20,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    usageCount: 156,
    maxUsage: null,
    minOrder: 5000,
    code: null,
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-promo-2',
    name: 'Menu du Jour',
    description: 'Plat du jour à -20% chaque midi',
    type: 'discount',
    value: 20,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    usageCount: 89,
    maxUsage: 200,
    minOrder: 15000,
    code: 'MENUJOUR',
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-promo-3',
    name: 'Achetez 2, Recevez 1',
    description: 'Pour tout achat de 2 plats principaux, recevez une boisson gratuite',
    type: 'buy_x_get_y',
    value: 1,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    usageCount: 45,
    maxUsage: null,
    minOrder: 20000,
    code: 'BOISSON',
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'demo-promo-4',
    name: 'Bienvenue',
    description: 'Première commande: 15% de réduction',
    type: 'discount',
    value: 15,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    usageCount: 234,
    maxUsage: null,
    minOrder: 10000,
    code: 'BIENVENUE',
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'demo-promo-5',
    name: 'Weekend Famille',
    description: 'Réduction 25% pour les groupes de 5+ personnes le weekend',
    type: 'discount',
    value: 25,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: false,
    usageCount: 67,
    maxUsage: null,
    minOrder: 30000,
    code: 'FAMILLE',
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'demo-promo-6',
    name: 'Livraison Gratuite',
    description: 'Livraison gratuite pour les commandes de plus de 25000 GNF',
    type: 'free_delivery',
    value: 0,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    isActive: true,
    usageCount: 123,
    maxUsage: null,
    minOrder: 25000,
    code: 'LIVRAISON',
    organizationId: 'demo-org-1',
    restaurantId: null,
    createdAt: new Date('2024-01-01'),
  },
];

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
    const demo = searchParams.get('demo');

    // Return demo data if demo mode or no organization specified
    if (demo === 'true' || !organizationId) {
      let filteredPromotions = [...DEMO_PROMOTIONS];
      
      // Apply filters
      if (isActive !== null) {
        filteredPromotions = filteredPromotions.filter(p => p.isActive === (isActive === 'true'));
      }
      if (type) {
        filteredPromotions = filteredPromotions.filter(p => p.type === type);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredPromotions = filteredPromotions.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.code?.toLowerCase().includes(searchLower)
        );
      }
      if (code) {
        filteredPromotions = filteredPromotions.filter(p => 
          p.code?.toLowerCase() === code.toLowerCase()
        );
      }

      const total = filteredPromotions.length;
      const paginatedPromotions = filteredPromotions.slice(skip, skip + limit);

      return apiSuccess({
        data: paginatedPromotions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

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
      // Fallback to demo data if model doesn't exist
      return apiSuccess({
        data: DEMO_PROMOTIONS.slice(skip, skip + limit),
        total: DEMO_PROMOTIONS.length,
        page,
        limit,
        totalPages: Math.ceil(DEMO_PROMOTIONS.length / limit),
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
      // Return demo response if model doesn't exist
      const demoPromotion = {
        id: `demo-promo-${Date.now()}`,
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
        createdAt: new Date(),
      };
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
      // Demo mode response
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
