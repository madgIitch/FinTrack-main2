import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { openDB } from 'idb';

console.log('transactions.js loaded');

// ── API URL ──────────────────────────────────────────────────────────────
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── IndexedDB Settings ──────────────────────────────────────────────────
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'transaction_id' });
      }
    }
  });
}

async function cacheTransactions(idb, txs) {
  for (const t of txs) {
    const id = t.transaction_id || t.id;
    if (!id) continue;
    t.transaction_id = id;
    try {
      await idb.put(STORE_NAME, t);
    } catch (e) {
      console.error('cacheTransactions failed for', id, e);
    }
  }
}

async function readCachedTransactions(idb) {
  return idb.getAll(STORE_NAME);
}

function groupByCategory(txs) {
  return txs.reduce((acc, tx) => {
    const cat = tx.category || 'Sin categoría';
    (acc[cat] = acc[cat] || []).push(tx);
    return acc;
  }, {});
}

function renderChrono(txs) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => list.appendChild(renderTxItem(tx)));
}

function renderGrouped(txs) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  const groups = groupByCategory(txs);
  Object.entries(groups).forEach(([cat, items]) => {
    const sec = document.createElement('div');
    sec.className = 'category-group';
    sec.innerHTML = `<h3>${cat}</h3>`;
    items.forEach(tx => sec.appendChild(renderTxItem(tx)));
    list.appendChild(sec);
  });
}

function renderTxItem(tx) {
  const div = document.createElement('div');
  div.className = 'transaction-item';
  div.innerHTML = `
    <span class="account-label">${tx.accountName}</span>
    <div class="desc">${tx.description}</div>
    <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
    <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
      ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
    </span>
  `;
  return div;
}

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

async function fetchTransactionsFromPlaid(userId) {
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Plaid error ${res.status}: ${err.error || res.statusText}`);
  }
  const { transactions } = await res.json();
  return transactions.map(tx => ({
    ...tx,
    transaction_id: tx.transaction_id || tx.id
  }));
}

async function fetchTestTransactions(userId) {
  const txs = [];
  const historySnap = await getDocs(collection(db, 'users', userId, 'history'));
  for (const monthDoc of historySnap.docs) {
    const itemsSnap = await getDocs(
      collection(db, 'users', userId, 'history', monthDoc.id, 'items')
    );
    itemsSnap.forEach(docSnap => {
      const data = docSnap.data();
      const id   = data.transaction_id || docSnap.id;
      if (!id) return;
      data.transaction_id = id;
      txs.push(data);
    });
  }
  return txs;
}

async function buildAccountMap(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  const list = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  const map = {};
  for (const { accessToken } of list) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) continue;
      const { accounts: accs } = await res.json();
      accs.forEach(a => { map[a.account_id] = a.name || 'Cuenta sin nombre'; });
    } catch {}
  }
  return map;
}

// ── Flujo principal con orden cronológico ───────────────────────────────────
async function loadTransactions(userId) {
  const idb        = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) Mostrar caché ordenado
  let cached = await readCachedTransactions(idb);
  cached = cached.sort((a,b) => new Date(b.date) - new Date(a.date));
  if (cached.length) {
    cached.forEach(tx => tx.accountName = accountMap[tx.account_id] || 'Desconocida');
    (document.getElementById('toggle-view').checked ? renderGrouped : renderChrono)(cached);
  }
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 2) Opcional: sync Firestore
  try {
    await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch {}

  hideOffline();
  showLoading();

  // 3) Fetch, combinar, ordenar, render, cache
  try {
    const [plaidTxs, testTxs] = await Promise.all([
      fetchTransactionsFromPlaid(userId),
      fetchTestTransactions(userId)
    ]);
    const combined = [...plaidTxs, ...testTxs];
    // Orden por fecha descendente
    combined.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Deduplicar
    const mapTx = new Map();
    combined.forEach(tx => mapTx.set(tx.transaction_id, tx));
    const allTxs = Array.from(mapTx.values());

    allTxs.forEach(tx => tx.accountName = accountMap[tx.account_id] || 'Desconocida');

    (document.getElementById('toggle-view').checked ? renderGrouped : renderChrono)(allTxs);

    await cacheTransactions(idb, allTxs);
  } catch (e) {
    console.error('loadTransactions error:', e);
    showOffline('Error al actualizar, mostrando caché.');
  } finally {
    hideLoading();
  }
}

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }
  const nameSpan = document.getElementById('user-name');
  getDoc(doc(db, 'users', user.uid)).then(snap => {
    const d = snap.exists() ? snap.data() : {};
    nameSpan.textContent = [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Usuario';
  });
  document.getElementById('toggle-view')
    .addEventListener('change', () => loadTransactions(user.uid));
  loadTransactions(user.uid);
});

window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
