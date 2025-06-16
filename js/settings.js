// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getMessaging,
  getToken,
  deleteToken
} from 'firebase/messaging';

const db = getFirestore(app);
const messaging = getMessaging(app);

// Tu clave pública VAPID (Firebase Console → Cloud Messaging → Web push certificates)
const VAPID_PUBLIC_KEY = 'BHf0cuTWZG91RETsBmmlc1xw3fzn-OWyonshT819ISjKsnOnttYbX8gm6dln7mAiGf5SyxjP52IcUMTAp0J4Vao';

// ── Suscripción Push con FCM ────────────────────────────────────────────────
async function subscribeUserToPush() {
  console.group('[settings.js] ► subscribeUserToPush START');
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    const userId = user.uid;

    // Solicitar token FCM
    const currentToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    console.log('[settings.js] FCM token obtenido:', currentToken);

    if (currentToken) {
      // Guardar token en Firestore
      await db
        .collection('users')
        .doc(userId)
        .collection('fcmTokens')
        .doc(currentToken)
        .set({
          createdAt: serverTimestamp(),
          userAgent: navigator.userAgent
        });
      console.log('[settings.js] Token FCM guardado en Firestore');
    } else {
      console.warn('[settings.js] No se pudo obtener token de registro FCM.');
    }
  } catch (err) {
    console.error('[settings.js] subscribeUserToPush ERROR:', err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

async function unsubscribeUserFromPush() {
  console.group('[settings.js] ► unsubscribeUserFromPush START');
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    const userId = user.uid;

    // Obtener el token actual
    const currentToken = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    if (currentToken) {
      // Eliminar token en el cliente
      const deleted = await deleteToken(messaging);
      console.log('[settings.js] Token FCM eliminado en cliente:', deleted);

      // Eliminar token de Firestore
      await db
        .collection('users')
        .doc(userId)
        .collection('fcmTokens')
        .doc(currentToken)
        .delete();
      console.log('[settings.js] Token FCM eliminado de Firestore');
    } else {
      console.warn('[settings.js] No hay token FCM para eliminar.');
    }
  } catch (err) {
    console.error('[settings.js] unsubscribeUserFromPush ERROR:', err);
    throw err;
  } finally {
    console.groupEnd();
  }
}

// ── Crea una fila de presupuesto dinámicamente ──────────────────────────────
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

  // Referencias UI
  const backBtn          = document.getElementById('back-btn');
  const chkNotifPush     = document.getElementById('notif-push');
  const chkNotifEmail    = document.getElementById('notif-email');
  const chkReportPush    = document.getElementById('report-push');
  const chkReportEmail   = document.getElementById('report-email');
  const btnSave          = document.getElementById('save-settings-btn');
  const budgetsContainer = document.getElementById('budgets-container');
  const addCategoryBtn   = document.getElementById('add-category-btn');

  // Navegación atrás
  backBtn.addEventListener('click', () => window.history.back());

  // Añadir nueva fila de presupuesto
  addCategoryBtn.addEventListener('click', () => {
    budgetsContainer.appendChild(createBudgetRow());
  });

  // Cambiar suscripción Push al togglear checkbox
  chkNotifPush.addEventListener('change', async () => {
    console.log('[settings.js] notif-push changed:', chkNotifPush.checked);
    if (chkNotifPush.checked) {
      if (Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        console.log('[settings.js] Notification.permission after request:', perm);
        if (perm !== 'granted') {
          alert('Debes permitir notificaciones para activar Push.');
          chkNotifPush.checked = false;
          return;
        }
      }
      try {
        await subscribeUserToPush();
      } catch (err) {
        console.error('[settings.js] subscribeUserToPush error:', err);
        chkNotifPush.checked = false;
      }
    } else {
      try {
        await unsubscribeUserFromPush();
      } catch (err) {
        console.error('[settings.js] unsubscribeUserFromPush error:', err);
        chkNotifPush.checked = true;
      }
    }
  });

  // Cuando cambia el estado de auth
  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged:', user);
    if (!user) return window.location.href = '../index.html';
    const uid = user.uid;
    const userRef = doc(db, 'users', uid);

    // 1) Cargar categorías disponibles
    try {
      const snap = await getDocs(collection(db, 'groups'));
      allCategories = snap.docs.map(d => d.id);
      console.log('[settings.js] allCategories:', allCategories);
    } catch (e) {
      console.error('[settings.js] Error loading groups:', e);
      allCategories = [];
    }

    // 2) Cargar ajustes guardados
    let loaded = {};
    try {
      const snap = await getDoc(userRef);
      loaded = snap.exists() ? snap.data().settings || {} : {};
      console.log('[settings.js] loaded settings:', loaded);
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
    }

    // Inicializar checkboxes según lo cargado
    chkNotifPush.checked   = Boolean(loaded.notifications?.push);
    chkNotifEmail.checked  = Boolean(loaded.notifications?.email);
    chkReportPush.checked  = Boolean(loaded.reports?.push);
    chkReportEmail.checked = Boolean(loaded.reports?.email);

    // Poblamos filas de presupuesto
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

  // Guardar ajustes al hacer click
  btnSave.addEventListener('click', async () => {
    console.log('[settings.js] Guardar Ajustes click');
    btnSave.disabled = true;
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Guardando…';

    // Construir objeto settings
    const settings = {
      notifications: {
        push:  chkNotifPush.checked,
        email: chkNotifEmail.checked
      },
      reports: {
        push:  chkReportPush.checked,
        email: chkReportEmail.checked
      },
      budgets: {}
    };

    // Validar filas de presupuesto
    const rows = Array.from(budgetsContainer.children);
    const seen = new Set();
    let valid = true, errorMsg = '';

    rows.forEach((row, idx) => {
      const cat = row.querySelector('.category-select').value;
      const amtStr = row.querySelector('.budget-input').value.trim();
      if (!cat) return;
      const amtNum = parseFloat(amtStr);
      if (isNaN(amtNum) || amtNum < 0) {
        valid = false;
        errorMsg = `Fila ${idx+1}: monto inválido para "${cat}".`;
        return;
      }
      if (seen.has(cat)) {
        valid = false;
        errorMsg = `Categoría "${cat}" repetida.`;
        return;
      }
      seen.add(cat);
      settings.budgets[cat] = amtNum;
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

    // Guardar en Firestore y forzar Sync
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { settings });
      console.log('[settings.js] Settings updated in Firestore');

      // Forzar manual sync
      console.log('[settings.js] Calling sync endpoint');
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
