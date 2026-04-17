// ============================================
// Inventory Alerts API for KFM DELICE
// GET - List stock alerts
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// GET - List alerts
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  const isRead = searchParams.get('isRead');
  const isResolved = searchParams.get('isResolved');

  try {
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return apiError('organizationId est requis', 400);
    }

    // Build filter
    const where: any = { organizationId };
    if (type) {
      where.type = type;
    }
    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === 'true';
    }
    if (isResolved !== null && isResolved !== undefined) {
      where.isResolved = isResolved === 'true';
    }

    const alerts = await db.stockAlert.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unit: true,
            minStock: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Get stats
    const stats = await db.stockAlert.groupBy({
      by: ['type', 'isRead', 'isResolved'],
      where: { organizationId },
      _count: true,
    });

    const statsSummary = {
      total: alerts.length,
      lowStock: alerts.filter(a => a.type === 'LOW_STOCK').length,
      outOfStock: alerts.filter(a => a.type === 'OUT_OF_STOCK').length,
      unread: alerts.filter(a => !a.isRead).length,
      unresolved: alerts.filter(a => !a.isResolved).length,
    };

    return apiSuccess({ alerts, stats: statsSummary });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return apiError('Erreur lors de la récupération des alertes', 500);
  }
});

// POST - Resolve alert
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const searchParams = request.nextUrl.searchParams;

  const { alertId, resolvedBy } = body;

  if (!alertId) {
    return apiError('ID d\'alerte requis', 400);
  }

  try {
    const alert = await db.stockAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      return apiError('Alerte non trouvée', 404);
    }

    const updatedAlert = await db.stockAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    return apiSuccess({ alert: updatedAlert }, 'Alerte résolue avec succès');
  } catch (error) {
    console.error('Error resolving alert:', error);
    return apiError('Erreur lors de la résolution de l\'alerte', 500);
  }
});