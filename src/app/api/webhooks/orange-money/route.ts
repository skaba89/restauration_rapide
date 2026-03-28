// Orange Money Webhook Handler with Security
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook } from '@/lib/webhook-security';
import { paymentWebhookSchema } from '@/lib/validations/payment';

interface OrangeMoneyPayload {
  transaction_id: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  currency: string;
  phone_number: string;
  order_id: string;
  pay_token: string;
  notif_token: string;
  transaction_date: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload: OrangeMoneyPayload = JSON.parse(rawBody);
    
    console.log('[Orange Money Webhook] Received:', {
      transaction_id: payload.transaction_id,
      status: payload.status,
      amount: payload.amount,
    });

    // Verify webhook signature and IP
    const verification = verifyWebhook('ORANGE_MONEY', request, rawBody);
    
    if (!verification.valid) {
      console.error('[Orange Money Webhook] Verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Webhook verification failed', details: verification.error },
        { status: 401 }
      );
    }

    console.log('[Orange Money Webhook] Verified from IP:', verification.ip);

    // Validate payload structure
    const webhookData = {
      transactionId: payload.transaction_id,
      status: payload.status.toLowerCase() as 'success' | 'failed' | 'pending' | 'cancelled',
      amount: payload.amount,
      currency: payload.currency,
      phoneNumber: payload.phone_number,
      timestamp: payload.transaction_date,
      providerReference: payload.pay_token,
    };

    const validation = paymentWebhookSchema.safeParse(webhookData);
    if (!validation.success) {
      console.error('[Orange Money Webhook] Invalid payload:', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Find payment by transaction ID
    const payment = await db.payment.findFirst({
      where: { transactionId: payload.transaction_id },
      include: { order: true },
    });

    if (!payment) {
      console.error('[Orange Money Webhook] Payment not found:', payload.transaction_id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Idempotency check - prevent duplicate processing
    if (payment.status === 'PAID' || payment.status === 'FAILED') {
      console.log('[Orange Money Webhook] Payment already processed:', payment.id, payment.status);
      return NextResponse.json({ 
        success: true, 
        status: payment.status,
        message: 'Payment already processed',
      });
    }

    // Map Orange Money status to our status
    const status = payload.status === 'SUCCESS' ? 'PAID' :
                   payload.status === 'FAILED' ? 'FAILED' :
                   payload.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING';

    // Use transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          processedAt: status === 'PAID' ? new Date() : undefined,
          failedAt: status === 'FAILED' || status === 'CANCELLED' ? new Date() : undefined,
          providerReference: payload.pay_token,
          phoneNumber: payload.phone_number,
        },
      });

      // Update order if payment successful
      if (status === 'PAID' && payment.order) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        // Create notification for the customer
        await tx.notification.create({
          data: {
            type: 'ORDER',
            title: 'Paiement confirmé',
            message: `Votre paiement de ${payload.amount} ${payload.currency} a été confirmé`,
            orderId: payment.orderId,
          },
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_WEBHOOK',
          entityType: 'Payment',
          entityId: payment.id,
          details: JSON.stringify({
            provider: 'ORANGE_MONEY',
            status,
            amount: payload.amount,
            currency: payload.currency,
            transactionId: payload.transaction_id,
            ipAddress: verification.ip,
          }),
        },
      });

      return updatedPayment;
    });

    console.log('[Orange Money Webhook] Order confirmed:', payment.orderId);

    return NextResponse.json({ 
      success: true, 
      status,
      orderId: payment.orderId,
      paymentId: result.id,
    });
  } catch (error) {
    console.error('[Orange Money Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    provider: 'Orange Money',
    timestamp: new Date().toISOString(),
    features: ['signature_verification', 'ip_whitelist', 'idempotency'],
  });
}
