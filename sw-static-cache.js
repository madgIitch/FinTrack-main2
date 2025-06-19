const STATIC_CACHE = 'static-v1';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.webmanifest',
  '/pages/home.html',
  '/pages/profile.html',
  '/pages/settings.html',
  '/pages/register.html',
  '/pages/notifications.html',
  '/pages/transactions.html',
  '/logoFintonic192x192.c58ee458.png',
];

// ── Instalar y cachear recursos estáticos ─────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW STATIC] Instalando y cacheando recursos estáticos');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW STATIC] Error cacheando:', err))
  );
});

// ── Activar SW y limpiar caches antiguos si hubiera ──────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Interceptar peticiones ───────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        // Si está cacheado, devuélvelo
        if (cached) return cached;

        // Si no, intenta desde red
        return fetch(event.request).catch(err => {
          console.warn('[SW STATIC] Error de red o sin conexión:', err);
          
          // Si es un HTML (página), devolver home.html como fallback
          if (event.request.destination === 'document') {
            return caches.match('/pages/home.html');
          }

          // Si no es HTML, devolver 503 vacío
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Offline',
          });
        });
      })
    );
  }
});
