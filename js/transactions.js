// ─────────────────────────────────────────────────────────────────────────────
// transactions.js – Lógica completa con soporte offline/online + logging
// ─────────────────────────────────────────────────────────────────────────────

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDoc, onSnapshot } from 'firebase/firestore';
import { openDB } from 'idb';

console.log('[Init] transactions.js loaded');

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

const DB_NAME = 'transactions-db';
const DB_VERSION = 1;
const STORE_TXS = 'txs';
const PAGE_SIZE = 20;

let currentPage = 1;
let allTxsGlobal = [];

// ─────────────────────────────────────────────────────────────────────────────
// IndexedDB
// ─────────────────────────────────────────────────────────────────────────────

async function openTxDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TXS)) {
        db.createObjectStore(STORE_TXS, { keyPath: 'transaction_id' });
      }
    }
  });
}

async function cacheTransactions(txs) {
  const db = await openTxDB();
  const tx = db.transaction(STORE_TXS, 'readwrite');
  for (const t of txs) {
    if (t.transaction_id) tx.store.put(t);
  }
  await tx.done;
  console.log('[CACHE] Transacciones guardadas en IndexedDB:', txs.length);
}

async function getCachedTransactions() {
  const db = await openTxDB();
  const txs = await db.getAll(STORE_TXS);
  console.log('[CACHE] Transacciones obtenidas de IndexedDB:', txs.length);
  return txs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Renderizado
// ─────────────────────────────────────────────────────────────────────────────

function renderTxItem(tx) {
  const div = document.createElement('div');
  div.className = 'transaction-item';
  div.innerHTML = `
    <span class="account-label">${tx.accountName}</span>
    <div class="desc">${tx.description}</div>
    <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
    <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
      ${tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)} €
    </span>
  `;
  return div;
}

function renderChronoPage(txs) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => list.appendChild(renderTxItem(tx)));
}

function renderGroupedPage(txs) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  const groups = txs.reduce((acc, tx) => {
    const cat = tx.category || 'Sin categoría';
    (acc[cat] = acc[cat] || []).push(tx);
    return acc;
  }, {});
  Object.entries(groups).forEach(([cat, items]) => {
    const sec = document.createElement('div');
    sec.className = 'category-group';
    sec.innerHTML = `<h3>${cat}</h3>`;
    items.forEach(tx => sec.appendChild(renderTxItem(tx)));
    list.appendChild(sec);
  });
}

function getFilteredTxs() {
  const val = document.getElementById('month-filter')?.value;
  return val ? allTxsGlobal.filter(tx => tx.date.startsWith(val)) : allTxsGlobal;
}

function updatePagination() {
  const total = getFilteredTxs().length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  document.getElementById('prev-page').disabled = currentPage <= 1;
  document.getElementById('next-page').disabled = currentPage >= pages;
  document.getElementById('page-info').textContent = `Página ${currentPage} de ${pages}`;
}

function showPage() {
  console.log('[UI] Mostrando página actual:', currentPage);
  const arr = getFilteredTxs();
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = arr.slice(start, start + PAGE_SIZE);
  document.getElementById('toggle-view').checked
    ? renderGroupedPage(slice)
    : renderChronoPage(slice);
  updatePagination();
}

// ─────────────────────────────────────────────────────────────────────────────
// UI y eventos
// ─────────────────────────────────────────────────────────────────────────────

function setupEventListeners() {
  console.log('[UI] Inicializando eventos UI');
  const mf = document.getElementById('month-filter');
  const mi = document.querySelector('.month-icon');
  if (mi) mi.onclick = () => (mf.showPicker ? mf.showPicker() : mf.focus());
  mf.onchange = () => { currentPage = 1; showPage(); };
  document.getElementById('prev-page').onclick = () => {
    if (currentPage > 1) { currentPage--; showPage(); }
  };
  document.getElementById('next-page').onclick = () => {
    const pages = Math.ceil(getFilteredTxs().length / PAGE_SIZE);
    if (currentPage < pages) { currentPage++; showPage(); }
  };
  document.getElementById('toggle-view').onchange = () => { currentPage = 1; showPage(); };
}

// ─────────────────────────────────────────────────────────────────────────────
// Firestore y Plaid
// ─────────────────────────────────────────────────────────────────────────────

