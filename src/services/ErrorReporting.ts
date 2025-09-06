import * as Sentry from '@sentry/browser';

export interface ErrorContext {
  url?: string;
  userId?: string;
  action?: string;
  timestamp?: string;
  userAgent?: string;
}

export class ErrorReporting {
  private static instance: ErrorReporting;
  private initialized = false;

  private constructor() {}

  static getInstance(): ErrorReporting {
    if (!ErrorReporting.instance) {
      ErrorReporting.instance = new ErrorReporting();
    }
    return ErrorReporting.instance;
  }

  async initialize(analyticsEnabled: boolean = false): Promise<void> {
    if (this.initialized || !analyticsEnabled) {
      return;
    }

    try {
      Sentry.init({
        dsn: process.env.SENTRY_DSN, // Set in environment
        environment: process.env.NODE_ENV || 'production',
        beforeSend(event) {
          // Only send if user has consented to analytics
          return analyticsEnabled ? event : null;
        },
        integrations: [
          new Sentry.BrowserTracing(),
        ],
        tracesSampleRate: 0.1, // Low sample rate for privacy
        beforeBreadcrumb(breadcrumb) {
          // Filter out sensitive data from breadcrumbs
          if (breadcrumb.category === 'console' && breadcrumb.data?.logger === 'console') {
            return null;
          }
          return breadcrumb;
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize error reporting:', error);
    }
  }

  reportError(error: Error, context?: ErrorContext): void {
    try {
      // Always log to console for debugging
      console.error('T&C Guard Error:', error, context);

      if (this.initialized) {
        Sentry.withScope((scope) => {
          if (context) {
            scope.setContext('tcGuard', {
              ...context,
              timestamp: context.timestamp || new Date().toISOString()
            });
          }
          Sentry.captureException(error);
        });
      }
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  }

  reportMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    try {
      console.log(`T&C Guard ${level.toUpperCase()}:`, message, context);

      if (this.initialized) {
        Sentry.withScope((scope) => {
          if (context) {
            scope.setContext('tcGuard', context);
          }
          Sentry.captureMessage(message, level);
        });
      }
    } catch (error) {
      console.error('Message reporting failed:', error);
    }
  }

  setUserContext(userId: string): void {
    if (this.initialized) {
      Sentry.setUser({ id: userId });
    }
  }

  addBreadcrumb(message: string, category: string = 'tcguard', data?: Record<string, any>): void {
    if (this.initialized) {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        timestamp: Date.now() / 1000
      });
    }
  }
}