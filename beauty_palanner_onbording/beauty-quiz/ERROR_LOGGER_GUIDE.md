# Error Logger Service Documentation

## Overview
The Error Logger Service provides centralized error tracking and monitoring via Sentry. It captures client-side and server-side errors, tracks user actions, and provides performance monitoring.

## Setup

### 1. Install Sentry (Already Done)
```bash
npm install @sentry/nextjs
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
SENTRY_AUTH_TOKEN=your-auth-token
```

Get your DSN from [sentry.io](https://sentry.io) after creating a project.

### 3. Import and Initialize
In your app component or layout:
```tsx
import { initializeErrorLogger, setupGlobalErrorHandlers } from '@/lib/errorLogger'

// Call once on app startup
useEffect(() => {
  initializeErrorLogger()
  setupGlobalErrorHandlers()
}, [])
```

## Usage

### Capture Errors
```tsx
import { captureError } from '@/lib/errorLogger'

try {
  // Your code
} catch (error) {
  captureError(error, {
    userId: 'user-123',
    sessionId: 'session-456',
    action: 'quiz-submission',
    metadata: { questionId: 42 }
  })
}
```

### Capture Messages
```tsx
import { captureMessage } from '@/lib/errorLogger'

captureMessage('User started quiz', 'info', {
  userId: 'user-123',
  action: 'quiz-start'
})
```

### Add Breadcrumbs (Track User Actions)
```tsx
import { addBreadcrumb } from '@/lib/errorLogger'

addBreadcrumb('User clicked submit', { formId: 'quiz-form' }, 'user-action')
```

### Set User Context
```tsx
import { setUser } from '@/lib/errorLogger'

// After authentication
setUser(user.uid, user.email)

// After logout
setUser(null)
```

### React Error Boundary Integration
```tsx
import { captureReactError } from '@/lib/errorLogger'
import ErrorBoundary from '@/components/ErrorBoundary'

class MyErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: any) {
    captureReactError(error, errorInfo)
  }

  render() {
    return <ErrorBoundary>{this.props.children}</ErrorBoundary>
  }
}
```

### Wrap Functions with Error Boundary
```tsx
import { withErrorBoundary, withSyncErrorBoundary } from '@/lib/errorLogger'

// Async function
const fetchUserData = withErrorBoundary(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  },
  { action: 'fetch-user-data' }
)

// Sync function
const parseJSON = withSyncErrorBoundary(
  (json: string) => JSON.parse(json),
  { action: 'parse-json' }
)
```

### Performance Monitoring
```tsx
import { startTransaction } from '@/lib/errorLogger'

const transaction = startTransaction('quiz-submission', 'http.request')
// Perform task...
transaction // { name: 'quiz-submission', startedAt: 1234567890 }
```

## Error Context Object
```tsx
interface ErrorContext {
  userId?: string        // User ID for context
  sessionId?: string     // Session ID for context
  action?: string        // What action was being performed
  metadata?: Record<string, unknown>  // Additional data
}
```

## Examples

### Example 1: Quiz Submission Error Handling
```tsx
import { captureError, addBreadcrumb, setUser } from '@/lib/errorLogger'
import { auth } from '@/lib/firebase'

async function submitQuiz(answers: QuizAnswers) {
  const user = auth.currentUser
  if (user) {
    setUser(user.uid, user.email || undefined)
  }

  addBreadcrumb('Quiz submission started', { questionCount: answers.length })

  try {
    const response = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    addBreadcrumb('Quiz submission successful')
    return await response.json()
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      userId: user?.uid,
      action: 'quiz-submission',
      metadata: { questionCount: answers.length }
    })
    throw error
  }
}
```

### Example 2: Camera Permission Error
```tsx
import { captureError } from '@/lib/errorLogger'

async function requestCameraAccess() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    return stream
  } catch (error) {
    captureError(error instanceof Error ? error : new Error(String(error)), {
      action: 'camera-access-request',
      metadata: { 
        browser: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    })
    throw error
  }
}
```

### Example 3: Firebase Authentication Error
```tsx
import { captureError, captureMessage } from '@/lib/errorLogger'
import { signInWithEmailAndPassword } from 'firebase/auth'

async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    captureMessage(`User logged in: ${email}`, 'info')
    return userCredential.user
  } catch (error) {
    const errorCode = (error as any).code
    if (errorCode === 'auth/user-not-found') {
      captureMessage(`Login attempt: user not found (${email})`, 'warning')
    } else {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: 'login',
        metadata: { email, errorCode }
      })
    }
    throw error
  }
}
```

## Global Error Handlers

The `setupGlobalErrorHandlers()` function automatically catches:
- **Unhandled Promise Rejections**: When a promise rejects without `.catch()`
- **Global Errors**: Uncaught JavaScript errors

```tsx
// Called automatically in your app initialization
setupGlobalErrorHandlers()
```

## Sentry Dashboard

After errors are captured, view them on [sentry.io](https://sentry.io):
1. Log in to your Sentry project
2. Navigate to the Issues tab
3. View error details, user info, breadcrumbs, and stack traces
4. Set up alerts for critical errors
5. Track error trends over time

## Performance Monitoring

Key metrics to track:
- Page load time
- Quiz initialization time
- API response times
- Image upload duration
- Camera stream initialization

```tsx
import { startTransaction } from '@/lib/errorLogger'

function trackPerformance(label: string, fn: () => void) {
  const transaction = startTransaction(label)
  const startTime = transaction.startedAt
  
  fn()
  
  const endTime = Date.now()
  const duration = endTime - startTime
  console.log(`${label} took ${duration}ms`)
}
```

## Best Practices

✅ **DO:**
- Capture user context early (after auth)
- Add breadcrumbs for important user actions
- Include metadata for better debugging
- Use specific error contexts (action, sessionId)
- Wrap async functions in error boundaries

❌ **DON'T:**
- Capture sensitive information (passwords, tokens)
- Log every single action (only important ones)
- Ignore errors in production
- Forget to set user context
- Use generic error messages

## Security

- **DO NOT** include passwords, API keys, or tokens in error context
- Use `maskAllText` and `blockAllMedia` for session replays
- Review Sentry privacy settings in your dashboard
- Regularly clean up old error data

## Troubleshooting

### Errors Not Appearing in Sentry
1. Check `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify Sentry project is active
3. Check browser console for errors
4. Ensure error occurred (use `captureError` directly to test)

### Too Many Errors
Adjust `tracesSampleRate` in config to reduce volume:
```tsx
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0
```

### Sensitive Data in Errors
Review and sanitize error context before sending:
```tsx
// ❌ BAD
captureError(error, { metadata: { authToken: user.token } })

// ✅ GOOD
captureError(error, { metadata: { userId: user.id } })
```

## Additional Resources
- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Handling Best Practices](https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/)
