// ============================================
// WhatsApp Webhook API
// Receive and process incoming WhatsApp messages
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { whatsappService } from '@/lib/whatsapp-service';

// Twilio webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Twilio verification
  const mode = searchParams.get('hub.mode');
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');
  
  if (mode === 'subscribe' && verifyToken === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }
  
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// Handle incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Twilio webhook
    if (body.AccountSid) {
      return handleTwilioWebhook(body);
    }
    
    // Handle UltraMSG webhook
    if (body.event === 'message') {
      return handleUltraMSGWebhook(body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle Twilio WhatsApp webhook
async function handleTwilioWebhook(body: Record<string, string>) {
  const from = body.From?.replace('whatsapp:', '') || '';
  const message = body.Body || '';
  const messageId = body.MessageSid;
  
  console.log('WhatsApp message from Twilio:', { from, message, messageId });
  
  // Process the message
  await processIncomingMessage(from, message);
  
  return NextResponse.json({ success: true });
}

// Handle UltraMSG webhook
async function handleUltraMSGWebhook(body: Record<string, unknown>) {
  const data = body.data as Record<string, unknown>;
  const from = (data?.from as string)?.replace('@c.us', '') || '';
  const message = data?.body as string || '';
  
  console.log('WhatsApp message from UltraMSG:', { from, message });
  
  // Process the message
  await processIncomingMessage(from, message);
  
  return NextResponse.json({ success: true });
}

// Process incoming WhatsApp message
async function processIncomingMessage(from: string, message: string) {
  try {
    // Clean phone number
    const phone = from.replace('+', '');
    
    // Find customer by phone
    const customer = await db.customerProfile.findFirst({
      where: { phone: { contains: phone.slice(-9) } }, // Last 9 digits for matching
      include: {
        orders: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] }
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      }
    });
    
    if (!customer) {
      // No customer found, send generic response
      await whatsappService.sendCustom(
        phone,
        `🍽️ *KFM DELICE*\n\nBienvenue! Pour commander, visitez notre site:\n${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}\n\nOu appelez-nous au ${process.env.WHATSAPP_FROM || '+224620000000'}`
      );
      return;
    }
    
    const lastOrder = customer.orders[0];
    
    // Check for keywords
    const lowerMessage = message.toLowerCase().trim();
    
    if (lowerMessage === 'statut' || lowerMessage === 'status' || lowerMessage === 'ma commande') {
      // Send order status
      if (lastOrder) {
        await whatsappService.sendOrderStatus({
          orderNumber: lastOrder.orderNumber,
          customerName: customer.firstName || 'Client',
          customerPhone: customer.phone,
          items: [], // Would need to fetch items
          subtotal: lastOrder.subtotal,
          deliveryFee: lastOrder.deliveryFee,
          total: lastOrder.total,
          currency: 'GNF',
          orderType: lastOrder.orderType,
          status: lastOrder.status,
          deliveryAddress: lastOrder.deliveryAddress,
          restaurantName: 'KFM DELICE',
          trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}/tracking/${lastOrder.orderNumber}`,
        });
      } else {
        await whatsappService.sendCustom(
          phone,
          '🍽️ *KFM DELICE*\n\nVous n\'avez pas de commande en cours.\n\nPour commander: ' + 
          (process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com')
        );
      }
    } else if (lowerMessage === 'menu' || lowerMessage === 'carte') {
      // Send menu link
      await whatsappService.sendCustom(
        phone,
        `🍽️ *KFM DELICE*\n\nDécouvrez notre menu:\n${process.env.NEXT_PUBLIC_APP_URL || 'https://kfm-delice.onrender.com'}/menu\n\nCommandez en ligne pour une livraison rapide! 🛵`
      );
    } else if (lowerMessage === 'aide' || lowerMessage === 'help') {
      // Send help message
      await whatsappService.sendCustom(
        phone,
        `🍽️ *KFM DELICE - Aide*\n\n` +
        `📌 Commandes disponibles:\n` +
        `• *STATUT* - Voir le statut de votre commande\n` +
        `• *MENU* - Voir notre menu\n` +
        `• *AIDE* - Ce message d'aide\n\n` +
        `📞 Pour toute question, appelez le ${process.env.WHATSAPP_FROM || '+224620000000'}`
      );
    } else {
      // Unknown message, send generic response
      await whatsappService.sendCustom(
        phone,
        `🍽️ *KFM DELICE*\n\nMerci pour votre message!\n\n` +
        `📌 Envoyez:\n` +
        `• *STATUT* pour suivre votre commande\n` +
        `• *MENU* pour voir notre carte\n` +
        `• *AIDE* pour plus d'options\n\n` +
        `📞 Ou appelez-nous au ${process.env.WHATSAPP_FROM || '+224620000000'}`
      );
    }
    
    // Log the message
    console.log('Processed WhatsApp message:', { from, message, customerId: customer.id });
    
  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
  }
}
