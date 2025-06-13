import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, getDoc, onSnapshot } from 'firebase/firestore';
import { openDB } from 'idb';

console.log('[Init] transactions.js loaded');

// API base URL
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// IndexedDB configuration
const DB_NAME    = 'fintrack-cache';
const DB_VERSION = 8;  // bump when data model changes
const STORE_NAME = 'transactions';

// Pagination settings
const PAGE_SIZE = 20;
let currentPage = 1;
let allTxsGlobal = [];

// Initialize or upgrade IndexedDB
async function initDB() {
  console.log('[DB] Initializing IndexedDB v' + DB_VERSION);
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: 'transaction_id' });
    }
  });
}

// Cache transactions to IndexedDB
async function cacheTransactions(idb, txs) {
  console.log('[Cache] Storing ' + txs.length + ' transactions');
  for (const tx of txs) {
    const id = tx.transaction_id || tx.id;
    if (!id) continue;
    tx.transaction_id = id;
    try {
      await idb.put(STORE_NAME, tx);
      console.log('[Cache] Stored tx', id);
    } catch (e) {
      console.error('[Cache] Error storing tx', id, e);
    }
  }
}

// Build account ID → name map
async function buildAccountMap(userId) {
  console.log('[Accounts] Building account map for user', userId);
  const userSnap = await getDoc(doc(db, 'users', userId));
  const accounts = userSnap.exists() ? userSnap.data().plaid?.accounts || [] : [];
  console.log('[Accounts] Found ' + accounts.length + ' accounts');
  const map = {};
  for (const { accessToken } of accounts) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) {
        console.warn('[Accounts] accountsGet responded not ok');
        continue;
      }
      const data = await res.json();
      data.accounts.forEach(a => {
        map[a.account_id] = a.name || 'Cuenta';
        console.log('[Accounts] Map', a.account_id, '→', a.name);
      });
    } catch (e) {
      console.error('[Accounts] fetch error', e);
    }
  }
  console.log('[Accounts] Completed account map');
  return map;
}

// Fetch transactions from Plaid
async function fetchTransactionsFromPlaid(userId) {
  console.log('[Fetch] Plaid transactions for', userId);
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) {
    console.error('[Fetch] Failed to fetch Plaid transactions:', res.status);
    throw new Error('Failed fetching Plaid transactions');
  }
  const data = await res.json();
  console.log('[Fetch] Retrieved ' + data.transactions.length + ' Plaid txs');
  return data.transactions.map(tx => ({
    ...tx,
    transaction_id: tx.transaction_id || tx.id
  }));
}

// Rendering helpers
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

// Filtering & pagination
function getFilteredTxs() {
  const val = document.getElementById('month-filter').value;
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
  console.log('[UI] showPage - page', currentPage);
  const arr = getFilteredTxs();
  console.log('[UI] showPage - filtered tx count', arr.length);
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = arr.slice(start, start + PAGE_SIZE);
  document.getElementById('toggle-view').checked
    ? renderGroupedPage(slice)
    : renderChronoPage(slice);
  updatePagination();
}

// UI event listeners
function setupEventListeners() {
  console.log('[UI] Setting up event listeners');
  const mf = document.getElementById('month-filter');
  const mi = document.querySelector('.month-icon');
  if (mi) mi.onclick = () => (mf.showPicker ? mf.showPicker() : mf.focus());
  mf.onchange = () => { currentPage = 1; showPage(); };
  document.getElementById('prev-page').onclick = () => {
    console.log('[UI] Prev page click');
    if (currentPage > 1) { currentPage--; showPage(); }
  };
  document.getElementById('next-page').onclick = () => {
    console.log('[UI] Next page click');
    const pages = Math.ceil(getFilteredTxs().length / PAGE_SIZE);
    if (currentPage < pages) { currentPage++; showPage(); }
  };
  document.getElementById('toggle-view').onchange = () => { currentPage = 1; showPage(); };
}

