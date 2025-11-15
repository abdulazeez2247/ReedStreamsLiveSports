const CACHE_NAME = 'reedstreams-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/upcoming.css',
  '/faq.css',
  '/scroll.css',
  '/upcoming.js',
  '/scroll.js',
  '/faq.js',
  '/sports.html',
  '/upcoming.html',
  '/DMCA.html',
  '/FAQ.html',
  '/COntact.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/remixicon@4.7.0/fonts/remixicon.css'
];

// Install event - cache essential files
self.addEventListener('install', event => {
  console.log('Service Worker installed');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Cache installation failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise make network request
        return fetch(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache for future visits
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed; returning offline page:', error);
            // You could return a custom offline page here
          });
      })
  );
});

// Handle push notifications (optional)
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ReedStreams', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'close') {
    // Do nothing
  } else {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});