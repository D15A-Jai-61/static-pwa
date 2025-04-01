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

// Sync event - Retry offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form') {
        console.log('[Service Worker] Sync event triggered: Submitting offline form data...');
        event.waitUntil(syncFormData());
    }
});

async function syncFormData() {
    console.log('[Service Worker] Checking for stored form data to sync...');
    const formData = await idbKeyval.get('formData'); // Use IndexedDB instead of localStorage
    if (formData && formData.length > 0) {
        console.log('[Service Worker] Syncing form data:', formData);
        try {
            const response = await fetch('http://localhost:5000/sync', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log('[Service Worker] Data synced successfully:', data);
            await idbKeyval.del('formData'); // Clear stored data after successful sync
        } catch (error) {
            console.error('[Service Worker] Failed to sync data:', error);
        }
    } else {
        console.log('[Service Worker] No form data to sync');
    }
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
