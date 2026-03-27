// Loyalty API - Loyalty program management
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler, getPaginationParams } from '@/lib/api-responses';

// GET /api/loyalty - Get loyalty data
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type') || 'transactions';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    if (!organizationId && !customerId) {
      return apiError('organizationId ou customerId est requis');
    }

    // Get customer loyalty info
    if (customerId && type === 'customer') {
      const customer = await db.customerProfile.findUnique({
        where: { id: customerId },
        include: {
          loyaltyTransactions: {
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { loyaltyTransactions: true },
          },
        },
      });

      if (!customer) {
        return apiError('Client non trouvé', 404);
      }

      // Get loyalty settings
      const organization = await db.organization.findUnique({
        where: { id: customer.organizationId },
        include: { settings: true },
      });

      const settings = organization?.settings;

      return apiSuccess({
        customer: {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          loyaltyPoints: customer.loyaltyPoints,
          loyaltyLevel: customer.loyaltyLevel,
          lifetimePoints: customer.lifetimePoints,
          pointsValue: customer.loyaltyPoints * (settings?.pointValue || 10),
        },
        settings: {
          enabled: settings?.loyaltyEnabled || false,
          pointsPerAmount: settings?.pointsPerAmount || 1,
          pointValue: settings?.pointValue || 10,
        },
        transactions: customer.loyaltyTransactions,
        total: customer._count.loyaltyTransactions,
      });
    }

    // Get loyalty transactions
    if (type === 'transactions') {
      const where = {
        ...(organizationId && { organizationId }),
        ...(customerId && { customerId }),
      };

      const [transactions, total] = await Promise.all([
        db.loyaltyTransaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        }),
        db.loyaltyTransaction.count({ where }),
      ]);

      return apiSuccess({
        data: transactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    // Get loyalty rewards
    if (type === 'rewards') {
      const rewards = await db.loyaltyReward.findMany({
        where: {
          organizationId: organizationId!,
          isActive: true,
        },
        orderBy: { pointsRequired: 'asc' },
      });

      return apiSuccess(rewards);
    }

    // Get loyalty stats
    if (type === 'stats' && organizationId) {
      const [totalPointsIssued, totalPointsRedeemed, totalCustomers, vipCustomers] = await Promise.all([
        db.loyaltyTransaction.aggregate({
          where: { organizationId, type: 'earn' },
          _sum: { points: true },
        }),
        db.loyaltyTransaction.aggregate({
          where: { organizationId, type: 'redeem' },
          _sum: { points: true },
        }),
        db.customerProfile.count({ where: { organizationId } }),
        db.customerProfile.count({ where: { organizationId, isVip: true } }),
      ]);

      return apiSuccess({
        totalPointsIssued: totalPointsIssued._sum.points || 0,
        totalPointsRedeemed: totalPointsRedeemed._sum.points || 0,
        activePoints: (totalPointsIssued._sum.points || 0) - (totalPointsRedeemed._sum.points || 0),
        totalCustomers,
        vipCustomers,
      });
    }

    return apiError('Type non reconnu');
  });
}

// POST /api/loyalty - Create transaction or reward
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { action, organizationId, customerId, points, type, description, referenceType, referenceId, expiresAt } = body;

    // Add points to customer
    if (action === 'earn' || type === 'earn') {
      if (!organizationId || !customerId || !points) {
        return apiError('organizationId, customerId et points sont requis');
      }

      const customer = await db.customerProfile.findUnique({ where: { id: customerId } });
      if (!customer) {
        return apiError('Client non trouvé', 404);
      }

      const balanceAfter = customer.loyaltyPoints + points;

      const transaction = await db.loyaltyTransaction.create({
        data: {
          organizationId,
          customerId,
          points,
          type: 'earn',
          description: description || 'Points gagnés',
          referenceType,
          referenceId,
          balanceAfter,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        },
      });

      // Update customer points
      await db.customerProfile.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { increment: points },
          lifetimePoints: { increment: points },
          loyaltyLevel: Math.floor(balanceAfter / 1000) + 1, // Level = points / 1000
        },
      });

      return apiSuccess(transaction, 'Points ajoutés', 201);
    }

    // Redeem points
    if (action === 'redeem' || type === 'redeem') {
      if (!organizationId || !customerId || !points) {
        return apiError('organizationId, customerId et points sont requis');
      }

      const customer = await db.customerProfile.findUnique({ where: { id: customerId } });
      if (!customer) {
        return apiError('Client non trouvé', 404);
      }

      if (customer.loyaltyPoints < points) {
        return apiError('Points insuffisants', 400);
      }

      const balanceAfter = customer.loyaltyPoints - points;

      const transaction = await db.loyaltyTransaction.create({
        data: {
          organizationId,
          customerId,
          points: -points,
          type: 'redeem',
          description: description || 'Points utilisés',
          referenceType,
          referenceId,
          balanceAfter,
        },
      });

      // Update customer points
      await db.customerProfile.update({
        where: { id: customerId },
        data: {
          loyaltyPoints: { decrement: points },
          loyaltyLevel: Math.floor(balanceAfter / 1000) + 1,
        },
      });

      return apiSuccess(transaction, 'Points utilisés');
    }

    // Create reward
    if (action === 'reward') {
      const { name, description: rewardDescription, image, pointsRequired, type: rewardType, value, productId, isActive } = body;

      if (!organizationId || !name || !pointsRequired) {
        return apiError('organizationId, name et pointsRequired sont requis');
      }

      const reward = await db.loyaltyReward.create({
        data: {
          organizationId,
          name,
          description: rewardDescription,
          image,
          pointsRequired,
          type: rewardType || 'discount',
          value: value || 0,
          productId,
          isActive: isActive !== false,
        },
      });

      return apiSuccess(reward, 'Récompense créée', 201);
    }

    return apiError('Action non reconnue');
  });
}

// PATCH /api/loyalty - Update settings or reward
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { type, id, organizationId, loyaltyEnabled, pointsPerAmount, pointValue, ...rewardData } = body;

    // Update organization settings
    if (type === 'settings' && organizationId) {
      const settings = await db.organizationSettings.upsert({
        where: { organizationId },
        create: {
          organizationId,
          loyaltyEnabled: loyaltyEnabled ?? true,
          pointsPerAmount: pointsPerAmount ?? 1,
          pointValue: pointValue ?? 10,
        },
        update: {
          ...(loyaltyEnabled !== undefined && { loyaltyEnabled }),
          ...(pointsPerAmount !== undefined && { pointsPerAmount }),
          ...(pointValue !== undefined && { pointValue }),
        },
      });

      return apiSuccess(settings, 'Paramètres mis à jour');
    }

    // Update reward
    if (type === 'reward' && id) {
      const reward = await db.loyaltyReward.update({
        where: { id },
        data: rewardData,
      });

      return apiSuccess(reward, 'Récompense mise à jour');
    }

    return apiError('Type non reconnu');
  });
}

// DELETE /api/loyalty - Delete reward
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return apiError('ID est requis');
    }

    await db.loyaltyReward.update({
      where: { id },
      data: { isActive: false },
    });

    return apiSuccess({ deleted: true }, 'Récompense désactivée');
  });
}
