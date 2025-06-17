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

const db = getFirestore(app);
const messaging = getMessaging(app);

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

let monthlyChart = null;

function updateNotificationIconStyle() {
  const btn = document.getElementById('btn-notifications');
  if (!btn) return;
  const state = Notification.permission;
  btn.classList.remove('notifs-granted', 'notifs-denied', 'notifs-default');
  btn.classList.add(`notifs-${state}`);
}

async function requestNotificationPermission() {
  if (!('Notification' in window)) return;

  let fmSW;
  try {
    fmSW = await navigator.serviceWorker.register(
      new URL('./firebase-messaging-sw.js', import.meta.url),
      { scope: '/js/' }
    );
    console.log('[HOME] FCM SW registrado con scope:', fmSW.scope);
  } catch (e) {
    console.error('[HOME] Error registrando FCM SW:', e);
    return;
  }

  const perm = await Notification.requestPermission();
  updateNotificationIconStyle();
  if (perm !== 'granted') return;

  try {
    const token = await getToken(messaging, {
      vapidKey: 'BHf0cuTWZG91RETsBmmlc1xw3fzn-OWyonshT819ISjKsnOnttYbX8gm6dln7mAiGf5SyxjP52IcUMTAp0J4Vao',
      serviceWorkerRegistration: fmSW
    });
    console.log('[HOME] FCM token obtenido:', token);
    await fetch(`${apiUrl}/plaid/save_fcm_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, userId: auth.currentUser.uid })
    });
  } catch (e) {
    console.warn('[HOME] No se pudo guardar el token:', e);
  }
}

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

    await navigator.serviceWorker.ready;
    console.log('[HOME] SW registered and ready, scope:', registration.scope);

    if ('sync' in registration) {
      try {
        await registration.sync.register('sync-transactions');
        console.log('[HOME] One-off sync registered');
      } catch (e) {
        if (e.name === 'NotAllowedError') {
          console.warn('[HOME] SyncManager deshabilitado por permisos del navegador');
        } else {
          console.warn('[HOME] One-off sync failed:', e);
        }
      }
    }

    if ('periodicSync' in registration) {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      if (status.state === 'granted') {
        try {
          await registration.periodicSync.register('sync-transactions', {
            minInterval: 15 * 60 * 1000
          });
          console.log('[HOME] periodicSync registered');
        } catch (e) {
          console.warn('[HOME] periodicSync failed:', e);
        }
      } else {
        console.log('[HOME] periodic-background-sync permiso:', status.state);
      }
    }
  } catch (err) {
    console.error('[HOME] SW registration failed:', err);
  }
}

window.addEventListener('load', async () => {
  await setupBackgroundSync();
  updateNotificationIconStyle();
});

document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOM ready');

  document.getElementById('open-sidebar')?.addEventListener('click', () =>
    document.getElementById('sidebar')?.classList.add('open')
  );
  document.getElementById('close-sidebar')?.addEventListener('click', () =>
    document.getElementById('sidebar')?.classList.remove('open')
  );

  document.getElementById('logout-link')?.addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    location.href = '../index.html';
  });

  document.getElementById('btn-notifications')?.addEventListener('click', async e => {
    e.preventDefault();
    await requestNotificationPermission();
  });
});

onAuthStateChanged(auth, async user => {
  console.log('[HOME] Auth state changed:', user);
  if (!user) {
    location.href = '../index.html';
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.exists() ? snap.data() : {};
    const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
    document.getElementById('user-name').textContent = name;
  } catch (e) {
    console.error('[HOME] load profile failed:', e);
  }

  await manualSync(user.uid);
  await loadBalances(user.uid);
  await saveUID(user.uid);
  await loadMonthlyChart(user.uid);
});


async function manualSync(uid) {
  const key = `lastSync_${uid}`;
  const last = Number(localStorage.getItem(key));
  const now = Date.now();
  if (last && now - last < 86400e3) {
    console.log('[HOME] Manual sync skipped (recent)');
    return;
  }
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

async function loadBalances(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
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
      const card = document.createElement('div');
      card.className = 'balance-slide';
      card.innerHTML = `
        <div class="card">
          <p class="card-title">${acc.name || 'Cuenta'}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${(acc.balances?.current || 0).toFixed(2)} €</p>
        </div>`;
      slider.appendChild(card);
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
  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot${i === 0 ? ' active' : ''}`;
    dot.onclick = () => { idx = i; update(); };
    dots.appendChild(dot);
  });
  document.getElementById('balance-prev').onclick = () => { idx = (idx + slides.length - 1) % slides.length; update(); };
  document.getElementById('balance-next').onclick = () => { idx = (idx + 1) % slides.length; update(); };
  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.childNodes.forEach((d,i) => d.classList.toggle('active', i===idx));
  }
  update();
}

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

async function loadMonthlyChart(userId) {
  let snap;
  try {
    snap = await getDocsFromServer(collection(db, 'users', userId, 'historySummary'));
  } catch {
    snap = await getDocs(collection(db, 'users', userId, 'historySummary'));
  }
  const docs = snap.docs.sort((a,b) => a.id.localeCompare(b.id));
  const categories = docs.map(d=>d.id);
  const expenses   = docs.map(d=>d.data().totalExpenses || 0);
  const incomes    = docs.map(d=>d.data().totalIncomes  || 0);
  const options = {
    chart: { type:'bar', toolbar:{ show:false } },
    series: [
      { name:'Gastos',   data: expenses },
      { name:'Ingresos', data: incomes  }
    ],
    plotOptions: { bar:{ borderRadius:4, columnWidth:'40%' } },
    dataLabels:{ enabled:true, offsetY:-10, style:{ fontSize:'12px' },
      formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)
    },
    xaxis:{ categories },
    yaxis:{ labels:{ formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v) } },
    tooltip:{ y:{ formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v) } },
    legend:{ position:'bottom' },
    grid:{ borderColor:'#eee' }
  };
  const el = document.querySelector('#monthlyChart');
  if (!el) return;
  el.innerHTML = '';
  if (monthlyChart) try{ monthlyChart.destroy(); }catch{}
  monthlyChart = new ApexCharts(el, options);
  monthlyChart.render();
}