function subscribeHistoryItems(userId, callback) {
  console.log('[FIRESTORE] Subscribiéndose a history del usuario');
  const historyRef = collection(db, 'users', userId, 'history');
  const summaryRef = collection(db, 'users', userId, 'historySummary');
  let itemUnsubs = [];
  const seedMap = new Map();
  let monthsSet = new Set();

  function resubscribeItems() {
    itemUnsubs.forEach(unsub => unsub());
    itemUnsubs = [];
    seedMap.clear();
    const months = Array.from(monthsSet);
    months.forEach(monthId => {
      const itemsRef = collection(db, 'users', userId, 'history', monthId, 'items');
      const unsub = onSnapshot(itemsRef, snap => {
        snap.docChanges().forEach(change => {
          const docSnap = change.doc;
          const id = docSnap.data().transaction_id || docSnap.id;
          if (change.type === 'removed') seedMap.delete(id);
          else seedMap.set(id, { ...docSnap.data(), transaction_id: id });
        });
        callback(Array.from(seedMap.values()));
      });
      itemUnsubs.push(unsub);
    });
  }

  onSnapshot(historyRef, snap => {
    snap.docs.forEach(d => monthsSet.add(d.id));
    resubscribeItems();
  });
  onSnapshot(summaryRef, snap => {
    snap.docs.forEach(d => monthsSet.add(d.id));
    resubscribeItems();
  });
}

async function fetchTransactionsFromPlaid(userId) {
  console.log('[FETCH] Obteniendo transacciones desde Plaid');
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Error obteniendo transacciones');
  const data = await res.json();
  return data.transactions.map(tx => ({
    ...tx,
    transaction_id: tx.transaction_id || tx.id
  }));
}

async function buildAccountMap(userId) {
  console.log('[FIRESTORE] Construyendo mapa de cuentas');
  const userSnap = await getDoc(doc(db, 'users', userId));
  const accounts = userSnap.exists() ? userSnap.data().plaid?.accounts || [] : [];
  const map = {};
  for (const { accessToken } of accounts) {
    const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken })
    });
    if (!res.ok) continue;
    const data = await res.json();
    data.accounts.forEach(a => { map[a.account_id] = a.name || 'Cuenta'; });
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Carga principal
// ─────────────────────────────────────────────────────────────────────────────

async function loadTransactions(userId) {
  console.log('[TX] → Iniciando loadTransactions con userId:', userId);

  if (!navigator.onLine) {
    console.warn('[TX] Modo offline detectado');
    allTxsGlobal = await getCachedTransactions();
    if (!window.hasInitializedUI) {
      setupEventListeners();
      window.hasInitializedUI = true;
    }
    showPage();
    return;
  }

  try {
    await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch (e) {
    console.warn('[SYNC] error en sync_transactions_and_store', e);
  }

  let plaidTxs = [];
  try {
    plaidTxs = await fetchTransactionsFromPlaid(userId);
  } catch (e) {
    console.warn('[FETCH] Error obteniendo transacciones Plaid', e);
  }

  let accountMap = {};
  try {
    accountMap = await buildAccountMap(userId);
  } catch (e) {
    console.warn('[MAP] Error construyendo mapa de cuentas', e);
  }

  try {
    subscribeHistoryItems(userId, async (seedTxs) => {
      const combined = Array.from(
        new Map([...plaidTxs, ...seedTxs].map(tx => [tx.transaction_id, tx])).values()
      ).sort((a, b) => new Date(b.date) - new Date(a.date));

      allTxsGlobal = combined.map(tx => ({
        ...tx,
        accountName: accountMap[tx.account_id] || 'Desconocida'
      }));

      await cacheTransactions(allTxsGlobal);

      if (!window.hasInitializedUI) {
        setupEventListeners();
        window.hasInitializedUI = true;
      }
      showPage();
    });
  } catch (e) {
    console.warn('[FIRESTORE] Error en suscripción a history', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Autenticación y eventos de red
// ─────────────────────────────────────────────────────────────────────────────

onAuthStateChanged(auth, user => {
  console.log('[AUTH] Cambio de estado detectado. User:', user);
  if (!user) return (window.location.href = '../index.html');
  loadTransactions(user.uid);
});

function showOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'block';
  console.log('[UI] Banner OFFLINE visible');
}

function hideOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.style.display = 'none';
  console.log('[UI] Banner OFFLINE oculto');
}

window.addEventListener('online', () => {
  hideOfflineBanner();
  if (auth.currentUser) {
    console.log('[NET] Conexión recuperada, recargando datos');
    loadTransactions(auth.currentUser.uid);
  }
});
window.addEventListener('offline', showOfflineBanner);
if (!navigator.onLine) showOfflineBanner();
