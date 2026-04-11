// ============================================
// Restaurant OS - Sentry Edge Configuration
// Edge runtime error tracking
// ============================================

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    
    // Release version
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring (lower for edge)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
    
    // Ignore specific errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'Network error',
    ],
  });
}

export default Sentry;
