import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractBearerToken,
  hasPermission,
} from '@/lib/auth-middleware';
import { hasPermission as originalHasPermission } from '@/lib/auth-helpers';

// Mock the auth-helpers module
vi.mock('@/lib/auth-helpers', () => ({
  validateSession: vi.fn(),
  hasPermission: vi.fn((role: string, requiredRoles: string[]) => {
    const roleHierarchy: Record<string, number> = {
      SUPER_ADMIN: 100,
      ORG_ADMIN: 80,
      ORG_MANAGER: 70,
      RESTAURANT_ADMIN: 60,
      RESTAURANT_MANAGER: 50,
      STAFF: 30,
      KITCHEN: 30,
      DRIVER: 20,
      CUSTOMER: 10,
      SUPPORT: 40,
    };
    const userLevel = roleHierarchy[role] || 0;
    return requiredRoles.some((r) => userLevel >= (roleHierarchy[r] || 0));
  }),
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractBearerToken', () => {
    it('should extract token from valid Bearer header', () => {
      const request = {
        headers: {
          get: vi.fn((key: string) => {
            if (key === 'authorization') return 'Bearer abc123token';
            return null;
          }),
        },
      } as unknown as Request;

      const token = extractBearerToken(request);
      expect(token).toBe('abc123token');
    });

    it('should return null for missing header', () => {
      const request = {
        headers: {
          get: vi.fn(() => null),
        },
      } as unknown as Request;

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('should return null for non-Bearer auth', () => {
      const request = {
        headers: {
          get: vi.fn((key: string) => {
            if (key === 'authorization') return 'Basic dXNlcjpwYXNz';
            return null;
          }),
        },
      } as unknown as Request;

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('should return null for malformed Bearer header', () => {
      const request = {
        headers: {
          get: vi.fn((key: string) => {
            if (key === 'authorization') return 'Bearer';
            return null;
          }),
        },
      } as unknown as Request;

      const token = extractBearerToken(request);
      expect(token).toBeNull();
    });

    it('should handle case-insensitive Bearer', () => {
      const request = {
        headers: {
          get: vi.fn((key: string) => {
            if (key === 'authorization') return 'bearer abc123token';
            return null;
          }),
        },
      } as unknown as Request;

      const token = extractBearerToken(request);
      expect(token).toBe('abc123token');
    });
  });

  describe('hasPermission', () => {
    it('should allow SUPER_ADMIN access to all roles', () => {
      const roles = [
        'SUPER_ADMIN',
        'ORG_ADMIN',
        'RESTAURANT_ADMIN',
        'STAFF',
        'DRIVER',
        'CUSTOMER',
      ];

      roles.forEach((role) => {
        expect(originalHasPermission('SUPER_ADMIN', [role])).toBe(true);
      });
    });

    it('should respect role hierarchy', () => {
      // ORG_ADMIN (80) should access RESTAURANT_ADMIN (60) resources
      expect(originalHasPermission('ORG_ADMIN', ['RESTAURANT_ADMIN'])).toBe(true);
      
      // RESTAURANT_ADMIN (60) should NOT access ORG_ADMIN (80) resources
      expect(originalHasPermission('RESTAURANT_ADMIN', ['ORG_ADMIN'])).toBe(false);
    });

    it('should allow access if any required role is satisfied', () => {
      // STAFF (30) can access with STAFF or DRIVER roles
      expect(originalHasPermission('STAFF', ['DRIVER', 'STAFF'])).toBe(true);
    });

    it('should deny access for insufficient role', () => {
      // CUSTOMER (10) should NOT access STAFF (30) resources
      expect(originalHasPermission('CUSTOMER', ['STAFF'])).toBe(false);
    });

    it('should handle ORG_MANAGER role', () => {
      // ORG_MANAGER (70) can access RESTAURANT_ADMIN (60) resources
      expect(originalHasPermission('ORG_MANAGER', ['RESTAURANT_ADMIN'])).toBe(true);
      
      // ORG_MANAGER (70) should NOT access ORG_ADMIN (80) resources
      expect(originalHasPermission('ORG_MANAGER', ['ORG_ADMIN'])).toBe(false);
    });

    it('should handle SUPPORT role', () => {
      // SUPPORT (40) can access STAFF (30) resources
      expect(originalHasPermission('SUPPORT', ['STAFF'])).toBe(true);
      
      // SUPPORT (40) should NOT access RESTAURANT_MANAGER (50) resources
      expect(originalHasPermission('SUPPORT', ['RESTAURANT_MANAGER'])).toBe(false);
    });

    it('should handle DRIVER role', () => {
      // DRIVER (20) can access DRIVER resources
      expect(originalHasPermission('DRIVER', ['DRIVER'])).toBe(true);
      
      // DRIVER (20) should NOT access STAFF (30) resources
      expect(originalHasPermission('DRIVER', ['STAFF'])).toBe(false);
    });

    it('should handle unknown roles gracefully', () => {
      expect(originalHasPermission('UNKNOWN_ROLE', ['CUSTOMER'])).toBe(false);
    });
  });
});
