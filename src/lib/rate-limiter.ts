// ============================================
// Restaurant OS - Rate Limiting Middleware
// Protect API routes from abuse
// ============================================

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (for production, use Redis)
const store: RateLimitStore = {};

// Clean up expired entries every minute
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 60000);
}

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             request.headers.get('cf-connecting-ip') ||
             'unknown';
  return `ip:${ip}`;
}

/**
 * Rate limiter factory
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Trop de requêtes, veuillez réessayer plus tard',
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async function rateLimiter(
    request: NextRequest
  ): Promise<{ success: true } | { success: false; response: NextResponse }> {
    const key = keyGenerator(request);
    const now = Date.now();

    // Initialize or get existing entry
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment count
    store[key].count++;

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - store[key].count);
    const resetTimeSeconds = Math.ceil((store[key].resetTime - now) / 1000);

    // Set rate limit headers
    const headers = {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': resetTimeSeconds.toString(),
    };

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: message,
            retryAfter: resetTimeSeconds,
          },
          {
            status: 429,
            headers: {
              ...headers,
              'Retry-After': resetTimeSeconds.toString(),
            },
          }
        ),
      };
    }

    return { success: true };
  };
}

/**
 * Pre-configured rate limiters
 */

// Strict rate limiter for authentication endpoints (5 requests per minute)
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans une minute.',
});

// Moderate rate limiter for public endpoints (30 requests per minute)
export const publicRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Trop de requêtes. Veuillez ralentir.',
});

// Lenient rate limiter for API endpoints (100 requests per minute)
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Limite de requêtes API dépassée.',
});

// Strict rate limiter for OTP requests (3 requests per 5 minutes)
export const otpRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3,
  message: 'Trop de demandes de code OTP. Veuillez réessayer dans 5 minutes.',
});

// Rate limiter for password reset (3 requests per hour)
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans une heure.',
});

// Rate limiter for registration (5 requests per hour per IP)
export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
  message: 'Trop de tentatives d\'inscription. Veuillez réessayer plus tard.',
});

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await limiter(request);

    if (!result.success) {
      return result.response;
    }

    return handler(request);
  };
}

/**
 * Combine rate limiting with authentication
 */
export function withRateLimitAndAuth(
  limiter: ReturnType<typeof createRateLimiter>,
  authMiddleware: (handler: any) => any,
  handler: any
) {
  return withRateLimit(limiter, authMiddleware(handler));
}

/**
 * User-based rate limiter (for authenticated routes)
 */
export function createUserRateLimiter(config: Omit<RateLimitConfig, 'keyGenerator'>) {
  return createRateLimiter({
    ...config,
    keyGenerator: (request: NextRequest) => {
      // Try to get user ID from authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        // Use a hash of the token as key (in production, decode and use user ID)
        return `token:${token.substring(0, 16)}`;
      }
      // Fall back to IP
      return defaultKeyGenerator(request);
    },
  });
}

/**
 * Export types
 */
export type { RateLimitConfig };
