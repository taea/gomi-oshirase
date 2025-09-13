const CACHE_NAME = 'gomi-oshirase-v1';
const urlsToCache = [
    '/gomi-oshirase/',
    '/gomi-oshirase/index.html',
    '/gomi-oshirase/styles.css',
    '/gomi-oshirase/app.js',
    '/gomi-oshirase/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

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

self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'ゴミの日です！',
        icon: '/gomi-oshirase/icon-192.png',
        badge: '/gomi-oshirase/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('ゴミの日お知らせくん', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/gomi-oshirase/')
    );
});

setInterval(() => {
    checkAndSendNotification();
}, 60000);

function checkAndSendNotification() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({
                type: 'CHECK_NOTIFICATION_TIME',
                time: `${hours}:${minutes}`
            });
        });
    });
}