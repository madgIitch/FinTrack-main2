importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// ── Inicializar Firebase en el Service Worker ─────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
  authDomain: "fintrack-1bced.firebaseapp.com",
  projectId: "fintrack-1bced",
  messagingSenderId: "576236535723",
  appId: "1:576236535723:web:4276524c0c6a10a3391cee",
});

const messaging = firebase.messaging();

// ── Manejar notificaciones en segundo plano desde FCM ─────────────────────
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);
  const { title, body, icon } = payload.notification || {};
  const options = {
    body: body || '',
    icon: icon || '/icons/notification.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title || 'Notificación', options);
});

// ── Instalación del Service Worker ─────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

// ── Activación del Service Worker ─────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  event.waitUntil(self.clients.claim());
});

// ── Listener para Periodic Background Sync ─────────────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] periodicSync recibido');
    event.waitUntil(doFullSync());
  }
});

// ── Flujo completo de sincronización, límites y notificaciones de excesos ──
async function doFullSync() {
  try {
    const uid = await getUIDFromIndexedDB();
    if (!uid) {
      console.warn('[SW] Sin UID en IndexedDB, abortando sync');
      return;
    }

    const apiUrl = self.location.hostname === 'localhost'
      ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
      : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

    // 1) Sincronizar transacciones
    const txRes = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (!txRes.ok) {
      console.error('[SW] sync_transactions_and_store falló:', txRes.status);
      return;
    }
    console.log('[SW] Transacciones sincronizadas con éxito');

    // 2) Sincronizar límites y obtener datos
    const limRes = await fetch(`${apiUrl}/plaid/sync_history_limits_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (!limRes.ok) {
      console.error('[SW] sync_history_limits_and_store falló:', limRes.status);
      return;
    }
    const { period, groups } = await limRes.clone().json();
    await storeInIndexedDB('historyLimits', { period, groups });
    console.log(`[SW] historyLimits recibidos para ${period}:`, groups);

    // 3) Comprobar excesos y notificar solo una vez
    for (const [groupName, data] of Object.entries(groups || {})) {
      const { limit, spent } = data;
      if (spent <= limit) continue;

      const notificationTag = `excess-${period}-${groupName}`;
      const prev = await self.registration.getNotifications({ tag: notificationTag });
      if (prev.length > 0) {
        console.log(`[SW] Notificación ya emitida para ${groupName}`);
        continue;
      }

      const bodyText = `${groupName}: ${spent.toFixed(2)} € de ${limit.toFixed(2)} €`;
      self.registration.showNotification('Límite excedido', {
        body:    bodyText,
        icon:    '/icons/notification-alert.png',
        tag:     notificationTag,
        renotify:false,
        vibrate: [100, 50, 100]
      });
      console.log(`[SW] Notificación enviada para ${groupName}`);
    }
  } catch (err) {
    console.error('[SW] Error en doFullSync:', err);
  }
}

// ── Guardar JSON en IndexedDB ─────────────────────────────────────────────
function storeInIndexedDB(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fintrack-db', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      store.put(value, key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };
    request.onerror = () => reject(request.error);
  });
}

// ── Escuchar push manualmente desde Push API ───────────────────────────────
self.addEventListener('push', event => {
  console.log('[SW] push recibido:', event);
  let payload = {
    title: 'Notificación',
    body:  'Tienes una nueva notificación',
    icon:  '/icons/notification.png',
    data:  {}
  };

  try {
    const json = event.data.json();
    payload = {
      title:      json.title  || payload.title,
      body:       json.body   || payload.body,
      icon:       json.icon   || payload.icon,
      tag:        json.tag,
      renotify:   json.renotify,
      vibrate:    json.vibrate,
      data:       json.data   || {}
    };
  } catch (e) {
    console.warn('[SW] payload no era JSON, usando valores por defecto');
  }

  const options = {
    body:     payload.body,
    icon:     payload.icon,
    tag:      payload.tag,
    renotify: payload.renotify || false,
    vibrate:  payload.vibrate || [100,50,100],
    data:     payload.data
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ── Gestionar click en la notificación ────────────────────────────────────
self.addEventListener('notificationclick', event => {
  console.log('[SW] notificationclick:', event.notification.tag);
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (const client of windowClients) {
          if (client.url.includes('/pages/home.html') && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/pages/home.html');
        }
      })
  );
});

// ── Obtener el UID desde IndexedDB ────────────────────────────────────────
function getUIDFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fintrack-db', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const getReq = store.get('userId');
      getReq.onsuccess = () => {
        resolve(getReq.result || null);
        db.close();
      };
      getReq.onerror = () => {
        reject(getReq.error);
        db.close();
      };
    };
    request.onerror = () => reject(request.error);
  });
}

// ── Interceptar llamadas GET a API y cachearlas ───────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (
    event.request.method === 'GET' &&
    url.origin.includes('fintrack') &&
    url.pathname.includes('/api/')
  ) {
    event.respondWith(
      caches.open('fintrack-api-cache').then(async cache => {
        try {
          const networkResponse = await fetch(event.request.clone());
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          return cache.match(event.request).then(cached => {
            if (cached) {
              console.log('[SW] Modo offline: usando caché para', url.pathname);
              return cached;
            }
            return new Response(JSON.stringify({ error: 'Sin conexión y sin datos cacheados' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        }
      })
    );
  }
});
