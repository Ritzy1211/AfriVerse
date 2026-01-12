import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production
  
  // Session Replay (optional)
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.npm_package_version || '1.0.0',

  // Only send errors in production (optional - remove to send in dev too)
  enabled: process.env.NODE_ENV === 'production',

  // Filtering
  ignoreErrors: [
    // Ignore common browser errors
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'Failed to fetch',
    'NetworkError',
    'Load failed',
  ],

  // Before sending error
  beforeSend(event, hint) {
    // Don't send in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry error (not sent in dev):', hint.originalException);
      return null;
    }
    return event;
  },
});
