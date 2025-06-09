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

console.log('[HOME] home.js loaded');

// ── URL de tu API (ajústala según entorno) ─────────────────────────────────
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── Registrar y programar periodicSync ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[SW] Registered with scope:', reg.scope);

      if ('periodicSync' in reg) {
        try {
          await reg.periodicSync.register('sync-transactions', {
            minInterval: 24 * 60 * 60 * 1000  // 24 h en ms
          });
          console.log('[SYNC] periodicSync registered');
        } catch (err) {
          console.warn('[SYNC] Could not register periodicSync:', err);
        }
      }
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOMContentLoaded');
  const userNameSpan = document.getElementById('user-name');
  const sidebar      = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutLink   = document.getElementById('logout-link');

  function updateWelcome(name) {
    console.log('[HOME] updateWelcome →', name);
    userNameSpan.textContent = name;
  }

  onAuthStateChanged(auth, async (user) => {
    console.log('[HOME] onAuthStateChanged → user:', user);
    if (!user) {
      console.log('[HOME] No user logged in, redirecting to index.html');
      window.location.href = '../index.html';
      return;
    }

    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    try {
      const snap = await getDoc(uRef);
      const data = snap.exists() ? snap.data() : {};
      console.log('[HOME] Firestore user data:', data);

      const name = [data.firstName, data.lastName]
        .filter(Boolean)
        .join(' ') || 'Usuario';
      updateWelcome(name);

      // ── Sincronización manual al inicio ────────────────────────────────
      console.log('[HOME] Starting manual sync');
      await doManualSync(user.uid);

      // ── Carga de saldos ────────────────────────────────────────────────
      console.log('[HOME] Loading balances');
      await loadBalances(user.uid);

      // ── Guardar UID en IndexedDB para Periodic Sync ───────────────────
      console.log('[HOME] Saving UID to IndexedDB');
      await saveUIDToIndexedDB(user.uid);

      // ── Cargar gráfica mensual ────────────────────────────────────────
      console.log('[HOME] Loading monthly chart');
      await loadMonthlyChart(user.uid);

    } catch (e) {
      console.error('[HOME] Error loading user from Firestore:', e);
      updateWelcome('Usuario');
    }
  });

  closeSidebar.addEventListener('click', () => {
    console.log('[HOME] closeSidebar clicked');
    sidebar.classList.remove('open');
  });

  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('[HOME] logoutLink clicked, signing out');
    try {
      await signOut(auth);
      console.log('[HOME] User signed out');
      window.location.href = '../index.html';
    } catch (err) {
      console.error('[HOME] Error signing out:', err);
    }
  });
});

// ── Función para cargar saldos (sin cambios) ─────────────────────────────
async function loadBalances(userId) {
  console.log('[DEBUG] loadBalances → userId:', userId);
  const db   = getFirestore(app);
  const uRef = doc(db, 'users', userId);
  let accounts = [];

  try {
    const snap = await getDoc(uRef);
    accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
    console.log('[DEBUG] Firestore accounts list:', accounts);
  } catch (err) {
    console.error('[DEBUG] Error fetching Firestore user document for balances:', err);
  }

  const slider = document.querySelector('.balance-slider');
  if (!slider) {
    console.warn('[DEBUG] loadBalances → .balance-slider not found in DOM');
    return;
  }

  slider.innerHTML = '';
  for (const [i, { accessToken }] of accounts.entries()) {
    console.log(`[DEBUG] Processing account #${i}, accessToken:`, accessToken);
    try {
      const res  = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const data = await res.json();
      console.log(`[DEBUG] get_account_details response for account #${i}:`, data);

      const { accounts: accs = [], institution } = data;
      const acc   = accs[0] || {};
      const name  = acc.name || 'Cuenta';
      const bal   = acc.balances?.current ?? 0;

      let logoSrc = '/img/default_bank.png';
      if (institution?.logo) {
        logoSrc = `data:image/png;base64,${institution.logo}`;
      } else if (institution?.url) {
        logoSrc = `${institution.url.replace(/\/$/, '')}/favicon.ico`;
      }

      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      const card = document.createElement('div');
      card.className = 'card';

      card.innerHTML = `
        <img src="${logoSrc}" class="card-logo" alt="Logo">
        <p class="card-title">${name}</p>
        <p class="card-subtitle">Saldo actual</p>
        <p class="card-balance">${bal.toFixed(2)} €</p>
      `;
      slide.appendChild(card);
      slider.appendChild(slide);

      console.log(`[DEBUG] Added slide for account #${i} (${name}) with balance ${bal}`);
    } catch (err) {
      console.error(`[ERROR] get_account_details for account #${i}:`, err);
    }
  }
  initBalanceSlider();
}

