// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';

const db = getFirestore(app);
const messaging = getMessaging(app);

// Determina la URL de tu API según el entorno
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// Tu clave pública VAPID (Firebase Console → Cloud Messaging → Web push certificates)
const VAPID_PUBLIC_KEY = 'BHf0cuTWZG91RETsBmmlc1xw3fzn-OWyonshT819ISjKsnOnttYbX8gm6dln7mAiGf5SyxjP52IcUMTAp0J4Vao';

// Helper: convierte Base64 URL-safe en Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

// ── Suscripción Push y guardado en backend ─────────────────────────────────
async function subscribeUserToPush() {
  console.group('[settings.js] ► subscribeUserToPush START');
  try {
    if (!('serviceWorker' in navigator)) throw new Error('Sin soporte para Service Worker');
    if (!('PushManager' in window))   throw new Error('Sin soporte para PushManager');

    // 1) Espera a que el SW esté listo
    const registration = await navigator.serviceWorker.ready;
    console.log('[settings.js] ServiceWorkerRegistration:', registration);

    // 2) (Opcional) Consulta el estado del permiso de Push
    try {
      const state = await registration.pushManager.permissionState({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      console.log('[settings.js] push permissionState:', state);
    } catch (e) {
      console.warn('[settings.js] No se pudo obtener permissionState:', e);
    }

    // 3) ¿Ya había una suscripción?
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      console.log('[settings.js] Ya suscrito:', existingSub.endpoint);
      console.groupEnd();
      return existingSub;
    }

    // 4) Suscribirse
    console.log('[settings.js] Intentando subscribe() con VAPID key…');
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    console.log('[settings.js] subscribe() OK, sub:', sub);

    // 5) Obtener también el token de FCM (para la consola de Firebase)
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    console.log('[settings.js] FCM token:', fcmToken);

    // 6) Enviar todo al backend
    const userId = auth.currentUser.uid;
    console.log('[settings.js] Enviando suscripción al backend para userId:', userId);
    await fetch(`${apiUrl}/save_push_subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        subscription: sub,
        fcmToken
      })
    });
    console.log('[settings.js] Suscripción guardada en servidor');

    console.groupEnd();
    return sub;

  } catch (err) {
    console.error('[settings.js] ► subscribeUserToPush ERROR:', err);
    console.groupEnd();
    throw err;
  }
}

// ── Desuscribir y notificar al backend ────────────────────────────────────
async function unsubscribeUserFromPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  if (!existing) return;

  console.log('[settings.js] Unsubscribing…');
  await existing.unsubscribe();
  console.log('[settings.js] Desuscrito de Push');

  const userId = auth.currentUser.uid;
  console.log('[settings.js] Notificando al backend para eliminar suscripción:', userId);
  await fetch(`${apiUrl}/delete_push_subscription`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      endpoint: existing.endpoint
    })
  });
  console.log('[settings.js] Suscripción eliminada en servidor');
}

// ── Creación dinámica de filas de presupuesto ─────────────────────────────
function createBudgetRow(selectedCategory = '', amount = '') {
  const rowDiv = document.createElement('div');
  rowDiv.className = 'budget-row';

  const select = document.createElement('select');
  select.className = 'category-select';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Selecciona categoría —';
  placeholder.disabled = true;
  placeholder.selected = !selectedCategory;
  select.append(placeholder);

  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedCategory) opt.selected = true;
    select.append(opt);
  });

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'budget-input';
  input.placeholder = '0,00';
  input.min = '0';
  input.step = '0.01';
  if (amount !== '' && !isNaN(amount)) {
    input.value = parseFloat(amount).toFixed(2);
  }

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = 'Eliminar';
  removeBtn.addEventListener('click', () => rowDiv.remove());

  rowDiv.append(select, input, removeBtn);
  return rowDiv;
}

let allCategories = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('[settings.js] DOMContentLoaded');

  const backBtn          = document.getElementById('back-btn');
  const chkNotifPush     = document.getElementById('notif-push');
  const chkNotifEmail    = document.getElementById('notif-email');
  const chkReportPush    = document.getElementById('report-push');
  const chkReportEmail   = document.getElementById('report-email');
  const btnSave          = document.getElementById('save-settings-btn');
  const budgetsContainer = document.getElementById('budgets-container');
  const addCategoryBtn   = document.getElementById('add-category-btn');

  backBtn.addEventListener('click', () => window.history.back());
  addCategoryBtn.addEventListener('click', () => {
    budgetsContainer.appendChild(createBudgetRow());
  });

  // ── Toggle notificaciones Push ───────────────────────────────────────────
  chkNotifPush.addEventListener('change', async () => {
    console.log('[settings.js] notif-push changed:', chkNotifPush.checked);
    if (chkNotifPush.checked) {
      // Pide permiso al usuario
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        console.log('[settings.js] Notification.permission:', perm);
        if (perm !== 'granted') {
          alert('Debes permitir notificaciones para activar Push.');
          chkNotifPush.checked = false;
          return;
        }
      }
      // Suscribe y guarda
      try {
        await subscribeUserToPush();
      } catch {
        chkNotifPush.checked = false;
      }
    } else {
      // Desuscribe y borra
      try {
        await unsubscribeUserFromPush();
      } catch {
        chkNotifPush.checked = true;
      }
    }
  });

  // ── Carga inicial de categorías y ajustes desde Firestore ────────────────
  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged:', user);
    if (!user) return window.location.href = '../index.html';
    const uid = user.uid;
    const userRef = doc(db, 'users', uid);

    // 1) Cargar todas las categorías disponibles
    try {
      const snap = await getDocs(collection(db, 'groups'));
      allCategories = snap.docs.map(d => d.id);
    } catch (e) {
      console.error('[settings.js] Error loading groups:', e);
      allCategories = [];
    }

    // 2) Recuperar ajustes guardados
    let loaded = {};
    try {
      const snap = await getDoc(userRef);
      loaded = snap.exists() ? snap.data().settings || {} : {};
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
    }

    // 3) Inicializar UI con esos ajustes
    chkNotifPush.checked   = Boolean(loaded.notifications?.push);
    chkNotifEmail.checked  = Boolean(loaded.notifications?.email);
    chkReportPush.checked  = Boolean(loaded.reports?.push);
    chkReportEmail.checked = Boolean(loaded.reports?.email);

    budgetsContainer.innerHTML = '';
    const map = loaded.budgets || {};
    Object.entries(map).forEach(([cat, amt]) => {
      if (!allCategories.includes(cat)) allCategories.push(cat);
      budgetsContainer.appendChild(createBudgetRow(cat, amt));
    });
    if (!Object.keys(map).length) {
      budgetsContainer.appendChild(createBudgetRow());
    }
  });

  // ── Guardar ajustes en Firestore y forzar sincronización ────────────────
  btnSave.addEventListener('click', async () => {
    console.log('[settings.js] Guardar Ajustes click');
    btnSave.disabled = true;
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Guardando…';

    // Construye el objeto de settings
    const settings = {
      notifications: {
        push:  document.getElementById('notif-push').checked,
        email: document.getElementById('notif-email').checked
      },
      reports: {
        push:  document.getElementById('report-push').checked,
        email: document.getElementById('report-email').checked
      },
      budgets: {}
    };

    // Valida cada fila de presupuesto
    const rows = Array.from(budgetsContainer.children);
    const seen = new Set();
    let valid = true, errorMsg = '';
    rows.forEach((row, i) => {
      const cat = row.querySelector('.category-select').value;
      const amt = parseFloat(row.querySelector('.budget-input').value);
      if (!cat) return;
      if (isNaN(amt) || amt < 0) {
        valid = false;
        errorMsg = `Fila ${i+1}: monto inválido para "${cat}".`;
        return;
      }
      if (seen.has(cat)) {
        valid = false;
        errorMsg = `Categoría "${cat}" repetida.`;
        return;
      }
      seen.add(cat);
      settings.budgets[cat] = amt;
    });

    if (!valid) {
      alert(errorMsg);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    // Guarda en Firestore y lanza sync
    try {
      const user = auth.currentUser;
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { settings });
      console.log('[settings.js] Settings updated in Firestore');

      await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      console.log('[settings.js] Sync endpoint called');

      btnSave.textContent = '¡Guardado y sincronizado!';
    } catch (e) {
      console.error('[settings.js] Error saving or syncing:', e);
      btnSave.textContent = 'Error, reintenta';
    } finally {
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 1500);
    }
  });
});
