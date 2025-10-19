# Accessibility Audit & Improvements Guide

## Overview
Accessibility (a11y) improvements ensure the Beauty Mirror Quiz is usable by everyone, including people with disabilities. This benefits ~15% of users and improves SEO.

## WCAG 2.1 Level AA Compliance

### 1. Semantic HTML

❌ **BAD - Non-semantic**
```tsx
<div onClick={handleSubmit} role="button">
  Submit
</div>
```

✅ **GOOD - Semantic**
```tsx
<button type="button" onClick={handleSubmit}>
  Submit
</button>
```

### 2. ARIA Labels and Descriptions

❌ **BAD - No label**
```tsx
<input type="email" placeholder="Email" />
```

✅ **GOOD - Proper label**
```tsx
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-required="true" />
```

### 3. Heading Hierarchy

❌ **BAD - Non-sequential headings**
```tsx
<h1>Welcome</h1>
<h3>Start Quiz</h3>
<h2>Questions</h2>
```

✅ **GOOD - Proper hierarchy**
```tsx
<h1>Welcome</h1>
<h2>Getting Started</h2>
<h3>Start Quiz</h3>
<h2>Quiz Questions</h2>
<h3>Question 1</h3>
```

### 4. Color Contrast (WCAG AA)
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- UI components and graphics: 3:1 contrast ratio

❌ **BAD - Insufficient contrast**
```tsx
<p style={{ color: '#CCCCCC', backgroundColor: '#FFFFFF' }}>
  Light gray on white
</p>
```

✅ **GOOD - Proper contrast**
```tsx
<p style={{ color: '#333333', backgroundColor: '#FFFFFF' }}>
  Dark gray on white (4.5:1+)
</p>
```

### 5. Keyboard Navigation

❌ **BAD - Not keyboard accessible**
```tsx
<div onClick={() => navigate('/quiz')}>
  Start Quiz
</div>
```

✅ **GOOD - Fully keyboard accessible**
```tsx
<button type="button" onClick={() => navigate('/quiz')}>
  Start Quiz
</button>
// Or with focus management
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      navigate('/quiz')
    }
  }}
  onClick={() => navigate('/quiz')}
>
  Start Quiz
</div>
```

### 6. Focus Indicators

```tsx
// Add visible focus styles
button:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

// Or in Tailwind
<button className="focus:outline-2 focus:outline-indigo-600 focus:outline-offset-2">
  Click me
</button>
```

### 7. Accessible Forms

```tsx
interface FormFieldProps {
  id: string
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  children
}) => (
  <div className="mb-4">
    <label htmlFor={id} className="block font-medium">
      {label}
      {required && <span aria-label="required">*</span>}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-red-600 mt-1">
        {error}
      </p>
    )}
  </div>
)

// Usage
<FormField id="email" label="Email" required error={emailError}>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!emailError}
    aria-describedby={emailError ? 'email-error' : undefined}
  />
</FormField>
```

### 8. Image Alt Text

```tsx
// Always provide descriptive alt text
<img
  src="/quiz-illustration.svg"
  alt="Person taking the Beauty Mirror quiz on a mobile device"
/>

// For decorative images
<img
  src="/divider.svg"
  alt=""  // Empty alt for purely decorative images
  aria-hidden="true"
/>

// With next/image
<Image
  src="/logo.png"
  alt="Beauty Mirror Quiz logo"
  width={200}
  height={50}
/>
```

### 9. ARIA Live Regions

```tsx
// For dynamic content updates
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// For loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading quiz...' : null}
</div>

// For alerts
<div role="alert" className="bg-red-100 p-4 rounded">
  {errorMessage}
</div>
```

### 10. Skip Navigation Links

```tsx
export const SkipLink: React.FC = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only"
  >
    Skip to main content
  </a>
)

// Add to layout
<html>
  <body>
    <SkipLink />
    <header>{/* Navigation */}</header>
    <main id="main-content">
      {/* Main content */}
    </main>
  </body>
</html>
```

## Accessible Quiz Implementation

### Modal Dialogs
```tsx
interface AccessibleModalProps {
  isOpen: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-black/50"
      onClick={onClose}
    >
      <dialog
        open={isOpen}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        aria-labelledby="modal-title"
      >
        <h1 id="modal-title">{title}</h1>
        {children}
        <button onClick={onClose} className="mt-4">
          Close
        </button>
      </dialog>
    </div>
  )
}
```

