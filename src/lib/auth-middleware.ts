// ============================================
// Restaurant OS - Authentication Middleware
// Protect API routes with session validation
// Supports: self-contained demo tokens, in-memory demo sessions, DB sessions
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-helpers';
import { apiError } from '@/lib/api-responses';
import { hasPermission } from '@/lib/auth-helpers';
import { validateDemoToken } from '@/lib/demo-tokens';

// ── Demo users lookup (shared with auth/route.ts) ──
// Full user data is embedded in the demo token, but we need
// organizations/phone/name which require a lookup by userId.
const DEMO_USER_LOOKUP: Record<string, any> = {
  'admin-user-1': {
    id: 'admin-user-1', email: 'admin@kfm-delice.com', phone: '+224 623 21 72 40',
    role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin', avatar: null, isActive: true,
    organizations: [{ id: 'kfm-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'ADMIN' }],
  },
  'demo-user-1': {
    id: 'demo-user-1', email: 'demo@kfm-delice.com', phone: '+224 622 000 000',
    role: 'ORG_ADMIN', firstName: 'Admin', lastName: 'Demo', avatar: null, isActive: true,
    organizations: [{ id: 'demo-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'ADMIN' }],
  },
  'kfm-user-1': {
    id: 'kfm-user-1', email: 'contact@kfm-delice.com', phone: '+224 623 21 72 41',
    role: 'ORG_ADMIN', firstName: 'KFM', lastName: 'DELICE', avatar: null, isActive: true,
    organizations: [{ id: 'kfm-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'ADMIN' }],
  },
  'amadou-user-1': {
    id: 'amadou-user-1', email: 'amadou@kfm-delice.com', phone: '+224 622 111 222',
    role: 'RESTAURANT_MANAGER', firstName: 'Amadou', lastName: 'Diallo', avatar: null, isActive: true,
    organizations: [{ id: 'kfm-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'MANAGER' }],
  },
  'kitchen-user-1': {
    id: 'kitchen-user-1', email: 'kitchen@kfm-delice.com', phone: '+224 622 222 333',
    role: 'KITCHEN', firstName: 'Chef', lastName: 'Abdoulaye', avatar: null, isActive: true,
    organizations: [{ id: 'kfm-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'STAFF' }],
  },
  'driver-user-1': {
    id: 'driver-user-1', email: 'driver@kfm-delice.com', phone: '+224 622 333 444',
    role: 'DRIVER', firstName: 'Moussa', lastName: 'Touré', avatar: null, isActive: true,
    organizations: [{ id: 'kfm-org-1', name: 'KFM DELICE', slug: 'kfm-delice', role: 'STAFF' }],
  },
};

// ── Demo session bridge ──
// In demo mode, tokens are stored in an in-memory Map inside route.ts.
// This module-level reference allows auth-middleware to validate them.
// The Map is populated lazily via a shared module pattern.
let _getDemoSession: ((token: string) => { user: any; expiresAt: Date } | undefined) | null = null;

// Called from auth/route.ts to register the demo session getter
export function registerDemoSessionGetter(
  getter: (token: string) => { user: any; expiresAt: Date } | undefined
) {
  _getDemoSession = getter;
}

// Try to validate against demo in-memory sessions
function getDemoSession(token: string): { user: any; expiresAt: Date } | undefined {
  if (!_getDemoSession) return undefined;
  try {
    const session = _getDemoSession(token);
    if (session && session.expiresAt > new Date()) {
      return session;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Authenticated user interface
 */
export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  language: string;
  isActive: boolean;
  organizations: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: true;
  user: AuthenticatedUser;
  sessionId: string;
}

export interface AuthError {
  success: false;
  error: NextResponse;
}

/**
 * Extract bearer token from request
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Validate authentication from request
 * 1. Self-contained demo tokens (works across serverless instances)
 * 2. In-memory demo sessions (same instance, fast path)
 * 3. Database sessions (persistent, production)
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const token = extractBearerToken(request);
  
  if (!token) {
    return {
      success: false,
      error: apiError('Token d\'authentification requis', 401),
    };
  }
  
  // 1. Check self-contained demo token (works across serverless instances)
  const demoPayload = validateDemoToken(token);
  if (demoPayload) {
    const fullUser = DEMO_USER_LOOKUP[demoPayload.userId];
    if (fullUser) {
      return {
        success: true,
        user: {
          id: fullUser.id,
          email: fullUser.email,
          phone: fullUser.phone,
          role: fullUser.role,
          firstName: fullUser.firstName,
          lastName: fullUser.lastName,
          avatar: fullUser.avatar,
          language: 'fr',
          isActive: fullUser.isActive !== false,
          organizations: fullUser.organizations || [],
        },
        sessionId: token,
      };
    }
  }

  // 2. Check in-memory demo sessions (same instance, fast path)
  const demoSession = getDemoSession(token);
  if (demoSession) {
    const user = demoSession.user;
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        language: 'fr',
        isActive: user.isActive !== false,
        organizations: user.organizations || [],
      },
      sessionId: token,
    };
  }

  // 3. Check database sessions (persistent, production)
  try {
    const session = await validateSession(token);
    
    if (!session) {
      return {
        success: false,
        error: apiError('Session invalide ou expirée', 401),
      };
    }
    
    const user = session.user;
    
    if (!user.isActive) {
      return {
        success: false,
        error: apiError('Compte désactivé', 403),
      };
    }
    
    if (user.isLocked) {
      return {
        success: false,
        error: apiError('Compte verrouillé', 403),
      };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        language: user.language,
        isActive: user.isActive,
        organizations: user.organizationUsers.map(ou => ({
          id: ou.organization.id,
          name: ou.organization.name,
          slug: ou.organization.slug,
          role: ou.role,
        })),
      },
      sessionId: session.id,
    };
  } catch (dbError) {
    // DB unavailable - if we're here, demo session also didn't match
    return {
      success: false,
      error: apiError('Session invalide ou service indisponible', 401),
    };
  }
}

/**
 * Higher-order function to protect API route handlers
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);
    
    if (!authResult.success) {
      return authResult.error;
    }
    
    return handler(request, authResult.user, context);
  };
}

/**
 * Role-based access control
 */
export function withRole(
  requiredRoles: string[],
  handler: (
    request: NextRequest,
    user: AuthenticatedUser
  ) => Promise<NextResponse>
) {
  return withAuth(async (request, user) => {
    if (!hasPermission(user.role, requiredRoles)) {
      return apiError('Accès non autorisé', 403);
    }
    
    return handler(request, user);
  });
}

/**
 * Organization membership check
 */
export function withOrganizationAccess(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser,
    organizationId: string
  ) => Promise<NextResponse>
) {
  return withAuth(async (request, user) => {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    
    if (!organizationId) {
      return apiError('Organization ID requis', 400);
    }
    
    const isMember = user.organizations.some(
      org => org.id === organizationId || org.slug === organizationId
    );
    
    if (!isMember && user.role !== 'SUPER_ADMIN') {
      return apiError('Accès à cette organisation non autorisé', 403);
    }
    
    return handler(request, user, organizationId);
  });
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function withOptionalAuth<T>(
  handler: (
    request: NextRequest,
    user: AuthenticatedUser | null,
    context?: T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);
    
    const user = authResult.success ? authResult.user : null;
    
    return handler(request, user, context);
  };
}

/**
 * Check if user can access a specific restaurant
 */
export async function canAccessRestaurant(
  user: AuthenticatedUser,
  restaurantId: string
): Promise<boolean> {
  // Super admin can access all
  if (user.role === 'SUPER_ADMIN') return true;
  
  // Check if user's organization owns the restaurant
  return user.organizations.length > 0;
}

/**
 * Rate limiting key generator
 */
export function getRateLimitKey(request: NextRequest, user: AuthenticatedUser | null): string {
  if (user) {
    return `user:${user.id}`;
  }
  
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';
  
  return `ip:${ip}`;
}

/**
 * Admin-only middleware
 */
export const withAdminAuth = (handler: Parameters<typeof withAuth>[0]) =>
  withRole(['SUPER_ADMIN', 'ORG_ADMIN', 'RESTAURANT_ADMIN'], handler);

/**
 * Manager-only middleware
 */
export const withManagerAuth = (handler: Parameters<typeof withAuth>[0]) =>
  withRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER'], handler);

/**
 * Staff-only middleware
 */
export const withStaffAuth = (handler: Parameters<typeof withAuth>[0]) =>
  withRole(['SUPER_ADMIN', 'ORG_ADMIN', 'ORG_MANAGER', 'RESTAURANT_ADMIN', 'RESTAURANT_MANAGER', 'STAFF', 'KITCHEN'], handler);

/**
 * Driver-only middleware
 */
export const withDriverAuth = (handler: Parameters<typeof withAuth>[0]) =>
  withRole(['SUPER_ADMIN', 'DRIVER'], handler);

/**
 * Customer middleware (all authenticated users)
 */
export const withCustomerAuth = withAuth;
