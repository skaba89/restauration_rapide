// Mobile Money Payment Integration
// Handles Orange Money, MTN MoMo, Wave, M-Pesa integrations

import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-responses';

// Payment provider configurations
export const PAYMENT_PROVIDERS = {
  ORANGE_MONEY: {
    name: 'Orange Money',
    code: 'MOBILE_MONEY_ORANGE',
    countries: ['CI', 'SN', 'ML', 'BF', 'GN'],
    currencies: ['XOF', 'XAF'],
    apiBaseUrl: process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay',
    merchantId: process.env.ORANGE_MONEY_MERCHANT_ID,
    apiKey: process.env.ORANGE_MONEY_API_KEY,
    secretKey: process.env.ORANGE_MONEY_SECRET_KEY,
    webhookSecret: process.env.ORANGE_MONEY_WEBHOOK_SECRET,
  },
  MTN_MOMO: {
    name: 'MTN Mobile Money',
    code: 'MOBILE_MONEY_MTN',
    countries: ['CI', 'BJ', 'TG', 'GW', 'CM', 'GH', 'UG'],
    currencies: ['XOF', 'XAF', 'GHS', 'UGX'],
    apiBaseUrl: process.env.MTN_MOMO_API_URL || 'https://momodeveloper.mtn.com',
    subscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY,
    apiKey: process.env.MTN_MOMO_API_KEY,
    userId: process.env.MTN_MOMO_USER_ID,
    webhookSecret: process.env.MTN_MOMO_WEBHOOK_SECRET,
  },
  WAVE: {
    name: 'Wave',
    code: 'MOBILE_MONEY_WAVE',
    countries: ['CI', 'SN'],
    currencies: ['XOF'],
    apiBaseUrl: process.env.WAVE_API_URL || 'https://api.wave.com',
    apiKey: process.env.WAVE_API_KEY,
    webhookSecret: process.env.WAVE_WEBHOOK_SECRET,
  },
  MPESA: {
    name: 'M-Pesa',
    code: 'MOBILE_MONEY_MPESA',
    countries: ['KE', 'CD', 'CG', 'MZ', 'TZ', 'UG', 'RW'],
    currencies: ['KES', 'CDF', 'CDF', 'MZN', 'TZS', 'UGX', 'RWF'],
    apiBaseUrl: process.env.MPESA_API_URL || 'https://api.safaricom.co.ke',
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    passkey: process.env.MPESA_PASSKEY,
    shortcode: process.env.MPESA_SHORTCODE,
    webhookSecret: process.env.MPESA_WEBHOOK_SECRET,
  },
  MOOV: {
    name: 'Moov Money',
    code: 'MOBILE_MONEY_MOOV',
    countries: ['BJ', 'TG', 'CI', 'BF', 'NE'],
    currencies: ['XOF'],
    apiBaseUrl: process.env.MOOV_API_URL || 'https://api.moov-africa.com',
    apiKey: process.env.MOOV_API_KEY,
    merchantId: process.env.MOOV_MERCHANT_ID,
    webhookSecret: process.env.MOOV_WEBHOOK_SECRET,
  },
} as const;

export type PaymentProvider = keyof typeof PAYMENT_PROVIDERS;

// Payment request interface
interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  phone: string;
  provider: PaymentProvider;
  callbackUrl: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// Payment response interface
interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  message: string;
  checkoutUrl?: string;
  ussdCode?: string;
  reference?: string;
}

// Webhook payload interfaces
interface OrangeMoneyWebhook {
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

interface MtnMomoWebhook {
  reference: string;
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  amount: string;
  currency: string;
  financialTransactionId: string;
  externalId: string;
  reason: {
    type: string;
    message: string;
  };
}

interface WaveWebhook {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  amount: string;
  currency: string;
  client_reference: string;
  timestamp: string;
}

interface MpesaWebhook {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

/**
 * Detect provider from phone number
 */
export function detectProviderFromPhone(phone: string, country: string = 'CI'): PaymentProvider | null {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Cote d'Ivoire prefixes
  if (country === 'CI') {
    if (/^(225)?(07|08|09|77|78|79)/.test(cleanPhone)) {
      // Orange: 07, 08, 77, 78, 79
      return 'ORANGE_MONEY';
    }
    if (/^(225)?(05|06|45|46|47|55|56|57|58|59)/.test(cleanPhone)) {
      // MTN: 05, 06, 45-47, 55-59
      return 'MTN_MOMO';
    }
    if (/^(225)?(01|02|03|04|84|85|86|87)/.test(cleanPhone)) {
      // Moov: 01-04, 84-87
      return 'MOOV';
    }
  }
  
  // Senegal prefixes
  if (country === 'SN') {
    if (/^(221)?(77|78)/.test(cleanPhone)) {
      return 'ORANGE_MONEY';
    }
    if (/^(221)?(70|76)/.test(cleanPhone)) {
      return 'WAVE';
    }
  }
  
  // Kenya - M-Pesa
  if (country === 'KE' && /^(254)?(7[0-9])/.test(cleanPhone)) {
    return 'MPESA';
  }
  
  return null;
}

/**
 * Initiate Orange Money payment
 */
export async function initiateOrangeMoneyPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = PAYMENT_PROVIDERS.ORANGE_MONEY;
  
