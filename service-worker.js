const CACHE_NAME = 'simple-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'styles.css',
    'pwa-banner.png',
    'date-time.js'  // We need to cache this new JS file
];

// Install the service worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch resources from the cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});

// Sync event to fetch current date and time
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-date-time') {
        event.waitUntil(
            fetch('https://worldtimeapi.org/api/timezone/Etc/UTC')  // API to get current time
                .then(response => response.json())
                .then(data => {
                    const currentTime = data.datetime;
                    return caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put('current-time.json', new Response(JSON.stringify({ currentTime })));
                        });
                })
        );
    }
});

// Activate the service worker
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
        })
    );
});
