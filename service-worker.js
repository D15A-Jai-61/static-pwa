const CACHE_NAME = 'static-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'styles.css',
    'manifest.json',
    'pwa-banner.png',
];

// Install event - Cache essential assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install event triggered');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Service Worker] Caching essential assets');
            return Promise.all(
                urlsToCache.map(url => 
                    cache.add(url).then(() => 
                        console.log(`[Service Worker] Cached successfully: ${url}`)
                    ).catch(error => 
                        console.error(`[Service Worker] Failed to cache: ${url}`, error)
                    )
                )
            );
        }).then(() => {
            console.log('[Service Worker] Caching process completed');
            return self.skipWaiting();
        })
        .catch(error => console.error('[Service Worker] Caching failed:', error))
    );
});

// Activate event - Cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate event triggered');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    console.log(`[Service Worker] Fetch event triggered for: ${event.request.url}`);
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request).then(networkResponse => {
            console.log(`[Service Worker] Network response for ${event.request.url}`);
            return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        }).catch(error => {
            console.log(`[Service Worker] Network failed, trying cache for ${event.request.url}`);
            return caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return cachedResponse;
                }
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});

// Sync event - Handle background sync
self.addEventListener('sync', (event) => {
    console.log(`[Service Worker] Sync event triggered: ${event.tag}`);
    if (event.tag === 'sync-demo') {
        event.waitUntil(
            handleSync().catch(error => {
                console.error('[Service Worker] Sync failed:', error);
            })
        );
    }
});

async function handleSync() {
    console.log('[Service Worker] Starting sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('[Service Worker] Sync task completed successfully!');
}

// Push event - Handle push notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push event received');
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: 'pwa-banner.png',
        badge: 'badge.png',
        actions: [
            { action: 'open', title: 'View Now' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    event.waitUntil(
        self.registration.showNotification('New Notification', options)
        .then(() => console.log('[Service Worker] Push notification displayed successfully'))
        .catch((error) => console.error('[Service Worker] Failed to display push notification:', error))
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log(`[Service Worker] Notification clicked: ${event.notification.title}`);
    event.notification.close();
    if (event.action === 'open') {
        console.log('[Service Worker] Opening application');
        event.waitUntil(clients.openWindow('https://your-static-site.com'));
    } else {
        console.log('[Service Worker] Notification dismissed');
    }
});
