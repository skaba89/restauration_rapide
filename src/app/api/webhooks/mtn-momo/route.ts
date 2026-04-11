// MTN MoMo Webhook Handler with Security
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook } from '@/lib/webhook-security';
import { paymentWebhookSchema } from '@/lib/validations/payment';

interface MtnMomoPayload {
  reference: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING' | 'TIMEOUT';
  amount: string;
  currency: string;
  financialTransactionId: string;
  externalId: string;
  reason?: {
    type: string;
    message: string;
  };
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload: MtnMomoPayload = JSON.parse(rawBody);
    
    console.log('[MTN MoMo Webhook] Received:', {
      reference: payload.reference,
      status: payload.status,
      amount: payload.amount,
    });

    // Verify webhook signature and IP
    const verification = verifyWebhook('MTN_MOMO', request, rawBody);
    
    if (!verification.valid) {
      console.error('[MTN MoMo Webhook] Verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Webhook verification failed', details: verification.error },
        { status: 401 }
      );
    }

    console.log('[MTN MoMo Webhook] Verified from IP:', verification.ip);

    // Validate payload structure
    const webhookData = {
      transactionId: payload.reference,
      status: payload.status === 'SUCCESSFUL' ? 'success' : 
              payload.status === 'FAILED' ? 'failed' : 
              payload.status === 'TIMEOUT' ? 'failed' : 'pending',
      amount: parseFloat(payload.amount),
      currency: payload.currency,
      timestamp: payload.timestamp || new Date().toISOString(),
      providerReference: payload.financialTransactionId,
    };

    const validation = paymentWebhookSchema.safeParse(webhookData);
    if (!validation.success) {
      console.error('[MTN MoMo Webhook] Invalid payload:', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid payload', details: validation.error.errors },
        { status: 400 }
      );
    }

    // Find payment by reference (transaction ID)
    const payment = await db.payment.findFirst({
      where: { transactionId: payload.reference },
      include: { order: true },
    });

    if (!payment) {
      console.error('[MTN MoMo Webhook] Payment not found:', payload.reference);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Idempotency check
    if (payment.status === 'PAID' || payment.status === 'FAILED') {
      console.log('[MTN MoMo Webhook] Payment already processed:', payment.id, payment.status);
      return NextResponse.json({ 
        success: true, 
        status: payment.status,
        message: 'Payment already processed',
      });
    }

    // Map MTN status to our status
    const status = payload.status === 'SUCCESSFUL' ? 'PAID' :
                   payload.status === 'FAILED' ? 'FAILED' :
                   payload.status === 'TIMEOUT' ? 'FAILED' : 'PENDING';

    // Use transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          processedAt: status === 'PAID' ? new Date() : undefined,
          failedAt: status === 'FAILED' ? new Date() : undefined,
          providerReference: payload.financialTransactionId,
          failureReason: payload.reason?.message,
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
            title: 'Paiement MTN MoMo confirmé',
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
            provider: 'MTN_MOMO',
            status,
            amount: payload.amount,
            financialTransactionId: payload.financialTransactionId,
            reason: payload.reason,
            ipAddress: verification.ip,
          }),
        },
      });

      return updatedPayment;
    });

    console.log('[MTN MoMo Webhook] Order confirmed:', payment.orderId);

    return NextResponse.json({ 
      success: true, 
      status,
      orderId: payment.orderId,
      paymentId: result.id,
    });
  } catch (error) {
    console.error('[MTN MoMo Webhook] Error:', error);
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
    provider: 'MTN MoMo',
    timestamp: new Date().toISOString(),
    features: ['signature_verification', 'ip_whitelist', 'idempotency'],
  });
}
