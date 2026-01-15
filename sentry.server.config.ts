import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring - reduce in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Debug in development
  debug: process.env.NODE_ENV === 'development',

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Spotlight for local development (if using Sentry Spotlight)
  spotlight: process.env.NODE_ENV === 'development',
});
