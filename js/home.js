// js/home.js

import { auth, app } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('[HOME] home.js loaded');

// ── URL de tu API (ajústala según entorno) ─────────────────────────────────
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── Registrar y programar periodicSync ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[SW] Registered with scope:', reg.scope);

      // Aquí registramos el Periodic Sync
      if ('periodicSync' in reg) {
        try {
          await reg.periodicSync.register('sync-transactions', {
            minInterval: 24 * 60 * 60 * 1000  // 24 h en ms
          });
          console.log('[SYNC] periodicSync registered');
        } catch (err) {
          console.warn('[SYNC] Could not register periodicSync:', err);
        }
      }
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const userNameSpan = document.getElementById('user-name');
  const sidebar      = document.getElementById('sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutLink   = document.getElementById('logout-link');

  function updateWelcome(name) {
    console.log('[HOME] updateWelcome →', name);
    userNameSpan.textContent = name;
  }

  onAuthStateChanged(auth, async (user) => {
    console.log('[HOME] onAuthStateChanged → user:', user);
    if (!user) {
      console.log('[HOME] No user logged in, redirecting to index.html');
      window.location.href = '../index.html';
      return;
    }

    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    try {
      const snap = await getDoc(uRef);
      const data = snap.exists() ? snap.data() : {};
      console.log('[HOME] Firestore user data:', data);

      const name = [data.firstName, data.lastName]
        .filter(Boolean)
        .join(' ') || 'Usuario';
      updateWelcome(name);

      // ── Sincronización manual al inicio ────────────────────────────────
      await doManualSync(user.uid);

      // ── Carga de saldos ────────────────────────────────────────────────
      await loadBalances(user.uid);

      // ── Guardar UID en IndexedDB para Periodic Sync ───────────────────
      await saveUIDToIndexedDB(user.uid);
      console.log('[HOME] UID saved to IndexedDB for periodicSync:', user.uid);

    } catch (e) {
      console.error('[HOME] Error loading user from Firestore:', e);
      updateWelcome('Usuario');
    }
  });

  closeSidebar.addEventListener('click', () => {
    console.log('[HOME] closeSidebar clicked');
    sidebar.classList.remove('open');
  });

  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    console.log('[HOME] logoutLink clicked, signing out');
    try {
      await signOut(auth);
      console.log('[HOME] User signed out');
      window.location.href = '../index.html';
    } catch (err) {
      console.error('[HOME] Error signing out:', err);
    }
  });
});

async function loadBalances(userId) {
  console.log('[DEBUG] loadBalances → userId:', userId);
  const db   = getFirestore(app);
  const uRef = doc(db, 'users', userId);
  let accounts = [];

  try {
    const snap = await getDoc(uRef);
    accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
    console.log('[DEBUG] Firestore accounts list:', accounts);
  } catch (err) {
    console.error('[DEBUG] Error fetching Firestore user document for balances:', err);
  }

  const slider = document.querySelector('.balance-slider');
  if (!slider) {
    console.warn('[DEBUG] loadBalances → .balance-slider not found in DOM');
    return;
  }

  slider.innerHTML = '';

  for (const [i, { accessToken }] of accounts.entries()) {
    console.log(`[DEBUG] Processing account #${i}, accessToken:`, accessToken);
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      console.log(`[DEBUG] get_account_details status for account #${i}:`, res.status);
      const data = await res.json();
      console.log(`[DEBUG] get_account_details response for account #${i}:`, data);

      const { accounts: accs = [], institution } = data;
      const acc = accs[0] || {};
      const accountName = acc.name || 'Cuenta';
      const bal = acc.balances?.current ?? 0;

      let logoSrc = '/img/default_bank.png';
      const base64Logo = institution?.logo;
      if (base64Logo) {
        logoSrc = `data:image/png;base64,${base64Logo}`;
      } else if (institution?.url) {
        const origin = institution.url.replace(/\/$/, '');
        logoSrc = `${origin}/favicon.ico`;
      }

      const slide = document.createElement('div');
      slide.className = 'balance-slide';

      const card = document.createElement('div');
      card.className = 'card';

      const title = document.createElement('p');
      title.className   = 'card-title';
      title.textContent = accountName;
      card.appendChild(title);

      const subtitle = document.createElement('p');
      subtitle.className   = 'card-subtitle';
      subtitle.textContent = 'Saldo actual';
      card.appendChild(subtitle);

      const balance = document.createElement('p');
      balance.className   = 'card-balance';
      balance.textContent = `${bal.toFixed(2)} €`;
      card.appendChild(balance);

      slide.appendChild(card);
      slider.appendChild(slide);
      console.log(`[DEBUG] Added slide for account #${i} (${accountName}) with balance ${bal}`);

    } catch (err) {
      console.error(`[ERROR] get_account_details for account #${i}:`, err);
    }
  }

  initBalanceSlider();
}

