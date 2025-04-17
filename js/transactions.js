// js/transactions.js

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';

// ----------------------------------------------------------------
// Configuración de la API Cloud Function
// ----------------------------------------------------------------
const API_BASE =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
console.debug('[DEBUG] API base URL:', API_BASE);

// ----------------------------------------------------------------
// IndexedDB
// ----------------------------------------------------------------
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

async function initDB() {
  console.debug('[DEBUG] Inicializando IndexedDB...');
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.debug('[DEBUG] Creando object store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
  console.debug('[DEBUG] IndexedDB lista:', idb);
  return idb;
}

async function cacheTransactions(idb, txs) {
  console.debug('[DEBUG] Caché → guardando transacciones:', txs.length);
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    console.debug('  → put id=', t.id);
    await tx.store.put(t);
  }
  await tx.done;
  console.debug('[DEBUG] Caché → terminado');
}

async function readCachedTransactions(idb) {
  const all = await idb.getAll(STORE_NAME);
  console.debug('[DEBUG] Caché → transacciones leídas:', all.length);
  return all;
}

// ----------------------------------------------------------------
// Fetch de Plaid
// ----------------------------------------------------------------
async function fetchTransactionsFromPlaid(userId) {
  console.debug('[DEBUG] Fetch → get_transactions, userId:', userId);
  const res = await fetch(`${API_BASE}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  console.debug('[DEBUG] Fetch status:', res.status);
  const payload = await res.json();
  console.debug('[DEBUG] Raw payload:', payload);
  return payload.transactions;
}

// ----------------------------------------------------------------
// Construye el mapa account_id → { name, institutionalName }
// ----------------------------------------------------------------
async function buildAccountMap(userId) {
  console.debug('[DEBUG] Construyendo mapa de cuentas para userId:', userId);
  const userSnap = await getDoc(doc(db, 'users', userId));
  const plaidAccounts = userSnap.exists() ? userSnap.data().plaid?.accounts || [] : [];
  console.debug('[DEBUG] Cuentas Plaid vinculadas:', plaidAccounts);
  const map = {};

  await Promise.all(plaidAccounts.map(async acc => {
    console.debug('[DEBUG] Fetch detalles cuenta →', acc.accessToken);
    const r = await fetch(`${API_BASE}/plaid/get_account_details`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: acc.accessToken }),
    });
    console.debug('[DEBUG] Status get_account_details:', r.status);
    const data = await r.json();
    console.debug('[DEBUG] Respuesta get_account_details:', data);
    for (const acct of data.accounts || []) {
      map[acct.account_id] = {
        name: acct.name,
        institutionalName: data.institution?.name || '',
      };
    }
  }));

  console.debug('[DEBUG] Mapa de cuentas final:', map);
  return map;
}

// ----------------------------------------------------------------
// Renderizado
// ----------------------------------------------------------------
function groupByCategory(txs) {
  console.debug('[DEBUG] Agrupando por categoría (completa):', txs.map(t=>t.category));
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(tx);
    return groups;
  }, {});
}

function renderTransactions(groups) {
  console.debug('[DEBUG] Renderizando grupos:', groups);
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
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
        <span class="amount ${tx.amount<0?'debit':'credit'}">
          ${tx.amount<0?'−':'+'}${Math.abs(tx.amount).toFixed(2)} €
        </span>
      `;
      section.appendChild(item);
    });
    list.appendChild(section);
  }
}

function showOffline(msg) {
  const ind = document.getElementById('offline-indicator');
  ind.textContent = msg||'Estás sin conexión. Mostrando caché.';
  ind.hidden = false;
}
function hideOffline() { document.getElementById('offline-indicator').hidden = true; }
function showLoading() { document.getElementById('transactions-loading').hidden = false; }
function hideLoading() { document.getElementById('transactions-loading').hidden = true; }

// ----------------------------------------------------------------
// Flujo completo
// ----------------------------------------------------------------
async function loadTransactions(userId) {
  console.debug('[DEBUG] loadTransactions → usuario:', userId);
  const idb = await initDB();

  // 1) del caché
  const cached = await readCachedTransactions(idb);
  if (cached.length) {
    console.debug('[DEBUG] Renderizando datos de caché');
    renderTransactions(groupByCategory(cached));
  }

  // 2) offline?
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) online
  hideOffline();
  showLoading();

  try {
    // a) accountMap
    const accountMap = await buildAccountMap(userId);

    // b) fetch txs
    const txs = await fetchTransactionsFromPlaid(userId);
    console.debug('[DEBUG] Raw transactions array:', txs);
    if (txs.length) {
      console.debug('[DEBUG] Primer tx keys:', Object.keys(txs[0]), txs[0]);
    }

    // c) enriquecer con accountName
    txs.forEach(tx => {
      // <-- aquí probamos varias claves hasta dar con la correcta
      const acctId = tx.account_id ?? tx.accountId ?? tx.accountIden;
      if (!acctId) {
        console.warn('[WARN] No he encontrado account_id en tx:', tx);
      }
      tx.accountName = accountMap[acctId]?.name || 'Cuenta desconocida';
      console.debug('[DEBUG] tx.account_id→', acctId, '→ accountName:', tx.accountName);
    });

    // d) render
    console.debug('[DEBUG] Renderizando datos online');
    renderTransactions(groupByCategory(txs));

    // e) cache
    await cacheTransactions(idb, txs);

  } catch (err) {
    console.error('[ERROR] loadTransactions:', err);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
  }
}

// ----------------------------------------------------------------
// onAuthStateChanged
// ----------------------------------------------------------------
onAuthStateChanged(auth, user => {
  console.debug('[DEBUG] onAuthStateChanged →', user);
  if (user) loadTransactions(user.uid);
  else window.location.href = '../index.html';
});

window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
