const CACHE_NAME = 'ecommerce-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'offline.html',
    'styles.css',
    'manifest.json',
    'pwa-banner.png',
];

// Install event - Cache essential assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching essential assets');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event - Serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        }).catch(() => caches.match('offline.html'))
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
    const formData = await idbKeyval.get('formData'); // Use IndexedDB instead of localStorage
    if (formData && formData.length > 0) {
        console.log('[Service Worker] Syncing form data...');
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
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: 'pwa-banner.png',
        badge: 'badge.png',
        actions: [
            { action: 'open', title: 'View Now' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    event.waitUntil(self.registration.showNotification('New Notification', options));
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'open') {
        event.waitUntil(clients.openWindow('https://your-ecommerce-site.com'));
    }
});
