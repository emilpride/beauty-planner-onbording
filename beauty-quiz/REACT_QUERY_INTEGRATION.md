# React Query Integration Guide

## Overview
TanStack React Query v5 has been integrated for server state management, replacing manual fetch/useEffect patterns.

## Installation
```bash
npm install @tanstack/react-query@5
```

## Setup

### 1. Provider Setup (Already Done)
The `QueryProvider` is wrapped in `app/layout.tsx` at the root level:

```tsx
<QueryProvider>
  <ThemeProvider>
    <ErrorBoundary>
      <ClientShell>{children}</ClientShell>
    </ErrorBoundary>
  </ThemeProvider>
</QueryProvider>
```

### 2. Available Hooks

#### Session Hooks (`hooks/useSessionQuery.ts`)
- **`useSaveSessionMutation()`** - Save/update onboarding session
- **`useSessionQuery(sessionId)`** - Fetch session details
- **`useBatchEventsMutation()`** - Batch save multiple events

#### User Hooks (`hooks/useUserQuery.ts`)
- **`useUserQuery(userId)`** - Fetch user profile
- **`useUpdateUserMutation()`** - Update user profile
- **`useAnalyzeQuizMutation()`** - Trigger quiz analysis (Gemini AI)
- **`useAnalysisQuery(sessionId)`** - Fetch analysis results

## Usage Examples

### Example 1: Save Session Events
```tsx
import { useSaveSessionMutation } from '@/hooks/useSessionQuery'

export function MyComponent() {
  const { mutate: saveSession, isPending } = useSaveSessionMutation()

  const handleSave = () => {
    saveSession({
      sessionId: 'session-123',
      userId: 'user-456',
      events: [{ type: 'page_view', timestamp: Date.now() }],
    })
  }

  return (
    <button onClick={handleSave} disabled={isPending}>
      {isPending ? 'Saving...' : 'Save'}
    </button>
  )
}
```

### Example 2: Fetch Session Details
```tsx
import { useSessionQuery } from '@/hooks/useSessionQuery'

export function SessionDetails({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading, error } = useSessionQuery(sessionId)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>{session?.sessionId}</h2>
      <p>Status: {session?.status}</p>
      <p>Events: {session?.events.length}</p>
    </div>
  )
}
```

### Example 3: Batch Events with Optimistic Updates
```tsx
import { useBatchEventsMutation } from '@/hooks/useSessionQuery'

export function EventBatcher({ sessionId }: { sessionId: string }) {
  const { mutate: batchEvents, isPending } = useBatchEventsMutation()

  const handleBatch = (events: any[]) => {
    batchEvents({
      sessionId,
      events,
      userId: 'current-user',
    })
  }

  return (
    <button onClick={() => handleBatch([...])} disabled={isPending}>
      Sync Events
    </button>
  )
}
```

### Example 4: User Profile with Caching
```tsx
import { useUserQuery, useUpdateUserMutation } from '@/hooks/useUserQuery'

export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUserQuery(userId)
  const { mutate: updateUser } = useUpdateUserMutation()

  if (isLoading) return <div>Loading profile...</div>

  return (
    <div>
      <h3>{user?.displayName}</h3>
      <p>{user?.email}</p>
      <button onClick={() => updateUser({ uid: userId, displayName: 'New Name' })}>
        Update Profile
      </button>
    </div>
  )
}
```

## Configuration

### Default Query Options (in QueryProvider)
- **staleTime**: 5 minutes - Time before data is considered stale
- **gcTime**: 10 minutes - Time before unused data is garbage collected
- **retry**: 1 - Number of retries on failure
- **refetchOnWindowFocus**: false - Don't refetch when user tabs back

### Per-Hook Configuration
Each hook has custom `staleTime` and `gcTime`:
- **Sessions**: 5 min stale, 10 min GC
- **Users**: 30 min stale, 1 hour GC
- **Analysis**: Never stale (results are immutable)

## Benefits

✅ **Automatic Caching** - Results cached per query key  
✅ **Background Refetching** - Keeps data fresh  
✅ **Deduplication** - Multiple components requesting same data = 1 request  
✅ **Error Handling** - Built-in retry logic  
✅ **Loading States** - `isLoading`, `isPending`, `isFetching`  
✅ **Optimistic Updates** - UI updates before server confirms  
✅ **Manual Cache Control** - `invalidateQueries`, `setQueryData`

## Common Patterns

### Pattern 1: Invalidate Cache After Mutation
```tsx
const { mutate } = useMutation({
  mutationFn: async (data) => {
    const response = await fetch('/api/save', { method: 'POST', body: JSON.stringify(data) })
    return response.json()
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] })
  }
})
```

### Pattern 2: Conditional Queries
```tsx
const { data } = useSessionQuery(sessionId, sessionId !== null) // Only fetch if sessionId exists
```

### Pattern 3: Dependent Queries
```tsx
const { data: user } = useUserQuery(userId)
const { data: analysis } = useAnalysisQuery(user?.lastSessionId)
```

## Migration Checklist

When updating existing components:

- [ ] Replace `useState` + `useEffect` + `fetch` with query hooks
- [ ] Remove manual loading/error state management
- [ ] Use `mutate` for POST/PUT/DELETE operations
- [ ] Let React Query handle caching and refetching
- [ ] Remove manual `setData` calls
- [ ] Add error boundaries for mutation errors

## Troubleshooting

### Query Not Fetching
Check `enabled` parameter - it defaults to `true` but you can set it conditionally:
```tsx
const { data } = useSessionQuery(sessionId, !!sessionId) // Only when sessionId exists
```

### Stale Data in UI
Use `queryClient.invalidateQueries()` after mutations:
```tsx
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] })
```

### Memory Leaks
React Query automatically cleans up:
- Subscribers when components unmount
- Unused queries after `gcTime` expires

## Further Reading
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools) for debugging
