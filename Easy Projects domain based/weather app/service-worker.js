// Service Worker for Weather App PWA

const CACHE_NAME = 'weather-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API calls
                if (!event.request.url.includes('api.openweathermap.org')) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          }
        );
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'sync-weather-data') {
    event.waitUntil(syncWeatherData());
  }
});

// Function to sync weather data when back online
function syncWeatherData() {
  // Get pending requests from IndexedDB
  return getOfflineRequests()
    .then(requests => {
      return Promise.all(
        requests.map(request => {
          // Process each request
          return fetch(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body
          })
          .then(response => {
            // Remove from pending requests
            return removeOfflineRequest(request.id);
          });
        })
      );
    });
}

// Placeholder functions for IndexedDB operations
function getOfflineRequests() {
  return Promise.resolve([]);
}

function removeOfflineRequest(id) {
  return Promise.resolve();
}