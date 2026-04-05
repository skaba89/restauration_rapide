// WhatsApp Notification Subscription API
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import { NextRequest } from 'next/server';

// POST /api/notifications/whatsapp/subscribe
export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { orderId, phone } = body;

    if (!orderId || !phone) {
      return apiError('Order ID et téléphone requis', 400);
    }

    // Verify order exists
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: { name: true, phone: true },
        },
      },
    });

    if (!order) {
      return apiError('Commande non trouvée', 404);
    }

    // Store WhatsApp notification preference
    // In a real implementation, this would integrate with WhatsApp Business API
    // For now, we'll store it in the order notes or a separate table
    
    // Update order with WhatsApp notification preference
    await db.order.update({
      where: { id: orderId },
      data: {
        internalNotes: `WhatsApp notifications enabled for ${phone}`,
      },
    });

    // In production, you would:
    // 1. Register the phone number with WhatsApp Business API
    // 2. Set up webhook for order status changes
    // 3. Send initial confirmation message

    // Simulate sending initial WhatsApp message
    const whatsappMessage = {
      to: phone,
      type: 'text',
      text: {
        body: `🍕 *${order.restaurant.name}*\n\n` +
              `✅ Votre commande #${order.orderNumber} a été reçue!\n\n` +
              `📦 Statut: En attente de confirmation\n\n` +
              `💰 Total: ${order.total.toLocaleString()} GNF\n\n` +
              `Nous vous tiendrons informé de l'avancement de votre commande.`,
      },
    };

    console.log('WhatsApp notification sent:', whatsappMessage);

    return apiSuccess({
      subscribed: true,
      orderId,
      phone,
      message: 'Notifications WhatsApp activées',
    });
  });
}
