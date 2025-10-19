# Progressive Web App (PWA) Documentation

## Overview
The Beauty Mirror Quiz has been configured as a Progressive Web App (PWA) with offline support, installation capabilities, and intelligent caching strategies.

## Features Implemented

### 1. **Install Prompt**
Users can install the app on their home screen with a single tap:
- Works on iOS (via Web Clip) and Android (via Chrome/Firefox)
- Custom install banner appears on first visit
- "Add to Home Screen" from browser menu

### 2. **Offline Support**
The app works offline using Workbox caching:
- **API Calls**: Network-first strategy (tries network, falls back to cache)
- **Static Assets**: Stale-while-revalidate (serve cached, update in background)
- **Images**: Cache-first (serve cached, update periodically)
- **Fonts**: Cache-first with 1-year expiration

### 3. **App Shell Architecture**
The app shell (HTML, CSS, JS) is cached for instant loading on repeat visits.

### 4. **Service Worker**
Automatically handles:
- Request interception
- Cache management
- Background sync (when online after being offline)

## Setup Configuration

### next.config.js
PWA is configured with:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Firebase Storage - cache for 24 hours
    // Google Fonts - cache for 1 year
    // API calls - network-first
    // Static resources - stale-while-revalidate
    // Images - cache-first
  ]
})
```

### public/manifest.json
Defines app metadata:
- App name, icons, theme colors
- Start URL, display mode (standalone)
- Shortcuts to key features
- Screenshots for installation

## Usage

### Install PWA Component
Add to your layout or shell component:

```tsx
import { PWAInstallPrompt, OfflineIndicator } from '@/components/PWAComponents'

export default function Layout() {
  return (
    <>
      <OfflineIndicator />
      <main>{/* Your content */}</main>
      <PWAInstallPrompt />
    </>
  )
}
```

### Detect Installation Status
```tsx
import { usePWAInstall } from '@/hooks/usePWA'

export function MyComponent() {
  const { canInstall, isInstalled, installApp } = usePWAInstall()

  return (
    <div>
      {isInstalled ? (
        <p>App installed! ✅</p>
      ) : canInstall ? (
        <button onClick={installApp}>Install App</button>
      ) : (
        <p>PWA not available on this browser</p>
      )}
    </div>
  )
}
```

### Check Online Status
```tsx
import { useOnlineStatus } from '@/hooks/usePWA'

export function MyComponent() {
  const isOnline = useOnlineStatus()

  return (
    <div>
      Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
      {!isOnline && <p>Limited features available</p>}
    </div>
  )
}
```

### Monitor Service Worker Updates
```tsx
import { useServiceWorker } from '@/hooks/usePWA'

export function UpdatePrompt() {
  const { hasUpdate, updateServiceWorker } = useServiceWorker()

  if (!hasUpdate) return null

  return (
    <div>
      <p>New version available!</p>
      <button onClick={updateServiceWorker}>Update</button>
    </div>
  )
}
```

## Cache Strategies

### Network-First (API Calls)
1. Try network request
2. If fails, use cached version
3. Always update cache with successful response

**Best for**: Dynamic API data that should be fresh

```
User Request → Network → Success? → Cache & Return
                          ↓ Fail
                      Use Cache
```

### Stale-While-Revalidate (JS/CSS)
1. Immediately return cached version
2. Fetch new version in background
3. Update cache for next visit

**Best for**: Static resources that update infrequently

```
User Request → Cache (return immediately)
              ↓
              Network (update in background)
```

### Cache-First (Images/Fonts)
1. Check cache first
2. If not cached, fetch from network
3. Cache the response

**Best for**: Static content that rarely changes

```
User Request → Cache Hit? → Return
                ↓ Miss
                Network → Cache & Return
```

## Installation Instructions

### iOS
1. Open app in Safari
2. Tap Share icon (bottom menu)
3. Tap "Add to Home Screen"
4. Name the app and tap Add

### Android
1. Open app in Chrome
2. Tap menu (three dots)
3. Tap "Install app" or "Add to Home screen"
4. Follow prompts to install

### Desktop (Chrome/Edge)
1. Click address bar icon (left of URL)
2. Click "Install Beauty Mirror Quiz"
3. App opens in separate window

## Offline Experience

When offline, users can:
- ✅ View previously loaded pages
- ✅ Access cached quiz data
- ✅ View their profile information
- ❌ Submit new quiz responses (will sync when online)
- ❌ Upload photos (will retry when online)

### Handling Offline States
```tsx
import { useOnlineStatus } from '@/hooks/usePWA'

export function QuizForm() {
  const isOnline = useOnlineStatus()

  return (
    <form>
      <input type="text" name="answer" />
      <button 
        type="submit" 
        disabled={!isOnline}
        title={!isOnline ? "Cannot submit while offline" : ""}
      >
        Submit
      </button>
      {!isOnline && <p>Connect to internet to submit</p>}
    </form>
  )
}
```

## Performance Metrics

### First Load
- Without PWA: ~3-5 seconds
- With PWA (cached): ~500ms (instant from home screen)

### Network Traffic
- Initial load: Full app download
- Subsequent loads: ~50-100KB (only changed resources)

### Storage Used
- App shell + assets: ~5-10MB
- Cache (with 100 sessions): ~20-30MB
- User quota: Typically 50MB+ per site

## Development

### Disable PWA in Development
PWA is disabled when `NODE_ENV === 'development'` to allow hot reloading.

To test PWA locally:
```bash
npm run build
npm install -g http-server
http-server ./out
```

Then open `http://localhost:8080` and test installation.

### Clear Service Worker Cache
```javascript
// In browser console
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(r => r.unregister())
    caches.keys().then(names => names.forEach(n => caches.delete(n)))
  })
}
```

### Test Offline Mode
In DevTools:
1. Go to Applications tab
2. Click Service Workers
3. Check "Offline" checkbox
4. Reload page to test offline functionality

## Browser Support

| Browser | Support | Install |
|---------|---------|---------|
| Chrome 64+ | ✅ Full | ✅ Yes |
| Firefox 58+ | ✅ Full | ❌ No |
| Safari 11+ | ⚠️ Limited | ✅ Web Clip |
| Edge 79+ | ✅ Full | ✅ Yes |
| Samsung Internet | ✅ Full | ✅ Yes |

## Deployment Checklist

- [ ] HTTPS enabled (required for service workers)
- [ ] `manifest.json` accessible at `/manifest.json`
- [ ] App icons in correct sizes (192x192, 512x512)
- [ ] Theme colors set in manifest
- [ ] Service worker caching configured
- [ ] Offline experience tested
- [ ] Installation tested on iOS and Android

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify HTTPS is enabled
- Clear browser cache and try again
- Check Application → Service Workers in DevTools

### Cache Not Updating
- Service workers intentionally cache aggressively
- Use "Network-first" strategy for frequently-changing data
- Manual cache clear: See "Clear Service Worker Cache" above

### App Icon Not Showing
- Verify icon paths in `manifest.json`
- Check icon sizes (192x192 minimum)
- Ensure icons are PNG or WebP format
- Clear cache and reinstall

### Offline Feature Not Working
- Enable Service Workers in browser settings
- Check network tab to verify caching
- Test with "Offline" mode in DevTools
- Verify runtime caching configuration

## Further Reading
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [next-pwa Documentation](https://github.com/shadowwalker/next-pwa)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
