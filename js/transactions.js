import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { openDB } from 'idb';

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;
const PAGE_SIZE  = 20;
let currentPage  = 1;
let allTxsGlobal = [];

function setupEventListeners() {
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showPage();
    }
  });
  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(allTxsGlobal.length / PAGE_SIZE);
    if (currentPage < totalPages) {
      currentPage++;
      showPage();
    }
  });
  document.getElementById('toggle-view').addEventListener('change', () => {
    currentPage = 1;
    showPage();
  });
}

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
    try { await idb.put(STORE_NAME, t); } catch (e) {
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

function renderChronoPage(txs) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => list.appendChild(renderTxItem(tx)));
}

function renderGroupedPage(txs) {
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

function updatePaginationControls() {
  const totalPages = Math.ceil(allTxsGlobal.length / PAGE_SIZE) || 1;
  document.getElementById('prev-page').disabled = currentPage <= 1;
  document.getElementById('next-page').disabled = currentPage >= totalPages;
  document.getElementById('page-info').textContent = `Página ${currentPage} de ${totalPages}`;
}

function showPage() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageTxs = allTxsGlobal.slice(start, start + PAGE_SIZE);
  const grouped = document.getElementById('toggle-view').checked;
  (grouped ? renderGroupedPage : renderChronoPage)(pageTxs);
  updatePaginationControls();
}

async function fetchTransactionsFromPlaid(userId) {
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Plaid error ${res.status}: ${err.error || res.statusText}`);
  }
  const { transactions } = await res.json();
  return transactions.map(tx => ({ ...tx, transaction_id: tx.transaction_id || tx.id }));
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) continue;
      const { accounts: accs } = await res.json();
      accs.forEach(a => map[a.account_id] = a.name || 'Cuenta sin nombre');
    } catch {}
  }
  return map;
}

async function loadTransactions(userId) {
  const idb        = await initDB();
  const accountMap = await buildAccountMap(userId);

  let cached = await readCachedTransactions(idb);
  cached.sort((a,b) => new Date(b.date) - new Date(a.date));
  allTxsGlobal = cached.map(tx => ({
    ...tx,
    accountName: accountMap[tx.account_id] || 'Desconocida'
  }));

  showPage();
  if (!navigator.onLine) {
    document.getElementById('offline-indicator').hidden = false;
    document.getElementById('transactions-loading').hidden = true;
    return;
  }

  document.getElementById('offline-indicator').hidden = true;
  document.getElementById('transactions-loading').hidden = false;

  try {
    await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
  } catch {}

  try {
    const [plaidTxs, testTxs] = await Promise.all([
      fetchTransactionsFromPlaid(userId),
      fetchTestTransactions(userId)
    ]);
    const combined = [...plaidTxs, ...testTxs];
    combined.sort((a,b) => new Date(b.date) - new Date(a.date));
    const unique = Array.from(new Map(combined.map(tx => [tx.transaction_id, tx])).values());
    allTxsGlobal = unique.map(tx => ({
      ...tx,
      accountName: accountMap[tx.account_id] || 'Desconocida'
    }));
    currentPage = 1;
    showPage();
    await cacheTransactions(idb, allTxsGlobal);
  } catch (e) {
    console.error('loadTransactions error:', e);
    document.getElementById('offline-indicator').textContent = 'Error al actualizar, mostrando caché.';
    document.getElementById('offline-indicator').hidden = false;
  } finally {
    document.getElementById('transactions-loading').hidden = true;
  }
}

onAuthStateChanged(auth, user => {
  if (!user) return void(window.location.href = '../index.html');
  getDoc(doc(db, 'users', user.uid)).then(snap => {
    const d = snap.exists() ? snap.data() : {};
    document.getElementById('user-name').textContent = [d.firstName, d.lastName].filter(Boolean).join(' ') || 'Usuario';
  });
  setupEventListeners();
  loadTransactions(user.uid);
});

window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});