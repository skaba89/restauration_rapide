// ============================================
// Restaurant OS - Mobile Money Webhooks
// Production handlers for African payment providers
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// TYPES
// ============================================

interface WebhookPayload {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  currency: string;
  phoneNumber: string;
  orderId?: string;
  reference: string;
  timestamp: string;
  [key: string]: unknown;
}

// ============================================
// ORANGE MONEY WEBHOOK
// ============================================

export async function handleOrangeMoneyWebhook(
  request: NextRequest
): Promise<NextResponse> {
  const rawBody = await request.text();
  
  try {
    const payload: WebhookPayload = JSON.parse(rawBody);
    
    // Verify signature
    const signature = request.headers.get('x-orange-signature');
    const secret = process.env.ORANGE_MONEY_WEBHOOK_SECRET;
    
    if (!signature || !verifyOrangeSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('[Orange Money Webhook] Received:', payload.transactionId, payload.status);
    
    return processPaymentWebhook(payload, 'ORANGE_MONEY');
  } catch (error) {
    console.error('[Orange Money Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function verifyOrangeSignature(
  payload: string,
  signature: string,
  secret: string | undefined
): boolean {
  if (!secret) return true; // Skip in demo mode
  
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}

// ============================================
// MTN MOBILE MONEY WEBHOOK
// ============================================

export async function handleMtnMomoWebhook(
  request: NextRequest
): Promise<NextResponse> {
  const rawBody = await request.text();
  
  try {
    const payload: WebhookPayload = JSON.parse(rawBody);
    
    const signature = request.headers.get('x-mtn-signature');
    const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
    
    if (!signature || !verifyMtnSignature(rawBody, signature, subscriptionKey)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('[MTN MoMo Webhook] Received:', payload.transactionId, payload.status);
    
    return processPaymentWebhook(payload, 'MTN_MOMO');
  } catch (error) {
    console.error('[MTN MoMo Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function verifyMtnSignature(
  payload: string,
  signature: string,
  subscriptionKey: string | undefined
): boolean {
  if (!subscriptionKey) return true;
  return signature === subscriptionKey;
}

// ============================================
// WAVE WEBHOOK
// ============================================

export async function handleWaveWebhook(
  request: NextRequest
): Promise<NextResponse> {
  const rawBody = await request.text();
  
  try {
    const payload: WebhookPayload = JSON.parse(rawBody);
    
    const signature = request.headers.get('wave-signature');
    const secret = process.env.WAVE_WEBHOOK_SECRET;
    
    if (!signature || !verifyWaveSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    console.log('[Wave Webhook] Received:', payload.transactionId, payload.status);
    
    return processPaymentWebhook(payload, 'WAVE');
  } catch (error) {
    console.error('[Wave Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function verifyWaveSignature(
  payload: string,
  signature: string,
  secret: string | undefined
): boolean {
  if (!secret) return true;
  
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

// ============================================
// MPESA WEBHOOK
// ============================================

export async function handleMpesaWebhook(
  request: NextRequest
): Promise<NextResponse> {
  const rawBody = await request.text();
  
  try {
    const payload = JSON.parse(rawBody);
    
    // MPesa STK Push callback format
    const stkCallback = payload.Body?.stkCallback;
    
    if (!stkCallback) {
      return NextResponse.json({ error: 'Invalid MPesa format' }, { status: 400 });
    }
    
    const result: WebhookPayload = {
      transactionId: stkCallback.CheckoutRequestID,
      status: stkCallback.ResultCode === 0 ? 'SUCCESS' : 'FAILED',
      amount: stkCallback.CallbackMetadata?.Item?.find((i: any) => i.Name === 'Amount')?.Value || 0,
      currency: 'KES',
      phoneNumber: stkCallback.CallbackMetadata?.Item?.find((i: any) => i.Name === 'PhoneNumber')?.Value?.toString() || '',
      reference: stkCallback.MerchantRequestID,
      timestamp: new Date().toISOString(),
    };

    console.log('[MPesa Webhook] Received:', result.transactionId, result.status);
    
    return processPaymentWebhook(result, 'MPESA');
  } catch (error) {
    console.error('[MPesa Webhook] Error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

// ============================================
// GENERIC PAYMENT PROCESSOR
// ============================================

async function processPaymentWebhook(
  payload: WebhookPayload,
  provider: string
): Promise<NextResponse> {
  try {
    // Find the payment by provider reference
    const payment = await db.payment.findFirst({
      where: {
        providerRef: payload.reference,
        method: provider as any,
      },
      include: {
        order: true,
      },
    });

    if (!payment) {
      const altPayment = await db.payment.findFirst({
        where: { transactionId: payload.transactionId },
        include: { order: true },
      });

      if (!altPayment) {
        console.warn(`[${provider}] Payment not found:`, payload.reference);
        return NextResponse.json({ 
          success: false, 
          message: 'Payment not found',
        }, { status: 404 });
      }
    }

    const targetPayment = payment || altPayment;

    // Check if already processed
    if (targetPayment.status === 'PAID' || targetPayment.status === 'FAILED') {
      return NextResponse.json({ 
        success: true, 
        message: 'Already processed',
      });
    }

    // Map status
    const statusMap: Record<string, string> = {
      'SUCCESS': 'PAID',
      'FAILED': 'FAILED',
      'CANCELLED': 'FAILED',
      'PENDING': 'PENDING',
    };

    const newStatus = statusMap[payload.status] || 'PENDING';

    // Update payment and order in transaction
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: targetPayment.id },
        data: {
          status: newStatus as any,
          processedAt: newStatus === 'PAID' ? new Date() : undefined,
          failedAt: newStatus === 'FAILED' ? new Date() : undefined,
          failureReason: newStatus === 'FAILED' ? 'Payment failed at provider' : undefined,
          transactionId: payload.transactionId,
          providerRef: payload.reference,
        },
      });

      if (newStatus === 'PAID' && targetPayment.order) {
        await tx.order.update({
          where: { id: targetPayment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            confirmedAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: targetPayment.orderId!,
            status: 'CONFIRMED',
            notes: `Payment confirmed via ${provider}`,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment processed',
      orderId: targetPayment.orderId,
      paymentId: targetPayment.id,
      status: newStatus,
    });
  } catch (error) {
    console.error(`[${provider}] Processing error:`, error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export {
  handleOrangeMoneyWebhook,
  handleMtnMomoWebhook,
  handleWaveWebhook,
  handleMpesaWebhook,
};
