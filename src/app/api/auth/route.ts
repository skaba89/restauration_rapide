// Authentication API - Resilient version
import { NextResponse } from 'next/server';

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
  organizations: [{
    id: 'demo-org-1',
    name: 'KFM DELICE',
    slug: 'kfm-delice',
    role: 'ADMIN',
  }],
};

// Lazy-loaded modules
let db: any = null;
let authHelpers: any = {};
let isDbAvailable = false;

// Dynamically import modules with error handling
async function loadModules() {
  if (db !== null) return; // Already loaded
  
  try {
    const dbModule = await import('@/lib/db');
    db = dbModule.db;
    isDbAvailable = dbModule.isDatabaseAvailable?.() ?? false;
    
    const helpers = await import('@/lib/auth-helpers');
    authHelpers = helpers;
  } catch (error) {
    console.error('Failed to load auth modules:', error);
    db = null;
    isDbAvailable = false;
  }
}

// Generate a demo token
function generateDemoToken(): string {
  return `demo-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Simple password verification for demo mode (bcrypt hash comparison)
async function verifyDemoPassword(password: string, hash: string): Promise<boolean> {
  try {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  } catch {
    // Fallback: direct comparison for demo
    const demoHash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4wqO.1BoWBPfGK.e';
    return password === 'demo123' || password === 'KfmDelice2024!';
  }
}

// Helper for JSON responses
function jsonResponse(success: boolean, data: any, status = 200): NextResponse {
  return NextResponse.json({ success, ...data }, { status });
}

// GET /api/auth - Get current session
export async function GET(request: Request) {
  try {
    await loadModules();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Non autorisé' }, 401);
    }

    // Demo mode or database unavailable
    if (!isDbAvailable || !db) {
      if (token.startsWith('demo-token')) {
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

    // Database mode
    const session = await authHelpers.validateSession?.(token);
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
          organizations: session.user.organizationUsers?.map((ou: any) => ({
            id: ou.organization.id,
            name: ou.organization.name,
            slug: ou.organization.slug,
            role: ou.role,
          })) || [],
        },
        session: {
          id: session.id,
          expiresAt: session.expiresAt,
        },
      }
    });
  } catch (error) {
    console.error('Auth GET error:', error);
    return jsonResponse(false, { error: 'Erreur serveur' }, 500);
  }
}

// POST /api/auth - Login, Register, or OTP verification
export async function POST(request: Request) {
  try {
    await loadModules();
    
    const body = await request.json();
    const { action, email, phone, password, otpCode, firstName, lastName, role = 'CUSTOMER' } = body;

    // Login with password
    if (action === 'login') {
      const identifier = email || phone;
      if (!identifier || !password) {
        return jsonResponse(false, { error: 'Email/téléphone et mot de passe sont requis' }, 400);
      }

      // Demo mode login
      if (!isDbAvailable || !db) {
        // Demo credentials
        const isDemoEmail = identifier === 'demo@kfm-delice.com';
        const isKfmEmail = identifier === 'contact@kfm-delice.com';
        const isDemoPassword = password === 'demo123' || password === 'KfmDelice2024!';
        
        if ((isDemoEmail && password === 'demo123') || (isKfmEmail && password === 'KfmDelice2024!')) {
          const user = isKfmEmail ? {
            id: 'kfm-user-1',
            email: 'contact@kfm-delice.com',
            phone: '+224 623 21 72 40',
            role: 'ORG_ADMIN',
            firstName: 'KFM',
            lastName: 'DELICE',
            avatar: null,
            organizations: [{
              id: 'kfm-org-1',
              name: 'KFM DELICE',
              slug: 'kfm-delice',
              role: 'ADMIN',
            }],
          } : DEMO_USER;
          
          const demoToken = generateDemoToken();
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
              token: demoToken,
              refreshToken: `demo-refresh-${Date.now()}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            message: 'Connexion réussie (mode démo)'
          });
        }
        return jsonResponse(false, { error: 'Identifiants incorrects. Mode démo: utilisez demo@kfm-delice.com / demo123 ou contact@kfm-delice.com / KfmDelice2024!' }, 401);
      }

      // Database mode
      const user = await authHelpers.getUserByEmailOrPhone?.(identifier);
      if (!user) {
        return jsonResponse(false, { error: 'Utilisateur non trouvé' }, 404);
      }

      if (!user.isActive || user.isLocked) {
        return jsonResponse(false, { error: 'Compte désactivé ou verrouillé' }, 403);
      }

      const isValidPassword = await authHelpers.verifyPassword?.(password, user.passwordHash);
      if (!isValidPassword) {
        return jsonResponse(false, { error: 'Mot de passe incorrect' }, 401);
      }

      const { ipAddress, userAgent } = authHelpers.getClientInfo?.(request) || {};
      const session = await authHelpers.createSession?.(user.id, ipAddress, userAgent);
      const refreshToken = await authHelpers.createRefreshToken?.(user.id);

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

      // Demo mode registration
      if (!isDbAvailable || !db) {
        return jsonResponse(false, { error: 'L\'inscription n\'est pas disponible en mode démo' }, 400);
      }

      // Database registration
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return jsonResponse(false, { error: 'Un compte avec cet email existe déjà' }, 409);
      }

      const hashedPassword = await authHelpers.hashPassword?.(password);
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

      const { ipAddress, userAgent } = authHelpers.getClientInfo?.(request) || {};
      const session = await authHelpers.createSession?.(user.id, ipAddress, userAgent);
      const refreshToken = await authHelpers.createRefreshToken?.(user.id);

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
      if (!isDbAvailable || !db) {
        return jsonResponse(true, {
          data: {
            message: 'Code OTP envoyé (mode démo)',
            otpCode: '123456',
          }
        });
      }

      // Database OTP
      const user = await authHelpers.getUserByEmailOrPhone?.(phone || email);
      if (type === 'LOGIN' && !user) {
        return jsonResponse(false, { error: 'Utilisateur non trouvé' }, 404);
      }

      const otp = await authHelpers.createOtpCode?.(type, phone, email, user?.id);
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
      if (!isDbAvailable || !db) {
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

      // Database OTP verification
      const otp = await authHelpers.verifyOtpCode?.(type, otpCode, phone, email);
      if (!otp) {
        return jsonResponse(false, { error: 'Code OTP invalide ou expiré' }, 400);
      }

      if (type === 'LOGIN' && otp.userId) {
        const user = await db.user.findUnique({ where: { id: otp.userId } });
        if (!user || !user.isActive) {
          return jsonResponse(false, { error: 'Compte non trouvé ou désactivé' }, 404);
        }

        const { ipAddress, userAgent } = authHelpers.getClientInfo?.(request) || {};
        const session = await authHelpers.createSession?.(user.id, ipAddress, userAgent);
        const refreshToken = await authHelpers.createRefreshToken?.(user.id);

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
      if (!isDbAvailable || !db) {
        if (refreshToken.startsWith('demo-refresh')) {
          return jsonResponse(true, {
            data: {
              token: generateDemoToken(),
              refreshToken: `demo-refresh-${Date.now()}`,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
            message: 'Token rafraîchi (mode démo)'
          });
        }
        return jsonResponse(false, { error: 'Refresh token invalide' }, 401);
      }

      // Database refresh
      const storedToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return jsonResponse(false, { error: 'Refresh token invalide ou expiré' }, 401);
      }

      const { ipAddress, userAgent } = authHelpers.getClientInfo?.(request) || {};
      const session = await authHelpers.createSession?.(storedToken.userId, ipAddress, userAgent);
      const newRefreshToken = await authHelpers.createRefreshToken?.(storedToken.userId);

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
  } catch (error) {
    console.error('Auth POST error:', error);
    return jsonResponse(false, { 
      error: error instanceof Error ? error.message : 'Erreur serveur',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, 500);
  }
}

// DELETE /api/auth - Logout
export async function DELETE(request: Request) {
  try {
    await loadModules();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Token requis' }, 401);
    }

    // Demo mode logout
    if (!isDbAvailable || !db) {
      return jsonResponse(true, { data: { loggedOut: true }, message: 'Déconnexion réussie (mode démo)' });
    }

    const success = await authHelpers.invalidateSession?.(token);
    if (!success) {
      return jsonResponse(false, { error: 'Erreur lors de la déconnexion' }, 500);
    }

    return jsonResponse(true, { data: { loggedOut: true }, message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Auth DELETE error:', error);
    return jsonResponse(false, { error: 'Erreur serveur' }, 500);
  }
}

// PATCH /api/auth - Update password
export async function PATCH(request: Request) {
  try {
    await loadModules();
    
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return jsonResponse(false, { error: 'Non autorisé' }, 401);
    }

    // Demo mode password update
    if (!isDbAvailable || !db) {
      return jsonResponse(false, { error: 'La modification du mot de passe n\'est pas disponible en mode démo' }, 400);
    }

    const session = await authHelpers.validateSession?.(token);
    if (!session || !session.user) {
      return jsonResponse(false, { error: 'Session invalide' }, 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return jsonResponse(false, { error: 'Mot de passe actuel et nouveau mot de passe sont requis' }, 400);
    }

    const isPasswordValid = await authHelpers.verifyPassword?.(currentPassword, session.user.passwordHash);
    if (!isPasswordValid) {
      return jsonResponse(false, { error: 'Mot de passe actuel incorrect' }, 401);
    }

    const hashedPassword = await authHelpers.hashPassword?.(newPassword);
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword },
    });

    return jsonResponse(true, { data: { updated: true }, message: 'Mot de passe mis à jour' });
  } catch (error) {
    console.error('Auth PATCH error:', error);
    return jsonResponse(false, { error: 'Erreur serveur' }, 500);
  }
}
