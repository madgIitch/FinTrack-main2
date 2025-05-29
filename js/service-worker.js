// js/service-worker.js

self.addEventListener('install', event => {
  console.log('[SW] Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activado');
  return self.clients.claim();
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'sync-transactions') {
    console.log('[SW] periodicSync recibido');
    event.waitUntil(syncTransactionsFromWorker());
  }
});

async function syncTransactionsFromWorker() {
  try {
    const uid = await getUIDFromIndexedDB();
    if (!uid) {
      console.warn('[SW] No UID disponible');
      return;
    }

    const apiUrl = self.location.hostname === 'localhost'
      ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
      : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    console.log('[SW] Sync periódica completada:', await res.json());
  } catch (e) {
    console.error('[SW] Error en syncTransactionsFromWorker:', e);
  }
}

function getUIDFromIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('fintrack-db',1);
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction('metadata','readonly');
      const store = tx.objectStore('metadata');
      const g = store.get('userId');
      g.onsuccess = () => {
        resolve(g.result || null);
        db.close();
      };
      g.onerror = () => reject(g.error);
    };
    req.onerror = () => reject(req.error);
  });
}
