import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getMessaging, getToken } from 'firebase/messaging';

console.log('[HOME] loaded');

// ── Firestore & Messaging ─────────────────────────────────────────────────
const db = getFirestore(app);
const messaging = getMessaging(app);

// API URL (ajústalo según tu entorno)
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

let monthlyChart = null;

// ── Petición de permiso de notificaciones (requiere gesto de usuario) ─────
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[HOME] Este navegador no soporta notificaciones');
    return;
  }
  try {
    const perm = await Notification.requestPermission();
    console.log('[HOME] Notification.permission:', perm);
    if (perm === 'granted') {
      const token = await getToken(messaging, { vapidKey: '<VAPID_PUBLIC_KEY>' });
      console.log('[HOME] FCM token obtenido:', token);
      await fetch(`${apiUrl}/save_fcm_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: auth.currentUser.uid })
      });
    }
  } catch (e) {
    console.error('[HOME] Error al solicitar permiso:', e);
  }
}

// ── Registrar Service Worker y periodicSync ────────────────────────────────
async function setupBackgroundSync() {
  if (!('serviceWorker' in navigator)) {
    console.log('[HOME] Service Worker no soportado');
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register(
      new URL('../service-worker.js', import.meta.url),
      { scope: '/' }
    );
    console.log('[HOME] SW registered, scope:', registration.scope);

    // One-off sync
    if ('sync' in registration) {
      try {
        await registration.sync.register('sync-transactions');
        console.log('[HOME] One-off sync registered');
      } catch (e) {
        console.warn('[HOME] One-off sync failed:', e);
      }
    }

    // Periodic sync cada 15 minutos (si está permitido)
    if ('periodicSync' in registration) {
      try {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        console.log('[HOME] periodic-background-sync permiso:', status.state);
        if (status.state === 'granted') {
          await registration.periodicSync.register('sync-transactions', {
            minInterval: 15 * 60 * 1000
          });
          console.log('[HOME] periodicSync registered');
        }
      } catch (e) {
        console.warn('[HOME] periodicSync failed:', e);
      }
    }
  } catch (err) {
    console.error('[HOME] SW registration failed:', err);
  }
}

window.addEventListener('load', setupBackgroundSync);

document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOM ready');

  // Si permiso notificaciones es default, preguntar al entrar
  if (Notification.permission === 'default') {
    const ask = confirm('¿Deseas activar notificaciones para esta página?');
    if (ask) {
      requestNotificationPermission();
    }
  }

  // Sidebar controls
  const sidebar  = document.getElementById('sidebar');
  const btnOpen  = document.getElementById('open-sidebar');
  const btnClose = document.getElementById('close-sidebar');
  btnOpen?.addEventListener('click',  () => sidebar?.classList.add('open'));
  btnClose?.addEventListener('click', () => sidebar?.classList.remove('open'));

  // Logout
  document.getElementById('logout-link')?.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await signOut(auth);
      location.href = '../index.html';
    } catch (e) {
      console.error('[HOME] signOut failed:', e);
    }
  });

  // Auth state listener
  onAuthStateChanged(auth, async user => {
    console.log('[HOME] Auth state changed:', user);
    if (!user) {
      location.href = '../index.html';
      return;
    }

    // Mostrar nombre de usuario
    try {
      const userDoc = doc(db, 'users', user.uid);
      const snap = await getDoc(userDoc);
      const data = snap.exists() ? snap.data() : {};
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
      document.getElementById('user-name').textContent = name;
    } catch (e) {
      console.error('[HOME] load profile failed:', e);
    }

    // Lógica de la app
    await manualSync(user.uid);
    await loadBalances(user.uid);
    await saveUID(user.uid);
    await loadMonthlyChart(user.uid);
  });
});

// ── Manual Sync (throttle 24h) ─────────────────────────────────────────────
async function manualSync(uid) {
  const key = `lastSync_${uid}`;
  const last = Number(localStorage.getItem(key));
  const now  = Date.now();
  if (last && now - last < 24 * 60 * 60 * 1000) {
    console.log('[HOME] Manual sync skipped (recent)');
    return;
  }
  console.log('[HOME] Performing manual sync');
  try {
    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (res.ok) {
      localStorage.setItem(key, now.toString());
      console.log('[HOME] Manual sync OK');
    } else {
      console.warn('[HOME] Manual sync failed, status:', res.status);
    }
  } catch (e) {
    console.error('[HOME] Manual sync error:', e);
  }
}

// ── Carga de balances en slider ────────────────────────────────────────────
async function loadBalances(userId) {
  console.log('[HOME] Loading balances for', userId);
  const userDoc = doc(db, 'users', userId);
  const snap = await getDoc(userDoc);
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  for (const { accessToken } of accounts) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) continue;
      const { accounts: accs = [] } = await res.json();
      const acc = accs[0] || {};
      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <p class="card-title">${acc.name || 'Cuenta'}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${(acc.balances?.current || 0).toFixed(2)} €</p>
        </div>`;
      slider.appendChild(slide);
    } catch (e) {
      console.error('[HOME] Balance fetch error:', e);
    }
  }
  initSlider();
}

