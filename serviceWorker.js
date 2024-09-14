const CACHE_NAME = 'my-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  // Add other static assets like CSS, JS files, images, etc.
];

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((error) => {
      console.error('Failed to cache during install:', error);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Old caches cleared.');
    }).catch((error) => {
      console.error('Failed to clean up old caches:', error);
    })
  );
});

// Fetch event: Serve cached response or fetch from network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/static/')) {
      // Handle static assets caching
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
        }).catch((error) => {
          console.error('Fetch failed:', error);
          // Optionally return a fallback response if desired
          return caches.match('/offline.html');
        })
      );
      return;
    }
  }

  // Network-first strategy for other requests
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      // Cache the new response
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      });
    }).catch((error) => {
      console.error('Fetch failed:', error);
      // Optionally return a fallback response if desired
      return caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || caches.match('/offline.html');
      });
    })
  );
});
