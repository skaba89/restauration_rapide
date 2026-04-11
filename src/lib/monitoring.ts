// ============================================
// Restaurant OS - Sentry Monitoring Configuration
// Error tracking and performance monitoring
// ============================================

/**
 * Sentry Configuration for Restaurant OS
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Create sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts
 * 3. Add SENTRY_DSN to your environment variables
 * 
 * Environment Variables:
 * - SENTRY_DSN: Your Sentry project DSN
 * - SENTRY_AUTH_TOKEN: For source maps upload
 * - SENTRY_ORG: Your Sentry organization
 * - SENTRY_PROJECT: Your Sentry project name
 * - NEXT_PUBLIC_SENTRY_DSN: Client-side DSN (same as SENTRY_DSN)
 */

export const sentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Release version (set during build)
  release: process.env.npm_package_version || '1.0.0',
  
  // Sample rate for performance monitoring (0.0 to 1.0)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Sample rate for session replays (0.0 to 1.0)
  replaysSessionSampleRate: 0.1,
  
  // Sample rate for error replays
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore specific errors
  ignoreErrors: [
    // Browser extensions
    'Non-Error promise rejection captured',
    'Network error',
    'NetworkError',
    // Random browser issues
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Next.js specific
    'LOADING', // Next.js loading state
  ],
  
  // Filter out sensitive data
  beforeSend(event: any, hint: any) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
      delete event.request.headers['x-api-key'];
    }
    
    // Remove sensitive query params
    if (event.request?.url) {
      const url = new URL(event.request.url);
      url.searchParams.delete('token');
      url.searchParams.delete('password');
      url.searchParams.delete('apiKey');
      event.request.url = url.toString();
    }
    
    // Filter out known non-critical errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Don't report cancelled requests
      if (error.message.includes('cancelled') || error.message.includes('abort')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Performance monitoring integrations
  integrations: [
    // Browser tracing
    // new BrowserTracing({
    //   tracePropagationTargets: [
    //     'localhost',
    //     /^https:\/\/api\.yourdomain\.com/,
    //   ],
    // }),
    // Session replay
    // new Replay({
    //   maskAllText: true,
    //   blockAllMedia: true,
    // }),
  ],
};

/**
 * Custom error classes for better error tracking
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Non autorisé') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Accès non autorisé') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Ressource') {
    super(`${resource} non trouvé(e)`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string, public provider: string, details?: Record<string, unknown>) {
    super(message, 'PAYMENT_ERROR', 400, { provider, ...details });
    this.name = 'PaymentError';
  }
}

/**
 * Log error to Sentry with context
 */
export function logError(
  error: Error | AppError,
  context?: {
    userId?: string;
    organizationId?: string;
    restaurantId?: string;
    orderId?: string;
    [key: string]: unknown;
  }
) {
  // If Sentry is configured, log to Sentry
  // Example:
  // Sentry.captureException(error, {
  //   user: { id: context?.userId },
  //   tags: {
  //     organizationId: context?.organizationId,
  //     restaurantId: context?.restaurantId,
  //   },
  //   extra: context,
  // });
  
  // For now, log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', {
      name: error.name,
      message: error.message,
      code: (error as AppError).code,
      statusCode: (error as AppError).statusCode,
      details: (error as AppError).details,
      context,
      stack: error.stack,
    });
  }
}

/**
 * Log performance metric
 */
export function logMetric(
  name: string,
  value: number,
  unit: 'millisecond' | 'second' | 'byte' | 'none' = 'millisecond',
  tags?: Record<string, string>
) {
  // If Sentry is configured, log metric
  // Example:
  // Sentry.metrics.distribution(name, value, { unit, tags });
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Metric] ${name}: ${value} ${unit}`, tags || '');
  }
}

/**
 * Performance timing helper
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result
      .then((value) => {
        const duration = performance.now() - start;
        logMetric(name, duration, 'millisecond');
        return value;
      })
      .catch((error) => {
        const duration = performance.now() - start;
        logMetric(`${name}.error`, duration, 'millisecond');
        throw error;
      });
  }
  
  const duration = performance.now() - start;
  logMetric(name, duration, 'millisecond');
  return result;
}
