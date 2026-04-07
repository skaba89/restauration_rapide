// Authentication API
import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
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

// Safe error handler
function safeResponse(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  return handler().catch((error) => {
    console.error('Auth API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Une erreur est survenue',
    }, { status: 500 });
  });
}

// Helper for JSON responses
function jsonResponse(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/auth - Get current session
export async function GET(request: Request) {
  return safeResponse(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Non autorisé' }, 401);
    }

    // Check for demo mode
    const databaseAvailable = isDatabaseAvailable();
    
    if (!databaseAvailable || !db) {
      // In demo mode, accept any demo-token-* as valid
      if (token.startsWith('demo-token-')) {
        return jsonResponse(true, {
          data: {
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
          }
        });
      }
      return jsonResponse(false, { error: 'Session invalide ou expirée' }, 401);
    }

    const session = await validateSession(token);

    if (!session) {
      return jsonResponse(false, { error: 'Session invalide ou expirée' }, 401);
    }

    return jsonResponse(true, {
      data: {
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
      }
    });
  });
}

// POST /api/auth - Login, Register, or OTP verification
export async function POST(request: Request) {
  return safeResponse(async () => {
    const body = await request.json();
    const { action, email, phone, password, otpCode, firstName, lastName, role = 'CUSTOMER' } = body;

    // Check for demo mode
    const isDemoMode = !isDatabaseAvailable() || !db;

    // Login with password
    if (action === 'login') {
      const identifier = email || phone;
      if (!identifier || !password) {
        return jsonResponse(false, { error: 'Email/téléphone et mot de passe sont requis' }, 400);
      }

      // Demo mode login
      if (isDemoMode) {
        if (identifier === 'demo@kfm-delice.com' && password === 'demo123') {
          const demoToken = generateDemoToken();
          return jsonResponse(true, {
            data: {
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
            },
            message: 'Connexion réussie (mode démo)'
          });
        }
        return jsonResponse(false, { error: 'Identifiants incorrects (mode démo - utilisez demo@kfm-delice.com / demo123)' }, 401);
      }

      const user = await getUserByEmailOrPhone(identifier);

      if (!user) {
        return jsonResponse(false, { error: 'Utilisateur non trouvé' }, 404);
      }

      if (!user.isActive || user.isLocked) {
        return jsonResponse(false, { error: 'Compte désactivé ou verrouillé' }, 403);
      }

      const isValidPasswordResult = await verifyPassword(password, user.passwordHash);
      if (!isValidPasswordResult) {
        return jsonResponse(false, { error: 'Mot de passe incorrect' }, 401);
      }

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(user.id, ipAddress, userAgent);
      const refreshToken = await createRefreshToken(user.id);

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
      });

      return jsonResponse(true, {
        data: {
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
        },
        message: 'Connexion réussie'
      });
    }

    // Register new user
    if (action === 'register') {
      if (!email || !password) {
        return jsonResponse(false, { error: 'Email et mot de passe sont requis' }, 400);
      }

      if (!isValidEmail(email)) {
        return jsonResponse(false, { error: 'Email invalide' }, 400);
      }

      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        return jsonResponse(false, { error: passwordValidation.message || 'Mot de passe invalide' }, 400);
      }

      // Demo mode registration
      if (isDemoMode) {
        return jsonResponse(false, { error: 'L\'inscription n\'est pas disponible en mode démo. Utilisez demo@kfm-delice.com / demo123 pour vous connecter.' }, 400);
      }

      // Check if user exists
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return jsonResponse(false, { error: 'Un compte avec cet email existe déjà' }, 409);
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

      return jsonResponse(true, {
        data: {
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
        },
        message: 'Compte créé avec succès'
      }, 201);
    }

    // Request OTP
    if (action === 'request-otp') {
      const type = body.type || 'LOGIN';
      
      if (!phone && !email) {
        return jsonResponse(false, { error: 'Téléphone ou email est requis' }, 400);
      }

      // Demo mode OTP
      if (isDemoMode) {
        return jsonResponse(true, {
          data: {
            message: 'Code OTP envoyé (mode démo)',
            otpCode: '123456',
          }
        });
      }

      // Check if user exists for login OTP
      if (type === 'LOGIN') {
        const user = await getUserByEmailOrPhone(phone || email);
        if (!user) {
          return jsonResponse(false, { error: 'Utilisateur non trouvé' }, 404);
        }

        const otp = await createOtpCode(type, phone, email, user.id);

        return jsonResponse(true, {
          data: {
            message: 'Code OTP envoyé',
            otpCode: otp.code,
          }
        });
      }

      // For registration, verify, etc.
      const otp = await createOtpCode(type, phone, email);

      return jsonResponse(true, {
        data: {
          message: 'Code OTP envoyé',
          otpCode: otp.code,
        }
      });
    }

    // Verify OTP
    if (action === 'verify-otp') {
      const type = body.type || 'LOGIN';
      
      if (!otpCode || (!phone && !email)) {
        return jsonResponse(false, { error: 'Code OTP et téléphone/email sont requis' }, 400);
      }

      // Demo mode OTP verification
      if (isDemoMode) {
        if (otpCode === '123456') {
          return jsonResponse(true, {
            data: {
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
            },
            message: 'Connexion réussie (mode démo)'
          });
        }
        return jsonResponse(false, { error: 'Code OTP invalide (mode démo - utilisez 123456)' }, 400);
      }

      const otp = await verifyOtpCode(type, otpCode, phone, email);

      if (!otp) {
        return jsonResponse(false, { error: 'Code OTP invalide ou expiré' }, 400);
      }

      // For login, create session
      if (type === 'LOGIN' && otp.userId) {
        const user = await db.user.findUnique({ where: { id: otp.userId } });
        
        if (!user || !user.isActive) {
          return jsonResponse(false, { error: 'Compte non trouvé ou désactivé' }, 404);
        }

        const { ipAddress, userAgent } = getClientInfo(request);
        const session = await createSession(user.id, ipAddress, userAgent);
        const refreshToken = await createRefreshToken(user.id);

        return jsonResponse(true, {
          data: {
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
          },
          message: 'Connexion réussie'
        });
      }

      return jsonResponse(true, { data: { verified: true }, message: 'Code OTP vérifié' });
    }

    // Refresh token
    if (action === 'refresh') {
      const { refreshToken } = body;

      if (!refreshToken) {
        return jsonResponse(false, { error: 'Refresh token est requis' }, 400);
      }

      // Demo mode refresh
      if (isDemoMode) {
        if (refreshToken.startsWith('demo-refresh-')) {
          return jsonResponse(true, {
            data: {
              token: generateDemoToken(),
              refreshToken: `demo-refresh-${Date.now()}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            message: 'Token rafraîchi (mode démo)'
          });
        }
        return jsonResponse(false, { error: 'Refresh token invalide ou expiré' }, 401);
      }

      const storedToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return jsonResponse(false, { error: 'Refresh token invalide ou expiré' }, 401);
      }

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(storedToken.userId, ipAddress, userAgent);
      const newRefreshToken = await createRefreshToken(storedToken.userId);

      // Revoke old refresh token
      await db.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      return jsonResponse(true, {
        data: {
          token: session.token,
          refreshToken: newRefreshToken.token,
          expiresAt: session.expiresAt,
        },
        message: 'Token rafraîchi'
      });
    }

    return jsonResponse(false, { error: 'Action non reconnue' }, 400);
  });
}

// DELETE /api/auth - Logout
export async function DELETE(request: Request) {
  return safeResponse(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Token requis' }, 401);
    }

    // Demo mode logout
    if (!isDatabaseAvailable() || !db) {
      return jsonResponse(true, { data: { loggedOut: true }, message: 'Déconnexion réussie (mode démo)' });
    }

    const success = await invalidateSession(token);

    if (!success) {
      return jsonResponse(false, { error: 'Erreur lors de la déconnexion' }, 500);
    }

    return jsonResponse(true, { data: { loggedOut: true }, message: 'Déconnexion réussie' });
  });
}

// PATCH /api/auth - Update password
export async function PATCH(request: Request) {
  return safeResponse(async () => {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Non autorisé' }, 401);
    }

    // Demo mode password update
    if (!isDatabaseAvailable() || !db) {
      return jsonResponse(false, { error: 'La modification du mot de passe n\'est pas disponible en mode démo' }, 400);
    }

    const session = await validateSession(token);
    if (!session || !session.user) {
      return jsonResponse(false, { error: 'Session invalide' }, 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return jsonResponse(false, { error: 'Mot de passe actuel et nouveau mot de passe sont requis' }, 400);
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      return jsonResponse(false, { error: passwordValidation.message || 'Nouveau mot de passe invalide' }, 400);
    }

    const isPasswordValid = await verifyPassword(currentPassword, session.user.passwordHash);
    if (!isPasswordValid) {
      return jsonResponse(false, { error: 'Mot de passe actuel incorrect' }, 401);
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    // Invalidate all other sessions
    try {
      await db.session.deleteMany({
        where: {
          userId: session.user.id,
          id: { not: session.id },
        },
      });
    } catch (e) {
      // Ignore session cleanup errors
    }

    return jsonResponse(true, { data: { updated: true }, message: 'Mot de passe mis à jour' });
  });
}