// Subscribe to Firestore history items in real-time (combining history and historySummary months)
function subscribeHistoryItems(userId, callback) {
  console.log('[Seed] Initializing subscription to history and summary months for', userId);
  const historyRef = collection(db, 'users', userId, 'history');
  const summaryRef = collection(db, 'users', userId, 'historySummary');
  let itemUnsubs = [];
  const seedMap = new Map();
  let monthsSet = new Set();

  // Helper to resubscribe to item subcollections based on current monthsSet
  function resubscribeItems() {
    itemUnsubs.forEach(unsub => unsub());
    itemUnsubs = [];
    seedMap.clear();
    const months = Array.from(monthsSet).sort();
    console.log('[Seed] Active months:', months);
    months.forEach(monthId => {
      const itemsRef = collection(db, 'users', userId, 'history', monthId, 'items');
      console.log('[Seed] Subscribing to items of month', monthId);
      const unsub = onSnapshot(itemsRef, itemsSnap => {
        console.log('[Seed] Item changes for month', monthId, itemsSnap.docChanges().length, 'changes');
        itemsSnap.docChanges().forEach(change => {
          const docSnap = change.doc;
          const id = docSnap.data().transaction_id || docSnap.id;
          console.log('[Seed] change type', change.type, 'for tx', id);
          if (change.type === 'removed') {
            seedMap.delete(id);
          } else {
            seedMap.set(id, { ...docSnap.data(), transaction_id: id });
          }
        });
        const seedTxs = Array.from(seedMap.values());
        console.log('[Seed] Delivering', seedTxs.length, 'seed transactions');
        callback(seedTxs);
      }, err => console.error('[Seed] items snapshot error', err));
      itemUnsubs.push(unsub);
    });
  }

  // Listen to history collection for monthDocs
  onSnapshot(historyRef, histSnap => {
    histSnap.docs.forEach(d => monthsSet.add(d.id));
    console.log('[Seed] history months snapshot:', histSnap.docs.map(d => d.id));
    resubscribeItems();
  }, err => console.error('[Seed] history snapshot error', err));

  // Listen to historySummary collection for monthDocs
  onSnapshot(summaryRef, sumSnap => {
    sumSnap.docs.forEach(d => monthsSet.add(d.id));
    console.log('[Seed] summary months snapshot:', sumSnap.docs.map(d => d.id));
    resubscribeItems();
  }, err => console.error('[Seed] summary snapshot error', err));
}

// Main load function
async function loadTransactions(userId) {
  console.log('[Main] loadTransactions for', userId);
  const idb = await initDB();
  const accountMap = await buildAccountMap(userId);
  console.log('[Main] Got account map, keys:', Object.keys(accountMap));

  // Sync remote
  if (navigator.onLine) {
    console.log('[Main] Syncing remote...');
    fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    }).catch(e => console.error('[Sync] Error', e));
  }

  // Fetch Plaid transactions once
  let plaidTxs = [];
  try {
    plaidTxs = await fetchTransactionsFromPlaid(userId);
  } catch (e) {
    console.error('[Fetch] Plaid error', e);
  }

  // Subscribe to Firestore seed transactions
  subscribeHistoryItems(userId, async (seedTxs) => {
    console.log('[Main] Received seedTxs count', seedTxs.length);
    const combined = Array.from(
      new Map([...plaidTxs, ...seedTxs].map(tx => [tx.transaction_id, tx])).values()
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    allTxsGlobal = combined.map(tx => ({
      ...tx,
      accountName: accountMap[tx.account_id] || 'Desconocida'
    }));

    console.log('[Main] combined tx count', allTxsGlobal.length);
    if (!window.hasInitializedUI) {
      setupEventListeners();
      window.hasInitializedUI = true;
      console.log('[Main] UI initialized');
    }
    showPage();

    // Cache latest for offline
    const freshDb = await initDB();
    await cacheTransactions(freshDb, allTxsGlobal);
  });
}

// Auth listener
onAuthStateChanged(auth, user => {
  console.log('[Auth] onAuthStateChanged', user?.uid);
  if (!user) return (window.location.href = '../index.html');
  loadTransactions(user.uid);
});

// Re-sync when coming online
window.addEventListener('online', () => {
  console.log('[Network] online event');
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