  try {
    // Generate payment token
    const response = await fetch(`${config.apiBaseUrl}/api/v1/webpayment/mp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Merchant-Id': config.merchantId || '',
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        order_id: request.orderId,
        return_url: request.callbackUrl,
        cancel_url: `${request.callbackUrl}?cancelled=true`,
        notif_url: `${process.env.BASE_URL}/api/webhooks/orange-money`,
        reference: request.orderId,
        lang: 'fr',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Orange Money payment initiation failed');
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: request.orderId,
        amount: request.amount,
        currencyId: request.currency,
        method: 'MOBILE_MONEY_ORANGE',
        provider: 'ORANGE_MONEY',
        transactionId: data.pay_token,
        phoneNumber: request.phone,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      transactionId: data.pay_token,
      status: 'pending',
      message: 'Paiement Orange Money initie. Veuillez confirmer sur votre telephone.',
      checkoutUrl: data.payment_url,
      ussdCode: '#144#',
    };
  } catch (error) {
    console.error('[Orange Money] Payment error:', error);
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur de paiement Orange Money',
    };
  }
}

/**
 * Initiate MTN MoMo payment
 */
export async function initiateMtnMomoPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = PAYMENT_PROVIDERS.MTN_MOMO;
  const transactionId = `mtn-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
  try {
    // Request to pay
    const response = await fetch(`${config.apiBaseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Reference-Id': transactionId,
        'X-Target-Environment': 'production',
        'Ocp-Apim-Subscription-Key': config.subscriptionKey || '',
      },
      body: JSON.stringify({
        amount: request.amount.toString(),
        currency: request.currency,
        externalId: request.orderId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: request.phone.replace(/\D/g, '').slice(-10),
        },
        payerMessage: request.description || `Commande ${request.orderId}`,
        payeeNote: request.metadata?.note || '',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'MTN MoMo payment failed');
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: request.orderId,
        amount: request.amount,
        currencyId: request.currency,
        method: 'MOBILE_MONEY_MTN',
        provider: 'MTN_MOMO',
        transactionId,
        phoneNumber: request.phone,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      transactionId,
      status: 'pending',
      message: 'Demande de paiement MTN MoMo envoyee. Veuillez confirmer sur votre telephone.',
      ussdCode: '*400#',
    };
  } catch (error) {
    console.error('[MTN MoMo] Payment error:', error);
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur de paiement MTN MoMo',
    };
  }
}

/**
 * Initiate Wave payment
 */
export async function initiateWavePayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = PAYMENT_PROVIDERS.WAVE;
  
  try {
    const response = await fetch(`${config.apiBaseUrl}/v1/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        amount: request.amount.toString(),
        currency: request.currency,
        error_url: `${request.callbackUrl}?error=true`,
        success_url: request.callbackUrl,
        client_reference: request.orderId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Wave payment failed');
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: request.orderId,
        amount: request.amount,
        currencyId: request.currency,
        method: 'MOBILE_MONEY_WAVE',
        provider: 'WAVE',
        transactionId: data.id,
        phoneNumber: request.phone,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      transactionId: data.id,
      status: 'pending',
      message: 'Paiement Wave initie.',
      checkoutUrl: data.wave_launch_url,
      ussdCode: '*99#',
    };
  } catch (error) {
    console.error('[Wave] Payment error:', error);
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur de paiement Wave',
    };
  }
}

/**
 * Initiate M-Pesa STK Push
 */
export async function initiateMpesaPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const config = PAYMENT_PROVIDERS.MPESA;
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${config.shortcode}${config.passkey}${timestamp}`
  ).toString('base64');
  
  try {
    const response = await fetch(
      `${config.apiBaseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          BusinessShortCode: config.shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: request.amount,
          PartyA: request.phone.replace(/\D/g, '').slice(-10),
          PartyB: config.shortcode,
          PhoneNumber: request.phone.replace(/\D/g, '').slice(-10),
          CallBackURL: `${process.env.BASE_URL}/api/webhooks/mpesa`,
          AccountReference: request.orderId,
          TransactionDesc: request.description || `Order ${request.orderId}`,
        }),
      }
    );

    const data = await response.json();

    if (data.ResponseCode !== '0') {
      throw new Error(data.ResponseDescription || 'M-Pesa payment failed');
    }

    // Create payment record
    await db.payment.create({
      data: {
        orderId: request.orderId,
        amount: request.amount,
        currencyId: request.currency,
        method: 'MOBILE_MONEY_MPESA',
        provider: 'MPESA',
        transactionId: data.CheckoutRequestID,
        phoneNumber: request.phone,
        status: 'PENDING',
        metadata: {
          merchantRequestId: data.MerchantRequestID,
        },
      },
    });

    return {
      success: true,
      transactionId: data.CheckoutRequestID,
      status: 'pending',
      message: 'Demande M-Pesa envoyee. Veuillez entrer votre PIN.',
    };
  } catch (error) {
    console.error('[M-Pesa] Payment error:', error);
    return {
      success: false,
      status: 'failed',
      message: error instanceof Error ? error.message : 'Erreur de paiement M-Pesa',
    };
  }
}

