// ============================================
// Restaurant OS - Authentication Middleware
// Protect API routes with session validation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth-helpers';
import { apiError } from '@/lib/api-responses';
import { hasPermission } from '@/lib/auth-helpers';

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
  // This would need to be implemented with a database query
  // For now, we'll use a simplified check
  return user.organizations.length > 0;
}

/**
 * Rate limiting key generator
 */
export function getRateLimitKey(request: NextRequest, user: AuthenticatedUser | null): string {
  if (user) {
    return `user:${user.id}`;
  }
  
  // Fall back to IP-based rate limiting
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
