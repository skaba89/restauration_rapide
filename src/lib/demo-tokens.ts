// ============================================
// Restaurant OS - Demo Token System
// Self-contained tokens that work across
// serverless instances without shared storage
// ============================================

import { createHmac } from 'crypto';

// Shared secret for demo token signing
// In production with DEMO_MODE=true, set DEMO_TOKEN_SECRET env var
const DEMO_TOKEN_SECRET = process.env.DEMO_TOKEN_SECRET || 'kfm-delice-demo-secret-2024';
const DEMO_TOKEN_PREFIX = 'demo_v1.';
const TOKEN_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface DemoTokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number; // expiry timestamp in ms
}

/**
 * Create a self-contained demo token
 * Encodes user identity + expiry in the token itself
 */
export function createDemoToken(user: {
  id: string;
  email: string;
  role: string;
}): string {
  const payload: DemoTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + TOKEN_DURATION_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = createHmac('sha256', DEMO_TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${DEMO_TOKEN_PREFIX}${payloadB64}.${signature}`;
}

/**
 * Validate and decode a self-contained demo token
 * Returns user identity if valid, null otherwise
 */
export function validateDemoToken(token: string): DemoTokenPayload | null {
  if (!token.startsWith(DEMO_TOKEN_PREFIX)) {
    return null;
  }

  try {
    const tokenWithoutPrefix = token.slice(DEMO_TOKEN_PREFIX.length);
    const lastDotIndex = tokenWithoutPrefix.lastIndexOf('.');

    if (lastDotIndex === -1) return null;

    const payloadB64 = tokenWithoutPrefix.slice(0, lastDotIndex);
    const signature = tokenWithoutPrefix.slice(lastDotIndex + 1);

    // Verify signature
    const expectedSignature = createHmac('sha256', DEMO_TOKEN_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      console.warn('[DEMO_TOKEN] Invalid signature');
      return null;
    }

    // Decode payload
    const payload: DemoTokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf-8')
    );

    // Check expiry
    if (payload.exp < Date.now()) {
      console.warn('[DEMO_TOKEN] Token expired');
      return null;
    }

    return payload;
  } catch (error) {
    console.warn('[DEMO_TOKEN] Failed to decode:', error);
    return null;
  }
}

/**
 * Check if a token is a demo token
 */
export function isDemoToken(token: string): boolean {
  return token.startsWith(DEMO_TOKEN_PREFIX);
}

/**
 * Get expiry date from demo token
 */
export function getDemoTokenExpiry(token: string): Date | null {
  const payload = validateDemoToken(token);
  return payload ? new Date(payload.exp) : null;
}
