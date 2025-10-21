# Performance Monitoring & Sentry Documentation

## Overview
Performance monitoring with Web Vitals and Sentry provides real-time insights into application performance and user experience metrics. This helps identify and fix performance bottlenecks before they impact users.

## Core Web Vitals (CWV)

### 1. Largest Contentful Paint (LCP)
**Target: ≤ 2.5 seconds**

Measures when the largest visible element appears on screen.

```
Good:    ≤ 2.5s  🟢
Fair:    2.5-4s  🟡
Poor:    > 4s    🔴
```

**Optimization Tips:**
- Optimize images (use WebP, AVIF)
- Lazy load off-screen content
- Minimize JavaScript
- Use server-side rendering where possible

### 2. Cumulative Layout Shift (CLS)
**Target: ≤ 0.1**

Measures unexpected layout shifts during page load.

```
Good:    ≤ 0.1    🟢
Fair:    0.1-0.25 🟡
Poor:    > 0.25   🔴
```

**Optimization Tips:**
- Set explicit sizes for images/videos
- Avoid inserting content above existing content
- Use CSS transforms for animations
- Preload web fonts

### 3. First Contentful Paint (FCP)
**Target: ≤ 1.8 seconds**

Measures when first content appears.

```
Good:    ≤ 1.8s   🟢
Fair:    1.8-3s   🟡
Poor:    > 3s     🔴
```

### 4. Time To First Byte (TTFB)
**Target: ≤ 600ms**

Measures server response time.

```
Good:    ≤ 600ms   🟢
Fair:    600-1.8s  🟡
Poor:    > 1.8s    🔴
```

## Setup

### 1. Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
```

### 2. Initialize in Your App
```tsx
'use client'

import { useEffect } from 'react'
import { initializeWebVitals } from '@/lib/performanceMonitoring'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeWebVitals()
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## Usage

### 1. Track Web Vitals Automatically
```tsx
import { initializeWebVitals } from '@/lib/performanceMonitoring'

// Call once on app load
initializeWebVitals()
// Metrics are automatically collected and sent to Sentry
```

### 2. Get Current Metrics
```tsx
import { getPerformanceMetrics, checkMetricTargets } from '@/lib/performanceMonitoring'

// Get all collected metrics
const metrics = getPerformanceMetrics()
console.log(metrics) // { lcp: 2100, cls: 0.08, fcp: 1500, ttfb: 550 }

// Check if metrics meet targets
const passing = checkMetricTargets()
console.log(passing) // { lcp: true, cls: true, fcp: true, ttfb: true }
```

### 3. Custom Performance Tracking
```tsx
import { markPerformance, measurePerformance, trackCustomMetric } from '@/lib/performanceMonitoring'

// Track custom operation
markPerformance('quiz-load-start')

// Do some work...
const quiz = await loadQuiz()

markPerformance('quiz-load-end')
const duration = measurePerformance('quiz-load', 'quiz-load-start', 'quiz-load-end')

// Log custom metric
trackCustomMetric('quiz-load-time', duration, 'ms')
```

### 4. Performance Timeline
```tsx
import { getPerformanceTimeline } from '@/lib/performanceMonitoring'

const timeline = getPerformanceTimeline()
console.table(timeline)
// Shows all performance markers and measurements
```

## Sentry Integration

### Performance Monitoring in Sentry

1. **Real-time Alerts**: Get notified when metrics degrade
2. **Performance Trends**: Track metrics over time
3. **Transaction Tracing**: See which pages are slowest
4. **Release Comparison**: Compare performance across app versions

### View in Sentry Dashboard

```
Projects → Beauty Mirror → Performance →
├── Web Vitals
├── Transaction Summary
├── Slowest Transactions
└── Performance Trends
```

### Example: Setting up Alerts

In Sentry:
1. Go to Alerts → Create Alert
2. Select "Performance Regression"
3. Choose metric (LCP, CLS, etc.)
4. Set threshold (e.g., > 3 seconds)
5. Add action (email, Slack, etc.)

## Real-World Examples

