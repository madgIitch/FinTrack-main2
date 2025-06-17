// js/notifications.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';

const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  const notifList = document.querySelector('.notifications-list');
  notifList.innerHTML = '';

  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/pages/home.html';
    });
  }

  auth.onAuthStateChanged(async user => {
    if (!user) {
      console.warn('[NOTIFICATIONS] Usuario no autenticado');
      return;
    }

    const notifRef = collection(db, `users/${user.uid}/notifications`);
    const q = query(notifRef, orderBy('data.timestamp', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      notifList.innerHTML = '<p style="text-align:center; margin-top: 2rem; color: #777;">No tienes notificaciones por ahora.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const n = doc.data();
      const li = document.createElement('li');
      li.className = `notification-card ${n.type}`;

      li.innerHTML = `
        <span class="material-icons notification-icon">
          ${n.type === 'alert' ? 'warning' : 'insert_drive_file'}
        </span>
        <div class="notification-content">
          <h2 class="notification-title">${n.title}</h2>
          <p class="notification-body">${n.body}</p>
          <time class="notification-time" style="font-size: 0.85rem; color: #888; margin-top: 6px; display: block;">
            ${n.data?.timestamp?.toDate?.().toLocaleString?.('es-ES') || ''}
          </time>
        </div>
      `;

      notifList.appendChild(li);
    });
  });
});