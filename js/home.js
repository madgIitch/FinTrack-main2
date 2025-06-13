// js/home.js

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

console.log('[HOME] loaded');

// ── Firestore instance ────────────────────────────────────────────────────
const db = getFirestore(app);

// API URL
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── Service Worker + Periodic Sync ────────────────────────────────────────
async function registerPeriodicSync() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported');
    return;
  }
  try {
    const reg = await navigator.serviceWorker.register(
      new URL('../service-worker.js', import.meta.url),
      { scope: '/' }
    );
    console.log('[SW] Registered, scope:', reg.scope);

    if (!('periodicSync' in reg)) {
      console.log('[SYNC] periodicSync not supported');
      return;
    }

    // Optional: check permission
    try {
      const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
      console.log('[SYNC] permission state:', status.state);
      if (status.state === 'denied') return;
    } catch (e) {
      console.warn('[SYNC] could not query permission:', e);
    }

    await reg.periodicSync.register('sync-transactions', {
      minInterval: 24 * 60 * 60 * 1000
    });
    console.log('[SYNC] periodicSync registered');

  } catch (err) {
    console.warn('[SW] registration or sync failed:', err);
  }
}
window.addEventListener('load', registerPeriodicSync);

// ── DOM & Auth Setup ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOM ready');

  const sidebar      = document.getElementById('sidebar');
  const openSidebar  = document.getElementById('open-sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutBtn    = document.getElementById('logout-link');
  const userNameSpan = document.getElementById('user-name');

  openSidebar.addEventListener('click', () => sidebar.classList.add('open'));
  closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));

  logoutBtn.addEventListener('click', async e => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.location.href = '../index.html';
    } catch (e) {
      console.error('[AUTH] signOut failed:', e);
    }
  });

  onAuthStateChanged(auth, async user => {
    console.log('[AUTH] state changed:', user);
    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    // Load user name
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
      userNameSpan.textContent = name;
    } catch (e) {
      console.error('[AUTH] load profile failed:', e);
    }

    await doManualSync(user.uid);
    await loadBalances(user.uid);
    await saveUIDToIndexedDB(user.uid);
    await loadMonthlyChart(user.uid);
  });
});

// ── Manual Sync (24h throttle) ─────────────────────────────────────────────
async function doManualSync(uid) {
  const key  = `lastSync_${uid}`;
  const last = Number(localStorage.getItem(key));
  const now  = Date.now();
  if (last && now - last < 24*60*60*1000) {
    console.log('[SYNC] skipped (recent)');
    return;
  }
  console.log('[SYNC] performing manual sync');
  try {
    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (res.ok) {
      localStorage.setItem(key, now.toString());
      console.log('[SYNC] manual sync OK');
    } else {
      console.warn('[SYNC] manual sync status', res.status);
    }
  } catch (e) {
    console.error('[SYNC] manual sync error:', e);
  }
}

// ── Balances Slider ────────────────────────────────────────────────────────
async function loadBalances(userId) {
  console.log('[BALANCE] loading for', userId);
  const snap = await getDoc(doc(db, 'users', userId));
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  for (const { accessToken } of accounts) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) continue;
      const { accounts: accs = [] } = await res.json();
      const acc  = accs[0] || {};
      const name = acc.name || 'Cuenta';
      const bal  = acc.balances?.current ?? 0;
      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <p class="card-title">${name}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${bal.toFixed(2)} €</p>
        </div>`;
      slider.appendChild(slide);
    } catch (e) {
      console.error('[BALANCE] fetch error:', e);
    }
  }
  initBalanceSlider();
}

function initBalanceSlider() {
  const slider = document.querySelector('.balance-slider');
  if (!slider) return;
  const slides = Array.from(slider.children);
  const prev   = document.getElementById('balance-prev');
  const next   = document.getElementById('balance-next');
  const dots   = document.getElementById('balance-dots');
  let idx = 0, total = slides.length;
  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i===0 ? ' active' : '');
    d.onclick = () => { idx = i; update(); };
    dots.appendChild(d);
  });
  prev.onclick = () => { idx = (idx - 1 + total) % total; update(); };
  next.onclick = () => { idx = (idx + 1) % total; update(); };
  function update() {
    slider.style.transform = `translateX(-${idx*100}%)`;
    dots.childNodes.forEach((d,i) => d.classList.toggle('active', i===idx));
  }
  update();
}

// ── Save UID to IndexedDB ────────────────────────────────────────────────
async function saveUIDToIndexedDB(uid) {
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('metadata');
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = () => db.close();
  };
}

// ── Monthly Chart (usa historySummary) ────────────────────────────────────
let monthlyChartInstance = null;

async function loadMonthlyChart(userId) {
  console.log('[CHART] loading summary for', userId);
  const col = collection(db, 'users', userId, 'historySummary');
  let snap;
  try {
    snap = await getDocsFromServer(col);
    console.log('[CHART] summary from server');
  } catch {
    snap = await getDocs(col);
    console.log('[CHART] summary from cache');
  }

  // Ordenar periodos
  const docs = snap.docs.sort((a, b) => a.id.localeCompare(b.id));
  const months = docs.map(d => d.id);
  const expenses = docs.map(d => d.data().totalExpenses || 0);
  const incomes  = docs.map(d => d.data().totalIncomes  || 0);

  const options = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    series: [
      { name: 'Gastos',   data: expenses },
      { name: 'Ingresos', data: incomes  }
    ],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    dataLabels: {
      enabled: true,
      offsetY: -10,
      style: { fontSize: '12px' },
      formatter: v => new Intl.NumberFormat('es-ES',{ style:'currency', currency:'EUR' }).format(v)
    },
    xaxis: { categories: months },
    yaxis: {
      labels: {
        formatter: v => new Intl.NumberFormat('es-ES',{ style:'currency', currency:'EUR' }).format(v)
      }
    },
    tooltip: {
      y: { formatter: v => new Intl.NumberFormat('es-ES',{ style:'currency', currency:'EUR' }).format(v) }
    },
    legend: { position: 'bottom' },
    grid: { borderColor: '#eee' }
  };

  const chartEl = document.querySelector('#monthlyChart');
  if (!chartEl) return;
  chartEl.innerHTML = '';
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new ApexCharts(chartEl, options);
  monthlyChartInstance.render();
}