### Example 1: Monitor Quiz Load Time
```tsx
import { markPerformance, measurePerformance } from '@/lib/performanceMonitoring'

export async function loadQuizPage(quizId: string) {
  markPerformance('quiz-init-start')
  
  try {
    const quiz = await fetchQuiz(quizId)
    const questions = await fetchQuestions(quiz.id)
    
    markPerformance('quiz-init-end')
    const time = measurePerformance('quiz-init', 'quiz-init-start', 'quiz-init-end')
    
    return { quiz, questions, loadTime: time }
  } catch (error) {
    markPerformance('quiz-init-error')
    throw error
  }
}
```

### Example 2: Track Photo Upload Time
```tsx
import { markPerformance, measurePerformance, trackCustomMetric } from '@/lib/performanceMonitoring'

async function uploadPhoto(file: File) {
  markPerformance('photo-upload-start')
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    markPerformance('photo-upload-end')
    const duration = measurePerformance('photo-upload', 'photo-upload-start', 'photo-upload-end')
    
    trackCustomMetric('photo-upload-duration', duration, 'ms')
    trackCustomMetric('photo-size', file.size / 1024, 'kb')
    
    return await response.json()
  } catch (error) {
    markPerformance('photo-upload-error')
    throw error
  }
}
```

### Example 3: Camera Initialization
```tsx
import { markPerformance, measurePerformance, trackCustomMetric } from '@/lib/performanceMonitoring'

async function initializeCamera() {
  markPerformance('camera-init-start')
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
    })
    
    markPerformance('camera-init-end')
    const duration = measurePerformance('camera-init', 'camera-init-start', 'camera-init-end')
    
    trackCustomMetric('camera-init-time', duration, 'ms')
    
    return stream
  } catch (error) {
    markPerformance('camera-init-error')
    throw error
  }
}
```

## Performance Budget

Recommended targets for Beauty Mirror Quiz:

| Metric | Target | Budget |
|--------|--------|--------|
| LCP | 2.5s | ±500ms |
| CLS | 0.1 | ±0.05 |
| FCP | 1.8s | ±300ms |
| TTFB | 600ms | ±100ms |
| Quiz Load | 2s | ±400ms |
| Camera Init | 1s | ±200ms |
| Photo Upload | 5s | ±1s |

## Monitoring Dashboard

### Key Metrics to Monitor

```
Daily Check:
├── LCP (target: < 2.5s) ✓
├── CLS (target: < 0.1) ✓
├── FCP (target: < 1.8s) ✓
├── TTFB (target: < 600ms) ✓
└── Error Rate (target: < 1%) ✓

Weekly:
├── P95 LCP (95th percentile)
├── P95 FCP
├── Top slow pages
└── User impact
```

## Common Performance Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| High LCP | Large images/slow server | Optimize images, enable caching, use CDN |
| High CLS | Ads/dynamic content | Set explicit sizes, lazy load below fold |
| High FCP | Large JS bundle | Code split, lazy load, minimize JavaScript |
| High TTFB | Slow server/far away | Add caching, use edge servers, optimize DB |
| Camera lag | Heavy JavaScript | Move JS off main thread, use Workers |
| Slow uploads | File size too large | Compress images before upload, streaming |

## Tools & Resources

### Browser DevTools
- Chrome DevTools → Lighthouse
- Firefox → Inspector → Performance
- Safari → Develop → Show Web Inspector

### Online Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)
- [Chrome UX Report](https://chromeuxreport.web.dev/)

### Documentation
- [Web Vitals Guide](https://web.dev/vitals/)
- [Sentry Performance Docs](https://docs.sentry.io/platforms/javascript/performance/)
- [MDN Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

## Advanced: Custom RUM (Real User Monitoring)

```tsx
// Create custom RUM solution
export class RUMCollector {
  private sessionId = crypto.randomUUID()
  private metrics: Record<string, number> = {}

  trackEvent(name: string, duration: number) {
    this.metrics[name] = duration
    // Send to analytics
    this.report()
  }

  private async report() {
    await fetch('/api/rum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        metrics: this.metrics,
        timestamp: Date.now(),
        url: window.location.href,
      }),
    })
  }
}

// Usage
const rum = new RUMCollector()
rum.trackEvent('quiz-completion', 45000) // 45 seconds
```

## Continuous Improvement

1. **Baseline**: Measure current performance
2. **Identify**: Find slowest pages/interactions
3. **Optimize**: Apply fixes
4. **Monitor**: Track improvement over time
5. **Iterate**: Continuously improve

Target: Achieve 90%+ metrics in green zone within 30 days.
