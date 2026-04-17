// SECURITY (P1): Rate limiting added to login/register. Demo OTP gate strengthened.
// Authentication API - Simplified version for standalone deployment
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { authRateLimiter } from '@/lib/rate-limiter';
import { registerDemoSessionGetter } from '@/lib/auth-middleware';
import { createDemoToken, validateDemoToken, getDemoTokenExpiry } from '@/lib/demo-tokens';

// Demo mode: only active when DEMO_MODE=true explicitly AND no DATABASE_URL
// When DATABASE_URL is set, always use real DB authentication
const IS_DEMO_MODE = process.env.DEMO_MODE === 'true' && !process.env.DATABASE_URL;

// Demo users - In production, these would come from the database
// Each demo user has its own hardcoded password (matching the login page UI)
// DEMO_PASSWORD_HASH env var is used as a FALLBACK if set
const DEMO_SHARED_PASSWORD = process.env.DEMO_PASSWORD_HASH || null;

const DEMO_USERS: Record<string, { password: string; user: any }> = {
  // Super Admin account
  'admin@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'AdminKFM2024!',
    user: {
      id: 'admin-user-1',
      email: 'admin@kfm-delice.com',
      phone: '+224 623 21 72 40',
      role: 'SUPER_ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'kfm-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'ADMIN',
      }],
    },
  },
  // Demo account
  'demo@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'demo123',
    user: {
      id: 'demo-user-1',
      email: 'demo@kfm-delice.com',
      phone: '+224 622 000 000',
      role: 'ORG_ADMIN',
      firstName: 'Admin',
      lastName: 'Demo',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'demo-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'ADMIN',
      }],
    },
  },
  // Contact account
  'contact@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'demo123',
    user: {
      id: 'kfm-user-1',
      email: 'contact@kfm-delice.com',
      phone: '+224 623 21 72 41',
      role: 'ORG_ADMIN',
      firstName: 'KFM',
      lastName: 'DELICE',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'kfm-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'ADMIN',
      }],
    },
  },
  // Restaurant Manager account
  'amadou@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'kfm2024!',
    user: {
      id: 'amadou-user-1',
      email: 'amadou@kfm-delice.com',
      phone: '+224 622 111 222',
      role: 'RESTAURANT_MANAGER',
      firstName: 'Amadou',
      lastName: 'Diallo',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'kfm-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'MANAGER',
      }],
    },
  },
  // Kitchen/Cook account
  'kitchen@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'kitchen123',
    user: {
      id: 'kitchen-user-1',
      email: 'kitchen@kfm-delice.com',
      phone: '+224 622 222 333',
      role: 'KITCHEN',
      firstName: 'Chef',
      lastName: 'Abdoulaye',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'kfm-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'STAFF',
      }],
    },
  },
  // Driver account
  'driver@kfm-delice.com': {
    password: DEMO_SHARED_PASSWORD || 'driver123',
    user: {
      id: 'driver-user-1',
      email: 'driver@kfm-delice.com',
      phone: '+224 622 333 444',
      role: 'DRIVER',
      firstName: 'Moussa',
      lastName: 'Touré',
      avatar: null,
      isActive: true,
      organizations: [{
        id: 'kfm-org-1',
        name: 'KFM DELICE',
        slug: 'kfm-delice',
        role: 'STAFF',
      }],
    },
  },
};

// In-memory sessions for demo mode
const sessions = new Map<string, { user: any; expiresAt: Date }>();

// Register session getter so auth-middleware can validate demo tokens
registerDemoSessionGetter((token) => sessions.get(token));

