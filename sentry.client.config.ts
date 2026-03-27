// ============================================
// Restaurant OS - Sentry Client Configuration
// Client-side error tracking
// ============================================

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    
    // Release version
    release: process.env.npm_package_version || '1.0.0',
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.restaurant-os\.app/,
        ],
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Ignore specific errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'Network error',
      'NetworkError',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'LOADING',
      'cancelled',
      'abort',
    ],
    
    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
      }
      
      // Remove sensitive query params
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url);
          url.searchParams.delete('token');
          url.searchParams.delete('password');
          url.searchParams.delete('apiKey');
          event.request.url = url.toString();
        } catch {
          // Invalid URL, keep as is
        }
      }
      
      return event;
    },
  });
}

export default Sentry;
