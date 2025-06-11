// js/home.js

import { auth, app } from './firebase.js';
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('[HOME] loaded');

// API URL
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// Registrar service worker & periodicSync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[SW] scope:', reg.scope);
      if ('periodicSync' in reg) {
        try {
          await reg.periodicSync.register('sync-transactions', {
            minInterval: 86400000
          });
          console.log('[SYNC] periodicSync registered');
        } catch {}
      }
    } catch (e) {
      console.error('[SW] failed:', e);
    }
  });
}

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const sidebar      = document.getElementById('sidebar');
  const openSidebar  = document.getElementById('open-sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutBtn    = document.getElementById('logout-link');
  const userNameSpan = document.getElementById('user-name');

  // Lógica del sidebar
  openSidebar.addEventListener('click', () => sidebar.classList.add('open'));
  closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  function updateWelcome(name) {
    userNameSpan.textContent = name;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '../index.html';
      return;
    }
    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    // Cargar nombre
    const snap = await getDoc(uRef);
    const data = snap.exists() ? snap.data() : {};
    updateWelcome([data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario');

    await doManualSync(user.uid);
    await loadBalances(user.uid);
    await saveUIDToIndexedDB(user.uid);
    await loadMonthlyChart(user.uid);
  });
});

// Slider de cargar balances
async function loadBalances(userId) {
  const db = getFirestore(app);
  const uRef = doc(db, 'users', userId);
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  const snap = await getDoc(uRef);
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];

  for (const { accessToken } of accounts) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ accessToken })
      });
      const { accounts: accs = [], institution } = await res.json();
      const acc = accs[0] || {};
      const name = acc.name || 'Cuenta';
      const bal  = acc.balances?.current ?? 0;
      let logo = '/img/default_bank.png';
      if (institution?.logo) logo = `data:image/png;base64,${institution.logo}`;
      else if (institution?.url) logo = `${institution.url.replace(/\/$/, '')}/favicon.ico`;

      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <img src="${logo}" class="card-logo" alt="Logo">
          <p class="card-title">${name}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${bal.toFixed(2)} €</p>
        </div>`;
      slider.appendChild(slide);

    } catch (e) {
      console.error('[BALANCE] error:', e);
    }
  }
  initBalanceSlider();
}

// Slider init
function initBalanceSlider() {
  const slider = document.querySelector('.balance-slider');
  const slides = Array.from(slider.children);
  const prev   = document.getElementById('balance-prev');
  const next   = document.getElementById('balance-next');
  const dots   = document.getElementById('balance-dots');
  if (!slider) return;

  let idx = 0;
  const total = slides.length;
  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => (idx = i, update());
    dots.appendChild(d);
  });
  prev.onclick = () => { idx = (idx - 1 + total) % total; update(); };
  next.onclick = () => { idx = (idx + 1) % total; update(); };

  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.childNodes.forEach((d,i)=>d.classList.toggle('active', i===idx));
  }
  update();
}

// Manual sync
async function doManualSync(uid) {
  const key = `lastSync_${uid}`;
  const last = parseInt(localStorage.getItem(key)||'0',10);
  const now  = Date.now();
  if (!last || now - last > 86400000) {
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ userId: uid })
      });
      if (res.ok) localStorage.setItem(key, now.toString());
    } catch {}
  }
}

// Save UID
async function saveUIDToIndexedDB(uid) {
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db',1);
  req.onupgradeneeded = () => req.result.createObjectStore('metadata');
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = ()=>db.close();
  };
}

//Cargar y renderizar el gráfico
async function loadMonthlyChart(userId) {
  console.log('[CHART] loadMonthlyChart →', userId);
  const db  = getFirestore(app);
  const col = collection(db, 'users', userId, 'history');

  // 1) Obtén los meses
  let snap;
  try { snap = await getDocsFromServer(col); }
  catch { snap = await getDocs(col); }
  const allMonths = snap.docs.map(d => d.id).sort();

  // 2) Filtra últimos 12 meses
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 11);
  const months = allMonths.filter(m => {
    const [y, M] = m.split('-').map(Number);
    return new Date(y, M - 1, 1) >= cutoff;
  });

  // 3) Calcula gastos e ingresos
  const expenses = [], incomes = [];
  for (const m of months) {
    const itemsCol = collection(db, 'users', userId, 'history', m, 'items');
    let itemsSnap;
    try { itemsSnap = await getDocsFromServer(itemsCol); }
    catch { itemsSnap = await getDocs(itemsCol); }

    let e = 0, i = 0;
    itemsSnap.forEach(doc => {
      const amt = doc.data().amount || 0;
      amt < 0 ? e += Math.abs(amt) : i += amt;
    });
    expenses.push(e);
    incomes.push(i);
  }

  // 4) Opciones ApexCharts minimalistas
  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false }
    },
    series: [
      { name: 'Gastos',   data: expenses },
      { name: 'Ingresos', data: incomes }
    ],
    colors: ['#e74c3c', '#3498db'],  // rojo suave y azul petróleo
    dataLabels: {
      enabled: true,
      formatter: v => v.toFixed(2),
      style: { colors: ['#333'] }
    },
    xaxis: {
      categories: months,
      labels: { style: { colors: '#555' } }
    },
    yaxis: {
      logarithmic: true,
      title: { text: '€ (escala log)', style: { color: '#555' } },
      labels: {
        formatter: v => `${v.toFixed(2)} €`,
        style: { colors: '#555' }
      }
    },
    plotOptions: {
      bar: { borderRadius: 4, horizontal: false, columnWidth: '40%' }
    },
    tooltip: {
      y: {
        formatter: v => `${v.toFixed(2)} €`
      }
    },
    legend: {
      position: 'bottom',
      labels: { colors: '#666' }
    },
    grid: {
      borderColor: '#eee'
    }
  };

  // 5) Renderiza el gráfico
  const chartEl = document.querySelector('#monthlyChart');
  chartEl.innerHTML = ''; 
  const chart = new ApexCharts(chartEl, options);
  chart.render();
}