function initBalanceSlider() {
  const slider = document.querySelector('.balance-slider');
  const slides = Array.from(slider.children);
  const prev   = document.getElementById('balance-prev');
  const next   = document.getElementById('balance-next');
  const dots   = document.getElementById('balance-dots');

  if (!slider || !prev || !next || !dots) {
    console.warn('[SLIDER] initBalanceSlider → Missing DOM elements for slider');
    return;
  }

  let idx = 0;
  const total = slides.length;
  console.log('[SLIDER] initBalanceSlider → total slides:', total);
  if (total < 2) return;

  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { idx = i; update(); });
    dots.appendChild(d);
  });

  prev.addEventListener('click', () => {
    idx = (idx - 1 + total) % total;
    update();
  });
  next.addEventListener('click', () => {
    idx = (idx + 1) % total;
    update();
  });

  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    Array.from(dots.children).forEach((dot, i) =>
      dot.classList.toggle('active', i === idx)
    );
    console.log('[SLIDER] update → current index:', idx);
  }
  update();
}

// ── Sincronización manual de transacciones a Firestore ─────────────────────
async function doManualSync(uid) {
  const lastSyncKey = `lastSync_${uid}`;
  const last = localStorage.getItem(lastSyncKey);
  const now = Date.now();

  console.log('[SYNC] doManualSync → last:', last, 'now:', now);
  if (!last || now - parseInt(last) > 24 * 60 * 60 * 1000) {
    console.log('[SYNC] Running manual sync now…');
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      });

      console.log('[SYNC] sync_transactions_and_store HTTP status:', res.status);

      let result = {};
      try {
        result = await res.json();
      } catch (jsonErr) {
        console.error('[SYNC] Error parsing JSON from sync_transactions_and_store:', jsonErr);
      }
      console.log('[SYNC] sync_transactions_and_store response JSON:', result);

      if (res.ok && result.success) {
        console.log('[SYNC] Synchronization successful:', result.message || result);
        localStorage.setItem(lastSyncKey, now.toString());
      } else {
        console.warn('[SYNC] sync_transactions_and_store returned an error:', result);
      }
    } catch (err) {
      console.error('[SYNC] Error performing manual fetch:', err);
    }
  } else {
    console.log('[SYNC] Already synced in the last 24 h');
  }
}

async function saveUIDToIndexedDB(uid) {
  console.log('[DB] saveUIDToIndexedDB → uid:', uid);
  if (!('indexedDB' in window)) {
    console.warn('[DB] IndexedDB not supported');
    return;
  }
  const openReq = indexedDB.open('fintrack-db', 1);
  openReq.onupgradeneeded = () => {
    console.log('[DB] saveUIDToIndexedDB → onupgradeneeded, creating "metadata" store');
    openReq.result.createObjectStore('metadata');
  };
  openReq.onsuccess = () => {
    const db = openReq.result;
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(uid, 'userId');
    tx.oncomplete = () => {
      console.log('[DB] saveUIDToIndexedDB → UID stored, closing DB');
      db.close();
    };
  };
  openReq.onerror = () => {
    console.error('[DB] saveUIDToIndexedDB → Error opening IndexedDB:', openReq.error);
  };
}
