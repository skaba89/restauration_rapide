// ============================================
// Inventory Alerts API for KFM DELICE
// GET - List stock alerts
// ============================================

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { db } from '@/lib/db';

// Demo alerts
const DEMO_ALERTS = [
  {
    id: 'alert-1',
    itemId: '3',
    itemName: 'Tomates',
    type: 'LOW_STOCK',
    message: 'Stock bas: Tomates - 10 kg restant(s)',
    threshold: 15,
    currentQty: 10,
    isRead: false,
    isResolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'alert-2',
    itemId: '11',
    itemName: 'Attieké',
    type: 'LOW_STOCK',
    message: 'Stock bas: Attieké - 8 kg restant(s)',
    threshold: 10,
    currentQty: 8,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'alert-3',
    itemId: '14',
    itemName: 'Ail',
    type: 'LOW_STOCK',
    message: 'Stock bas: Ail - 4 kg restant(s)',
    threshold: 5,
    currentQty: 4,
    isRead: true,
    isResolved: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'alert-4',
    itemId: '19',
    itemName: 'Frites surgelées',
    type: 'OUT_OF_STOCK',
    message: 'Rupture de stock: Frites surgelées',
    threshold: 5,
    currentQty: 0,
    isRead: false,
    isResolved: false,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

// GET - List alerts
export const GET = withErrorHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const demo = searchParams.get('demo') === 'true';
  const type = searchParams.get('type');
  const isRead = searchParams.get('isRead');
  const isResolved = searchParams.get('isResolved');

  if (demo) {
    let alerts = [...DEMO_ALERTS];

    if (type) {
      alerts = alerts.filter(a => a.type === type);
    }
    if (isRead !== null && isRead !== undefined) {
      alerts = alerts.filter(a => a.isRead === (isRead === 'true'));
    }
    if (isResolved !== null && isResolved !== undefined) {
      alerts = alerts.filter(a => a.isResolved === (isResolved === 'true'));
    }

    return apiSuccess({ 
      alerts,
      stats: {
        total: DEMO_ALERTS.length,
        lowStock: DEMO_ALERTS.filter(a => a.type === 'LOW_STOCK').length,
        outOfStock: DEMO_ALERTS.filter(a => a.type === 'OUT_OF_STOCK').length,
        unread: DEMO_ALERTS.filter(a => !a.isRead).length,
        unresolved: DEMO_ALERTS.filter(a => !a.isResolved).length,
      }
    });
  }

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
  const demo = searchParams.get('demo') === 'true';

  const { alertId, resolvedBy } = body;

  if (!alertId) {
    return apiError('ID d\'alerte requis', 400);
  }

  if (demo) {
    return apiSuccess({ alertId, isResolved: true }, 'Alerte résolue');
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
