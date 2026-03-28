// Order Status API - Update order status
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { pusher } from '@/lib/pusher';

// PATCH /api/orders/[id]/status - Update order status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandler(async () => {
    const { id } = await params;
    const body = await request.json();
    const { status, estimatedTime, driverId } = body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return apiError('Statut invalide');
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (estimatedTime) updateData.estimatedPrepTime = estimatedTime;
    if (driverId !== undefined) updateData.driverId = driverId;

    // Update order
    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        driver: { select: { id: true, firstName: true, lastName: true, phone: true } },
        items: { include: { product: true } },
        restaurant: { select: { id: true, name: true, organizationId: true } },
      },
    });

    // Push real-time update via Pusher
    try {
      await pusher.trigger(
        `restaurant-${order.restaurantId}`,
        'order_updated',
        { order }
      );
      
      // Also trigger organization-wide update
      if (order.restaurant?.organizationId) {
        await pusher.trigger(
          `org-${order.restaurant.organizationId}`,
          'order_updated',
          { order }
        );
      }
    } catch (pusherError) {
      console.error('Pusher error:', pusherError);
      // Don't fail the request if pusher fails
    }

    return apiSuccess(order, 'Statut mis à jour');
  });
}