// Generate a cryptographically secure unique token (256-bit entropy)
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Helper for JSON responses
function json(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/auth - Get current session
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json(false, { error: 'Non autorisé - Token requis' }, 401);
    }

    // 1. Check self-contained demo token (works across serverless instances)
    const demoPayload = validateDemoToken(token);
    if (demoPayload) {
      // Look up full user data from demo users
      const demoUserEntry = Object.values(DEMO_USERS).find(u => u.user.id === demoPayload.userId);
      if (demoUserEntry) {
        return json(true, {
          data: {
            user: demoUserEntry.user,
            session: {
              id: token,
              expiresAt: new Date(demoPayload.exp).toISOString(),
            },
          }
        });
      }
    }

    // 2. Check in-memory sessions (same instance)
    const session = sessions.get(token);
    if (session && session.expiresAt > new Date()) {
      return json(true, {
        data: {
          user: session.user,
          session: {
            id: token,
            expiresAt: session.expiresAt.toISOString(),
          },
        }
      });
    }

    // Token expired or not found
    if (session) {
      sessions.delete(token);
    }

    return json(false, { error: 'Session invalide ou expirée' }, 401);
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
      // SECURITY (P1): Rate limit login attempts
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

      // Check demo users (only in demo mode)
      if (IS_DEMO_MODE) {
        const demoUser = DEMO_USERS[identifier];
        if (demoUser && demoUser.password && demoUser.password === passwordStr) {
          // Create self-contained demo token (works across serverless instances)
          const token = createDemoToken(demoUser.user);
          const expiresAt = getDemoTokenExpiry(token) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

          // Also store in memory for same-instance fast path
          sessions.set(token, { user: demoUser.user, expiresAt });

          return json(true, {
            data: {
              user: {
                id: demoUser.user.id,
                email: demoUser.user.email,
                phone: demoUser.user.phone,
                role: demoUser.user.role,
                firstName: demoUser.user.firstName,
                lastName: demoUser.user.lastName,
                avatar: demoUser.user.avatar,
                organizations: demoUser.user.organizations,
              },
              token: token,
              refreshToken: `refresh-${Date.now()}`,
              expiresAt: expiresAt.toISOString(),
            },
            message: 'Connexion réussie'
          });
        }
      } // end IS_DEMO_MODE demo user check

      // Try database authentication
      try {
        const { getUserByEmailOrPhone, verifyPassword, createSession, createRefreshToken, getClientInfo } = await import('@/lib/auth-helpers');
        const { db } = await import('@/lib/db');
        
        if (db) {
          const user = await getUserByEmailOrPhone(identifier);
          if (user && !user.isLocked && user.isActive) {
            const isValid = await verifyPassword(password, user.passwordHash);
            if (isValid) {
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
          }
        }
      } catch (dbError) {
        console.log('Database not available, using demo mode only');
      }

      console.log('[AUTH] Login failed for:', identifier);
      const failResponse: Record<string, string> = { error: 'Identifiants incorrects' };
      if (IS_DEMO_MODE) {
        failResponse.hint = 'Mode demo active - consultez la documentation pour les comptes de demonstration';
      }
      return json(false, failResponse, 401);
    }

    // Register new user
    if (action === 'register') {
      // SECURITY (P1): Rate limit registration attempts
      const regResult = await authRateLimiter(request as any);
      if (!regResult.success) {
        return regResult.response;
      }

      if (!email || !password) {
        return json(false, { error: 'Email et mot de passe sont requis' }, 400);
      }

      try {
        const { hashPassword, createSession, createRefreshToken, getClientInfo } = await import('@/lib/auth-helpers');
        const { db } = await import('@/lib/db');
        
        if (!db) {
          return json(false, { error: 'L\'inscription nécessite une base de données. Utilisez un compte démo.' }, 400);
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
      } catch (dbError) {
        console.error('Registration error:', dbError);
        return json(false, { error: 'Erreur lors de l\'inscription' }, 500);
      }
    }

    // Request OTP
    if (action === 'request-otp') {
      // In production, a real OTP would be sent via SMS using a provider like Twilio
      if (IS_DEMO_MODE) {
        return json(true, {
          data: {
            message: 'Code OTP envoye (mode demo)',
          }
        });
      }

      // Non-demo mode: use proper OTP sending from auth-helpers
      try {
        const { sendOtp } = await import('@/lib/auth-helpers');
        const recipient = email || phone;
        await sendOtp(recipient);
        return json(true, { data: { message: 'Code OTP envoye' } });
      } catch {
        return json(false, { error: 'Erreur lors de l\'envoi du code OTP' }, 500);
      }
    }

    // Verify OTP
    if (action === 'verify-otp') {
      if (!otpCode || (!phone && !email)) {
        return json(false, { error: 'Code OTP et téléphone/email sont requis' }, 400);
      }

      // SECURITY (P1): Demo OTP gate strengthened - only works for demo-specific emails
      if (IS_DEMO_MODE && otpCode === '123456') {
        const recipient = (email || phone || '').toLowerCase().trim();
        // Only allow demo OTP for known demo email addresses, not any random user
        const demoUserEntry = recipient && DEMO_USERS[recipient];
        if (!demoUserEntry) {
          console.warn('[AUTH] Demo OTP attempt for non-demo user:', recipient);
          return json(false, { error: 'Code OTP invalide' }, 400);
        }

        // Create self-contained demo token
        const token = createDemoToken(demoUserEntry.user);
        const demoUser = demoUserEntry.user;
        const expiresAt = getDemoTokenExpiry(token) || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Also store in memory for same-instance fast path
        sessions.set(token, { user: demoUser, expiresAt });

        return json(true, {
          data: {
            user: {
              id: demoUser.id,
              email: demoUser.email,
              phone: demoUser.phone,
              role: demoUser.role,
              firstName: demoUser.firstName,
              lastName: demoUser.lastName,
            },
            token: token,
            refreshToken: `refresh-${Date.now()}`,
            expiresAt: expiresAt.toISOString(),
          },
          message: 'Connexion réussie'
        });
      }

      // Non-demo mode: use proper OTP verification from auth-helpers
      try {
        const { verifyOtp } = await import('@/lib/auth-helpers');
        const recipient = email || phone;
        const otpResult = await verifyOtp(recipient, otpCode);
        if (otpResult.valid) {
          const token = generateToken();
          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          sessions.set(token, { user: otpResult.user, expiresAt });
          return json(true, {
            data: {
              user: otpResult.user,
              token,
              refreshToken: `refresh-${Date.now()}`,
              expiresAt: expiresAt.toISOString(),
            },
            message: 'Connexion réussie'
          });
        }
      } catch {
        // auth-helpers not available
      }

      return json(false, { error: 'Code OTP invalide' }, 400);
    }

    // Refresh token
    if (action === 'refresh') {
      const { refreshToken } = body;
      if (!refreshToken) {
        return json(false, { error: 'Refresh token est requis' }, 400);
      }

      // Demo mode refresh - generate a new self-contained demo token
      if (refreshToken.startsWith('refresh-')) {
        // Extract userId from the old token if it's a demo token
        // For refresh, we need the original token passed in body
        const { originalToken } = body;
        let newToken: string;
        if (originalToken) {
          const payload = validateDemoToken(originalToken);
          if (payload) {
            // Refresh with the same user identity
            const mockUser = { id: payload.userId, email: payload.email, role: payload.role };
            newToken = createDemoToken(mockUser);
          } else {
            newToken = generateToken();
          }
        } else {
          newToken = generateToken();
        }
        return json(true, {
          data: {
            token: newToken,
            refreshToken: `refresh-${Date.now()}`,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          message: 'Token rafraîchi'
        });
      }

      return json(false, { error: 'Refresh token invalide' }, 401);
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
      sessions.delete(token);
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

    // Demo mode password update not available
    return json(false, { error: 'La modification du mot de passe n\'est pas disponible en mode démo' }, 400);
  } catch (error) {
    console.error('Auth PATCH error:', error);
    return json(false, { error: 'Erreur serveur' }, 500);
  }
}