### Video with Captions
```tsx
export const AccessibleVideo: React.FC<{ src: string }> = ({ src }) => (
  <figure>
    <video controls width="640" height="480">
      <source src={src} type="video/mp4" />
      <track
        kind="captions"
        src="/captions.vtt"
        srcLang="en"
        label="English"
        default
      />
      Your browser does not support the video tag.
    </video>
    <figcaption>Beauty Mirror Quiz Introduction Video</figcaption>
  </figure>
)
```

### Camera Overlay Accessibility
```tsx
interface AccessibleCameraOverlayProps {
  mode: 'face' | 'hair' | 'body'
  isAligned: boolean
}

export const AccessibleCameraOverlay: React.FC<AccessibleCameraOverlayProps> =
  ({ mode, isAligned }) => (
    <div className="relative w-full h-full">
      {/* Screen reader only instructions */}
      <div className="sr-only" role="status" aria-live="polite">
        {isAligned
          ? `${mode} photo is properly aligned. Press Spacebar to capture.`
          : `Position your ${mode} within the guide. Photo guidance: center and fill the circle.`}
      </div>

      {/* Visual guide */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <circle cx="50%" cy="50%" r="50" fill="none" stroke="green" />
      </svg>
    </div>
  )
```

## Testing for Accessibility

### 1. Automated Testing
```bash
# Install axe DevTools for browser
npm install -D @axe-core/react

# Use in tests
import { axe, toHaveNoViolations } from 'jest-axe'

it('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### 2. Manual Testing Checklist
- [ ] Keyboard navigation (Tab through entire page)
- [ ] Screen reader testing (VoiceOver, NVDA, JAWS)
- [ ] Color contrast verification (use Lighthouse or WebAIM)
- [ ] Focus management (focus visible on all interactive elements)
- [ ] Form validation (error messages announced)
- [ ] Skip links (present and functional)
- [ ] Mobile accessibility (VoiceOver on iOS, TalkBack on Android)

### 3. Browser DevTools
- Chrome: Lighthouse → Accessibility
- Firefox: Accessibility Inspector
- Safari: Audit → Accessibility
- Edge: Same as Chrome (Chromium-based)

## Utility Classes for Accessibility

Add to your Tailwind CSS config:

```tsx
// tailwind.config.js
theme: {
  extend: {
    // Screen reader only text
    '.sr-only': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    },
    '.not-sr-only': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: 'inherit',
      margin: 'inherit',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
    },
  },
}

// Usage
<span className="sr-only">Loading...</span>
<button className="focus:not-sr-only">Skip Navigation</button>
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| No focus indicators | Add outline/border on :focus-visible |
| Missing alt text | Describe what's in images |
| Color only for meaning | Add text labels in addition to colors |
| Poor contrast | Use WebAIM contrast checker |
| Non-semantic HTML | Use `<button>` not `<div onClick>` |
| Form labels missing | Always use `<label>` with `htmlFor` |
| No error messages | Use `aria-invalid` and error containers |
| Keyboard trap | Ensure Escape works, can tab out |
| Hidden content accessible | Use `display:none` or `hidden` attribute |
| ARIA misuse | Only use ARIA when semantic HTML won't work |

## Accessibility Checklist

### Pages
- [ ] Main page (/)
- [ ] Welcome page (/welcome)
- [ ] Quiz pages (/quiz/*)
- [ ] Results page (/success)
- [ ] Profile page (/profile)
- [ ] About page (if exists)

### Components
- [ ] Forms (input fields, selectors)
- [ ] Buttons (all interactive elements)
- [ ] Navigation (menus, breadcrumbs)
- [ ] Modals (dialogs, popups)
- [ ] Notifications (alerts, toasts)
- [ ] Camera overlay
- [ ] Image upload
- [ ] Carousels (if any)

### Features
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Screen reader support
- [ ] Color contrast
- [ ] Zoom to 200%
- [ ] Touch targets (minimum 44x44px)
- [ ] Error handling
- [ ] Form validation
- [ ] Skip links

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [Accessibility Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Inclusive Components](https://inclusive-components.design/)
- [Testing Accessibility](https://www.testingaccessibility.com/)

## Team Responsibility

✅ **Designers**: Create accessible designs with proper contrast and size
✅ **Developers**: Implement semantics and ARIA correctly
✅ **QA**: Test with keyboard and screen readers
✅ **Product**: Prioritize accessibility in requirements
