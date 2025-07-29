// ───── Archivo: js/notifications.js ─────

import { auth, app } from './firebase.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

import {
  getStorage,
  ref,
  listAll,
  getDownloadURL
} from 'firebase/storage';

const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
  const notifList = document.querySelector('.notifications-list');
  const tabButtons = document.querySelectorAll('.tab-button');
  const backBtn = document.getElementById('back-button');

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/pages/home.html';
    });
  }

  let allNotifications = [];

  auth.onAuthStateChanged(async user => {
    if (!user) {
      console.warn('[NOTIFICATIONS] Usuario no autenticado');
      return;
    }

    try {
      // ───── Obtener notificaciones desde Firestore ─────
      const notifRef = collection(db, `users/${user.uid}/notifications`);
      const q = query(notifRef, orderBy('data.timestamp', 'desc'));
      const snapshot = await getDocs(q);
      allNotifications = snapshot.docs.map(doc => doc.data());

      // ───── Añadir informes históricos desde Storage si no están en Firestore ─────
      const reportsFolderRef = ref(storage, `users/${user.uid}/reports`);
      const reportList = await listAll(reportsFolderRef);

      const existingPeriods = new Set(
        allNotifications
          .filter(n => n.type === 'report' && n.data?.period)
          .map(n => n.data.period)
      );

      for (const itemRef of reportList.items) {
        const match = itemRef.name.match(/^(\d{4}-\d{2})\.pdf$/);
        if (!match) continue;

        const period = match[1];
        if (existingPeriods.has(period)) continue;

        const url = await getDownloadURL(itemRef);

        allNotifications.push({
          title: '📎 Informe financiero disponible',
          body: `Informe correspondiente a ${period}.`,
          type: 'report',
          data: {
            period,
            url,
            timestamp: { toDate: () => new Date() } // Marca actual como fecha
          }
        });
      }

      renderNotifications('all');
    } catch (err) {
      console.error('[NOTIFICATIONS] Error cargando notificaciones:', err);
      notifList.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: #777;">Error cargando notificaciones.</p>';
    }
  });

  // ───── Manejo de pestañas ─────
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.tab-button.active')?.classList.remove('active');
      btn.classList.add('active');
      renderNotifications(btn.dataset.type);
    });
  });

  // ───── Renderizado de notificaciones por tipo ─────
  function renderNotifications(typeFilter) {
    notifList.innerHTML = '';

    const filtered = allNotifications.filter(n => typeFilter === 'all' || n.type === typeFilter);

    if (filtered.length === 0) {
      notifList.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: #777;">No hay elementos en esta categoría.</p>';
      return;
    }

    filtered.forEach(n => {
      const li = document.createElement('li');
      li.className = `notification-card ${n.type}`;

      const icon = n.type === 'alert' ? 'warning' : 'insert_drive_file';
      const time = n.data?.timestamp?.toDate?.().toLocaleString?.('es-ES') || '';

      li.innerHTML = `
        <span class="material-icons notification-icon">${icon}</span>
        <div class="notification-content">
          <h2 class="notification-title">${n.title}</h2>
          <p class="notification-body">${n.body}</p>
          <time class="notification-time" style="font-size: 0.85rem; color: #888; margin-top: 6px; display: block;">
            ${time}
          </time>
        </div>
      `;

      if (n.type === 'report' && n.data?.url) {
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => window.open(n.data.url, '_blank'));
      }

      notifList.appendChild(li);
    });
  }
});
