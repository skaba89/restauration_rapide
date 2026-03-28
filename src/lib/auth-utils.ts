// ============================================
// Restaurant OS - Auth Utilities
// Helper functions for authentication
// ============================================

import { headers } from 'next/headers';
import { db } from './db';
import { Session } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  organizationId?: string;
}

/**
 * Get the current authenticated user from the session
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.slice(7);
    
    // Find session
    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            organizationUsers: {
              take: 1,
            },
          },
        },
      },
    });
    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    
    return {
      id: session.user.id,
      email: session.user.email,
      phone: session.user.phone,
      role: session.user.role,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      avatar: session.user.avatar,
      organizationId: session.user.organizationUsers[0]?.organizationId,
    };
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.slice(7);
    
    const session = await db.session.findUnique({
      where: { token },
    });
    
    if (!session || session.expiresAt < new Date()) {
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Check if user belongs to organization
 */
export function belongsToOrganization(user: AuthUser, organizationId: string): boolean {
  return user.organizationId === organizationId;
}
