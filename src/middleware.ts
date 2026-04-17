import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that are intentionally public (no auth required)
const PUBLIC_API_ROUTES = [
  '/api/public/',
  '/api/auth/',
  '/api/login',
  '/api/register',
  '/api/otp/',
  '/api/menu',       // Public menu endpoint (no trailing slash)
  '/api/menu-items', // Public menu items
  '/api/orders',     // Customer order creation
  '/api/reservations', // Public reservations
  '/api/reviews',    // Public reviews
  '/api/voice-order',
  '/api/webhook/',
  '/api/stripe/',
  '/api/notifications/',
  '/api/realtime',
];

// Routes that require SUPER_ADMIN role (most sensitive)
const SUPER_ADMIN_ROUTES = [
  '/api/admin/reset-password',
  '/api/clear-data',
  '/api/debug',
  '/api/setup',
];

// Routes that have been disabled for security (P1 remediation)
const DISABLED_ROUTES = [
  '/api/fix-admin',
  '/api/migrate',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── CORS handling for API routes ──
  if (pathname.startsWith('/api')) {
    // SECURITY (P1): No wildcard CORS in production - require explicit origin
    let allowedOrigin: string;
    if (process.env.NODE_ENV === 'production') {
      allowedOrigin = process.env.ALLOWED_ORIGIN || request.headers.get('origin') || '';
      // If no explicit ALLOWED_ORIGIN set, reflect the request origin (more restrictive than wildcard)
      if (!process.env.ALLOWED_ORIGIN) {
        const requestOrigin = request.headers.get('origin');
        allowedOrigin = requestOrigin || '';
      }
    } else {
      // Development: allow localhost
      allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
    }

    // Handle CORS preflight (OPTIONS) requests
    if (request.method === 'OPTIONS') {
      if (allowedOrigin) {
        const response = new NextResponse(null, { status: 200 });
        response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', '86400');
        return response;
      }
      // Block if no valid origin
      return new NextResponse(null, { status: 403 });
    }

    // Add CORS headers to all API responses
    const response = NextResponse.next();
    if (allowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    }
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    // ── Disabled routes (P1 remediation) ──
    const isDisabledRoute = DISABLED_ROUTES.some(route => pathname.startsWith(route));
    if (isDisabledRoute) {
      return NextResponse.json(
        { success: false, error: 'Endpoint désactivé pour raisons de sécurité', code: 'ENDPOINT_DISABLED' },
        { status: 410, headers: response.headers }
      );
    }

    // ── Admin API auth enforcement ──
    // SECURITY (P1): Enforce auth in ALL environments, not just production
    if (pathname.startsWith('/api/admin')) {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Authentification requise', code: 'AUTH_REQUIRED' },
          { status: 401, headers: response.headers }
        );
      }

      // Extra protection for SUPER_ADMIN routes
      const isSuperAdminRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
      if (isSuperAdminRoute) {
        response.headers.set('X-Auth-Required', 'SUPER_ADMIN');
      }

      // Security headers for admin routes
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }

    // ── Critical endpoint protection (all environments) ──
    const isCriticalRoute = SUPER_ADMIN_ROUTES.some(route => pathname.startsWith(route));
    if (isCriticalRoute) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
        return NextResponse.json(
          { success: false, error: 'Authentification requise pour cette opération', code: 'AUTH_REQUIRED' },
          { status: 401, headers: response.headers }
        );
      }
    }

    return response;
  }

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Skip for app routes
  const appRoutes = ['/login', '/dashboard', '/pos', '/orders', '/menu', '/reservations',
                     '/customers', '/deliveries', '/drivers', '/analytics', '/settings',
                     '/kitchen', '/driver', '/staff', '/admin', '/profile', '/customer', '/r'];

  if (appRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Root landing page
  if (pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Run middleware on all routes (including API routes for CORS and auth)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
