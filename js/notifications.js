// js/notifications.js

import { auth, app } from './firebase.js';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';

const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.currentUser;
  if (!user) return;

  const notifList = document.querySelector('.notifications-list');
  const notifRef = collection(db, `users/${user.uid}/notifications`);
  const snapshot = await getDocs(notifRef);

  notifList.innerHTML = ''; // limpia contenido hardcoded

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
      </div>
    `;

    notifList.appendChild(li);
  });
});
