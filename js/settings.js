// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(app);
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[settings.js] DOMContentLoaded');

  // Botón “atrás”
  const backBtn = document.getElementById('back-btn');
  console.log('[settings.js] backBtn element:', backBtn);
  backBtn.addEventListener('click', () => {
    console.log('[settings.js] backBtn clicked');
    window.history.back();
  });

  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged user:', user);
    if (!user) {
      console.log('[settings.js] No user, redirecting to index');
      window.location.href = '../index.html';
      return;
    }

    const uid     = user.uid;
    const userRef = doc(db, 'users', uid);
    console.log('[settings.js] Authenticated uid:', uid);

    // ── Seed inicial de categorías Plaid en Firestore ────────────────────
    try {
      console.log('[settings.js] Checking if categories exist in Firestore');
      const catCol = collection(db, 'categories');
      const q      = query(catCol, limit(1));
      const snap   = await getDocs(q);
      console.log('[settings.js] category snapshot empty?:', snap.empty);
      if (snap.empty) {
        console.log('[settings.js] No categories found, fetching from Plaid API');
        const res = await fetch(`${apiUrl}/categories/get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('[settings.js] /categories/get status:', res.status);
        const data = await res.json();
        console.log('[settings.js] Plaid categories received:', data.categories?.length);
        const batch = writeBatch(db);
        data.categories.forEach(cat => {
          console.log('[settings.js] Queuing category for write:', cat.category_id);
          const catRef = doc(db, 'categories', cat.category_id);
          batch.set(catRef, cat);
        });
        console.log('[settings.js] Committing batch write for categories');
        await batch.commit();
        console.log('[settings.js] Categories successfully seeded to Firestore');
      } else {
        console.log('[settings.js] Categories already exist, skipping seed');
      }
    } catch (e) {
      console.error('[settings.js] Error seeding categories:', e);
    }

    // ── Referencias UI ────────────────────────────────────────────────
    console.log('[settings.js] Querying UI elements');
    const chkNotifPush   = document.getElementById('notif-push');
    const chkNotifEmail  = document.getElementById('notif-email');
    const chkReportPush  = document.getElementById('report-push');
    const chkReportEmail = document.getElementById('report-email');
    const btnSave        = document.getElementById('save-settings-btn');
    console.log('[settings.js] UI elements:', {
      chkNotifPush, chkNotifEmail, chkReportPush, chkReportEmail, btnSave
    });

    // ── Cargar ajustes existentes ─────────────────────────────────────
    let loadedSettings = {};
    try {
      console.log('[settings.js] Fetching user settings from Firestore');
      const snap = await getDoc(userRef);
      console.log('[settings.js] userDoc exists?:', snap.exists());
      if (snap.exists()) {
        loadedSettings = snap.data().settings || {};
        console.log('[settings.js] loadedSettings:', loadedSettings);
      }
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
    }

    const notifications = loadedSettings.notifications || {};
    const reports       = loadedSettings.reports       || {};

    // ── Rellenar UI con valores ───────────────────────────────────────
    console.log('[settings.js] Populating checkboxes');
    chkNotifPush.checked   = Boolean(notifications.push);
    chkNotifEmail.checked  = Boolean(notifications.email);
    chkReportPush.checked  = Boolean(reports.push);
    chkReportEmail.checked = Boolean(reports.email);
    console.log('[settings.js] Checkbox states:', {
      notifPush: chkNotifPush.checked,
      notifEmail: chkNotifEmail.checked,
      reportPush: chkReportPush.checked,
      reportEmail: chkReportEmail.checked
    });

    // ── Guardar ajustes al pulsar botón ──────────────────────────────
    btnSave.addEventListener('click', async () => {
      console.log('[settings.js] save-settings-btn clicked');
      btnSave.disabled    = true;
      const originalText  = btnSave.textContent;
      btnSave.textContent = 'Guardando…';

      const newSettings = {
        notifications: {
          push:  chkNotifPush.checked,
          email: chkNotifEmail.checked
        },
        reports: {
          push:  chkReportPush.checked,
          email: chkReportEmail.checked
        }
      };
      console.log('[settings.js] New settings to save:', newSettings);

      try {
        await updateDoc(userRef, { settings: newSettings });
        console.log('[settings.js] Settings successfully updated in Firestore');
        btnSave.textContent = '¡Guardado!';
        setTimeout(() => {
          btnSave.disabled    = false;
          btnSave.textContent = originalText;
        }, 1500);
      } catch (e) {
        console.error('[settings.js] Error updating settings:', e);
        btnSave.textContent = 'Error, reintenta';
        setTimeout(() => {
          btnSave.disabled    = false;
          btnSave.textContent = originalText;
        }, 2000);
      }
    });
  });
});
