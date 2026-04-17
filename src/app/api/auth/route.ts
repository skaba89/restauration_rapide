// ============================================
// Restaurant OS - Authentication API
// Production mode: database-only authentication
// ============================================
import { NextResponse } from 'next/server';
import { authRateLimiter } from '@/lib/rate-limiter';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, createRefreshToken, getClientInfo, getUserByEmailOrPhone, createOtpCode, verifyOtpCode, invalidateSession } from '@/lib/auth-helpers';

// Helper for JSON responses
function json(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/auth - Get current session (validate token)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json(false, { error: 'Non autorisé - Token requis' }, 401);
    }

    if (!db) {
      return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
    }

    const { validateSession } = await import('@/lib/auth-helpers');
    const session = await validateSession(token);

    if (!session) {
      return json(false, { error: 'Session invalide ou expirée' }, 401);
    }

    const user = session.user;

    return json(true, {
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          isActive: user.isActive,
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      }
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return json(false, { error: 'Erreur serveur' }, 500);
  }
}

// POST /api/auth - Login, Register, or OTP verification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, phone, password, otpCode, firstName, lastName, role = 'CUSTOMER' } = body;

    // Login with password
    if (action === 'login') {
      // Rate limit login attempts
      const loginResult = await authRateLimiter(request as any);
      if (!loginResult.success) {
        return loginResult.response;
      }

      const identifier = (email || phone || '').toLowerCase().trim();
      const passwordStr = String(password || '').trim();
      
      console.log('[AUTH] Login attempt:', { identifier, hasPassword: !!passwordStr });
      
      if (!identifier || !passwordStr) {
        return json(false, { error: 'Email/téléphone et mot de passe sont requis' }, 400);
      }

      if (!db) {
        return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
      }

      // Database authentication
      const user = await getUserByEmailOrPhone(identifier);
      if (!user) {
        console.log('[AUTH] Login failed - user not found:', identifier);
        return json(false, { error: 'Identifiants incorrects' }, 401);
      }

      if (user.isLocked) {
        return json(false, { error: 'Compte verrouillé. Contactez l\'administrateur.' }, 403);
      }

      if (!user.isActive) {
        return json(false, { error: 'Compte désactivé. Contactez l\'administrateur.' }, 403);
      }

      const isValid = await verifyPassword(passwordStr, user.passwordHash);
      if (!isValid) {
        console.log('[AUTH] Login failed - wrong password for:', identifier);
        return json(false, { error: 'Identifiants incorrects' }, 401);
      }

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(user.id, ipAddress, userAgent);
      const refreshToken = await createRefreshToken(user.id);

      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
      });

      return json(true, {
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
      const regResult = await authRateLimiter(request as any);
      if (!regResult.success) {
        return regResult.response;
      }

      if (!email || !password) {
        return json(false, { error: 'Email et mot de passe sont requis' }, 400);
      }

      if (!db) {
        return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
      }

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return json(false, { error: 'Un compte avec cet email existe déjà' }, 409);
      }

      const hashedPassword = await hashPassword(password);
      const user = await db.user.create({
        data: {
          email,
          phone,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role,
        },
      });

      const { ipAddress, userAgent } = getClientInfo(request);
      const session = await createSession(user.id, ipAddress, userAgent);
      const refreshToken = await createRefreshToken(user.id);

      return json(true, {
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
      if (!db) {
        return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
      }

      const recipient = email || phone;
      if (!recipient) {
        return json(false, { error: 'Email ou téléphone est requis' }, 400);
      }

      try {
        const otpType = email ? 'VERIFY_EMAIL' : 'VERIFY_PHONE';
        await createOtpCode(otpType, phone, email);
        // In production, an SMS/email would be sent here via Twilio/etc.
        console.log('[AUTH] OTP created for:', recipient, '(check DB for code)');
        return json(true, { data: { message: 'Code OTP envoyé' } });
      } catch (error) {
        console.error('OTP creation error:', error);
        return json(false, { error: 'Erreur lors de l\'envoi du code OTP' }, 500);
      }
    }

    // Verify OTP
    if (action === 'verify-otp') {
      if (!otpCode || (!phone && !email)) {
        return json(false, { error: 'Code OTP et téléphone/email sont requis' }, 400);
      }

      if (!db) {
        return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
      }

      const otpType = email ? 'VERIFY_EMAIL' : 'VERIFY_PHONE';
      const otpResult = await verifyOtpCode(otpType, otpCode, phone, email);
      
      if (otpResult) {
        // OTP valid - if userId is associated, create a session
        if (otpResult.userId) {
          const { ipAddress, userAgent } = getClientInfo(request);
          const session = await createSession(otpResult.userId, ipAddress, userAgent);
          const refreshToken = await createRefreshToken(otpResult.userId);

          return json(true, {
            data: {
              user: {
                id: otpResult.userId,
              },
              token: session.token,
              refreshToken: refreshToken.token,
              expiresAt: session.expiresAt,
            },
            message: 'Code OTP vérifié'
          });
        }

        return json(true, {
          data: { message: 'Code OTP vérifié' }
        });
      }

      return json(false, { error: 'Code OTP invalide ou expiré' }, 400);
    }

    // Refresh token
    if (action === 'refresh') {
      const { refreshToken } = body;
      if (!refreshToken) {
        return json(false, { error: 'Refresh token est requis' }, 400);
      }

      if (!db) {
        return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
      }

      try {
        const storedToken = await db.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { user: true },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
          if (storedToken) {
            await db.refreshToken.delete({ where: { id: storedToken.id } });
          }
          return json(false, { error: 'Refresh token invalide ou expiré' }, 401);
        }

        // Delete old refresh token and create new ones
        await db.refreshToken.delete({ where: { id: storedToken.id } });
        const { ipAddress, userAgent } = getClientInfo(request);
        const session = await createSession(storedToken.userId, ipAddress, userAgent);
        const newRefreshToken = await createRefreshToken(storedToken.userId);

        return json(true, {
          data: {
            token: session.token,
            refreshToken: newRefreshToken.token,
            expiresAt: session.expiresAt,
          },
          message: 'Token rafraîchi'
        });
      } catch (error) {
        console.error('Token refresh error:', error);
        return json(false, { error: 'Erreur lors du rafraîchissement du token' }, 500);
      }
    }

    return json(false, { error: 'Action non reconnue' }, 400);
  } catch (error) {
    console.error('Auth POST error:', error);
    return json(false, { 
      error: error instanceof Error ? error.message : 'Erreur serveur',
    }, 500);
  }
}

// DELETE /api/auth - Logout
export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      await invalidateSession(token);
    }

    return json(true, { data: { loggedOut: true }, message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return json(false, { error: 'Erreur serveur' }, 500);
  }
}

// PATCH /api/auth - Update password
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json(false, { error: 'Non autorisé' }, 401);
    }

    if (!db) {
      return json(false, { error: 'Base de données non configurée. Contactez l\'administrateur.' }, 503);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return json(false, { error: 'Mot de passe actuel et nouveau mot de passe sont requis' }, 400);
    }

    const { validateSession } = await import('@/lib/auth-helpers');
    const session = await validateSession(token);
    if (!session) {
      return json(false, { error: 'Session invalide' }, 401);
    }

    const user = session.user;
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return json(false, { error: 'Mot de passe actuel incorrect' }, 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    return json(true, { data: { passwordUpdated: true }, message: 'Mot de passe mis à jour' });
  } catch (error) {
    console.error('Auth PATCH error:', error);
    return json(false, { error: 'Erreur serveur' }, 500);
  }
}
