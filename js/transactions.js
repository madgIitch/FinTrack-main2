import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { openDB } from 'idb';  // <-- ahora importamos openDB directamente

// ----------------------------------------------------------------
// Configuración de la API Cloud Function
// ----------------------------------------------------------------
const apiUrl =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ----------------------------------------------------------------
// Constantes de IndexedDB
// ----------------------------------------------------------------
const DB_NAME = 'fintrack-cache';
const STORE_NAME = 'transactions';
const DB_VERSION = 1;

// ----------------------------------------------------------------
// Inicializa o actualiza la base de datos
// ----------------------------------------------------------------
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

// ----------------------------------------------------------------
// Guarda transacciones en caché
// ----------------------------------------------------------------
async function cacheTransactions(db, txs) {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  for (const t of txs) {
    await tx.store.put(t);
  }
  await tx.done;
}

// ----------------------------------------------------------------
// Lee todas las transacciones de la caché
// ----------------------------------------------------------------
async function readCachedTransactions(db) {
  return db.getAll(STORE_NAME);
}

// ----------------------------------------------------------------
// Agrupa transacciones por categoría
// ----------------------------------------------------------------
function groupByCategory(txs) {
  return txs.reduce((groups, tx) => {
    const cat = tx.category || 'Sin categoría';
    ;(groups[cat] = groups[cat] || []).push(tx);
    return groups;
  }, {});
}

// ----------------------------------------------------------------
// Renderiza las transacciones en el DOM
// ----------------------------------------------------------------
function renderTransactions(groups) {
  const list = document.getElementById('transactions-list');
  list.innerHTML = '';

  for (const [cat, txs] of Object.entries(groups)) {
    const section = document.createElement('div');
    section.className = 'category-group';
    section.innerHTML = `<h3>${cat}</h3>`;

    txs.forEach((tx) => {
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <span class="date">${new Date(tx.date).toLocaleDateString()}</span>
        <div class="desc">${tx.description}</div>
        <span class="amount ${tx.amount < 0 ? 'debit' : 'credit'}">
          ${tx.amount < 0 ? '−' : '+'}${Math.abs(tx.amount).toFixed(2)} €
        </span>
      `;
      section.appendChild(item);
    });

    list.appendChild(section);
  }
}

// ----------------------------------------------------------------
// Mostrar/ocultar indicadores de estado
// ----------------------------------------------------------------
function showOffline(msg) {
  const ind = document.getElementById('offline-indicator');
  ind.textContent = msg || 'Estás sin conexión. Mostrando datos en caché.';
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
// Llama al endpoint de tu función para traer transacciones de Plaid
// ----------------------------------------------------------------
async function fetchTransactionsFromPlaid(userId) {
  const res = await fetch(`${apiUrl}/plaid/get_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Error al obtener transacciones desde Plaid');
  const { transactions } = await res.json();
  return transactions;
}

// ----------------------------------------------------------------
// Flujo principal: caché → render → fetch online → actualizar cache+UI
// ----------------------------------------------------------------
async function loadTransactions(userId) {
  const db = await initDB();

  // 1) Mostrar de la caché
  const cached = await readCachedTransactions(db);
  if (cached.length) {
    renderTransactions(groupByCategory(cached));
  }

  // 2) Si OFFLINE
  if (!navigator.onLine) {
    showOffline();
    hideLoading();
    return;
  }

  // 3) En línea: fetch → render → cache
  hideOffline();
  showLoading();
  try {
    const txs = await fetchTransactionsFromPlaid(userId);
    renderTransactions(groupByCategory(txs));
    await cacheTransactions(db, txs);
  } catch (err) {
    console.error(err);
    showOffline('No se pudieron actualizar datos, mostrando caché.');
  } finally {
    hideLoading();
  }
}

// ----------------------------------------------------------------
// Cuando el usuario esté autenticado, arrancamos todo
// ----------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loadTransactions(user.uid);
  } else {
    window.location.href = '../index.html';
  }
});

// ----------------------------------------------------------------
// Si volvemos online, recargamos
// ----------------------------------------------------------------
window.addEventListener('online', () => {
  if (auth.currentUser) loadTransactions(auth.currentUser.uid);
});
