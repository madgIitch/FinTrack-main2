// public/service-worker.js

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Instalado');
  // Activar inmediatamente sin esperar a recarga
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  // Tomar control inmediato de todas las páginas bajo el scope
  event.waitUntil(self.clients.claim());
});

// Listener para Periodic Background Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] periodicSync recibido');
    // Ejecutar flujo completo de sincronización
    event.waitUntil(doFullSync());
  }
});

// Flujo completo de sincronización, límites y notificaciones de excesos
async function doFullSync() {
  try {
    const uid = await getUIDFromIndexedDB();
    if (!uid) {
      console.warn('[SW] Sin UID en IndexedDB, abortando sync');
      return;
    }

    // Determinar URL base de la API según entorno
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

    // 2) Sincronizar límites y obtener datos de historyLimits
    const limRes = await fetch(`${apiUrl}/plaid/sync_history_limits_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (!limRes.ok) {
      console.error('[SW] sync_history_limits_and_store falló:', limRes.status);
      return;
    }

    const { period, groups } = await limRes.json();
    console.log(`[SW] historyLimits recibidos para ${period}:`, groups);

    // 3) Comprobar excesos y notificar solo una vez por grupo
    for (const [groupName, data] of Object.entries(groups || {})) {
      const { limit, spent } = data;
      if (spent <= limit) continue;

      // Tag único por periodo y grupo para evitar duplicados
      const notificationTag = `excess-${period}-${groupName}`;

      // Verificar si hay notificación previa con ese tag
      const prev = await self.registration.getNotifications({ tag: notificationTag });
      if (prev.length > 0) {
        console.log(`[SW] Notificación ya emitida para ${groupName}`);
        continue;
      }

      // Construir y mostrar la notificación
      const bodyText = `${groupName}: ${spent.toFixed(2)} € de ${limit.toFixed(2)} €`;
      self.registration.showNotification('Límite excedido', {
        body: bodyText,
        icon: '/icons/notification-alert.png',
        tag: notificationTag,
        renotify: false,
        vibrate: [100, 50, 100]
      });
      console.log(`[SW] Notificación enviada para ${groupName}`);
    }
  } catch (err) {
    console.error('[SW] Error en doFullSync:', err);
  }
}

// Obtener el UID desde IndexedDB (store: 'metadata', key: 'userId')
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