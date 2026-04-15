// ============================================
// RESTAURANT OS - Database Rate Limiter
// Persistent rate limiting using PostgreSQL
// ============================================

import { db } from '@/lib/db';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // seconds
}

export class DatabaseRateLimiter {
  /**
   * Check if request is within rate limit
   * @param identifier - Unique identifier (IP, userId, apiKey)
   * @param limit - Max requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @param endpoint - Optional endpoint for granular limits
   */
  async checkLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000, // 1 minute default
    endpoint?: string
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    try {
      // Find or create rate limit record
      const existing = await db.rateLimit.findUnique({
        where: {
          identifier_endpoint: {
            identifier,
            endpoint: endpoint || null,
          },
        },
      });

      // No record found or window expired
      if (!existing || existing.windowStart < windowStart) {
        // Create new record
        await db.rateLimit.upsert({
          where: {
            identifier_endpoint: {
              identifier,
              endpoint: endpoint || null,
            },
          },
          update: {
            count: 1,
            windowStart: now,
          },
          create: {
            identifier,
            endpoint: endpoint || null,
            count: 1,
            windowStart: now,
          },
        });

        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: new Date(now.getTime() + windowMs),
        };
      }

      // Window still active
      const count = existing.count;
      const resetAt = new Date(existing.windowStart.getTime() + windowMs);

      if (count >= limit) {
        // Rate limit exceeded
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          retryAfter: Math.ceil((resetAt.getTime() - now.getTime()) / 1000),
        };
      }

      // Increment counter
      await db.rateLimit.update({
        where: { id: existing.id },
        data: { count: count + 1 },
      });

      return {
        allowed: true,
        remaining: limit - count - 1,
        resetAt,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request but log error
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }
  }

  /**
   * Get current rate limit status without incrementing
   */
  async getStatus(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000,
    endpoint?: string
  ): Promise<{ current: number; remaining: number; resetAt: Date }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    const existing = await db.rateLimit.findUnique({
      where: {
        identifier_endpoint: {
          identifier,
          endpoint: endpoint || null,
        },
      },
    });

    if (!existing || existing.windowStart < windowStart) {
      return {
        current: 0,
        remaining: limit,
        resetAt: new Date(now.getTime() + windowMs),
      };
    }

    const resetAt = new Date(existing.windowStart.getTime() + windowMs);
    return {
      current: existing.count,
      remaining: Math.max(0, limit - existing.count),
      resetAt,
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  async reset(identifier: string, endpoint?: string): Promise<void> {
    await db.rateLimit.deleteMany({
      where: {
        identifier,
        endpoint: endpoint || null,
      },
    });
  }

  /**
   * Cleanup old records (call periodically)
   */
  async cleanup(olderThanMs: number = 3600000): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanMs);
    
    const result = await db.rateLimit.deleteMany({
      where: {
        windowStart: { lt: cutoff },
      },
    });

    return result.count;
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // API calls: 100 requests per minute
  api: new DatabaseRateLimiter(),
  
  // Authentication: 5 attempts per minute
  auth: new DatabaseRateLimiter(),
  
  // Password reset: 3 attempts per hour
  passwordReset: new DatabaseRateLimiter(),
  
  // SMS/Email: 10 per hour
  notifications: new DatabaseRateLimiter(),
  
  // Payment APIs: 20 per minute
  payments: new DatabaseRateLimiter(),
};

// Helper function for middleware
export async function checkRateLimit(
  identifier: string,
  type: 'api' | 'auth' | 'passwordReset' | 'notifications' | 'payments' = 'api'
): Promise<RateLimitResult> {
  const config = {
    api: { limit: 100, windowMs: 60000 },
    auth: { limit: 5, windowMs: 60000 },
    passwordReset: { limit: 3, windowMs: 3600000 },
    notifications: { limit: 10, windowMs: 3600000 },
    payments: { limit: 20, windowMs: 60000 },
  };

  const { limit, windowMs } = config[type];
  return rateLimiters.api.checkLimit(identifier, limit, windowMs);
}
