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
  // Tomar control de todas las páginas abiertas bajo este scope
  event.waitUntil(self.clients.claim());
});

// Listener para Periodic Background Sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] periodicSync recibido');
    // Esperar a que termine la sincronización
    event.waitUntil(syncTransactionsFromWorker());
  }
});

// Función que hace fetch al endpoint y almacena en Firestore mediante la función Cloud
async function syncTransactionsFromWorker() {
  try {
    const uid = await getUIDFromIndexedDB();
    if (!uid) {
      console.warn('[SW] No hay UID en IndexedDB');
      return;
    }

    const apiUrl = self.location.hostname === 'localhost'
      ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
      : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });

    if (!res.ok) {
      console.error('[SW] Error syncTransactionsFromWorker:', res.status, await res.text());
    } else {
      console.log('[SW] Sincronización periódica completada:', await res.json());
    }
  } catch (e) {
    console.error('[SW] Excepción en syncTransactionsFromWorker:', e);
  }
}

// Leer el UID desde IndexedDB para usarlo en la sincronización
function getUIDFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('fintrack-db', 1);
    req.onupgradeneeded = () => {
      // Si no existe la store, crearla
      req.result.createObjectStore('metadata');
    };
    req.onsuccess = () => {
      const db = req.result;
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
    req.onerror = () => {
      reject(req.error);
    };
  });
}
