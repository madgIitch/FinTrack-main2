importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');
// ── Inicializar Firebase en el Service Worker ─────────────────────────────
firebase.initializeApp({
    apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
    authDomain: "fintrack-1bced.firebaseapp.com",
    projectId: "fintrack-1bced",
    messagingSenderId: "576236535723",
    appId: "1:576236535723:web:4276524c0c6a10a3391cee"
});
const messaging = firebase.messaging();
// ── Manejar notificaciones en segundo plano desde FCM ─────────────────────
messaging.onBackgroundMessage((payload)=>{
    console.log('[firebase-messaging-sw.js] Received background message', payload);
    const { title, body, icon } = payload.notification || {};
    const options = {
        body: body || '',
        icon: icon || '/icons/notification.png',
        data: payload.data || {}
    };
    self.registration.showNotification(title || "Notificaci\xf3n", options);
});
// ── Instalación del Service Worker ─────────────────────────────────────────
self.addEventListener('install', (event)=>{
    console.log('[SW] Instalado');
    self.skipWaiting();
});
// ── Activación del Service Worker ─────────────────────────────────────────
self.addEventListener('activate', (event)=>{
    console.log('[SW] Activado');
    event.waitUntil(self.clients.claim());
});
// ── Listener para Periodic Background Sync ─────────────────────────────────
self.addEventListener('periodicsync', (event)=>{
    if (event.tag === 'sync-transactions') {
        console.log('[SW] periodicSync recibido');
        event.waitUntil(doFullSync());
    }
});
// ── Listener para mensajes desde el cliente ───────────────────────────────
self.addEventListener('message', (event)=>{
    if (event.data?.type === 'TRIGGER_SYNC') {
        console.log('[SW] Mensaje recibido: TRIGGER_SYNC');
        event.waitUntil(doFullSync());
    }
});
// ── Flujo completo de sincronización, límites y notificaciones de excesos ──
async function doFullSync() {
    console.log('[SW] doFullSync INICIADO');
    try {
        const uid = await getUIDFromIndexedDB();
        console.log('[SW] UID obtenido desde IndexedDB:', uid);
        if (!uid) {
            console.warn('[SW] Sin UID en IndexedDB, abortando sync');
            return;
        }
        const apiUrl = self.location.hostname === 'localhost' ? 'http://localhost:5001/fintrack-1bced/us-central1/api' : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
        // ── Paso 1: Transacciones ──────────────────────────────────────
        console.log("[SW] Enviando petici\xf3n a sync_transactions_and_store...");
        const txRes = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: uid
            })
        });
        console.log('[SW] Respuesta transacciones status:', txRes.status);
        if (!txRes.ok) {
            const errorText = await txRes.text();
            console.error("[SW] sync_transactions_and_store fall\xf3:", txRes.status, errorText);
            return;
        }
        console.log("[SW] Transacciones sincronizadas con \xe9xito");
        // ── Paso 2: Límites ────────────────────────────────────────────
        console.log("[SW] Enviando petici\xf3n a sync_history_limits_and_store...");
        const limRes = await fetch(`${apiUrl}/plaid/sync_history_limits_and_store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: uid
            })
        });
        console.log("[SW] Respuesta l\xedmites status:", limRes.status);
        if (!limRes.ok) {
            const errorText = await limRes.text();
            console.error("[SW] sync_history_limits_and_store fall\xf3:", limRes.status, errorText);
            return;
        }
        const json = await limRes.clone().json();
        console.log('[SW] JSON recibido de sync_history_limits_and_store:', json);
        const { period, groups } = json;
        console.log(`[SW] historyLimits recibidos para ${period}:`, groups);
        // ── Guardar localmente ─────────────────────────────────────────
        await storeInIndexedDB('historyLimits', {
            period,
            groups
        });
        console.log('[SW] historyLimits guardados en IndexedDB');
        // ── Paso 3: Notificaciones ─────────────────────────────────────
        for (const [groupName, data] of Object.entries(groups || {})){
            const { limit, spent } = data;
            if (spent <= limit) continue;
            const notificationTag = `excess-${period}-${groupName}`;
            const prev = await self.registration.getNotifications({
                tag: notificationTag
            });
            if (prev.length > 0) {
                console.log(`[SW] Notificaci\xf3n ya emitida para ${groupName}`);
                continue;
            }
            const bodyText = `${groupName}: ${spent.toFixed(2)} \u{20AC} de ${limit.toFixed(2)} \u{20AC}`;
            self.registration.showNotification("L\xedmite excedido", {
                body: bodyText,
                icon: '/icons/notification-alert.png',
                tag: notificationTag,
                renotify: false,
                vibrate: [
                    100,
                    50,
                    100
                ]
            });
            console.log(`[SW] Notificaci\xf3n enviada para ${groupName}`);
        }
    } catch (err) {
        console.error('[SW] Error inesperado en doFullSync:', err);
    }
}
// ── Guardar JSON en IndexedDB ─────────────────────────────────────────────
function storeInIndexedDB(key, value) {
    console.log('[SW] Intentando guardar en IndexedDB:', key, value);
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open('fintrack-db', 1);
        request.onupgradeneeded = ()=>{
            console.log('[SW] onupgradeneeded - creando objectStore si no existe');
            const db = request.result;
            if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata');
        };
        request.onsuccess = ()=>{
            console.log('[SW] open success');
            const db = request.result;
            const tx = db.transaction('metadata', 'readwrite');
            const store = tx.objectStore('metadata');
            const putRequest = store.put(value, key);
            putRequest.onsuccess = ()=>{
                console.log('[SW] Guardado correctamente en IndexedDB:', key);
            };
            putRequest.onerror = (e)=>{
                console.error('[SW] Error al guardar en IndexedDB:', e.target.error);
            };
            tx.oncomplete = ()=>{
                console.log("[SW] Transacci\xf3n completada");
                db.close();
                resolve();
            };
            tx.onerror = (e)=>{
                console.error("[SW] Transacci\xf3n fallida:", tx.error);
                db.close();
                reject(tx.error);
            };
        };
        request.onerror = (e)=>{
            console.error('[SW] Error abriendo IndexedDB:', e.target.error);
            reject(request.error);
        };
    });
}
// ── Escuchar push manualmente desde Push API ───────────────────────────────
self.addEventListener('push', (event)=>{
    console.log('[SW] push recibido:', event);
    let payload = {
        title: "Notificaci\xf3n",
        body: "Tienes una nueva notificaci\xf3n",
        icon: '/icons/notification.png',
        data: {}
    };
    try {
        const json = event.data.json();
        payload = {
            title: json.title || payload.title,
            body: json.body || payload.body,
            icon: json.icon || payload.icon,
            tag: json.tag,
            renotify: json.renotify,
            vibrate: json.vibrate,
            data: json.data || {}
        };
    } catch (e) {
        console.warn('[SW] payload no era JSON, usando valores por defecto');
    }
    const options = {
        body: payload.body,
        icon: payload.icon,
        tag: payload.tag,
        renotify: payload.renotify || false,
        vibrate: payload.vibrate || [
            100,
            50,
            100
        ],
        data: payload.data
    };
    event.waitUntil(self.registration.showNotification(payload.title, options));
});
// ── Gestionar click en la notificación ────────────────────────────────────
self.addEventListener('notificationclick', (event)=>{
    console.log('[SW] notificationclick:', event.notification.tag);
    event.notification.close();
    event.waitUntil(clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients)=>{
        for (const client of windowClients){
            if (client.url.includes('/pages/home.html') && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/pages/home.html');
    }));
});
// ── Obtener el UID desde IndexedDB ────────────────────────────────────────
function getUIDFromIndexedDB() {
    return new Promise((resolve, reject)=>{
        const request = indexedDB.open('fintrack-db', 1);
        request.onupgradeneeded = ()=>{
            const db = request.result;
            if (!db.objectStoreNames.contains('metadata')) db.createObjectStore('metadata');
        };
        request.onsuccess = ()=>{
            const db = request.result;
            const tx = db.transaction('metadata', 'readonly');
            const store = tx.objectStore('metadata');
            const getReq = store.get('userId');
            getReq.onsuccess = ()=>{
                resolve(getReq.result || null);
                db.close();
            };
            getReq.onerror = ()=>{
                reject(getReq.error);
                db.close();
            };
        };
        request.onerror = ()=>reject(request.error);
    });
}
// ── Interceptar llamadas GET a API y cachearlas ───────────────────────────
self.addEventListener('fetch', (event)=>{
    const url = new URL(event.request.url);
    if (event.request.method === 'GET' && url.origin.includes('fintrack') && url.pathname.includes('/api/')) event.respondWith(caches.open('fintrack-api-cache').then(async (cache)=>{
        try {
            const networkResponse = await fetch(event.request.clone());
            if (networkResponse.ok) cache.put(event.request, networkResponse.clone());
            return networkResponse;
        } catch (error) {
            return cache.match(event.request).then((cached)=>{
                if (cached) {
                    console.log("[SW] Modo offline: usando cach\xe9 para", url.pathname);
                    return cached;
                }
                return new Response(JSON.stringify({
                    error: "Sin conexi\xf3n y sin datos cacheados"
                }), {
                    status: 503,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            });
        }
    }));
});

//# sourceMappingURL=service-worker.js.map
