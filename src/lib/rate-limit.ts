// ============================================
// Restaurant OS - Rate Limiting
// Protect API routes from abuse
// ============================================

import { NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  // Time window in milliseconds
  windowMs: number;
  // Maximum requests per window
  maxRequests: number;
  // Key prefix for storage
  keyPrefix?: string;
  // Skip rate limit for certain conditions
  skip?: (identifier: string) => boolean;
}

/**
 * Rate limit result
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * In-memory rate limit store (for single instance)
 * For production with multiple instances, use Redis
 */
class MemoryStore {
  private store: Map<string, { count: number; resetAt: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (value.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  increment(key: string, windowMs: number): { count: number; resetAt: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || record.resetAt < now) {
      // Create new record
      const newRecord = {
        count: 1,
        resetAt: now + windowMs,
      };
      this.store.set(key, newRecord);
      return newRecord;
    }

    // Increment existing record
    record.count++;
    this.store.set(key, record);
    return record;
  }

  reset(key: string): void {
    this.store.delete(key);
  }

  get(key: string): { count: number; resetAt: number } | undefined {
    return this.store.get(key);
  }
}

// Global store instance
const globalForStore = globalThis as unknown as { rateLimitStore: MemoryStore };
const store = globalForStore.rateLimitStore ?? new MemoryStore();
if (process.env.NODE_ENV !== 'production') globalForStore.rateLimitStore = store;

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // Strict: 10 requests per minute (for auth endpoints)
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'strict',
  },
  
  // Standard: 100 requests per minute (for most API endpoints)
  standard: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'standard',
  },
  
  // Relaxed: 300 requests per minute (for read-heavy endpoints)
  relaxed: {
    windowMs: 60 * 1000,
    maxRequests: 300,
    keyPrefix: 'relaxed',
  },
  
  // Webhook: 1000 requests per minute (for webhooks from providers)
  webhook: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
    keyPrefix: 'webhook',
  },
  
  // Password attempts: 5 per 15 minutes
  password: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    keyPrefix: 'password',
  },
  
  // OTP requests: 3 per 5 minutes
  otp: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 3,
    keyPrefix: 'otp',
  },
} as const;

/**
 * Check rate limit for an identifier
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const key = `${config.keyPrefix || 'default'}:${identifier}`;
  const { count, resetAt } = store.increment(key, config.windowMs);
  
  const remaining = Math.max(0, config.maxRequests - count);
  const success = count <= config.maxRequests;
  
  return {
    success,
    limit: config.maxRequests,
    remaining,
    resetAt: new Date(resetAt),
    retryAfter: success ? undefined : Math.ceil((resetAt - Date.now()) / 1000),
  };
}

/**
 * Reset rate limit for an identifier
 */
export function resetRateLimit(identifier: string, keyPrefix: string = 'default'): void {
  store.reset(`${keyPrefix}:${identifier}`);
}

/**
 * Rate limit headers to add to response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt.getTime() / 1000).toString(),
    ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() }),
  };
}

/**
 * Create rate limit exceeded response
 */
export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Trop de requêtes. Veuillez réessayer plus tard.',
      retryAfter: result.retryAfter,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(result),
    }
  );
}

/**
 * Higher-order function to add rate limiting to API handlers
 */
export function withRateLimit(
  config: RateLimitConfig | keyof typeof rateLimitConfigs,
  getIdentifier: (request: Request) => string | Promise<string>
) {
  const resolvedConfig = typeof config === 'string' ? rateLimitConfigs[config] : config;
  
  return function <T extends (...args: unknown[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (...args: Parameters<T>) => {
      const request = args[0] as Request;
      const identifier = await getIdentifier(request);
      
      // Check if should skip
      if (resolvedConfig.skip?.(identifier)) {
        return handler(...args);
      }
      
      const result = checkRateLimit(identifier, resolvedConfig);
      
      if (!result.success) {
        return rateLimitExceededResponse(result);
      }
      
      const response = await handler(...args);
      
      // Add rate limit headers to response
      const headers = getRateLimitHeaders(result);
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      
      return response;
    }) as T;
  };
}

/**
 * Get IP-based identifier for rate limiting
 */
export function getIpIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  const ip = cfIp || (forwarded?.split(',')[0].trim()) || realIp || 'unknown';
  return `ip:${ip}`;
}

/**
 * Get user-based identifier for rate limiting
 * Falls back to IP if no user
 */
export function getUserIdentifier(request: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }
  
  // Try to extract from auth header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // Use a hash of the token as identifier
    const token = authHeader.slice(7);
    return `token:${token.slice(0, 16)}`;
  }
  
  return getIpIdentifier(request);
}

/**
 * Rate limit middleware for specific endpoints
 */
export const rateLimiters = {
  // For authentication endpoints
  auth: withRateLimit('strict', getIpIdentifier),
  
  // For password reset/OTP
  otp: withRateLimit('otp', getIpIdentifier),
  
  // For general API endpoints
  api: withRateLimit('standard', (req) => getUserIdentifier(req)),
  
  // For read-heavy endpoints
  read: withRateLimit('relaxed', (req) => getUserIdentifier(req)),
  
  // For webhooks
  webhook: withRateLimit('webhook', getIpIdentifier),
};
