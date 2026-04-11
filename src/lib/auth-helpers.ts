// ============================================
// Restaurant OS - Authentication Helpers
// Secure authentication with bcrypt
// ============================================

import { db } from '@/lib/db';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

// Session configuration
const SESSION_DURATION_HOURS = 24 * 7; // 7 days
const REFRESH_TOKEN_DURATION_DAYS = 30;
const BCRYPT_SALT_ROUNDS = 12;

// Generate a secure random token
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

// Hash a password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

// Verify password using bcrypt
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate OTP code
export function generateOtpCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

// Create a new session
export async function createSession(userId: string, ipAddress?: string, userAgent?: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_DURATION_HOURS);

  const session = await db.session.create({
    data: {
      userId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  return session;
}

// Create refresh token
export async function createRefreshToken(userId: string) {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DURATION_DAYS);

  const refreshToken = await db.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return refreshToken;
}

// Validate session
export async function validateSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          organizationUsers: {
            include: {
              organization: true,
            },
          },
          customerProfiles: true,
          driverProfile: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  // Update last login
  await db.user.update({
    where: { id: session.userId },
    data: { lastLoginAt: new Date() },
  });

  return session;
}

// Logout - invalidate session
export async function invalidateSession(token: string) {
  try {
    await db.session.delete({ where: { token } });
    return true;
  } catch {
    return false;
  }
}

// Invalidate all user sessions
export async function invalidateAllUserSessions(userId: string) {
  await db.session.deleteMany({ where: { userId } });
}

// Create or get OTP code
export async function createOtpCode(
  type: 'LOGIN' | 'REGISTER' | 'VERIFY_PHONE' | 'VERIFY_EMAIL' | 'RESET_PASSWORD' | 'VERIFY_PAYMENT',
  phone?: string,
  email?: string,
  userId?: string
) {
  // Invalidate previous OTPs of same type
  if (phone) {
    await db.otpCode.deleteMany({
      where: { phone, type },
    });
  }
  if (email) {
    await db.otpCode.deleteMany({
      where: { email, type },
    });
  }

  const code = generateOtpCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes

  const otp = await db.otpCode.create({
    data: {
      userId,
      phone,
      email,
      code,
      type,
      expiresAt,
    },
  });

  return otp;
}

// Verify OTP code
export async function verifyOtpCode(
  type: 'LOGIN' | 'REGISTER' | 'VERIFY_PHONE' | 'VERIFY_EMAIL' | 'RESET_PASSWORD' | 'VERIFY_PAYMENT',
  code: string,
  phone?: string,
  email?: string
) {
  const otp = await db.otpCode.findFirst({
    where: {
      type,
      code,
      verifiedAt: null,
      expiresAt: { gt: new Date() },
      ...(phone && { phone }),
      ...(email && { email }),
    },
  });

  if (!otp) {
    return null;
  }

  // Check attempts
  if (otp.attempts >= 3) {
    await db.otpCode.delete({ where: { id: otp.id } });
    return null;
  }

  // Mark as verified
  await db.otpCode.update({
    where: { id: otp.id },
    data: { verifiedAt: new Date() },
  });

  return otp;
}

// Get user by email or phone
export async function getUserByEmailOrPhone(identifier: string) {
  return db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: identifier }],
    },
  });
}

// Check if user has permission
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
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

  const userLevel = roleHierarchy[userRole] || 0;
  return requiredRoles.some((role) => userLevel >= (roleHierarchy[role] || 0));
}

// Extract client info from request
export function getClientInfo(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || undefined;
  
  return {
    ipAddress: Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim(),
    userAgent,
  };
}
