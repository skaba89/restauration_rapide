// Offline Sync API
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';

// GET /api/sync - Get pending sync items
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return apiError('organizationId est requis');
    }

    const pendingItems = await db.syncQueue.findMany({
      where: {
        organizationId,
        status: 'pending',
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    return apiSuccess(pendingItems);
  });
}

// POST /api/sync - Sync offline data
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { organizationId, items } = body;

    if (!organizationId || !items?.length) {
      return apiError('organizationId et items sont requis');
    }

    const results = [];

    for (const item of items) {
      try {
        let result;

        switch (item.entity) {
          case 'order':
            result = await syncOrder(organizationId, item);
            break;
          case 'customer':
            result = await syncCustomer(organizationId, item);
            break;
          case 'delivery':
            result = await syncDelivery(organizationId, item);
            break;
          default:
            result = { success: false, error: 'Entity type not supported' };
        }

        results.push({
          syncId: item.syncId,
          entityId: item.entityId,
          success: result.success,
          error: result.error,
        });
      } catch (error) {
        results.push({
          syncId: item.syncId,
          entityId: item.entityId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return apiSuccess({
      synced: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  });
}

// Sync order from offline
async function syncOrder(organizationId: string, item: { action: string; data: string; entityId: string; syncId: string }) {
  const data = JSON.parse(item.data);

  if (item.action === 'create') {
    // Check if order already exists by syncId
    const existing = await db.order.findFirst({
      where: { syncId: item.syncId },
    });

    if (existing) {
      return { success: true, id: existing.id };
    }

    // Create order
    const order = await db.order.create({
      data: {
        ...data,
        organizationId,
        syncId: item.syncId,
        syncStatus: 'synced',
      },
    });

    return { success: true, id: order.id };
  }

  if (item.action === 'update') {
    const order = await db.order.update({
      where: { id: item.entityId },
      data: {
        ...data,
        syncStatus: 'synced',
      },
    });

    return { success: true, id: order.id };
  }

  return { success: false, error: 'Invalid action' };
}

// Sync customer from offline
async function syncCustomer(organizationId: string, item: { action: string; data: string; entityId: string }) {
  const data = JSON.parse(item.data);

  if (item.action === 'create') {
    // Check if customer exists by phone
    const existing = await db.customer.findFirst({
      where: { organizationId, phone: data.phone },
    });

    if (existing) {
      return { success: true, id: existing.id };
    }

    const customer = await db.customer.create({
      data: {
        ...data,
        organizationId,
      },
    });

    return { success: true, id: customer.id };
  }

  if (item.action === 'update') {
    const customer = await db.customer.update({
      where: { id: item.entityId },
      data,
    });

    return { success: true, id: customer.id };
  }

  return { success: false, error: 'Invalid action' };
}

// Sync delivery tracking from offline
async function syncDelivery(organizationId: string, item: { action: string; data: string; entityId: string }) {
  const data = JSON.parse(item.data);

  if (item.action === 'update') {
    const delivery = await db.delivery.update({
      where: { id: item.entityId },
      data,
    });

    // Add tracking point if location provided
    if (data.lat && data.lng) {
      await db.deliveryTracking.create({
        data: {
          deliveryId: item.entityId,
          lat: data.lat,
          lng: data.lng,
          status: data.status,
        },
      });
    }

    return { success: true, id: delivery.id };
  }

  return { success: false, error: 'Invalid action' };
}
