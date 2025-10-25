const CACHE_NAME = 'bm-cache-v2';
// Only include assets that are guaranteed to exist in /public
const ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Add each asset individually and ignore failures to avoid aborting install
      await Promise.all(
        ASSETS.map(async (url) => {
          try {
            await cache.add(url);
          } catch (_) {
            // ignore missing or failed requests during install
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Only handle same-origin requests; let cross-origin (e.g., Firestore, Firebase Auth) pass through
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request)
        .then((resp) => {
          // Cache successful responses only
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
          }
          return resp;
        })
        .catch(() => caches.match('/'))
    )
  );
});
