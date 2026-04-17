// ============================================
// RESTAURANT OS - Secure Authentication Utilities
// Implementation: bcrypt + JWT signé + Refresh tokens
// ============================================

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('[SECURITY] FATAL: JWT_SECRET environment variable is required in production. Refusing to start.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// ============================================
// PASSWORD HASHING (bcrypt)
// ============================================

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Strong hashing for production
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns true if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 * @param password - Password to validate
 * @returns Validation result
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================
// JWT TOKEN MANAGEMENT
// ============================================

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  restaurantId?: string;
  type: 'access' | 'refresh';
  jti: string; // Unique token ID for revocation
  iat: number;
  exp: number;
}

/**
 * Generate a unique token ID
 */
function generateTokenId(): string {
  return `tok_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Parse time string to seconds (e.g., "7d" -> 604800)
 */
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60; // Default 7 days

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 24 * 60 * 60;
    default: return value * 24 * 60 * 60;
  }
}

/**
 * Sign and create a JWT access token
 * @param payload - User data to include in token
 * @returns Signed JWT token
 */
export async function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  restaurantId?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const now = Math.floor(Date.now() / 1000);
  const expSeconds = parseExpiresIn(JWT_EXPIRES_IN);
  const exp = now + expSeconds;

  const jwtPayload: JWTPayload = {
    ...payload,
    type: 'access',
    jti: generateTokenId(),
    iat: now,
    exp,
  };

  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expSeconds.toString())
    .sign(JWT_SECRET);

  return {
    token,
    expiresAt: new Date(exp * 1000),
  };
}

/**
 * Sign and create a JWT refresh token
 * @param userId - User ID
 * @returns Signed refresh token
 */
export async function signRefreshToken(userId: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const now = Math.floor(Date.now() / 1000);
  const expSeconds = parseExpiresIn(REFRESH_TOKEN_EXPIRES_IN);
  const exp = now + expSeconds;

  const jwtPayload: JWTPayload = {
    userId,
    email: '',
    role: '',
    type: 'refresh',
    jti: generateTokenId(),
    iat: now,
    exp,
  };

  const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expSeconds.toString())
    .sign(JWT_SECRET);

  return {
    token,
    expiresAt: new Date(exp * 1000),
  };
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Decode token without verification (for debugging only)
 * @param token - JWT token
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ============================================
// SESSION MANAGEMENT
// ============================================

export interface SessionData {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Create session data object
 */
export function createSessionData(
  userId: string,
  token: string,
  refreshToken: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
): SessionData {
  return {
    id: generateTokenId(),
    userId,
    token,
    refreshToken,
    ipAddress,
    userAgent,
    expiresAt,
    createdAt: new Date(),
  };
}

/**
 * Check if session is expired
 */
export function isSessionExpired(session: SessionData): boolean {
  return session.expiresAt < new Date();
}

/**
 * Extend session expiration
 */
export function extendSession(session: SessionData, expiresIn: string = JWT_EXPIRES_IN): SessionData {
  const expSeconds = parseExpiresIn(expiresIn);
  const newExpiresAt = new Date(Date.now() + expSeconds * 1000);

  return {
    ...session,
    expiresAt: newExpiresAt,
  };
}

// ============================================
// CLIENT INFO EXTRACTION
// ============================================

export interface ClientInfo {
  ipAddress: string;
  userAgent: string;
}

/**
 * Extract client information from request
 */
export function getClientInfo(request: Request): ClientInfo {
  const headers = request.headers;

  // Get IP address (handle proxies)
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : realIp || 'unknown';

  // Get user agent
  const userAgent = headers.get('user-agent') || 'unknown';

  return {
    ipAddress: ip,
    userAgent,
  };
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (international format)
 */
export function isValidPhone(phone: string): boolean {
  // Basic validation: starts with +, contains digits, spaces, dashes
  const phoneRegex = /^\+?[\d\s-]{8,}$/;
  return phoneRegex.test(phone);
}

/**
 * Generate secure random string for OTP
 */
export function generateOTP(length: number = 6): string {
  const chars = '0123456789';
  let otp = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    otp += chars[array[i] % chars.length];
  }

  return otp;
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetAt: number }> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request is allowed
   * @param identifier - User ID or IP
   * @returns true if allowed, false if rate limited
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const record = this.requests.get(identifier);

    if (!record) {
      this.requests.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (now > record.resetAt) {
      // Reset window
      this.requests.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxRequests) {
      return false; // Rate limited
    }

    record.count++;
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const record = this.requests.get(identifier);
    if (!record) return this.maxRequests;

    const now = Date.now();
    if (now > record.resetAt) return this.maxRequests;

    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Clean up old records (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.requests.entries()) {
      if (now > record.resetAt) {
        this.requests.delete(key);
      }
    }
  }
}

// Global rate limiters for different endpoints
export const authRateLimiter = new RateLimiter(60000, 5); // 5 attempts per minute
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
export const orderRateLimiter = new RateLimiter(60000, 30); // 30 orders per minute
