// public/firebase-messaging-sw.js
console.log('[firebase-messaging-sw.js] loaded');
try {
    importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');
    firebase.initializeApp({
        apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
        authDomain: "fintrack-1bced.firebaseapp.com",
        projectId: "fintrack-1bced",
        messagingSenderId: "576236535723",
        appId: "1:576236535723:web:4276524c0c6a10a3391cee"
    });
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload)=>{
        console.log('[firebase-messaging-sw.js] BG message:', payload);
        const { title = 'FinTrack', body = '', icon = '/icon.png' } = payload.notification || {};
        self.registration.showNotification(title, {
            body,
            icon
        });
    });
} catch (e) {
    console.error('[firebase-messaging-sw.js] error loading libs:', e);
}

//# sourceMappingURL=firebase-messaging-sw.js.map
