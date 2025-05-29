// js/service-worker.js
self.addEventListener('install', (event)=>{
    console.log('[SW] Instalado');
    self.skipWaiting();
});
self.addEventListener('activate', (event)=>{
    console.log('[SW] Activado');
    return self.clients.claim();
});
// Periodic Background Sync
self.addEventListener('periodicsync', (event)=>{
    if (event.tag === 'sync-transactions') {
        console.log('[SW] periodicSync event recibido');
        event.waitUntil(syncTransactionsFromWorker());
    }
});
async function syncTransactionsFromWorker() {
    try {
        const uid = await getUIDFromIndexedDB();
        if (!uid) {
            console.warn('[SW] No hay UID para sincronizar');
            return;
        }
        const apiUrl = self.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
        await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: uid
            })
        });
        console.log("[SW] Sincronizaci\xf3n peri\xf3dica completada");
    } catch (e) {
        console.error('[SW] Error al sincronizar:', e);
    }
}
function getUIDFromIndexedDB() {
    return new Promise((resolve, reject)=>{
        const req = indexedDB.open('fintrack-db', 1);
        req.onsuccess = ()=>{
            const db = req.result;
            const tx = db.transaction('metadata', 'readonly');
            const store = tx.objectStore('metadata');
            const getReq = store.get('userId');
            getReq.onsuccess = ()=>{
                resolve(getReq.result || null);
                db.close();
            };
            getReq.onerror = ()=>reject(getReq.error);
        };
        req.onerror = ()=>reject(req.error);
    });
}

//# sourceMappingURL=service-worker.js.map
