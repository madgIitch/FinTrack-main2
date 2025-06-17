// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');
// Inicializa tu app de Firebase igual que en tu firebase.js
firebase.initializeApp({
    apiKey: 'TU_API_KEY',
    authDomain: 'TU_DOMAIN',
    projectId: 'TU_PROJECT_ID',
    messagingSenderId: 'TU_SENDER_ID',
    appId: 'TU_APP_ID'
});
const messaging = firebase.messaging();
// Opcional: manejar mensajes en background
messaging.onBackgroundMessage((payload)=>{
    self.registration.showNotification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon
    });
});

//# sourceMappingURL=firebase-messaging.js.map
