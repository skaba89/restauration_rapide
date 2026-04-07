// Authentication API
import { db, isDatabaseAvailable } from '@/lib/db';
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

// Demo user for fallback mode
const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@kfm-delice.com',
  phone: '+224 622 000 000',
  role: 'ORG_ADMIN',
  firstName: 'Admin',
  lastName: 'Demo',
  avatar: null,
  isActive: true,
  passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4wqO.1BoWBPfGK.e', // password: demo123
  organizations: [{
    id: 'demo-org-1',
    name: 'KFM DELICE',
    slug: 'kfm-delice',
    role: 'ADMIN',
  }],
};

// Generate a demo token
function generateDemoToken(): string {
  return `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET /api/auth - Get current session
export async function GET(request: Request) {
  return withErrorHandler(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return apiError('Non autorisé', 401);
    }

    // Check for demo mode
    if (!isDatabaseAvailable() || !db) {
      // In demo mode, accept any demo-token-* as valid
      if (token.startsWith('demo-token-')) {
        return apiSuccess({
          user: {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            phone: DEMO_USER.phone,
            role: DEMO_USER.role,
            firstName: DEMO_USER.firstName,
            lastName: DEMO_USER.lastName,
            avatar: DEMO_USER.avatar,
            language: 'fr',
            isActive: true,
            organizations: DEMO_USER.organizations,
          },
          session: {
            id: 'demo-session-1',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      }
      return apiError('Session invalide ou expirée', 401);
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

    // Check for demo mode
    const isDemoMode = !isDatabaseAvailable() || !db;

    // Login with password
    if (action === 'login') {
      const identifier = email || phone;
      if (!identifier || !password) {
        return apiError('Email/téléphone et mot de passe sont requis');
      }

      // Demo mode login
      if (isDemoMode) {
        // Accept demo@kfm-delice.com with password demo123
        if (identifier === 'demo@kfm-delice.com' && password === 'demo123') {
          const demoToken = generateDemoToken();
          return apiSuccess({
            user: {
              id: DEMO_USER.id,
              email: DEMO_USER.email,
              phone: DEMO_USER.phone,
              role: DEMO_USER.role,
              firstName: DEMO_USER.firstName,
              lastName: DEMO_USER.lastName,
              avatar: DEMO_USER.avatar,
            },
            token: demoToken,
            refreshToken: `demo-refresh-${Date.now()}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, 'Connexion réussie (mode démo)');
        }
        return apiError('Identifiants incorrects (mode démo - utilisez demo@kfm-delice.com / demo123)', 401);
      }

      const user = await getUserByEmailOrPhone(identifier);

      if (!user) {
        return apiError('Utilisateur non trouvé', 404);
      }

      if (!user.isActive || user.isLocked) {
        return apiError('Compte désactivé ou verrouillé', 403);
      }

      const isValidPasswordResult = await verifyPassword(password, user.passwordHash);
      if (!isValidPasswordResult) {
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

      // Demo mode registration
      if (isDemoMode) {
        return apiError('L\'inscription n\'est pas disponible en mode démo. Utilisez demo@kfm-delice.com / demo123 pour vous connecter.', 400);
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

      // Demo mode OTP
      if (isDemoMode) {
        return apiSuccess({
          message: 'Code OTP envoyé (mode démo)',
          otpCode: '123456',
        });
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

      // Demo mode OTP verification
      if (isDemoMode) {
        if (otpCode === '123456') {
          return apiSuccess({
            user: {
              id: DEMO_USER.id,
              email: DEMO_USER.email,
              phone: DEMO_USER.phone,
              role: DEMO_USER.role,
              firstName: DEMO_USER.firstName,
              lastName: DEMO_USER.lastName,
            },
            token: generateDemoToken(),
            refreshToken: `demo-refresh-${Date.now()}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, 'Connexion réussie (mode démo)');
        }
        return apiError('Code OTP invalide (mode démo - utilisez 123456)', 400);
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

      // Demo mode refresh
      if (isDemoMode) {
        if (refreshToken.startsWith('demo-refresh-')) {
          return apiSuccess({
            token: generateDemoToken(),
            refreshToken: `demo-refresh-${Date.now()}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          }, 'Token rafraîchi (mode démo)');
        }
        return apiError('Refresh token invalide ou expiré', 401);
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

    // Demo mode logout
    if (!isDatabaseAvailable() || !db) {
      return apiSuccess({ loggedOut: true }, 'Déconnexion réussie (mode démo)');
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

    // Demo mode password update
    if (!isDatabaseAvailable() || !db) {
      return apiError('La modification du mot de passe n\'est pas disponible en mode démo', 400);
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
