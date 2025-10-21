// This file sets up Sentry error tracking for the Next.js app
// Add this to your .env.local or deployment environment:
// NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
// SENTRY_AUTH_TOKEN=your-auth-token (for release tracking)

import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env['NEXT_PUBLIC_SENTRY_DSN'],
  environment: process.env.NODE_ENV || 'development',
  
  // Tracing
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Network errors we don't want to track
    'NetworkError',
    'NetworkingError',
    'HttpRequestError',
    'TimeoutError',
    // Random plugins/extensions
    'chrome-extension://',
    'moz-extension://',
  ],
})
