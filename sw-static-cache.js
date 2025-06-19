const STATIC_CACHE = 'static-v1';
const API_CACHE = 'fintrack-api-cache';

const STATIC_ASSETS = [
  '/index.html',
  '/manifest.webmanifest',
  '/pages/home.html',
  '/pages/profile.html',
  '/pages/analysis.html',
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

// ── Activar y limpiar caches antiguos ─────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
  (async () => {
    const cache = await caches.open(STATIC_CACHE);
    for (const asset of STATIC_ASSETS) {
      try {
        const response = await fetch(asset);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        await cache.put(asset, response.clone());
        console.log(`[SW STATIC] ✅ Cacheado: ${asset}`);
      } catch (err) {
        console.warn(`[SW STATIC] ⚠️ No se pudo cachear: ${asset}`, err);
      }
    }
    self.skipWaiting();
  })()
);

});

// ── Interceptar peticiones ───────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;

  if (event.request.method !== 'GET') return;

  // 1. Recursos estáticos
  if (STATIC_ASSETS.includes(pathname)) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request)
      )
    );
    return;
  }

  // 2. Peticiones a API → cache dinámico
  if (pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then(async cache => {
        try {
          const response = await fetch(event.request.clone());
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (err) {
          console.warn('[SW STATIC] API offline, usando caché para:', pathname);
          const cached = await cache.match(event.request);
          return cached || new Response(JSON.stringify({ error: 'Offline y sin caché' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })
    );
    return;
  }

  // 3. Otros recursos → red con fallback
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached ||
      fetch(event.request).catch(err => {
        console.warn('[SW STATIC] Error de red o sin conexión:', err);

        // Fallback a home si es documento HTML
        if (event.request.destination === 'document') {
          return caches.match('/pages/home.html');
        }

        return new Response('Recurso no disponible offline', {
          status: 503,
          statusText: 'Offline'
        });
      })
    )
  );
});
