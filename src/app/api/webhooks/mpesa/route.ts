// M-Pesa Webhook Handler (STK Push Callback) with Security
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook } from '@/lib/webhook-security';

interface MpesaCallbackItem {
  Name: string;
  Value: string | number;
}

interface MpesaPayload {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MpesaCallbackItem[];
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const payload: MpesaPayload = JSON.parse(rawBody);
    
    console.log('[M-Pesa Webhook] Received:', JSON.stringify(payload, null, 2));

    // Verify webhook signature and IP
    const verification = verifyWebhook('MPESA', request, rawBody);
    
    if (!verification.valid) {
      console.error('[M-Pesa Webhook] Verification failed:', verification.error);
      return NextResponse.json(
        { error: 'Webhook verification failed', details: verification.error },
        { status: 401 }
      );
    }

    console.log('[M-Pesa Webhook] Verified from IP:', verification.ip);

    const { stkCallback } = payload.Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Extract metadata from callback
    const metadata: Record<string, unknown> = {};
    if (CallbackMetadata?.Item) {
      CallbackMetadata.Item.forEach((item) => {
        metadata[item.Name] = item.Value;
      });
    }

    // Find payment by checkout request ID
    const payment = await db.payment.findFirst({
      where: { transactionId: CheckoutRequestID },
      include: { order: true },
    });

    if (!payment) {
      console.error('[M-Pesa Webhook] Payment not found:', CheckoutRequestID);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Idempotency check
    if (payment.status === 'PAID' || payment.status === 'FAILED') {
      console.log('[M-Pesa Webhook] Payment already processed:', payment.id, payment.status);
      return NextResponse.json({ 
        success: true, 
        status: payment.status,
        message: 'Payment already processed',
      });
    }

    // ResultCode 0 = Success, anything else = Failure
    const status = ResultCode === 0 ? 'PAID' : 'FAILED';

    // Use transaction for atomic updates
    const result = await db.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status,
          processedAt: status === 'PAID' ? new Date() : undefined,
          failedAt: status === 'FAILED' ? new Date() : undefined,
          providerReference: metadata.MpesaReceiptNumber as string || undefined,
          failureReason: ResultDesc,
          metadata: {
            ...payment.metadata as Record<string, unknown>,
            mpesa: metadata,
            merchantRequestId: stkCallback.MerchantRequestID,
            resultCode: ResultCode,
          },
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
            title: 'Paiement M-Pesa confirmé',
            message: `Votre paiement M-Pesa a été confirmé. Reçu: ${metadata.MpesaReceiptNumber || 'N/A'}`,
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
            provider: 'MPESA',
            status,
            resultCode: ResultCode,
            resultDesc: ResultDesc,
            mpesaReceiptNumber: metadata.MpesaReceiptNumber,
            transactionDate: metadata.TransactionDate,
            phoneNumber: metadata.PhoneNumber,
            ipAddress: verification.ip,
          }),
        },
      });

      return updatedPayment;
    });

    console.log('[M-Pesa Webhook] Order confirmed:', payment.orderId);
    if (metadata.MpesaReceiptNumber) {
      console.log('[M-Pesa Webhook] M-Pesa Receipt:', metadata.MpesaReceiptNumber);
    }

    return NextResponse.json({ 
      success: true, 
      status,
      orderId: payment.orderId,
      paymentId: result.id,
      receiptNumber: metadata.MpesaReceiptNumber,
    });
  } catch (error) {
    console.error('[M-Pesa Webhook] Error:', error);
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
    provider: 'M-Pesa',
    timestamp: new Date().toISOString(),
    features: ['signature_verification', 'ip_whitelist', 'idempotency', 'stk_push_callback'],
  });
}
