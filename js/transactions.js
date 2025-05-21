// js/transactions.js

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';

// ----------------------------------------------------------------
// API URL de tus Cloud Functions
// ----------------------------------------------------------------
const apiUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ----------------------------------------------------------------
// Constantes de IndexedDB
// ----------------------------------------------------------------
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

// ----------------------------------------------------------------
// Estado global
// ----------------------------------------------------------------
let allTransactions = [];
let accountMap       = {};
let idbInstance      = null;

// ----------------------------------------------------------------
// Switch vista /categoría
// ----------------------------------------------------------------
const toggleEl = document.getElementById('toggle-view');
toggleEl.addEventListener('change', () => {
  console.debug('[DEBUG] Toggle vista por categoría:', toggleEl.checked);
  renderAll();
});

// ----------------------------------------------------------------
// Inicializa o actualiza IndexedDB
// ----------------------------------------------------------------
async function initDB() {
  console.debug('[DEBUG] Inicializando IndexedDB...');
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.debug('[DEBUG] Creando object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
  console.debug('[DEBUG] IndexedDB lista:', idb);
  return idb;
}

// ----------------------------------------------------------------
// Guardar en caché
// ----------------------------------------------------------------
async function cacheTransactions(idb, txs) {
  console.debug('[DEBUG] Caché → guardando', txs.length, 'transacciones');
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    console.debug('  → put id=', t.id);
    await tx.store.put(t);
  }
  await tx.done;
  console.debug('[DEBUG] Caché → completo');
}

// ----------------------------------------------------------------
// Leer de caché
// ----------------------------------------------------------------
async function readCachedTransactions(idb) {
  const all = await idb.getAll(STORE_NAME);
  console.debug('[DEBUG] Caché → transacciones leídas:', all.length);
  return all;
}

// ----------------------------------------------------------------
// Agrupa por categoría
// ----------------------------------------------------------------
function groupByCategory(txs) {
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    (groups[cat] = groups[cat] || []).push(tx);
    return groups;
  }, {});
}

// ----------------------------------------------------------------
// UI helpers
// ----------------------------------------------------------------
function showOffline(msg) {
  const ind = document.getElementById('offline-indicator');
  ind.textContent = msg || 'Estás sin conexión. Mostrando caché.';
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

// ----------------------------------------------------------------
// Llama a tu función get_transactions
// ----------------------------------------------------------------
async function fetchTransactionsFromPlaid(userId) {
  console.debug('[DEBUG] Fetch → get_transactions para usuario:', userId);
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  console.debug('[DEBUG] Status fetch:', res.status);
  if (!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(`Plaid error ${res.status}: ${err.error||res.statusText}`);
  }
  const { transactions } = await res.json();
  console.debug('[DEBUG] 🔍 Transacciones brutas recibidas:', transactions);
  return transactions;
}

// ----------------------------------------------------------------
// Detalles de cuenta para mapear account_id → nombre
// ----------------------------------------------------------------
async function fetchAccountDetails(accessToken) {
  console.debug('[DEBUG] Fetch detalles cuenta →', accessToken);
  const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  });
  if (!res.ok) throw new Error('Error obteniendo detalles de cuenta');
  const data = await res.json();
  console.debug('[DEBUG] Detalles de cuenta:', data);
  return data;
}

// ----------------------------------------------------------------
// Construye mapa de cuentas
// ----------------------------------------------------------------
async function buildAccountMap(userId) {
  console.debug('[DEBUG] buildAccountMap para usuario:', userId);
  const userDoc = await getDoc(doc(db, 'users', userId));
  const accounts = userDoc.exists()
    ? (userDoc.data().plaid?.accounts || [])
    : [];
  console.debug('[DEBUG] Cuentas Plaid:', accounts.length);

  const map = {};
  for (const { accessToken } of accounts) {
    try {
      const { accounts: accs } = await fetchAccountDetails(accessToken);
      accs.forEach(acc => {
        map[acc.account_id] = { name: acc.name || 'Sin nombre' };
      });
    } catch (e) {
      console.error('[ERROR] buildAccountMap →', e);
    }
  }
  console.debug('[DEBUG] Mapa final:', map);
  return map;
}

// ----------------------------------------------------------------
// Render view según toggle
// ----------------------------------------------------------------
function renderAll() {
  if (toggleEl.checked) {
    renderByCategory(allTransactions);
  } else {
    renderChronological(allTransactions);
  }
}

// ----------------------------------------------------------------
// Render cronológico
// ----------------------------------------------------------------
function renderChronological(txs) {
  console.debug('[DEBUG] renderChronological →', txs);
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    item.innerHTML = `
      <span class="account-label">${tx.accountName}</span>
      <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
      <div class="desc">${tx.description}</div>
      <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
        ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
      </span>
    `;
    list.appendChild(item);
  });
}

// ----------------------------------------------------------------
// Render por categoría
// ----------------------------------------------------------------
function renderByCategory(txs) {
  console.debug('[DEBUG] renderByCategory →', txs);
  const groups = groupByCategory(txs);
  const list   = document.getElementById('transactions-list');
  list.innerHTML = '';

  Object.entries(groups).forEach(([cat, arr]) => {
    const section = document.createElement('div');
    section.className = 'category-group';
    section.innerHTML = `<h3>${cat}</h3>`;
    arr.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <span class="account-label">${tx.accountName}</span>
        <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
        <div class="desc">${tx.description}</div>
        <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
          ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
        </span>
      `;
      section.appendChild(item);
    });
    list.appendChild(section);
  });
}

// ----------------------------------------------------------------
// Flujo principal
// ----------------------------------------------------------------
async function loadTransactions(userId) {
  console.debug('[DEBUG] loadTransactions →', userId);

  if (!idbInstance) {
    idbInstance = await initDB();
  }
  accountMap = await buildAccountMap(userId);

  // 1) Mostrar caché
  const cached = await readCachedTransactions(idbInstance);
  if (cached.length) {
    cached.forEach(tx => {
      // Si backend ya incluyó personal_finance_category, úsalo:
      if (Array.isArray(tx.personal_finance_category)) {
        tx.category = tx.personal_finance_category[0] || tx.category;
      }
      tx.accountName = accountMap[tx.account_id]?.name || 'Desconocida';
    });
    allTransactions = cached.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    renderAll();
  }

  // 2) Offline?
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) Online: fetch → render → cache
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);
    txs.forEach(tx => {
      console.debug('[DEBUG] tx recibido →', tx);
      // si tu Cloud Function ya mapea personal_finance_category:
      if (Array.isArray(tx.personal_finance_category)) {
        tx.category = tx.personal_finance_category[0];
      }
      tx.accountName = accountMap[tx.account_id]?.name || 'Desconocida';
    });
    allTransactions = txs.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
    renderAll();
    await cacheTransactions(idbInstance, allTransactions);
  } catch (err) {
    console.error('❌ loadTransactions error:', err);
    showOffline('No se pudieron actualizar, mostrando caché.');
  } finally {
    hideLoading();
  }
}

// ----------------------------------------------------------------
// Arranca al autenticar
// ----------------------------------------------------------------
onAuthStateChanged(auth, user => {
  console.debug('[DEBUG] onAuthStateChanged →', user);
  if (user) {
    loadTransactions(user.uid);
  } else {
    window.location.href = '../index.html';
  }
});

// ----------------------------------------------------------------
// Al reconectar
// ----------------------------------------------------------------
window.addEventListener('online', () => {
  if (auth.currentUser) {
    console.debug('[DEBUG] Reconectado, recargando...');
    loadTransactions(auth.currentUser.uid);
  }
});
