// Service Worker Unificado para NAO Moto Club: PWA, Web Push Notifications y Offline Maps Cache
const MAP_CACHE_NAME = 'nao-map-tiles-v2';
const TILE_DOMAINS = [
  'server.arcgisonline.com',
  'services.arcgisonline.com',
  'tile.opentopomap.org',
  'tile.openstreetmap.org',
  'basemaps.cartocdn.com',
  'demotiles.maplibre.org'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== MAP_CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 1. Interceptar peticiones de mapas offline
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isMapTile = TILE_DOMAINS.some(domain => url.hostname.includes(domain)) ||
                    url.pathname.includes('/tile/') ||
                    url.pathname.endsWith('.pbf');

  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return new Response('', { status: 408, statusText: 'Offline Map Tile Unavailable' });
        }
      })
    );
  }
});

// 2. Receptor de Notificaciones Push Nativas (Web Push)
self.addEventListener('push', (event) => {
  let data = {
    title: 'NAO Moto Club',
    body: 'Tienes una nueva actualización en tu club.',
    icon: '/apple-icon',
    badge: '/favicon.svg',
    url: '/'
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/apple-icon',
    badge: data.badge || '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'nao-notification',
    renotify: true,
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 3. Acción al pulsar sobre la notificación en el móvil
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