function initSlider() {
  const slider = document.querySelector('.balance-slider');
  if (!slider) return;
  const slides = Array.from(slider.children);
  let idx = 0;
  const dots = document.getElementById('balance-dots');
  const prev = document.getElementById('balance-prev');
  const next = document.getElementById('balance-next');
  dots.innerHTML = '';

  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = `slider-dot${i === 0 ? ' active' : ''}`;
    d.onclick = () => { idx = i; update(); };
    dots.appendChild(d);
  });
  prev.onclick = () => { idx = (idx - 1 + slides.length) % slides.length; update(); };
  next.onclick = () => { idx = (idx + 1) % slides.length; update(); };

  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.childNodes.forEach((dot, i) =>
      dot.classList.toggle('active', i === idx)
    );
  }
  update();
}

// ── Guardar UID en IndexedDB ──────────────────────────────────────────────
async function saveUID(uid) {
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('metadata');
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(uid, 'userId');
    tx.oncomplete = () => db.close();
  };
}

// ── Monthly Chart (historySummary) ────────────────────────────────────────
async function loadMonthlyChart(userId) {
  console.log('[HOME] Loading chart for', userId);
  const col = collection(db, 'users', userId, 'historySummary');
  let snap;
  try {
    snap = await getDocsFromServer(col);
    console.log('[HOME] Chart data from server');
  } catch {
    snap = await getDocs(col);
    console.log('[HOME] Chart data from cache');
  }

  const docs = snap.docs.sort((a, b) => a.id.localeCompare(b.id));
  const categories = docs.map(d => d.id);
  const expenses   = docs.map(d => d.data().totalExpenses || 0);
  const incomes    = docs.map(d => d.data().totalIncomes  || 0);

  const options = {
    chart: { type: 'bar', toolbar: { show: false } },
    series: [
      { name: 'Gastos',   data: expenses },
      { name: 'Ingresos', data: incomes  }
    ],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    dataLabels: {
      enabled: true,
      offsetY: -10,
      style: { fontSize: '12px' },
      formatter: v => new Intl.NumberFormat('es-ES', {
        style: 'currency', currency: 'EUR'
      }).format(v)
    },
    xaxis: { categories },
    yaxis: {
      labels: {
        formatter: v => new Intl.NumberFormat('es-ES', {
          style: 'currency', currency: 'EUR'
        }).format(v)
      }
    },
    tooltip: {
      y: {
        formatter: v => new Intl.NumberFormat('es-ES', {
          style: 'currency', currency: 'EUR'
        }).format(v)
      }
    },
    legend: { position: 'bottom' },
    grid: { borderColor: '#eee' }
  };

  const el = document.querySelector('#monthlyChart');
  if (!el) return;
  el.innerHTML = '';
  if (monthlyChart) {
    try { monthlyChart.destroy(); } catch {};
  }
  monthlyChart = new ApexCharts(el, options);
  monthlyChart.render();
}
