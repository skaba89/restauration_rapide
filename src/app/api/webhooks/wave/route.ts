// Wave Webhook Handler with Security
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook } from '@/lib/webhook-security';
import { paymentWebhookSchema } from '@/lib/validations/payment';

interface WavePayload {
  id: string;
  status: 'succeeded' | 'failed' | 'pending' | 'cancelled';
  amount: string;
  currency: string;
  client_reference: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
  };
  metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload: WavePayload = JSON.parse(rawBody);
    
    console.log('[Wave Webhook] Received:', {
      id: payload.id,
      status: payload.status,
      amount: payload.amount,
    });

    // Verify webhook signature and IP
    const verification = verifyWebhook('WAVE', request, rawBody);
    
    if (!verification.valid) {
      console.error('[Wave Webhook] Verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Webhook verification failed', details: verification.error },
        { status: 401 }
      );
    }

    console.log('[Wave Webhook] Verified from IP:', verification.ip);

    // Validate payload structure
    const webhookData = {
      transactionId: payload.id,
      status: payload.status,
      amount: parseFloat(payload.amount),
      currency: payload.currency,
      timestamp: payload.timestamp,
      metadata: payload.metadata,
    };

    const validation = paymentWebhookSchema.safeParse(webhookData);
    if (!validation.success) {
      console.error('[Wave Webhook] Invalid payload:', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Find payment by Wave transaction ID
    const payment = await db.payment.findFirst({
      where: { 
        OR: [
          { transactionId: payload.id },
          { transactionId: payload.client_reference },
        ]
      },
      include: { order: true },
    });

    if (!payment) {
      console.error('[Wave Webhook] Payment not found:', payload.id);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Idempotency check
    if (payment.status === 'PAID' || payment.status === 'FAILED') {
      console.log('[Wave Webhook] Payment already processed:', payment.id, payment.status);
      return NextResponse.json({ 
        success: true, 
        status: payment.status,
        message: 'Payment already processed',
      });
    }

    // Map Wave status to our status
    const status = payload.status === 'succeeded' ? 'PAID' :
                   payload.status === 'failed' ? 'FAILED' :
                   payload.status === 'cancelled' ? 'CANCELLED' : 'PENDING';

    // Use transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          processedAt: status === 'PAID' ? new Date() : undefined,
          failedAt: status === 'FAILED' || status === 'CANCELLED' ? new Date() : undefined,
          providerReference: payload.id,
          failureReason: payload.error?.message,
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

        // Create notification
        await tx.notification.create({
          data: {
            type: 'ORDER',
            title: 'Paiement Wave confirmé',
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
            provider: 'WAVE',
            status,
            amount: payload.amount,
            waveTransactionId: payload.id,
            error: payload.error,
            ipAddress: verification.ip,
          }),
        },
      });

      return updatedPayment;
    });

    console.log('[Wave Webhook] Order confirmed:', payment.orderId);

    return NextResponse.json({ 
      success: true, 
      status,
      orderId: payment.orderId,
      paymentId: result.id,
    });
  } catch (error) {
    console.error('[Wave Webhook] Error:', error);
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
    provider: 'Wave',
    timestamp: new Date().toISOString(),
    features: ['signature_verification', 'ip_whitelist', 'idempotency'],
  });
}
