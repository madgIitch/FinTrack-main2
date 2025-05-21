// public/js/transactions.js

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';

// ── CONFIG API ────────────────────────────────────────────────────────────────
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── IndexedDB ────────────────────────────────────────────────────────────────
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

async function initDB() {
  console.debug('[DEBUG] initDB → abriendo IndexedDB...');
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.debug('[DEBUG] initDB → creando store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
  console.debug('[DEBUG] initDB → listo');
  return idb;
}

async function cacheTransactions(idb, txs) {
  console.debug('[DEBUG] cacheTransactions → guardando', txs.length);
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    await tx.store.put(t);
    console.debug(`  → cacheTransactions put id=${t.id}`);
  }
  await tx.done;
  console.debug('[DEBUG] cacheTransactions → terminado');
}

async function readCachedTransactions(idb) {
  const all = await idb.getAll(STORE_NAME);
  console.debug('[DEBUG] readCachedTransactions → leídas', all.length);
  return all;
}

// ── RENDERIZADO ───────────────────────────────────────────────────────────────
function renderTxItem(tx) {
  const item = document.createElement('div');
  item.className = 'transaction-item';
  item.innerHTML = `
    <span class="account-label">${tx.accountName}</span>
    <div class="desc">${tx.description}</div>
    <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
    <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
      ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
    </span>
  `;
  return item;
}

function renderChrono(txs) {
  console.debug('[DEBUG] renderChrono → orden cronológico');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => list.appendChild(renderTxItem(tx)));
}

function renderGrouped(txs) {
  console.debug('[DEBUG] renderGrouped → agrupado');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  const groups = txs.reduce((g, tx) => {
    const cat = tx.category || 'Sin categoría';
    (g[cat] = g[cat] || []).push(tx);
    return g;
  }, {});
  for (const [cat, items] of Object.entries(groups)) {
    console.debug(`[DEBUG] renderGrouped → ${cat}: ${items.length}`);
    const sec = document.createElement('div');
    sec.className = 'category-group';
    sec.innerHTML = `<h3>${cat}</h3>`;
    items.forEach(tx => sec.appendChild(renderTxItem(tx)));
    list.appendChild(sec);
  }
}

// ── ESTADO UI ────────────────────────────────────────────────────────────────
function showOffline(msg = 'Estás sin conexión. Mostrando datos en caché.') {
  const ind = document.getElementById('offline-indicator');
  ind.textContent = msg;
  ind.hidden = false;
}
function hideOffline() {
  document.getElementById('offline-indicator').hidden = true;
}
function showLoading() {
  document.getElementById('transactions-loading').hidden = false;
}
function hideLoading() {
  document.getElementById('transactions-loading').hidden = true;
}

// ── FETCH DE TRANSACCIONES ───────────────────────────────────────────────────
async function fetchTransactionsFromPlaid(userId) {
  console.debug('[DEBUG] Fetch → get_transactions, userId:', userId);
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId })
  });
  console.debug('[DEBUG] Fetch status:', res.status);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Plaid error ${res.status}: ${err.error || res.statusText}`);
  }
  const { transactions } = await res.json();
  console.debug('[DEBUG] Transacciones raw:', transactions);
  return transactions;
}

// ── MAPA account_id → nombre ─────────────────────────────────────────────────
async function buildAccountMap(userId) {
  console.debug('[DEBUG] buildAccountMap → userId:', userId);
  const snap = await getDoc(doc(db,'users',userId));
  const accounts = snap.exists() ? snap.data().plaid?.accounts||[] : [];
  console.debug('[DEBUG] buildAccountMap → tokens encontrados:', accounts.length);

  const map = {};
  for (const { accessToken } of accounts) {
    try {
      console.debug('[DEBUG] buildAccountMap → get_account_details', accessToken);
      const r = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accessToken })
      });
      if (!r.ok) continue;
      const { accounts: accs } = await r.json();
      accs.forEach(a => { map[a.account_id] = a.name || 'Cuenta sin nombre'; });
    } catch (e) {
      console.error('[ERROR] buildAccountMap →', e);
    }
  }
  console.debug('[DEBUG] buildAccountMap → resultado:', map);
  return map;
}

// ── FLUJO PRINCIPAL ───────────────────────────────────────────────────────────
let lastTxs = [];  // <-- almacenamos el último array

async function loadTransactions(userId) {
  console.debug('[DEBUG] loadTransactions → inicio para', userId);

  const idb = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) Mostrar caché
  const cached = await readCachedTransactions(idb);
  if (cached.length) {
    cached.forEach(tx => tx.accountName = accountMap[tx.account_id] || 'Desconocida');
    console.debug('[CACHE]', cached);
    lastTxs = cached;
    renderView();
  }

  // 2) Offline?
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) Online: fetch → cache → render
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);

    txs.forEach(tx => {
      // campo legacy
      const legacyCat = tx.category || 'Sin categoría';
      // nuevo pf category puede venir array u objeto
      let pf = tx.personal_finance_category;
      console.debug('[RAW TX.personal_finance_category]', pf);
      // si es objeto con `.hierarchy`...
      if (pf && pf.hierarchy) {
        tx.personal_finance_category = pf.hierarchy;
      }
      // si es array, ok. si no, fallback legacy
      if (!Array.isArray(tx.personal_finance_category) || !tx.personal_finance_category.length) {
        tx.personal_finance_category = [];
        tx.category = legacyCat;
      } else {
        tx.category = tx.personal_finance_category[0];
      }

      tx.accountName = accountMap[tx.account_id] || 'Desconocida';
    });

    console.debug('[DEBUG] Transacciones mapeadas:', txs);
    lastTxs = txs;
    await cacheTransactions(idb, txs);
    renderView();

  } catch (err) {
    console.error('❌ loadTransactions error:', err);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
  }

  console.debug('[DEBUG] loadTransactions → fin');
}

// render según switch
function renderView() {
  const byCat = document.getElementById('toggle-view').checked;
  byCat ? renderGrouped(lastTxs) : renderChrono(lastTxs);
}

// ── INICIO ────────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }
  // toggle listener
  document.getElementById('toggle-view')
    .addEventListener('change', renderView);
  loadTransactions(user.uid);
});

window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
