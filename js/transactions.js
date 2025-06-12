// transactions.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { openDB } from 'idb';

console.log('[Init] transactions.js loaded');

// URL API
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// IndexedDB settings
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

// Pagination and filters
const PAGE_SIZE  = 20;
let currentPage  = 1;
let allTxsGlobal = [];

// ——— Initialize IndexedDB —————————————————————————
async function initDB() {
  console.log('[DB] Initializing IndexedDB');
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('[DB] Creating object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'transaction_id' });
      }
    }
  });
}

// ——— Cache transactions ———————————————————————————
async function cacheTransactions(idb, txs) {
  console.log(`[Cache] Caching ${txs.length} transactions`);
  for (const tx of txs) {
    const id = tx.transaction_id || tx.id;
    if (!id) {
      console.warn('[Cache] Skipping tx with no ID', tx);
      continue;
    }
    tx.transaction_id = id;
    try {
      await idb.put(STORE_NAME, tx);
      console.log(`[Cache] Stored tx ${id}`);
    } catch (e) {
      console.error(`[Cache] Failed for ${id}`, e);
    }
  }
}

// ——— Read cached transactions ——————————————————————
async function readCachedTransactions(idb) {
  console.log('[Cache] Reading all cached transactions');
  const all = await idb.getAll(STORE_NAME);
  console.log(`[Cache] Retrieved ${all.length} transactions from cache`);
  return all;
}

// ——— Build account map from Firestore ——————————
async function buildAccountMap(userId) {
  console.log('[Accounts] Building account map for user', userId);
  const snap = await getDoc(doc(db, 'users', userId));
  const list = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  console.log('[Accounts] Found', list.length, 'Plaid accounts');
  const map = {};
  for (const { accessToken } of list) {
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      if (!res.ok) continue;
      const { accounts } = await res.json();
      accounts.forEach(a => { map[a.account_id] = a.name || 'Cuenta sin nombre'; });
    } catch (e) {
      console.error('[Accounts] Error fetching account details', e);
    }
  }
  return map;
}

// ——— Fetch Plaid transactions —————————————————————
async function fetchTransactionsFromPlaid(userId) {
  console.log('[Fetch] Fetching Plaid transactions for', userId);
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
  console.log('[Fetch] Retrieved', transactions.length, 'Plaid txs');
  return transactions.map(tx => ({
    ...tx,
    transaction_id: tx.transaction_id || tx.id
  }));
}

// ——— Fetch test transactions ——————————————————————
async function fetchTestTransactions(userId) {
  console.log('[Fetch] Fetching Firestore history for', userId);
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
  console.log('[Fetch] Retrieved', txs.length, 'test txs');
  return txs;
}

// ——— Group by category ———————————————————————————
function groupByCategory(txs) {
  console.log('[Render] Grouping', txs.length, 'txs by category');
  return txs.reduce((acc, tx) => {
    const cat = tx.category || 'Sin categoría';
    (acc[cat] = acc[cat] || []).push(tx);
    return acc;
  }, {});
}

