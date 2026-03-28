// ============================================
// Restaurant OS - Sentry Server Configuration
// Server-side error tracking
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
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Integrations
    integrations: [
      Sentry.prismaIntegration(),
      Sentry.consoleIntegration({
        levels: ['error', 'warn'],
      }),
    ],
    
    // Ignore specific errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'Network error',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
        delete event.request.headers['x-api-key'];
        delete event.request.headers['x-auth-token'];
      }
      
      // Don't send PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
        delete event.user.username;
      }
      
      // Filter out database connection errors during startup
      const error = hint.originalException;
      if (error instanceof Error) {
        if (
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Can\'t reach database server')
        ) {
          return null;
        }
      }
      
      return event;
    },
  });
}

/**
 * Capture exception with restaurant context
 */
export function captureRestaurantError(
  error: Error,
  context: {
    restaurantId?: string;
    organizationId?: string;
    orderId?: string;
    userId?: string;
    action?: string;
  }
) {
  Sentry.captureException(error, {
    user: context.userId ? { id: context.userId } : undefined,
    tags: {
      restaurantId: context.restaurantId,
      organizationId: context.organizationId,
      action: context.action,
    },
    extra: {
      orderId: context.orderId,
    },
  });
}

/**
 * Capture payment error
 */
export function capturePaymentError(
  error: Error,
  context: {
    provider: string;
    orderId: string;
    amount?: number;
    currency?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      paymentProvider: context.provider,
      orderId: context.orderId,
    },
    extra: {
      amount: context.amount,
      currency: context.currency,
    },
  });
}

/**
 * Capture webhook error
 */
export function captureWebhookError(
  error: Error,
  context: {
    provider: string;
    transactionId?: string;
    payload?: object;
  }
) {
  Sentry.captureException(error, {
    tags: {
      webhookProvider: context.provider,
      transactionId: context.transactionId,
    },
    extra: {
      payload: context.payload,
    },
  });
}

export default Sentry;
