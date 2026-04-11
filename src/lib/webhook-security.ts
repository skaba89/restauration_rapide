// ============================================
// Restaurant OS - Webhook Security Utilities
// Signature verification for Mobile Money providers
// ============================================

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Webhook signature verification configuration
 */
export const WEBHOOK_SECRETS = {
  ORANGE_MONEY: process.env.ORANGE_MONEY_WEBHOOK_SECRET || 'om_webhook_secret_dev',
  MTN_MOMO: process.env.MTN_MOMO_SUBSCRIPTION_KEY || 'mtn_momo_secret_dev',
  WAVE: process.env.WAVE_WEBHOOK_SECRET || 'wave_webhook_secret_dev',
  MPESA: process.env.MPESA_PASSKEY || 'mpesa_passkey_dev',
} as const;

/**
 * Verify Orange Money webhook signature
 * Orange Money uses HMAC-SHA256 signature in X-Orange-Signature header
 */
export function verifyOrangeMoneySignature(
  payload: string,
  signature: string | null,
  secret: string = WEBHOOK_SECRETS.ORANGE_MONEY
): boolean {
  if (!signature) return false;
  
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    // Timing-safe comparison to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(signature.toLowerCase()),
      Buffer.from(expectedSignature.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Verify MTN MoMo webhook signature
 * MTN MoMo uses X-Mtn-Signature header with HMAC-SHA256
 */
export function verifyMtnMomoSignature(
  payload: string,
  signature: string | null,
  secret: string = WEBHOOK_SECRETS.MTN_MOMO
): boolean {
  if (!signature) return false;
  
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signature.toLowerCase()),
      Buffer.from(expectedSignature.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Verify Wave webhook signature
 * Wave uses Wave-Signature header with HMAC-SHA256
 */
export function verifyWaveSignature(
  payload: string,
  signature: string | null,
  secret: string = WEBHOOK_SECRETS.WAVE
): boolean {
  if (!signature) return false;
  
  try {
    // Wave sends signature in format: t=timestamp,v1=signature
    const parts = signature.split(',');
    let signaturePart = '';
    
    for (const part of parts) {
      if (part.startsWith('v1=')) {
        signaturePart = part.substring(3);
        break;
      }
    }
    
    if (!signaturePart) return false;
    
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signaturePart.toLowerCase()),
      Buffer.from(expectedSignature.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Verify M-Pesa STK Push callback signature
 * M-Pesa uses LipaNaMpesa Passkey for verification
 */
export function verifyMpesaSignature(
  merchantRequestId: string,
  checkoutRequestId: string,
  resultCode: number,
  amount: number,
  mpesaReceiptNumber: string,
  transactionDate: string,
  phoneNumber: string,
  shortCode: string,
  passkey: string = WEBHOOK_SECRETS.MPESA
): string {
  // M-Pesa password is base64(ShortCode + Passkey + Timestamp)
  const timestamp = transactionDate.substring(0, 14); // Format: YYYYMMDDHHmmss
  const passwordString = `${shortCode}${passkey}${timestamp}`;
  const password = Buffer.from(passwordString).toString('base64');
  
  return password;
}

/**
 * Generic webhook signature verification
 */
export function verifyWebhookSignature(
  provider: 'ORANGE_MONEY' | 'MTN_MOMO' | 'WAVE' | 'MPESA',
  payload: string,
  signature: string | null,
  additionalParams?: Record<string, unknown>
): boolean {
  switch (provider) {
    case 'ORANGE_MONEY':
      return verifyOrangeMoneySignature(payload, signature);
    case 'MTN_MOMO':
      return verifyMtnMomoSignature(payload, signature);
    case 'WAVE':
      return verifyWaveSignature(payload, signature);
    case 'MPESA':
      // M-Pesa has different verification method
      if (additionalParams) {
        const password = verifyMpesaSignature(
          additionalParams.merchantRequestId as string || '',
          additionalParams.checkoutRequestId as string || '',
          additionalParams.resultCode as number || 0,
          additionalParams.amount as number || 0,
          additionalParams.mpesaReceiptNumber as string || '',
          additionalParams.transactionDate as string || '',
          additionalParams.phoneNumber as string || '',
          additionalParams.shortCode as string || ''
        );
        return password === additionalParams.expectedPassword;
      }
      return false;
    default:
      return false;
  }
}

/**
 * Extract IP address from request for IP whitelisting
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cloudflareIp = request.headers.get('cf-connecting-ip');
  
  if (cloudflareIp) return cloudflareIp;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  
  return 'unknown';
}

/**
 * IP whitelist for webhook providers
 * These are the IP ranges for Mobile Money providers
 */
export const WEBHOOK_IP_WHITELIST = {
  ORANGE_MONEY: [
    // Orange CI IP ranges (example - update with actual IPs)
    '41.202.0.0/16',
    '41.207.0.0/16',
    '196.200.0.0/16',
  ],
  MTN_MOMO: [
    // MTN IP ranges (example - update with actual IPs)
    '41.206.0.0/16',
    '196.216.0.0/16',
  ],
  WAVE: [
    // Wave IP ranges (example - update with actual IPs)
    '34.0.0.0/8', // Google Cloud (Wave's infrastructure)
  ],
  MPESA: [
    // Safaricom/M-Pesa IP ranges (example - update with actual IPs)
    '196.201.0.0/16',
    '197.237.0.0/16',
  ],
} as const;

/**
 * Check if IP is in CIDR range
 */
function isIpInCidr(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = parseInt(bits, 10);
  
  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  const rangeNum = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
  const maskNum = ~((1 << (32 - mask)) - 1) >>> 0;
  
  return (ipNum & maskNum) === (rangeNum & maskNum);
}

/**
 * Check if IP is whitelisted for a provider
 */
export function isIpWhitelisted(
  ip: string,
  provider: keyof typeof WEBHOOK_IP_WHITELIST
): boolean {
  // In development, skip IP check
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  const whitelist = WEBHOOK_IP_WHITELIST[provider];
  return whitelist.some(cidr => isIpInCidr(ip, cidr));
}

/**
 * Webhook verification result
 */
export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
  ip?: string;
  provider?: string;
}

/**
 * Full webhook verification including signature and IP
 */
export function verifyWebhook(
  provider: 'ORANGE_MONEY' | 'MTN_MOMO' | 'WAVE' | 'MPESA',
  request: Request,
  payload: string
): WebhookVerificationResult {
  const ip = getClientIp(request);
  
  // Check IP whitelist
  if (!isIpWhitelisted(ip, provider)) {
    return {
      valid: false,
      error: `IP ${ip} is not whitelisted for ${provider}`,
      ip,
    };
  }
  
  // Get signature from appropriate header
  const signatureHeaders: Record<string, string> = {
    ORANGE_MONEY: 'x-orange-signature',
    MTN_MOMO: 'x-mtn-signature',
    WAVE: 'wave-signature',
    MPESA: 'x-mpesa-signature',
  };
  
  const signature = request.headers.get(signatureHeaders[provider]);
  
  // Verify signature
  if (!verifyWebhookSignature(provider, payload, signature)) {
    return {
      valid: false,
      error: 'Invalid webhook signature',
      ip,
      provider,
    };
  }
  
  return {
    valid: true,
    ip,
    provider,
  };
}
