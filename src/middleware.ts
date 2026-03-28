import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'never',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow root landing page without i18n redirect
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Allow app routes without i18n
  const appRoutes = ['/login', '/dashboard', '/pos', '/orders', '/menu', '/reservations', 
                     '/customers', '/deliveries', '/drivers', '/analytics', '/settings',
                     '/kitchen', '/driver', '/staff', '/admin', '/profile', '/api',
                     '/customer'];
  
  if (appRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Apply i18n middleware for other routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
