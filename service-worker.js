const CACHE_NAME = 'simple-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'offline-form.html',
    'styles.css',
    'manifest.json',
    'pwa-banner.png',
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching essential assets');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event - serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log('[Service Worker] Returning cached resource:', event.request.url);
                return response;
            }
            console.log('[Service Worker] Fetching from network:', event.request.url);
            return fetch(event.request);
        })
    );
});

// Sync event - retry offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form') {
        console.log('[Service Worker] Sync event triggered: Submitting offline form data...');
        event.waitUntil(syncFormData());
    }
});

function syncFormData() {
    // Retrieve the form data from localStorage
    const formData = JSON.parse(localStorage.getItem('formData'));

    if (formData && formData.length > 0) {
        console.log('[Service Worker] Syncing form data...');
        
        // Send the form data to the backend server at localhost:5000/sync
        return fetch('http://localhost:5000/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log('[Service Worker] Data synced successfully:', data);
            // Clear the stored form data in localStorage after successful sync
            localStorage.removeItem('formData');
        })
        .catch((error) => {
            console.error('[Service Worker] Failed to sync data:', error);
        });
    } else {
        console.log('[Service Worker] No form data to sync');
    }
}

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: 'pwa-banner.png',  // Use pwa-banner.png for the notification icon
        badge: 'badge.png',      // Optional: You can use a badge if needed
    };

    event.waitUntil(
        self.registration.showNotification('New Content Available!', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://your-app-url.com') // Open your app's homepage or a specific page
    );
});
