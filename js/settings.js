// public/js/settings.js

import { auth, app } from './firebase.js';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const backBtn        = document.getElementById('back-btn');
  const chkNotifPush   = document.getElementById('notif-push');
  const chkNotifEmail  = document.getElementById('notif-email');
  const chkReportPush  = document.getElementById('report-push');
  const chkReportEmail = document.getElementById('report-email');
  const btnSave        = document.getElementById('save-settings-btn');

  // “Atrás” vuelve en el historial
  backBtn.addEventListener('click', () => {
    window.history.back();
  });

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    const uid     = user.uid;
    const userRef = doc(db, 'users', uid);

    // 1) Cargar ajustes desde Firestore
    let loadedSettings = {};
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        // si no hay subclave 'settings', usamos objeto vacío
        loadedSettings = snap.data().settings || {};
      }
    } catch (e) {
      console.error('Error cargando ajustes:', e);
    }

    // Desestructuramos con valores por defecto
    const notifications = loadedSettings.notifications || {};
    const reports       = loadedSettings.reports       || {};

    // 2) Rellenar los checkboxes
    chkNotifPush.checked   = Boolean(notifications.push);
    chkNotifEmail.checked  = Boolean(notifications.email);
    chkReportPush.checked  = Boolean(reports.push);
    chkReportEmail.checked = Boolean(reports.email);

    // 3) Guardar ajustes
    btnSave.addEventListener('click', async () => {
      btnSave.disabled    = true;
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

      try {
        await updateDoc(userRef, { settings: newSettings });
        btnSave.textContent = '¡Guardado!';
        setTimeout(() => {
          btnSave.disabled    = false;
          btnSave.textContent = 'Guardar Ajustes';
        }, 1500);
      } catch (e) {
        console.error('Error guardando ajustes:', e);
        btnSave.textContent = 'Error, reintenta';
        setTimeout(() => {
          btnSave.disabled    = false;
          btnSave.textContent = 'Guardar Ajustes';
        }, 2000);
      }
    });
  });
});
