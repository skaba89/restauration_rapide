import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkRateLimit,
  resetRateLimit,
  getRateLimitHeaders,
  rateLimitConfigs,
  getIpIdentifier,
  getUserIdentifier,
} from '@/lib/rate-limit';

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow requests under the limit', () => {
      const result = checkRateLimit('test-key-1', {
        windowMs: 60000,
        maxRequests: 10,
      });

      expect(result.success).toBe(true);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(9);
    });

    it('should block requests over the limit', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 3,
        keyPrefix: 'test',
      };

      // Make 3 requests
      checkRateLimit('test-key-2', config);
      checkRateLimit('test-key-2', config);
      checkRateLimit('test-key-2', config);

      // 4th request should be blocked
      const result = checkRateLimit('test-key-2', config);
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should track different keys separately', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 5,
      };

      // Exhaust limit for key1
      for (let i = 0; i < 5; i++) {
        checkRateLimit('key-1', config);
      }

      // key2 should still have full allowance
      const result = checkRateLimit('key-2', config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);

      // key1 should be blocked
      const key1Result = checkRateLimit('key-1', config);
      expect(key1Result.success).toBe(false);
    });

    it('should reset after window expires', async () => {
      const config = {
        windowMs: 100, // 100ms window
        maxRequests: 2,
        keyPrefix: 'short',
      };

      // Use up the limit
      checkRateLimit('expire-test', config);
      checkRateLimit('expire-test', config);

      // Should be blocked
      let result = checkRateLimit('expire-test', config);
      expect(result.success).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = checkRateLimit('expire-test', config);
      expect(result.success).toBe(true);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset the rate limit for a key', () => {
      const config = {
        windowMs: 60000,
        maxRequests: 2,
        keyPrefix: 'reset-test',
      };

      // Use up the limit
      checkRateLimit('reset-key', config);
      checkRateLimit('reset-key', config);
      let result = checkRateLimit('reset-key', config);
      expect(result.success).toBe(false);

      // Reset
      resetRateLimit('reset-key', 'reset-test');

      // Should be allowed again
      result = checkRateLimit('reset-key', config);
      expect(result.success).toBe(true);
    });
  });

  describe('getRateLimitHeaders', () => {
    it('should return correct headers', () => {
      const result = {
        success: true,
        limit: 100,
        remaining: 95,
        resetAt: new Date('2024-01-01T00:01:00Z'),
      };

      const headers = getRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('100');
      expect(headers['X-RateLimit-Remaining']).toBe('95');
      expect(headers['X-RateLimit-Reset']).toBe('1704067260');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After when rate limited', () => {
      const result = {
        success: false,
        limit: 100,
        remaining: 0,
        resetAt: new Date(Date.now() + 30000),
        retryAfter: 30,
      };

      const headers = getRateLimitHeaders(result);
      expect(headers['Retry-After']).toBe('30');
    });
  });

  describe('rateLimitConfigs', () => {
    it('should have predefined configurations', () => {
      expect(rateLimitConfigs.strict.maxRequests).toBe(10);
      expect(rateLimitConfigs.standard.maxRequests).toBe(100);
      expect(rateLimitConfigs.relaxed.maxRequests).toBe(300);
      expect(rateLimitConfigs.webhook.maxRequests).toBe(1000);
      expect(rateLimitConfigs.password.maxRequests).toBe(5);
      expect(rateLimitConfigs.otp.maxRequests).toBe(3);
    });
  });

  describe('getIpIdentifier', () => {
    it('should extract IP from x-forwarded-for', () => {
      const request = {
        headers: new Map([
          ['x-forwarded-for', '192.168.1.1, 10.0.0.1'],
        ]),
        get: function (key: string) {
          return this.headers.get(key);
        },
      } as unknown as Request;

      const identifier = getIpIdentifier(request);
      expect(identifier).toBe('ip:192.168.1.1');
    });

    it('should prioritize cf-connecting-ip', () => {
      const request = {
        headers: new Map([
          ['x-forwarded-for', '10.0.0.1'],
          ['cf-connecting-ip', '1.2.3.4'],
        ]),
        get: function (key: string) {
          return this.headers.get(key);
        },
      } as unknown as Request;

      const identifier = getIpIdentifier(request);
      expect(identifier).toBe('ip:1.2.3.4');
    });

    it('should return unknown for missing IP', () => {
      const request = {
        headers: new Map(),
        get: () => null,
      } as unknown as Request;

      const identifier = getIpIdentifier(request);
      expect(identifier).toBe('ip:unknown');
    });
  });

  describe('getUserIdentifier', () => {
    it('should return user ID if provided', () => {
      const request = {} as Request;
      const identifier = getUserIdentifier(request, 'user-123');
      expect(identifier).toBe('user:user-123');
    });

    it('should extract from Bearer token', () => {
      const request = {
        headers: new Map([
          ['authorization', 'Bearer abcdefghijklmnopqrstuvwxyz123456'],
        ]),
        get: function (key: string) {
          return this.headers.get(key);
        },
      } as unknown as Request;

      const identifier = getUserIdentifier(request);
      expect(identifier).toBe('token:abcdefghijklmnop');
    });

    it('should fallback to IP', () => {
      const request = {
        headers: new Map([
          ['x-real-ip', '5.6.7.8'],
        ]),
        get: function (key: string) {
          return this.headers.get(key);
        },
      } as unknown as Request;

      const identifier = getUserIdentifier(request);
      expect(identifier).toBe('ip:5.6.7.8');
    });
  });
});
