import { getToken } from 'firebase/messaging';
import { messaging, auth, apiUrl } from './firebase.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return;

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;

  try {
    const token = await getToken(messaging, {
      vapidKey: 'BHf0cuTWZG91RETsBmmlc1xw3fzn-OWyonshT819ISjKsnOnttYbX8gm6dln7mAiGf5SyxjP52IcUMTAp0J4Vao',
      serviceWorkerRegistration: await navigator.serviceWorker.ready
    });
    console.log('[NOTIFS] Token obtenido:', token);
    await fetch(`${apiUrl}/plaid/save_fcm_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: auth.currentUser.uid })
    });
  } catch (e) {
    console.warn('[NOTIFS] Error guardando token:', e);
  }
}
