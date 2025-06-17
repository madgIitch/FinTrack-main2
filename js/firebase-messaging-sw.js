// firebase-messaging-sw.js

// Carga los scripts de compatibilidad
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Inicializa Firebase — sustituye estos valores por los reales de tu proyecto
firebase.initializeApp({
  apiKey: 'AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0',
  authDomain: 'fintrack-1bced.firebaseapp.com',
  projectId: 'fintrack-1bced',
  messagingSenderId: '539360502832',
  appId: '1:576236535723:web:4276524c0c6a10a3391cee',
});

// Inicializa messaging
const messaging = firebase.messaging();

// Maneja mensajes cuando la app está en background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en background:', payload);
  const notificationTitle = payload.notification?.title || 'Notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/favicon.ico',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


