const CACHE_NAME = 'simple-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'offline-form.html',
    'styles.css',
    'manifest.json',
    'pwa-banner.png', // Only reference files you need
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event - serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Sync event - retry offline form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form') {
        console.log('[Service Worker] Sync event triggered: Submitting offline form data');
        event.waitUntil(syncFormData());
    }
});

function syncFormData() {
    return getFormDataFromIndexedDB().then((formData) => {
        if (formData) {
            console.log('[Service Worker] Syncing form data...');
            console.log('[Service Worker] Form data retrieved:', formData); // Simulate submitting form data
            // Here, instead of sending the data to a backend, we'll just log it
            clearFormDataFromIndexedDB();
            console.log('[Service Worker] Form data cleared from IndexedDB.');
        }
    });
}

function getFormDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('offlineFormData', 1);
        request.onsuccess = function() {
            const db = request.result;
            const tx = db.transaction('formData', 'readonly');
            const store = tx.objectStore('formData');
            const data = store.getAll();
            data.onsuccess = function() {
                resolve(data.result[0]); // Assuming we're only storing one form data at a time
            };
            data.onerror = reject;
        };
    });
}

function clearFormDataFromIndexedDB() {
    const request = indexedDB.open('offlineFormData', 1);
    request.onsuccess = function() {
        const db = request.result;
        const tx = db.transaction('formData', 'readwrite');
        const store = tx.objectStore('formData');
        store.clear();
        console.log('[Service Worker] Form data cleared from IndexedDB.');
    };
}

// Push event - handle push notifications (you can customize this if needed)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        badge: 'badge.png', // You can update this if you have a badge image
    };

    event.waitUntil(
        self.registration.showNotification('New Content Available!', options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/index.html') // URL to be redirected to after clicking the notification
    );
});
