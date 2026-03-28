// Structured Logging Utility for Restaurant OS
// Provides centralized logging with levels, formatting, and optional external services

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  organizationId?: string;
  restaurantId?: string;
}

// Log level priority
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// Minimum log level from environment
const MIN_LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

// Check if we should log this level
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

// Format log entry for console
function formatConsoleLog(entry: LogEntry): string {
  const timestamp = entry.timestamp;
  const level = entry.level.toUpperCase().padEnd(5);
  const context = entry.context ? `[${entry.context}]` : '';
  
  let message = `${timestamp} ${level} ${context} ${entry.message}`;
  
  if (entry.data && Object.keys(entry.data).length > 0) {
    message += ` ${JSON.stringify(entry.data)}`;
  }
  
  if (entry.error) {
    message += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
    if (entry.error.stack) {
      message += `\n  Stack: ${entry.error.stack}`;
    }
  }
  
  return message;
}

// Main logger class
class Logger {
  private context?: string;
  private defaultMeta: Partial<LogEntry> = {};

  constructor(context?: string, defaultMeta?: Partial<LogEntry>) {
    this.context = context;
    this.defaultMeta = defaultMeta || {};
  }

  // Set default metadata for all logs
  setDefaultMeta(meta: Partial<LogEntry>) {
    this.defaultMeta = { ...this.defaultMeta, ...meta };
  }

  // Create child logger with additional context
  child(context: string, meta?: Partial<LogEntry>): Logger {
    return new Logger(
      `${this.context}:${context}`,
      { ...this.defaultMeta, ...meta }
    );
  }

  // Core logging method
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error
  ): void {
    if (!shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      data,
      ...this.defaultMeta,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Console output
    const consoleMethod = level === 'fatal' || level === 'error' ? 'error' :
                         level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](formatConsoleLog(entry));

    // Send to external logging service if configured
    this.sendToExternalService(entry);
  }

  // Send to external logging service (Sentry, DataDog, etc.)
  private async sendToExternalService(entry: LogEntry): Promise<void> {
    // Skip in development
    if (process.env.NODE_ENV === 'development') return;
    
    // Sentry integration
    if (process.env.SENTRY_DSN && (entry.level === 'error' || entry.level === 'fatal')) {
      try {
        // Dynamic import to avoid bundling in client
        // const Sentry = await import('@sentry/nextjs');
        // Sentry.captureException(entry.error || new Error(entry.message), {
        //   extra: entry.data,
        //   tags: {
        //     context: entry.context,
        //     level: entry.level,
        //   },
        // });
      } catch {
        // Ignore if Sentry not available
      }
    }

    // Custom webhook for logging
    if (process.env.LOG_WEBHOOK_URL) {
      try {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch {
        // Silently fail for webhook
      }
    }
  }

  // Convenience methods
  debug(message: string, data?: Record<string, unknown>): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : 
                     error ? new Error(String(error)) : undefined;
    this.log('error', message, data, errorObj);
  }

  fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorObj = error instanceof Error ? error : 
                     error ? new Error(String(error)) : undefined;
    this.log('fatal', message, data, errorObj);
  }

  // HTTP request logging
  httpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    data?: Record<string, unknown>
  ): void {
    this.log(
      statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
      `HTTP ${method} ${path} ${statusCode} ${duration}ms`,
      {
        method,
        path,
        statusCode,
        duration,
        ...data,
      }
    );
  }

  // Database query logging
  dbQuery(query: string, duration: number, error?: Error): void {
    this.log(
      error ? 'error' : duration > 1000 ? 'warn' : 'debug',
      `DB Query ${duration}ms`,
      { query: query.substring(0, 200), duration },
      error
    );
  }

  // Business event logging
  businessEvent(event: string, data?: Record<string, unknown>): void {
    this.info(`[BUSINESS] ${event}`, data);
  }

  // Security event logging
  securityEvent(event: string, data?: Record<string, unknown>): void {
    this.warn(`[SECURITY] ${event}`, data);
  }
}

// Create default logger instance
export const logger = new Logger('App');

// Create logger for specific modules
export const createLogger = (context: string, meta?: Partial<LogEntry>): Logger => {
  return new Logger(context, meta);
};

// Pre-configured loggers for common modules
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('DB');
export const authLogger = createLogger('Auth');
export const paymentLogger = createLogger('Payment');
export const orderLogger = createLogger('Order');
export const deliveryLogger = createLogger('Delivery');
export const socketLogger = createLogger('Socket');

// Export type
export type { LogLevel, LogEntry };
