// Service Worker para Modo Off-Road y Caché de Mapas Offline de NAO Club
const MAP_CACHE_NAME = 'nao-map-tiles-v1';
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

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Solo interceptar peticiones de mosaicos de mapa (tiles)
  const isMapTile = TILE_DOMAINS.some(domain => url.hostname.includes(domain)) ||
                    url.pathname.includes('/tile/') ||
                    url.pathname.endsWith('.png') ||
                    url.pathname.endsWith('.jpg') ||
                    url.pathname.endsWith('.pbf');

  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then(async (cache) => {
        // 1. Intentar servir desde caché local (ideal para off-road sin señal)
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Si hay señal, descargar y guardar en caché para la próxima vez
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Si estamos totalmente offline y no está en caché, no arrojar error no controlado
          console.warn('[SW Maps] Sin señal satelital/4G para tile:', url.pathname);
          return new Response('', { status: 408, statusText: 'Offline Map Tile Unavailable' });
        }
      })
    );
  }
});
