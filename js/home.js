import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('[HOME] loaded');

const db = getFirestore(app);

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

let monthlyChart = null;

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
});

function updateNotificationIconStyle() {
  const btn = document.getElementById('btn-notifications');
  if (!btn) return;
  const state = Notification.permission;
  btn.classList.remove('notifs-granted', 'notifs-denied', 'notifs-default');
  btn.classList.add(`notifs-${state}`);
}

async function setupBackgroundSync() {
  if (!('serviceWorker' in navigator)) {
    console.log('[HOME] Service Worker no soportado');
    return;
  }

  try {
    const cacheSWReg = await navigator.serviceWorker.register(
      new URL('/sw-static-cache.js', import.meta.url)
    );
    console.log('[HOME] SW de caché registrado:', cacheSWReg.scope);
  } catch (err) {
    console.warn('[HOME] Error al registrar SW de caché:', err);
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
      try {
        const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
        if (status.state === 'granted') {
          await registration.periodicSync.register('sync-transactions', {
            minInterval: 15 * 60 * 1000
          });
          console.log('[HOME] periodicSync registered');
        } else {
          console.log('[HOME] periodic-background-sync permiso:', status.state);
        }
      } catch (e) {
        console.warn('[HOME] periodicSync failed:', e);
      }
    }

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'TRIGGER_SYNC' });
      console.log('[HOME] Sincronización forzada enviada al SW');
    } else {
      console.warn('[HOME] No hay controlador activo para el SW, no se pudo lanzar TRIGGER_SYNC');
    }

  } catch (err) {
    console.error('[HOME] SW registration failed:', err);
  }
}

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
  await loadDailyChart(user.uid);
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
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  if (!navigator.onLine) {
    console.warn('[HOME] Modo offline: usando IndexedDB para cuentas');
    const balanceData = await readFromIndexedDB('currentBalance');
    if (balanceData?.accounts) {
      for (const acc of balanceData.accounts) {
        appendBalanceCard(slider, acc);
      }
      initSlider();
    } else {
      console.warn('[HOME] No hay cuentas en IndexedDB');
    }
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'users', userId));
    const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];

    const fetchedAccounts = [];

    for (const { accessToken } of accounts) {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      if (!res.ok) throw new Error('API balance failed');
      const { accounts: accs = [] } = await res.json();
      const acc = accs[0] || {};
      appendBalanceCard(slider, acc);
      fetchedAccounts.push(acc);
    }

    if (fetchedAccounts.length > 0) {
      await writeToIndexedDB('currentBalance', { accounts: fetchedAccounts });
      initSlider();
    }

  } catch (e) {
    console.warn('[HOME] Balance fetch error (intentando fallback):', e);
    try {
      const balanceData = await readFromIndexedDB('currentBalance');
      if (balanceData?.accounts) {
        for (const acc of balanceData.accounts) {
          appendBalanceCard(slider, acc);
        }
        initSlider();
      }
    } catch (err) {
      console.error('[HOME] Error leyendo balance de IndexedDB:', err);
    }
  }
}

function appendBalanceCard(slider, acc) {
  const card = document.createElement('div');
  card.className = 'balance-slide';
  card.innerHTML = `
    <div class="card">
      <p class="card-title">${acc.name || 'Cuenta'}</p>
      <p class="card-subtitle">Saldo actual</p>
      <p class="card-balance">${(acc.balances?.current || 0).toFixed(2)} €</p>
    </div>`;
  slider.appendChild(card);
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
    dots.childNodes.forEach((d, i) => d.classList.toggle('active', i === idx));
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

async function loadDailyChart(userId) {
  const currentMonth = new Date().toISOString().slice(0, 7);

  if (!navigator.onLine) {
    console.warn('[HOME] Modo offline: usando IndexedDB para resumen diario');
    const fallback = await readFromIndexedDB(`dailySummary-${currentMonth}`);
    if (fallback) {
      const { dias = [], gastos = [], ingresos = [] } = fallback;
      renderDailyChart(dias, gastos, ingresos);
    } else {
      console.warn('[HOME] No se encontró resumen diario en IndexedDB');
    }
    return;
  }

  try {
    const res = await fetch(`${apiUrl}/plaid/get_daily_summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!res.ok) throw new Error('Error en respuesta HTTP');

    const { dias, gastos, ingresos } = await res.json();
    await writeToIndexedDB(`dailySummary-${currentMonth}`, { dias, gastos, ingresos });
    renderDailyChart(dias, gastos, ingresos);

  } catch (e) {
    console.warn('[HOME] Daily chart error (intentando fallback):', e);
    try {
      const fallback = await readFromIndexedDB(`dailySummary-${currentMonth}`);
      if (fallback) {
        const { dias = [], gastos = [], ingresos = [] } = fallback;
        renderDailyChart(dias, gastos, ingresos);
      } else {
        console.warn('[HOME] No se encontró resumen diario en IndexedDB');
      }
    } catch (err) {
      console.error('[HOME] Error leyendo dailySummary de IndexedDB:', err);
    }
  }
}

function renderDailyChart(dias, gastos, ingresos) {
  const options = {
    chart: { type: 'bar', toolbar: { show: false }, height: 300 },
    series: [
      { name: 'Gastos', data: gastos },
      { name: 'Ingresos', data: ingresos }
    ],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
    dataLabels: {
      enabled: true,
      offsetY: -6,
      style: {
        fontSize: '12px',
        fontWeight: 'bold',
        colors: ['#000']
      },
      background: { enabled: false },
      formatter: v => new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(v)
    },
    xaxis: { categories: dias, labels: { rotate: -45 } },
    yaxis: { labels: { formatter: v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v) } },
    tooltip: { y: { formatter: v => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(v) } },
    legend: { position: 'bottom' },
    grid: { borderColor: '#eee' }
  };

  const el = document.querySelector('#monthlyChart');
  if (!el) return;
  el.innerHTML = '';
  if (monthlyChart) try { monthlyChart.destroy(); } catch { }
  monthlyChart = new ApexCharts(el, options);
  monthlyChart.render();
}

async function readFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fintrack-db', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const getReq = store.get(key);

      getReq.onsuccess = () => {
        resolve(getReq.result || null);
        db.close();
      };
      getReq.onerror = () => {
        reject(getReq.error);
        db.close();
      };
    };

    request.onerror = e => {
      reject(request.error);
    };
  });
}

async function writeToIndexedDB(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fintrack-db', 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      store.put(value, key);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        reject(tx.error);
        db.close();
      };
    };

    request.onerror = e => {
      reject(request.error);
    };
  });
}
