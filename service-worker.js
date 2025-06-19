importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// ── Inicializar Firebase ──────────────────────────────────────
firebase.initializeApp({
  apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
  authDomain: "fintrack-1bced.firebaseapp.com",
  projectId: "fintrack-1bced",
  messagingSenderId: "576236535723",
  appId: "1:576236535723:web:4276524c0c6a10a3391cee",
});

const messaging = firebase.messaging();

// ── Notificaciones en segundo plano ───────────────────────────
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Background message', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Notificación', {
    body: body || '',
    icon: icon || '/icons/notification.png',
    data: payload.data || {}
  });
});

// ── SW lifecycle ───────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW] Activado');
  e.waitUntil(self.clients.claim());
});

// ── Periodic Background Sync ──────────────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] periodicSync recibido');
    event.waitUntil(doFullSync());
  }
});

// ── Trigger manual desde el cliente ───────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'TRIGGER_SYNC') {
    console.log('[SW] Mensaje recibido: TRIGGER_SYNC');
    event.waitUntil(doFullSync());
  }
});

// ── doFullSync: Transacciones, Límites y Notificaciones ──────
async function doFullSync() {
  console.log('[SW] doFullSync INICIADO');

  try {
    const uid = await getUIDFromIndexedDB();
    if (!uid) {
      console.warn('[SW] Sin UID en IndexedDB, abortando sync');
      return;
    }

    const apiUrl = self.location.hostname === 'localhost'
      ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
      : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

    const txRes = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });

    if (!txRes.ok) {
      const errorText = await txRes.text();
      console.error('[SW] sync_transactions_and_store falló:', txRes.status, errorText);
      return;
    }

    const limRes = await fetch(`${apiUrl}/plaid/sync_history_limits_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });

    if (!limRes.ok) {
      const errorText = await limRes.text();
      console.error('[SW] sync_history_limits_and_store falló:', limRes.status, errorText);
      return;
    }

    const json = await limRes.clone().json();
    const { period, groups } = json;
    await storeInIndexedDB('historyLimits', { period, groups });

    for (const [groupName, data] of Object.entries(groups || {})) {
      const { limit, spent } = data;
      if (spent <= limit) continue;

      const tag = `excess-${period}-${groupName}`;
      const prev = await self.registration.getNotifications({ tag });
      if (prev.length > 0) continue;

      const bodyText = `${groupName}: ${spent.toFixed(2)} € de ${limit.toFixed(2)} €`;
      self.registration.showNotification('Límite excedido', {
        body: bodyText,
        icon: '/icons/notification-alert.png',
        tag,
        renotify: false,
        vibrate: [100, 50, 100]
      });
    }
  } catch (err) {
    console.error('[SW] Error inesperado en doFullSync:', err);
  }
}

// ── IndexedDB helpers ─────────────────────────────────────────
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
      const putRequest = store.put(value, key);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);

      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

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

// ── Notificación Push Manual ─────────────────────────────────
self.addEventListener('push', event => {
  let payload = {
    title: 'Notificación',
    body:  'Tienes una nueva notificación',
    icon:  '/icons/notification.png',
    data:  {}
  };

  try {
    const json = event.data.json();
    payload = { ...payload, ...json };
  } catch (e) {
    console.warn('[SW] payload no era JSON, usando valores por defecto');
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    tag: payload.tag,
    renotify: payload.renotify || false,
    vibrate: payload.vibrate || [100, 50, 100],
    data: payload.data
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ── Click en Notificación ─────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      for (const client of clientsArr) {
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
