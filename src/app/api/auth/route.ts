// Authentication API
import { db } from '@/lib/db';
import { apiSuccess, apiError, withErrorHandler } from '@/lib/api-responses';
import {
  hashPassword,
  verifyPassword,
  createSession,
  createRefreshToken,
  validateSession,
  invalidateSession,
  createOtpCode,
  verifyOtpCode,
  getUserByEmailOrPhone,
  getClientInfo,
} from '@/lib/auth-helpers';
import { isValidEmail, isValidPassword } from '@/lib/utils-helpers';

// GET /api/auth - Get current session
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return apiError('Non autorisé', 401);
    }

    const session = await validateSession(token);

    if (!session) {
      return apiError('Session invalide ou expirée', 401);
    }

    return apiSuccess({
      user: {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone,
        role: session.user.role,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        avatar: session.user.avatar,
        language: session.user.language,
        isActive: session.user.isActive,
        organizations: session.user.organizationUsers.map(ou => ({
          id: ou.organization.id,
          name: ou.organization.name,
          slug: ou.organization.slug,
          role: ou.role,
        })),
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    });
  });
}

// POST /api/auth - Login, Register, or OTP verification
export async function POST(request: Request) {
  return withErrorHandler(async () => {
    const body = await request.json();
    const { action, email, phone, password, otpCode, firstName, lastName, role = 'CUSTOMER' } = body;

    // Login with password
    if (action === 'login') {
      const identifier = email || phone;
      if (!identifier || !password) {
        return apiError('Email/téléphone et mot de passe sont requis');
      }

      const user = await getUserByEmailOrPhone(identifier);

      if (!user) {
        return apiError('Utilisateur non trouvé', 404);
      }

      if (!user.isActive || user.isLocked) {
        return apiError('Compte désactivé ou verrouillé', 403);
      }

      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return apiError('Mot de passe incorrect', 401);
      }

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(user.id, ipAddress, userAgent);
      const refreshToken = await createRefreshToken(user.id);

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
      });

      return apiSuccess({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        token: session.token,
        refreshToken: refreshToken.token,
        expiresAt: session.expiresAt,
      }, 'Connexion réussie');
    }

    // Register new user
    if (action === 'register') {
      if (!email || !password) {
        return apiError('Email et mot de passe sont requis');
      }

      if (!isValidEmail(email)) {
        return apiError('Email invalide');
      }

      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        return apiError(passwordValidation.message || 'Mot de passe invalide');
      }

      // Check if user exists
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return apiError('Un compte avec cet email existe déjà', 409);
      }

      // Create user
      const user = await db.user.create({
        data: {
          email,
          phone,
          passwordHash: await hashPassword(password),
          firstName,
          lastName,
          role,
        },
      });

      // Create session
      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(user.id, ipAddress, userAgent);
      const refreshToken = await createRefreshToken(user.id);

      // Send verification OTP (mock - in production, send actual email/SMS)
      await createOtpCode('VERIFY_EMAIL', undefined, email, user.id);

      return apiSuccess({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token: session.token,
        refreshToken: refreshToken.token,
        expiresAt: session.expiresAt,
      }, 'Compte créé avec succès', 201);
    }

    // Request OTP
    if (action === 'request-otp') {
      const type = body.type || 'LOGIN';
      
      if (!phone && !email) {
        return apiError('Téléphone ou email est requis');
      }

      // Check if user exists for login OTP
      if (type === 'LOGIN') {
        const user = await getUserByEmailOrPhone(phone || email);
        if (!user) {
          return apiError('Utilisateur non trouvé', 404);
        }

        const otp = await createOtpCode(type, phone, email, user.id);

        // In production, send actual SMS/Email
        return apiSuccess({
          message: 'Code OTP envoyé',
          // Only for demo - remove in production
          otpCode: otp.code,
        });
      }

      // For registration, verify, etc.
      const otp = await createOtpCode(type, phone, email);

      return apiSuccess({
        message: 'Code OTP envoyé',
        // Only for demo - remove in production
        otpCode: otp.code,
      });
    }

    // Verify OTP
    if (action === 'verify-otp') {
      const type = body.type || 'LOGIN';
      
      if (!otpCode || (!phone && !email)) {
        return apiError('Code OTP et téléphone/email sont requis');
      }

      const otp = await verifyOtpCode(type, otpCode, phone, email);

      if (!otp) {
        return apiError('Code OTP invalide ou expiré', 400);
      }

      // For login, create session
      if (type === 'LOGIN' && otp.userId) {
        const user = await db.user.findUnique({ where: { id: otp.userId } });
        
        if (!user || !user.isActive) {
          return apiError('Compte non trouvé ou désactivé', 404);
        }

        const { ipAddress, userAgent } = getClientInfo(request);
        const session = await createSession(user.id, ipAddress, userAgent);
        const refreshToken = await createRefreshToken(user.id);

        return apiSuccess({
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          token: session.token,
          refreshToken: refreshToken.token,
          expiresAt: session.expiresAt,
        }, 'Connexion réussie');
      }

      return apiSuccess({ verified: true }, 'Code OTP vérifié');
    }

    // Refresh token
    if (action === 'refresh') {
      const { refreshToken } = body;

      if (!refreshToken) {
        return apiError('Refresh token est requis');
      }

      const storedToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return apiError('Refresh token invalide ou expiré', 401);
      }

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(storedToken.userId, ipAddress, userAgent);
      const newRefreshToken = await createRefreshToken(storedToken.userId);

      // Revoke old refresh token
      await db.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      return apiSuccess({
        token: session.token,
        refreshToken: newRefreshToken.token,
        expiresAt: session.expiresAt,
      }, 'Token rafraîchi');
    }

    return apiError('Action non reconnue', 400);
  });
}

// DELETE /api/auth - Logout
export async function DELETE(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return apiError('Token requis', 401);
    }

    const success = await invalidateSession(token);

    if (!success) {
      return apiError('Erreur lors de la déconnexion', 500);
    }

    return apiSuccess({ loggedOut: true }, 'Déconnexion réussie');
  });
}

// PATCH /api/auth - Update password
export async function PATCH(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return apiError('Non autorisé', 401);
    }

    const session = await validateSession(token);
    if (!session) {
      return apiError('Session invalide', 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return apiError('Mot de passe actuel et nouveau mot de passe sont requis');
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return apiError(passwordValidation.message || 'Nouveau mot de passe invalide');
    }

    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return apiError('Utilisateur non trouvé', 404);
    }
    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return apiError('Mot de passe actuel incorrect', 401);
    }

    await db.user.update({
      where: { id: session.userId },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    // Invalidate all other sessions
    await db.session.deleteMany({
      where: {
        userId: session.userId,
        id: { not: session.id },
      },
    });

    return apiSuccess({ updated: true }, 'Mot de passe mis à jour');
  });
}
