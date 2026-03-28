// ============================================
// RESTAURANT OS - Mobile Money Payment Service
// Integration with Orange Money, MTN MoMo, Wave
// ============================================

// Types for payment providers
export type PaymentProvider = 'orange_money' | 'mtn_momo' | 'wave' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';

export interface PaymentRequest {
  amount: number;
  currency: string;
  phoneNumber: string;
  provider: PaymentProvider;
  reference: string;
  description?: string;
  orderId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message: string;
  providerReference?: string;
  otpRequired?: boolean;
  ussdCode?: string;
}

export interface PaymentVerification {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  paidAt?: Date;
}

// Configuration
interface PaymentConfig {
  orangeMoney: {
    apiKey: string;
    merchantId: string;
    baseUrl: string;
  };
  mtnMomo: {
    apiKey: string;
    userId: string;
    baseUrl: string;
  };
  wave: {
    apiKey: string;
    baseUrl: string;
  };
}

// Get config from environment
const getConfig = (): PaymentConfig => ({
  orangeMoney: {
    apiKey: process.env.ORANGE_MONEY_API_KEY || '',
    merchantId: process.env.ORANGE_MERCHANT_ID || '',
    baseUrl: 'https://api.orange.com/orange-money-webpay/dev/v1',
  },
  mtnMomo: {
    apiKey: process.env.MTN_MOMO_API_KEY || '',
    userId: process.env.MTN_MOMO_USER_ID || '',
    baseUrl: 'https://momodeveloper.mtn.com/collection/v1_0',
  },
  wave: {
    apiKey: process.env.WAVE_API_KEY || '',
    baseUrl: 'https://api.wave.com/v1',
  },
});

// Validate phone number format for different countries
export function validatePhoneNumber(phone: string, countryCode: string): boolean {
  const patterns: Record<string, RegExp> = {
    CI: /^(\+225|0)?[0-9]{10}$/, // Côte d'Ivoire
    SN: /^(\+221|0)?[0-9]{9}$/,   // Sénégal
    ML: /^(\+223|0)?[0-9]{8}$/,   // Mali
    BF: /^(\+226|0)?[0-9]{8}$/,   // Burkina Faso
    GN: /^(\+224|0)?[0-9]{9}$/,   // Guinée
    CM: /^(\+237|0)?[0-9]{9}$/,   // Cameroun
    GH: /^(\+233|0)?[0-9]{9}$/,   // Ghana
    NG: /^(\+234|0)?[0-9]{10}$/,  // Nigeria
    KE: /^(\+254|0)?[0-9]{9}$/,   // Kenya
  };

  const pattern = patterns[countryCode];
  if (!pattern) return false;
  
  return pattern.test(phone.replace(/\s/g, ''));
}

// Format phone number to international format
export function formatPhoneNumber(phone: string, countryCode: string): string {
  const cleaned = phone.replace(/\s/g, '');
  
  const prefixes: Record<string, string> = {
    CI: '+225',
    SN: '+221',
    ML: '+223',
    BF: '+226',
    GN: '+224',
    CM: '+237',
    GH: '+233',
    NG: '+234',
    KE: '+254',
  };

  const prefix = prefixes[countryCode] || '';
  
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('0')) return prefix + cleaned.slice(1);
  
  return prefix + cleaned;
}

// Detect provider from phone number
export function detectProvider(phone: string): PaymentProvider | null {
  const cleaned = phone.replace(/\D/g, '');
  
  // Côte d'Ivoire prefixes
  if (cleaned.includes('07') || cleaned.includes('08')) {
    // Orange CI: 07, 08
    return 'orange_money';
  }
  if (cleaned.includes('05') || cleaned.includes('06')) {
    // MTN CI: 05, 06
    return 'mtn_momo';
  }
  
  // Sénégal prefixes
  if (cleaned.includes('77') || cleaned.includes('78')) {
    return 'orange_money';
  }
  if (cleaned.includes('70') || cleaned.includes('76')) {
    return 'wave';
  }
  
  return null;
}

