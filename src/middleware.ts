import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware that only handles i18n for non-API, non-static routes
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and internal Next.js routes
  if (
    pathname.startsWith('/api') ||
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
  
  // For other routes, just continue (i18n handling can be added later if needed)
  return NextResponse.next();
}

// Run middleware on all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
