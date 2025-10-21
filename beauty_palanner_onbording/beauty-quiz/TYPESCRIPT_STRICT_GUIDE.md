# TypeScript Strict Mode Guide

## Overview
Strict Mode has been enabled with comprehensive type checking to catch errors at compile time, preventing runtime bugs and improving code quality.

## Enabled Compiler Options

### Core Strict Settings
```json
{
  "compilerOptions": {
    "strict": true,                       // Enable all strict type-checking options
    "noImplicitAny": true,                // Error on implicit `any` type
    "noImplicitThis": true,               // Error on `this` with implicit `any` type
    "strictNullChecks": true,             // Null/undefined not assignable to other types
    "strictFunctionTypes": true,          // Stricter function type checking
    "strictBindCallApply": true,          // Stricter bind/call/apply checking
    "strictPropertyInitialization": true,// Class properties must be initialized
    "alwaysStrict": true,                 // Emit "use strict"
    "noImplicitReturns": true,            // Function must explicitly return
    "noFallthroughCasesInSwitch": true,   // Explicit returns in switch cases
    "noUncheckedIndexedAccess": true,     // Index access must be checked
    "forceConsistentCasingInFileNames": true,
    "useDefineForClassFields": true       // Use modern class field semantics
  }
}
```

## Type Checking Best Practices

### 1. Avoid `any` - Use Union Types Instead

❌ **BAD**
```tsx
function processData(data: any) {
  return data.value
}
```

✅ **GOOD**
```tsx
interface DataType {
  value: string
}

function processData(data: DataType) {
  return data.value
}
```

### 2. Use `unknown` for Dynamic Data

❌ **BAD**
```tsx
function handleUnknownData(data: any) {
  console.log(data.property)
}
```

✅ **GOOD**
```tsx
function handleUnknownData(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'property' in data) {
    return (data as any).property
  }
  return ''
}
```

### 3. Explicit Return Types

❌ **BAD**
```tsx
const calculateTotal = (items: Item[]) => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

✅ **GOOD**
```tsx
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0)
}
```

### 4. Strict Null Checks

❌ **BAD**
```tsx
function getName(user: User) {
  return user.name.toUpperCase()  // Might be null!
}
```

✅ **GOOD**
```tsx
function getName(user: User): string {
  return (user.name ?? 'Anonymous').toUpperCase()
}

// Or
function getName(user: User | null): string | null {
  return user?.name?.toUpperCase() ?? null
}
```

### 5. Optional vs Null Properties

❌ **BAD**
```tsx
interface User {
  name: string
  email: string | null  // Nullable instead of optional
}
```

✅ **GOOD**
```tsx
interface User {
  name: string
  email?: string  // Explicitly optional
}

// Use optional chaining
const email = user.email ?? 'no-email@example.com'
```

### 6. Generic Constraints

❌ **BAD**
```tsx
function sortArray(arr: any[]): any[] {
  return arr.sort()
}
```

✅ **GOOD**
```tsx
function sortArray<T extends Comparable>(arr: T[]): T[] {
  return arr.sort((a, b) => a.compare(b))
}

interface Comparable {
  compare(other: Comparable): number
}
```

### 7. Function Overloads for Multiple Signatures

❌ **BAD**
```tsx
function formatValue(value: any): any {
  if (typeof value === 'string') {
    return value.toUpperCase()
  }
  return value.toString()
}
```

✅ **GOOD**
```tsx
function formatValue(value: string): string
function formatValue(value: number): string
function formatValue(value: string | number): string {
  return typeof value === 'string'
    ? value.toUpperCase()
    : value.toString()
}
```

### 8. Exhaustive Type Checking with Discriminated Unions

❌ **BAD**
```tsx
type Response = 
  | { status: 'success'; data: any }
  | { status: 'error'; error: any }
  | { status: 'loading' }

function handleResponse(res: Response) {
  if (res.status === 'success') {
    console.log(res.data)
  }
  // Forgot to handle error and loading!
}
```

✅ **GOOD**
```tsx
type Response =
  | { status: 'success'; data: unknown }
  | { status: 'error'; error: string }
  | { status: 'loading' }