// Orange Money Integration
async function initiateOrangeMoneyPayment(
  request: PaymentRequest,
  config: PaymentConfig['orangeMoney']
): Promise<PaymentResponse> {
  try {
    // In production, make actual API call
    // For demo, return mock response
    
    if (!config.apiKey || !config.merchantId) {
      // Demo mode
      return {
        success: true,
        transactionId: `OM_${Date.now()}`,
        status: 'processing',
        message: 'Paiement Orange Money initié',
        otpRequired: true,
        ussdCode: '#144#',
      };
    }

    const response = await fetch(`${config.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: config.merchantId,
        amount: request.amount,
        currency: request.currency,
        phone_number: request.phoneNumber,
        reference: request.reference,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      transactionId: data.transaction_id,
      status: 'processing',
      message: 'Paiement initié. Veuillez confirmer sur votre téléphone.',
      providerReference: data.provider_ref,
      otpRequired: true,
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Erreur lors de l\'initiation du paiement Orange Money',
    };
  }
}

// MTN MoMo Integration
async function initiateMtnMomoPayment(
  request: PaymentRequest,
  config: PaymentConfig['mtnMomo']
): Promise<PaymentResponse> {
  try {
    if (!config.apiKey || !config.userId) {
      // Demo mode
      return {
        success: true,
        transactionId: `MTN_${Date.now()}`,
        status: 'processing',
        message: 'Paiement MTN MoMo initié',
        otpRequired: true,
        ussdCode: '*126#',
      };
    }

    const response = await fetch(`${config.baseUrl}/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'X-Reference-Id': request.reference,
        'X-Target-Environment': 'production',
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': config.userId,
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        externalId: request.reference,
        payer: {
          partyIdType: 'MSISDN',
          partyId: request.phoneNumber,
        },
        payerMessage: request.description || 'Paiement Restaurant OS',
        payeeNote: `Commande ${request.orderId || ''}`,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        transactionId: request.reference,
        status: 'processing',
        message: 'Demande de paiement envoyée. Confirmez sur votre téléphone.',
        providerReference: request.reference,
      };
    }

    return {
      success: false,
      status: 'failed',
      message: 'Erreur MTN MoMo',
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Erreur lors de l\'initiation du paiement MTN MoMo',
    };
  }
}

// Wave Integration
async function initiateWavePayment(
  request: PaymentRequest,
  config: PaymentConfig['wave']
): Promise<PaymentResponse> {
  try {
    if (!config.apiKey) {
      // Demo mode
      return {
        success: true,
        transactionId: `WAVE_${Date.now()}`,
        status: 'processing',
        message: 'Paiement Wave initié',
        ussdCode: '*145#',
      };
    }

    const response = await fetch(`${config.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: request.amount,
        currency: request.currency,
        phone: request.phoneNumber,
        reference: request.reference,
      }),
    });

    const data = await response.json();

    return {
      success: true,
      transactionId: data.id,
      status: 'processing',
      message: 'Paiement Wave initié. Confirmez sur votre application Wave.',
      providerReference: data.reference,
    };
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Erreur lors de l\'initiation du paiement Wave',
    };
  }
}

// Main payment initiation function
export async function initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
  const config = getConfig();

  switch (request.provider) {
    case 'orange_money':
      return initiateOrangeMoneyPayment(request, config.orangeMoney);
    case 'mtn_momo':
      return initiateMtnMomoPayment(request, config.mtnMomo);
    case 'wave':
      return initiateWavePayment(request, config.wave);
    case 'cash':
      return {
        success: true,
        transactionId: `CASH_${Date.now()}`,
        status: 'success',
        message: 'Paiement en espèces enregistré',
      };
    default:
      return {
        success: false,
        status: 'failed',
        message: 'Provider non supporté',
      };
  }
}

// Verify payment status
export async function verifyPayment(
  transactionId: string,
  provider: PaymentProvider
): Promise<PaymentVerification> {
  const config = getConfig();

  // In production, query the provider's API
  // For demo, return mock success
  
  return {
    transactionId,
    status: 'success',
    amount: 0, // Would be fetched from provider
    paidAt: new Date(),
  };
}

// Calculate fees
export function calculatePaymentFees(
  amount: number,
  provider: PaymentProvider
): { fee: number; total: number } {
  const feeRates: Record<PaymentProvider, number> = {
    orange_money: 0.02, // 2%
    mtn_momo: 0.019,    // 1.9%
    wave: 0.01,         // 1%
    cash: 0,            // No fee
  };

  const fee = Math.ceil(amount * feeRates[provider]);
  const total = amount + fee;

  return { fee, total };
}

// Export utility functions and types
export const paymentService = {
  initiatePayment,
  verifyPayment,
  calculatePaymentFees,
  validatePhoneNumber,
  formatPhoneNumber,
  detectProvider,
};