// ——— Render helpers —————————————————————————————
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
function renderChronoPage(txs) {
  console.log('[Render] Chrono:', txs.length, 'items');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => list.appendChild(renderTxItem(tx)));
}
function renderGroupedPage(txs) {
  console.log('[Render] Grouped:', txs.length, 'items');
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

// ——— Filter & paginate ——————————————————————————
function getFilteredTxs() {
  const val = document.getElementById('month-filter').value;
  console.log('[Filter] Month value:', val);
  if (!val) return allTxsGlobal;
  const filtered = allTxsGlobal.filter(tx =>
    new Date(tx.date).toISOString().slice(0,7) === val
  );
  console.log('[Filter] Count after filter:', filtered.length);
  return filtered;
}
function updatePaginationControls() {
  const total = getFilteredTxs().length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  console.log(`[Page] ${currentPage}/${pages} of ${total}`);
  document.getElementById('prev-page').disabled = currentPage <= 1;
  document.getElementById('next-page').disabled = currentPage >= pages;
  document.getElementById('page-info').textContent = `Página ${currentPage} de ${pages}`;
}
function showPage() {
  console.log('[Nav] showPage()');
  const arr = getFilteredTxs();
  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = arr.slice(start, start + PAGE_SIZE);
  console.log('[Nav] displaying', slice.length, 'items', start, 'to', start + slice.length);
  document.getElementById('toggle-view').checked
    ? renderGroupedPage(slice)
    : renderChronoPage(slice);
  updatePaginationControls();
}

// ——— UI event listeners —————————————————————————
function setupEventListeners() {
  console.log('[UI] setupEventListeners');
  const monthFilter = document.getElementById('month-filter');
  const monthIcon   = document.querySelector('.month-icon');

  // global click check
  document.addEventListener('click', e => {
    if (e.target.closest('.month-icon')) {
      console.log('📅 [Global] calendar icon clicked');
    }
  });

  monthIcon.addEventListener('click', () => {
    console.log('📅 [UI] month-icon clicked');
    if (typeof monthFilter.showPicker === 'function') {
      monthFilter.showPicker();
    } else {
      monthFilter.focus();
    }
  });
  monthFilter.addEventListener('change', () => {
    console.log('[UI] month-filter change ->', monthFilter.value);
    currentPage = 1;
    showPage();
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    console.log('[UI] prev-page clicked');
    if (currentPage > 1) { currentPage--; showPage(); }
  });
  document.getElementById('next-page').addEventListener('click', () => {
    console.log('[UI] next-page clicked');
    const pages = Math.ceil(getFilteredTxs().length / PAGE_SIZE);
    if (currentPage < pages) { currentPage++; showPage(); }
  });
  document.getElementById('toggle-view').addEventListener('change', () => {
    console.log('[UI] toggle-view changed ->', document.getElementById('toggle-view').checked);
    currentPage = 1;
    showPage();
  });
}

// ——— Main load ———————————————————————————————
async function loadTransactions(userId) {
  console.log('[Main] loadTransactions(', userId, ')');
  const idb = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) cache first
  let cached = await readCachedTransactions(idb);
  cached.sort((a,b) => new Date(b.date) - new Date(a.date));
  allTxsGlobal = cached.map(tx => ({
    ...tx,
    accountName: accountMap[tx.account_id] || 'Desconocida'
  }));
  console.log('[Main] cache loaded:', allTxsGlobal.length);
  setupEventListeners();
  showPage();

  // 2) offline?
  if (!navigator.onLine) {
    console.log('[Main] offline, showing cache only');
    document.getElementById('offline-indicator').hidden = false;
    document.getElementById('transactions-loading').hidden = true;
    return;
  }

  // 3) sync
  console.log('[Main] syncing remote store');
  document.getElementById('offline-indicator').hidden = true;
  document.getElementById('transactions-loading').hidden = false;
  try {
    await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({userId})
    });
    console.log('[Main] sync done');
  } catch(e) {
    console.error('[Main] sync error', e);
  }

  // 4) fetch latest
  try {
    console.log('[Main] fetching latest txs');
    const [plaid, test] = await Promise.all([
      fetchTransactionsFromPlaid(userId),
      fetchTestTransactions(userId)
    ]);
    let combined = [...plaid, ...test];
    combined.sort((a,b) => new Date(b.date) - new Date(a.date));
    combined = Array.from(new Map(combined.map(tx => [tx.transaction_id, tx])).values());
    console.log('[Main] unique combined count:', combined.length);
    allTxsGlobal = combined.map(tx => ({
      ...tx,
      accountName: accountMap[tx.account_id] || 'Desconocida'
    }));
    currentPage = 1;
    showPage();
    await cacheTransactions(idb, allTxsGlobal);
  } catch(e) {
    console.error('[Main] fetch error', e);
    const ind = document.getElementById('offline-indicator');
    ind.textContent = 'Error al actualizar, mostrando caché.';
    ind.hidden = false;
  } finally {
    document.getElementById('transactions-loading').hidden = true;
    console.log('[Main] loadTransactions complete');
  }
}

// ——— Auth listener —————————————————————————————
onAuthStateChanged(auth, user => {
  console.log('[Auth] state changed:', user);
  if (!user) {
    window.location.href = '../index.html';
    return;
  }
  getDoc(doc(db,'users',user.uid)).then(snap => {
    const d = snap.exists()?snap.data():{};
    const name = [d.firstName,d.lastName].filter(Boolean).join(' ')||'Usuario';
    document.getElementById('user-name').textContent = name;
  });
  loadTransactions(user.uid);
});

// ——— Retry on online ————————————————————————————
window.addEventListener('online', () => {
  console.log('[Network] back online');
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
