// ───── Archivo: firebase-messaging-sw.js ─────
// Este Service Worker se encarga de recibir notificaciones push en segundo plano
// usando Firebase Cloud Messaging (FCM). Es fundamental para que funcionen las alertas
// aunque el usuario tenga la app cerrada o minimizada.

// ───── Importo los scripts necesarios de Firebase (versión compat) ─────
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// ───── Inicializo Firebase dentro del SW ─────
// Solo se necesita config mínima con apiKey, projectId y messagingSenderId
firebase.initializeApp({
  apiKey: 'AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0',
  authDomain: 'fintrack-1bced.firebaseapp.com',
  projectId: 'fintrack-1bced',
  messagingSenderId: '576236535723',
  appId: '1:576236535723:web:4276524c0c6a10a3391cee',
});

// ───── Obtengo una instancia de Firebase Messaging ─────
const messaging = firebase.messaging();

// ───── Manejador de mensajes recibidos en background ─────
// Esto se ejecuta cuando llega una notificación push y la app está cerrada o en segundo plano.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);

  // Extraigo título y cuerpo desde payload (con fallback por si faltan)
  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
    data: payload.data || {} // Permite incluir metadatos para usar en onClick
  };

  // Muestra la notificación al usuario
  self.registration.showNotification(notificationTitle, notificationOptions);
});
