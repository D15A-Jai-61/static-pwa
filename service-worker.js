const CACHE_NAME = 'static-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'offline.html',
    'styles.css',
    'manifest.json',
    'pwa-banner.png',
];

// Install event - Cache essential assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install event triggered');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log('[Service Worker] Caching essential assets');
            for (const url of urlsToCache) {
                try {
                    await cache.add(url);
                    console.log(`[Service Worker] Cached successfully: ${url}`);
                } catch (error) {
                    console.error(`[Service Worker] Failed to cache: ${url}`, error);
                }
            }
        }).then(() => console.log('[Service Worker] Caching process completed'))
        .catch((error) => console.error('[Service Worker] Caching failed:', error))
    );
});

// Fetch event - Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    console.log(`[Service Worker] Fetch event triggered for: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log(`[Service Worker] Serving cached response for: ${event.request.url}`);
                return response;
            }
            console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
            return fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    console.log(`[Service Worker] Cached new resource: ${event.request.url}`);
                    return fetchResponse;
                });
            }).catch((error) => {
                console.error(`[Service Worker] Network request failed for: ${event.request.url}`, error);
                return caches.match('offline.html');
            });
        })
    );
});

// Sync event - Trigger manual sync via DevTools
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-demo') {
        console.log('[Service Worker] Sync event triggered manually');
        event.waitUntil(syncDemoTask());
    }
});

async function syncDemoTask() {
    console.log('[Service Worker] Running sync task...');
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('[Service Worker] Sync task completed successfully!');
            resolve();
        }, 2000);
    });
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