// ── Inicializa el slider de saldos ────────────────────────────────────────
function initBalanceSlider() {
  console.log('[SLIDER] initBalanceSlider start');
  const slider = document.querySelector('.balance-slider');
  const slides = Array.from(slider.children);
  const prev   = document.getElementById('balance-prev');
  const next   = document.getElementById('balance-next');
  const dots   = document.getElementById('balance-dots');
  if (!slider || !prev || !next || !dots) {
    console.warn('[SLIDER] Missing DOM elements for slider');
    return;
  }
  let idx = 0;
  const total = slides.length;
  console.log('[SLIDER] total slides:', total);
  if (total < 2) return;

  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { idx = i; update(); });
    dots.appendChild(d);
  });

  prev.addEventListener('click', () => { idx = (idx - 1 + total) % total; update(); });
  next.addEventListener('click', () => { idx = (idx + 1) % total; update(); });

  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    dots.childNodes.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    console.log('[SLIDER] update → current index:', idx);
  }
  update();
}

// ── Sincronización manual de transacciones a Firestore ─────────────────────
async function doManualSync(uid) {
  console.log('[SYNC] doManualSync start for', uid);
  const lastKey = `lastSync_${uid}`;
  const last    = localStorage.getItem(lastKey);
  const now     = Date.now();
  console.log('[SYNC] last:', last, 'now:', now);

  if (!last || now - parseInt(last) > 86400000) {
    console.log('[SYNC] Performing manual sync');
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      });
      const result = await res.json();
      console.log('[SYNC] sync_transactions_and_store response:', result);
      if (res.ok && result.success) {
        localStorage.setItem(lastKey, now.toString());
        console.log('[SYNC] sync successful');
      }
    } catch (err) {
      console.error('[SYNC] Error in manual sync:', err);
    }
  } else {
    console.log('[SYNC] Already synced within 24h');
  }
}

// ── Guarda UID en IndexedDB ────────────────────────────────────────────────
async function saveUIDToIndexedDB(uid) {
  console.log('[DB] saveUIDToIndexedDB → uid:', uid);
  if (!('indexedDB' in window)) {
    console.warn('[DB] IndexedDB not supported');
    return;
  }
  const openReq = indexedDB.open('fintrack-db', 1);
  openReq.onupgradeneeded = () => {
    console.log('[DB] onupgradeneeded, creating store "metadata"');
    openReq.result.createObjectStore('metadata');
  };
  openReq.onsuccess = () => {
    const db = openReq.result;
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(uid, 'userId');
    tx.oncomplete = () => { console.log('[DB] UID stored'); db.close(); };
  };
  openReq.onerror = () => console.error('[DB] IndexedDB error:', openReq.error);
}

// ── Cargar y dibujar gráfica mensual con escala logarítmica ──────────────
async function loadMonthlyChart(userId) {
  console.log('[CHART] loadMonthlyChart → userId:', userId);
  const db = getFirestore(app);

  const historyCol = collection(db, 'users', userId, 'history');
  console.log('[CHART] Querying:', historyCol.path);

  let monthsSnap;
  try {
    monthsSnap = await getDocsFromServer(historyCol);
  } catch {
    monthsSnap = await getDocs(historyCol);
  }

  console.log('[CHART] monthsSnap empty?', monthsSnap.empty);
  console.log('[CHART] monthsSnap docs:', monthsSnap.docs.map(d => d.id));

  const months = monthsSnap.docs.map(d => d.id).sort();
  console.log('[CHART] months sorted:', months);

  const expenses = [], incomes = [];

  for (const month of months) {
    console.log('[CHART] processing month:', month);
    const itemsCol = collection(db, 'users', userId, 'history', month, 'items');

    let itemsSnap;
    try {
      itemsSnap = await getDocsFromServer(itemsCol);
    } catch {
      itemsSnap = await getDocs(itemsCol);
    }

    console.log(`[CHART] ${month} items count:`, itemsSnap.size);
    let e = 0, i = 0;
    itemsSnap.forEach(docSnap => {
      const tx = docSnap.data();
      const amt = tx.amount ?? 0;
      if (amt < 0) e += Math.abs(amt);
      else         i += amt;
    });

    console.log(`[CHART] ${month} → expenses: ${e}, incomes: ${i}`);
    expenses.push(e);
    incomes.push(i);
  }

  // Dibujar gráfica logarítmica
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Gastos',   data: expenses, backgroundColor: '#FF6384' },
        { label: 'Ingresos', data: incomes,  backgroundColor: '#36A2EB'   }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'logarithmic',
          beginAtZero: false,
          title: { display: true, text: '€ (escala log)' },
          ticks: {
            callback: v => {
              // Sólo mostrar potencias de 10
              const remain = v / (10 ** Math.floor(Math.log10(v)));
              return remain === 1 ? `${v} €` : '';
            }
          }
        }
      },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €`
          }
        }
      }
    }
  });

  console.log('[CHART] Logarithmic chart rendered');
}
