// js/transactions.js

import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { openDB } from 'idb';

console.log('transactions.js loaded');

const apiUrl = 'https://api-t6634jgkjqu-uc.a.run.app/api'; 

// ── CONSTANTES DE IndexedDB ─────────────────────────────────────────────────
const DB_NAME    = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

// ── Inicializa o actualiza la base de datos ─────────────────────────────────
async function initDB() {
  console.debug('[DEBUG] initDB → abriendo o creando IndexedDB');
  const idb = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.debug('[DEBUG] initDB → creando store:', STORE_NAME);
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
  console.debug('[DEBUG] initDB → listo:', idb);
  return idb;
}

// ── Guarda transacciones en caché ───────────────────────────────────────────
async function cacheTransactions(idb, txs) {
  console.debug('[DEBUG] cacheTransactions → guardando transacciones:', txs.length);
  const tx = idb.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    console.debug('  → cacheTransactions put id=', t.id);
    await tx.store.put(t);
  }
  await tx.done;
  console.debug('[DEBUG] cacheTransactions → terminado');
}

// ── Lee todas las transacciones de la caché ─────────────────────────────────
async function readCachedTransactions(idb) {
  const all = await idb.getAll(STORE_NAME);
  console.debug('[DEBUG] readCachedTransactions → leídas', all.length, 'transacciones');
  return all;
}

// ── Agrupa transacciones por categoría para la vista agrupada ───────────────
function groupByCategory(txs) {
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    (groups[cat] = groups[cat] || []).push(tx);
    return groups;
  }, {});
}

// ── Renderiza en orden cronológico ──────────────────────────────────────────
function renderChrono(txs) {
  console.debug('[DEBUG] renderChrono → mostrando en orden cronológico');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  txs.forEach(tx => {
    list.appendChild(renderTxItem(tx));
  });
}

// ── Renderiza agrupado por categoría ────────────────────────────────────────
function renderGrouped(txs) {
  console.debug('[DEBUG] renderGrouped → mostrando agrupado por categoría');
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';
  const groups = groupByCategory(txs);
  for (const [cat, items] of Object.entries(groups)) {
    console.debug('[DEBUG] renderGrouped → categoría', JSON.stringify(cat), 'con', items.length, 'items');
    const section = document.createElement('div');
    section.className = 'category-group';
    section.innerHTML = `<h3>${cat}</h3>`;
    items.forEach(tx => section.appendChild(renderTxItem(tx)));
    list.appendChild(section);
  }
}

// ── Crea el nodo HTML de una transacción ────────────────────────────────────
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

// ── Indicadores de estado ───────────────────────────────────────────────────
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

// ── Llama al endpoint para traer transacciones de Plaid ────────────────────
async function fetchTransactionsFromPlaid(userId) {
  console.debug('[DEBUG] fetchTransactionsFromPlaid → get_transactions, userId:', userId);
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId })
  });
  console.debug('[DEBUG] fetchTransactionsFromPlaid → status:', res.status);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Plaid error ${res.status}: ${err.error || res.statusText}`);
  }
  const { transactions } = await res.json();
  console.debug('[DEBUG] fetchTransactionsFromPlaid → payload completo:', { transactions });
  return transactions;
}

// ── Construye un mapa account_id → nombre de cuenta ────────────────────────
async function buildAccountMap(userId) {
  console.debug('[DEBUG] buildAccountMap → obteniendo cuentas Firestore para', userId);
  const userSnap = await getDoc(doc(db, 'users', userId));
  const accounts = userSnap.exists() ? userSnap.data().plaid?.accounts || [] : [];
  console.debug('[DEBUG] buildAccountMap → tokens encontrados:', accounts.length);

  const map = {};
  for (const { accessToken } of accounts) {
    try {
      console.debug('[DEBUG] buildAccountMap → fetch get_account_details para', accessToken);
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ accessToken })
      });
      if (!res.ok) {
        console.warn('[WARN] buildAccountMap → detalles cuenta no OK para', accessToken);
        continue;
      }
      const { accounts: accs } = await res.json();
      console.debug('[DEBUG] buildAccountMap → detalles recibidos:', accs);
      accs.forEach(a => {
        map[a.account_id] = a.name || 'Cuenta sin nombre';
      });
    } catch (e) {
      console.error('[ERROR] buildAccountMap →', e);
    }
  }
  console.debug('[DEBUG] buildAccountMap → map final:', map);
  return map;
}

// ── Flujo principal: caché → render → fetch online → actualizar caché ──────
async function loadTransactions(userId) {
  console.debug('[DEBUG] loadTransactions → inicio para userId:', userId);
  const idb        = await initDB();
  const accountMap = await buildAccountMap(userId);

  // 1) Mostrar caché
  const cached = await readCachedTransactions(idb);
  if (cached.length) {
    cached.forEach(tx => {
      tx.accountName = accountMap[tx.account_id] || 'Cuenta desconocida';
    });
    console.debug('[DEBUG] loadTransactions → renderizando CACHE:', cached);
    const byCategory = document.getElementById('toggle-view').checked;
    byCategory ? renderGrouped(cached) : renderChrono(cached);
  }

  // 2) Offline?
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) Online: primero sincronizar Firestore
  try {
    await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    console.debug('[DEBUG] loadTransactions → Firestore sync OK');
  } catch (syncErr) {
    console.error('[ERROR] loadTransactions Firestore sync failed:', syncErr);
  }

  // 4) Luego fetch → render → cache
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);
    console.debug('[DEBUG] loadTransactions → recibidas del servidor:', txs);

    txs.forEach(tx => {
      const legacyCat = tx.category || 'Sin categoría';
      const pf = tx.personal_finance_category;
      let chosen = null;
      if (pf && typeof pf === 'object') {
        if (pf.detailed) chosen = pf.detailed;
        else if (pf.primary) chosen = pf.primary;
      }
      tx.category = chosen
        ? chosen.toLowerCase()
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        : legacyCat;
      tx.accountName = accountMap[tx.account_id] || 'Cuenta desconocida';
      console.debug('[MAPPED TX]', tx.id, 'category:', tx.category, 'accountName:', tx.accountName);
    });

    const byCategory = document.getElementById('toggle-view').checked;
    byCategory ? renderGrouped(txs) : renderChrono(txs);

    await cacheTransactions(idb, txs);
  } catch (err) {
    console.error('❌ loadTransactions error:', err);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
    console.debug('[DEBUG] loadTransactions → fin');
  }
}

// ── Arranca cuando el usuario esté autenticado ───────────────────────────────
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  document.getElementById('toggle-view')
    .addEventListener('change', () => loadTransactions(user.uid));

  loadTransactions(user.uid);
});

// ── Si volvemos online, recargamos ───────────────────────────────────────────
window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