function handleResponse(res: Response): void {
  switch (res.status) {
    case 'success':
      console.log(res.data)
      break
    case 'error':
      console.error(res.error)
      break
    case 'loading':
      console.log('Loading...')
      break
    default:
      // TypeScript ensures all cases are handled
      const _exhaustive: never = res
      return _exhaustive
  }
}
```

### 9. Proper React Component Typing

❌ **BAD**
```tsx
function MyComponent(props: any) {
  return <div>{props.children}</div>
}
```

✅ **GOOD**
```tsx
interface MyComponentProps {
  children: React.ReactNode
  onClick?: () => void
}

export const MyComponent: React.FC<MyComponentProps> = ({ children, onClick }) => {
  return <div onClick={onClick}>{children}</div>
}
```

### 10. Proper Event Typing

❌ **BAD**
```tsx
const handleClick = (e: any) => {
  console.log(e.target.value)
}

<input onClick={handleClick} />
```

✅ **GOOD**
```tsx
const handleClick = (e: React.MouseEvent<HTMLInputElement>): void => {
  console.log(e.currentTarget.value)
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  console.log(e.target.value)
}

<input onMouseDown={handleClick} onChange={handleChange} />
```

## Common Patterns

### Pattern 1: Optional Chaining & Nullish Coalescing
```tsx
// Optional chaining - safely access nested properties
const email = user?.profile?.email

// Nullish coalescing - provide default for null/undefined
const name = user?.name ?? 'Anonymous'

// Combined
const displayName = user?.profile?.displayName ?? user?.name ?? 'Guest'
```

### Pattern 2: Type Guards
```tsx
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

function processValue(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase())
  } else if (isUser(value)) {
    console.log(value.name)
  }
}
```

### Pattern 3: Const Assertions
```tsx
// Without: type is readonly string[]
const colors = ['red', 'green', 'blue'] as const

// Useful for discriminated unions
const status = { success: true, data: [] } as const
type Status = typeof status // { readonly success: true; readonly data: readonly [] }
```

### Pattern 4: Utility Types
```tsx
// Partial - all properties optional
type PartialUser = Partial<User>

// Required - all properties required
type RequiredUser = Required<User>

// Pick - select specific properties
type UserPreview = Pick<User, 'id' | 'name'>

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>

// Record - create object from union
type StatusMessages = Record<'success' | 'error' | 'loading', string>

// ReturnType - extract function return type
type ResponseType = ReturnType<typeof fetchUser>
```

### Pattern 5: Async/Await Type Safety
```tsx
// Proper error handling
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }
  return response.json() as Promise<User>
}

// Using in components
export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true)
      try {
        const data = await fetchUser(userId)
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  return user ? <div>{user.name}</div> : null
}
```

## Migration Checklist

When updating existing code for strict mode compliance:

- [ ] Add explicit return types to all functions
- [ ] Replace `any` with proper types or `unknown`
- [ ] Add proper null/undefined handling
- [ ] Use optional chaining (`?.`) and nullish coalescing (`??`)
- [ ] Add type guards for runtime checks
- [ ] Use discriminated unions instead of loose object types
- [ ] Add proper React event types
- [ ] Initialize all class properties in constructor
- [ ] Add exhaustiveness checks in switch statements
- [ ] Use utility types to reduce duplication

## Error Resolution Examples

### Error: `Parameter 'x' implicitly has an 'any' type`
```tsx
// ❌ Before
function add(a, b) {
  return a + b
}

// ✅ After
function add(a: number, b: number): number {
  return a + b
}
```

### Error: `Cannot find name 'JSON'` (in some contexts)
```tsx
// Make sure JSON is in lib array in tsconfig.json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"]
  }
}
```

### Error: `Object is possibly 'null'`
```tsx
// ❌ Before
function getName(user: User | null) {
  return user.name  // Error!
}

// ✅ After
function getName(user: User | null): string | null {
  return user?.name ?? null
}

// ✅ Or validate
function getName(user: User | null): string {
  if (!user) return 'Anonymous'
  return user.name
}
```

## Performance Impact

Strict mode has minimal performance impact:
- Compilation time: +5-10% (more type checking)
- Runtime performance: 0% (types are removed at compile time)
- Bundle size: No change (types only exist during development)

## Further Reading
- [TypeScript Handbook - Type Checking](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html)
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [TypeScript: Null vs Undefined](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#null-and-undefined)
- [TypeScript: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)