/**
 * Generic payment initiation function
 */
export async function initiatePayment(
  provider: PaymentProvider,
  request: PaymentRequest
): Promise<PaymentResponse> {
  switch (provider) {
    case 'ORANGE_MONEY':
      return initiateOrangeMoneyPayment(request);
    case 'MTN_MOMO':
      return initiateMtnMomoPayment(request);
    case 'WAVE':
      return initiateWavePayment(request);
    case 'MPESA':
      return initiateMpesaPayment(request);
    default:
      return {
        success: false,
        status: 'failed',
        message: `Provider ${provider} not supported`,
      };
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  provider: PaymentProvider,
  payload: string,
  signature: string
): boolean {
  const config = PAYMENT_PROVIDERS[provider];
  if (!config.webhookSecret) {
    console.warn(`[Webhook] No secret configured for ${provider}`);
    return true; // Skip verification if no secret configured
  }
  
  // Implementation depends on provider's signature method
  // This is a placeholder - implement actual HMAC verification
  return signature === config.webhookSecret;
}

/**
 * Process webhook for Orange Money
 */
export async function processOrangeMoneyWebhook(payload: OrangeMoneyWebhook) {
  const payment = await db.payment.findFirst({
    where: { transactionId: payload.transaction_id },
    include: { order: true },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${payload.transaction_id}`);
  }

  const status = payload.status === 'SUCCESS' ? 'PAID' :
                 payload.status === 'FAILED' ? 'FAILED' :
                 payload.status === 'CANCELLED' ? 'CANCELLED' : 'PENDING';

  // Update payment
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status,
      processedAt: status === 'PAID' ? new Date() : undefined,
      failedAt: status === 'FAILED' ? new Date() : undefined,
      providerReference: payload.pay_token,
      metadata: {
        notifToken: payload.notif_token,
        phoneNumber: payload.phone_number,
      },
    },
  });

  // Update order if paid
  if (status === 'PAID' && payment.order) {
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  }

  return { success: true, status };
}

/**
 * Process webhook for MTN MoMo
 */
export async function processMtnMomoWebhook(payload: MtnMomoWebhook) {
  const payment = await db.payment.findFirst({
    where: { transactionId: payload.reference },
    include: { order: true },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${payload.reference}`);
  }

  const status = payload.status === 'SUCCESSFUL' ? 'PAID' :
                 payload.status === 'FAILED' ? 'FAILED' : 'PENDING';

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status,
      processedAt: status === 'PAID' ? new Date() : undefined,
      failedAt: status === 'FAILED' ? new Date() : undefined,
      providerReference: payload.financialTransactionId,
      failureReason: payload.reason?.message,
    },
  });

  if (status === 'PAID' && payment.order) {
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  }

  return { success: true, status };
}

/**
 * Process webhook for Wave
 */
export async function processWaveWebhook(payload: WaveWebhook) {
  const payment = await db.payment.findFirst({
    where: { transactionId: payload.id },
    include: { order: true },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${payload.id}`);
  }

  const status = payload.status === 'succeeded' ? 'PAID' :
                 payload.status === 'failed' ? 'FAILED' : 'PENDING';

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status,
      processedAt: status === 'PAID' ? new Date() : undefined,
      failedAt: status === 'FAILED' ? new Date() : undefined,
    },
  });

  if (status === 'PAID' && payment.order) {
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  }

  return { success: true, status };
}

/**
 * Process webhook for M-Pesa
 */
export async function processMpesaWebhook(payload: MpesaWebhook) {
  const checkoutId = payload.Body.stkCallback.CheckoutRequestID;
  const resultCode = payload.Body.stkCallback.ResultCode;
  
  const payment = await db.payment.findFirst({
    where: { transactionId: checkoutId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${checkoutId}`);
  }

  const status = resultCode === 0 ? 'PAID' : 'FAILED';
  const metadata: Record<string, unknown> = {};

  // Extract metadata from callback
  if (payload.Body.stkCallback.CallbackMetadata) {
    payload.Body.stkCallback.CallbackMetadata.Item.forEach((item) => {
      metadata[item.Name] = item.Value;
    });
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status,
      processedAt: status === 'PAID' ? new Date() : undefined,
      failedAt: status === 'FAILED' ? new Date() : undefined,
      providerReference: metadata.MpesaReceiptNumber as string || undefined,
      failureReason: payload.Body.stkCallback.ResultDesc,
      metadata,
    },
  });

  if (status === 'PAID' && payment.order) {
    await db.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });
  }

  return { success: true, status };
}

// Export provider list for UI
export const availableProviders = Object.entries(PAYMENT_PROVIDERS).map(([key, config]) => ({
  id: key,
  name: config.name,
  code: config.code,
  countries: config.countries,
  currencies: config.currencies,
}));
