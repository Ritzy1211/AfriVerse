import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring - reduce in production for cost efficiency
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,
  
  // Debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Filtering - ignore common non-actionable errors
  ignoreErrors: [
    // Resize observer errors (benign)
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors (usually user connectivity issues)
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    'ChunkLoadError',
    // Browser extensions
    'top.GLOBALS',
    // Cancelled requests
    'AbortError',
    'cancelled',
  ],

  // Don't send PII
  sendDefaultPii: false,

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

// Export for Next.js router transition tracking
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
