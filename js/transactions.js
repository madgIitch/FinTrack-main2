import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';

// ----------------------------------------------------------------
// Elementos clave del DOM
// ----------------------------------------------------------------
const userNameSpan     = document.getElementById('user-name');
const toggleSwitch     = document.getElementById('toggle-view');
const toggleLabel      = document.querySelector('.toggle-label');
const listContainer    = document.getElementById('transactions-list');
const offlineIndicator = document.getElementById('offline-indicator');
const loadingIndicator = document.getElementById('transactions-loading');

// ----------------------------------------------------------------
// API Cloud Functions
// ----------------------------------------------------------------
const apiUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ----------------------------------------------------------------
// IndexedDB
// ----------------------------------------------------------------
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

async function initDB() {
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
  return idb;
}
async function cacheTransactions(idb, txs) {
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    await tx.store.put(t);
  }
  await tx.done;
}
async function readCachedTransactions(idb) {
  return idb.getAll(STORE_NAME);
}

// ----------------------------------------------------------------
// Agrupador
// ----------------------------------------------------------------
function groupByCategory(txs) {
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    (groups[cat] = groups[cat] || []).push(tx);
    return groups;
  }, {});
}

// ----------------------------------------------------------------
// Indicadores de estado
// ----------------------------------------------------------------
function showOffline(msg) {
  offlineIndicator.textContent = msg || 'Estás sin conexión. Mostrando datos en caché.';
  offlineIndicator.hidden = false;
}
function hideOffline() {
  offlineIndicator.hidden = true;
}
function showLoading() {
  loadingIndicator.hidden = false;
}
function hideLoading() {
  loadingIndicator.hidden = true;
}

// ----------------------------------------------------------------
// Llamadas a Cloud Functions
// ----------------------------------------------------------------
async function fetchTransactionsFromPlaid(userId) {
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Error al obtener transacciones desde Plaid');
  const { transactions } = await res.json();
  return transactions;
}
async function fetchAccountDetails(accessToken) {
  const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  });
  if (!res.ok) throw new Error('Error al obtener detalles de cuenta');
  return res.json();
}

// ----------------------------------------------------------------
// Construye mapa account_id → nombre de cuenta
// ----------------------------------------------------------------
async function buildAccountMap(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const accounts = userDoc.exists() ? userDoc.data().plaid?.accounts || [] : [];
  const map = {};
  for (const { accessToken } of accounts) {
    try {
      const { accounts: accs } = await fetchAccountDetails(accessToken);
      accs.forEach(acc => {
        map[acc.account_id] = acc.name || 'Cuenta sin nombre';
      });
    } catch {}
  }
  return map;
}

// ----------------------------------------------------------------
// Estado global y vista
// ----------------------------------------------------------------
let allTransactions = [];
let viewMode        = 'category'; // 'category' | 'chron'

// ----------------------------------------------------------------
// Render por categoría
// ----------------------------------------------------------------
function renderByCategory(groups) {
  listContainer.innerHTML = '';
  for (const [cat, txs] of Object.entries(groups)) {
    const section = document.createElement('div');
    section.className = 'category-group';
    section.innerHTML = `<h3>${cat}</h3>`;
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
      section.appendChild(item);
    });
    listContainer.appendChild(section);
  }
}

// ----------------------------------------------------------------
// Render cronológico
// ----------------------------------------------------------------
function renderChronological(txs) {
  listContainer.innerHTML = '';
  // opcional: encabezado
  const header = document.createElement('h3');
  header.textContent = 'Orden cronológico';
  header.style.marginBottom = '10px';
  listContainer.appendChild(header);

  txs
    .slice()
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .forEach(tx => {
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
      listContainer.appendChild(item);
    });
}

// ----------------------------------------------------------------
// Actualiza UI según viewMode
// ----------------------------------------------------------------
function updateUI() {
  if (viewMode === 'chron') {
    renderChronological(allTransactions);
  } else {
    renderByCategory(groupByCategory(allTransactions));
  }
}

// ----------------------------------------------------------------
// Flujo principal
// ----------------------------------------------------------------
async function loadTransactions(userId) {
  const idb        = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) Caché
  const cached = await readCachedTransactions(idb);
  console.log('[DEBUG] Caché →', cached);
  if (cached.length) {
    allTransactions = cached.map(tx => ({
      ...tx,
      accountName: accountMap[tx.account_id] || 'Cuenta desconocida'
    }));
    console.log('[DEBUG] allTransactions tras caché →', allTransactions);
    updateUI();
  }

  // 2) Offline?
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) Online
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);
    console.log('[DEBUG] Plaid →', txs);
    allTransactions = txs.map(tx => ({
      ...tx,
      accountName: accountMap[tx.account_id] || 'Cuenta desconocida'
    }));
    console.log('[DEBUG] allTransactions tras fetch →', allTransactions);
    updateUI();
    await cacheTransactions(idb, allTransactions);
  } catch (e) {
    console.error('[ERROR] loadTransactions →', e);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
  }
}

// ----------------------------------------------------------------
// Listener toggle
// ----------------------------------------------------------------
toggleSwitch.addEventListener('change', () => {
  viewMode = toggleSwitch.checked ? 'chron' : 'category';
  toggleLabel.textContent = viewMode === 'chron' ? 'Por fecha' : 'Por categoría';
  updateUI();
});

// ----------------------------------------------------------------
// Autenticación y saludo
// ----------------------------------------------------------------
onAuthStateChanged(auth, user => {
  if (user) {
    // saludo
    getDoc(doc(db, 'users', user.uid))
      .then(sd => {
        if (sd.exists()) {
          const { firstName='', lastName='' } = sd.data();
          userNameSpan.textContent = `${firstName} ${lastName}`.trim();
        }
      })
      .catch(() => console.error('Error cargando perfil'));
    // carga transacciones
    loadTransactions(user.uid);
  } else {
    window.location.href = '../index.html';
  }
});

// ----------------------------------------------------------------
// Reconexión
// ----------------------------------------------------------------
window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
