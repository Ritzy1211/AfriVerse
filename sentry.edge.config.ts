import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.npm_package_version || '1.0.0',

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',
});
