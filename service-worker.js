const CACHE_NAME = 'simple-pwa-cache-v1';
const urlsToCache = [
    'index.html',
    'offline-form.html',
    'styles.css',
    'manifest.json',
    'icon.png',
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching assets...');
            return cache.addAll(urlsToCache);
        }).then(() => {
            console.log('[Service Worker] Installation complete.');
        }).catch((error) => {
            console.error('[Service Worker] Install failed:', error);
        })
    );
});

// Fetch event - serve cached assets or fetch from network
self.addEventListener('fetch', (event) => {
    console.log(`[Service Worker] Fetching: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                return response;
            }
            console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
            return fetch(event.request);
        }).catch((error) => {
            console.error('[Service Worker] Fetch error:', error);
        })
    );
});

// Sync event - retry offline form submissions
self.addEventListener('sync', (event) => {
    console.log(`[Service Worker] Sync event triggered: ${event.tag}`);
    if (event.tag === 'sync-form') {
        console.log('[Service Worker] Submitting offline form data...');
        event.waitUntil(syncFormData());
    }
});

// Function to sync form data
function syncFormData() {
    console.log('[Service Worker] Syncing form data...');
    return getFormDataFromIndexedDB().then((formData) => {
        if (formData) {
            console.log('[Service Worker] Form data found:', formData);
            // Simulate sending form data to a server
            return fetch('https://your-api-endpoint.com/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            }).then(response => response.json())
              .then((data) => {
                  console.log('[Service Worker] Form data successfully submitted:', data);
                  clearFormDataFromIndexedDB();
              }).catch((error) => {
                  console.error('[Service Worker] Error submitting form data:', error);
              });
        } else {
            console.log('[Service Worker] No form data found to sync.');
        }
    }).catch((error) => {
        console.error('[Service Worker] Error syncing form data:', error);
    });
}

// Function to get form data from IndexedDB
function getFormDataFromIndexedDB() {
    console.log('[Service Worker] Retrieving form data from IndexedDB...');
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('offlineFormData', 1);
        request.onsuccess = function() {
            const db = request.result;
            const tx = db.transaction('formData', 'readonly');
            const store = tx.objectStore('formData');
            const data = store.getAll();
            data.onsuccess = function() {
                console.log('[Service Worker] Form data retrieved:', data.result);
                resolve(data.result[0]); // Return the first form data item
            };
            data.onerror = function(error) {
                console.error('[Service Worker] Error retrieving form data from IndexedDB:', error);
                reject(error);
            };
        };
    });
}

// Function to clear form data from IndexedDB
function clearFormDataFromIndexedDB() {
    console.log('[Service Worker] Clearing form data from IndexedDB...');
    const request = indexedDB.open('offlineFormData', 1);
    request.onsuccess = function() {
        const db = request.result;
        const tx = db.transaction('formData', 'readwrite');
        const store = tx.objectStore('formData');
        store.clear();
        console.log('[Service Worker] Form data cleared from IndexedDB.');
    };
    request.onerror = function(error) {
        console.error('[Service Worker] Error clearing form data from IndexedDB:', error);
    };
}

// Push event - handle push notifications
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push event received:', event);
    const options = {
        body: event.data.text(),
        icon: 'icon.png',
        badge: 'badge.png',
    };

    event.waitUntil(
        self.registration.showNotification('New Content Available!', options).then(() => {
            console.log('[Service Worker] Push notification displayed.');
        }).catch((error) => {
            console.error('[Service Worker] Error displaying push notification:', error);
        })
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event);
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://your-app-url.com/new-content').then(() => {
            console.log('[Service Worker] Opening new content URL.');
        }).catch((error) => {
            console.error('[Service Worker] Error opening new content URL:', error);
        })
    );
});
