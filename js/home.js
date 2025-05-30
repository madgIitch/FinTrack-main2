// js/home.js

import { auth, app } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('home.js loaded');

// ── URL de tu API (ajústala según entorno) ─────────────────────────────────
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

  // ── Registrar Service Worker con Parcel ─────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[SW] Registered with scope:', reg.scope);
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
    userNameSpan.textContent = name;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    try {
      const snap = await getDoc(uRef);
      const data = snap.exists() ? snap.data() : {};
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
      updateWelcome(name);

      // ── Sincronización manual al inicio ────────────────────────────────
      await doManualSync(user.uid);

      // ── Carga de saldos ────────────────────────────────────────────────
      await loadBalances(user.uid);

      // ── Guardar UID en IndexedDB para Periodic Sync ───────────────────
      await saveUIDToIndexedDB(user.uid);

    } catch (e) {
      console.error('Error cargando usuario:', e);
      updateWelcome('Usuario');
    }
  });

  closeSidebar.onclick = () => sidebar.classList.remove('open');
  logoutLink.onclick = async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  };
});

async function loadBalances(userId) {
  console.log('[DEBUG] loadBalances → userId:', userId);
  const db   = getFirestore(app);
  const uRef = doc(db, 'users', userId);
  const snap = await getDoc(uRef);
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  console.log('[DEBUG] Firestore accounts:', accounts);

  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  for (const [i, { accessToken }] of accounts.entries()) {
    console.log(`[DEBUG] Processing account #${i}`, accessToken);
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const { accounts: accs, institution } = await res.json();
      const acc = accs?.[0] || {};
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

    } catch (err) {
      console.error(`[ERROR] get_account_details #${i}:`, err);
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
  let idx = 0;
  const total = slides.length;
  if (total < 2) return;

  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => { idx = i; update(); });
    dots.appendChild(d);
  });

  prev.onclick = () => { idx = (idx - 1 + total) % total; update(); };
  next.onclick = () => { idx = (idx + 1) % total; update(); };

  function update() {
    slider.style.transform = `translateX(-${idx * 100}%)`;
    Array.from(dots.children).forEach((dot, i) =>
      dot.classList.toggle('active', i === idx)
    );
  }
  update();
}

// ── Sincronización manual de transacciones a Firestore ────────────────
async function doManualSync(uid) {
  const lastSyncKey = `lastSync_${uid}`;
  const last = localStorage.getItem(lastSyncKey);
  const now = Date.now();

  if (!last || now - parseInt(last) > 24 * 60 * 60 * 1000) {
    console.log('[SYNC] Ejecutando sincronización manual');
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      });
      const result = await res.json();
      console.log('[SYNC] Resultado manual:', result);
      localStorage.setItem(lastSyncKey, now.toString());
    } catch (err) {
      console.error('[SYNC] Error manual:', err);
    }
  } else {
    console.log('[SYNC] Ya sincronizado en las últimas 24 h');
  }
}

async function saveUIDToIndexedDB(uid) {
  if (!('indexedDB' in window)) return;
  const openReq = indexedDB.open('fintrack-db', 1);
  openReq.onupgradeneeded = () => {
    openReq.result.createObjectStore('metadata');
  };
  openReq.onsuccess = () => {
    const db = openReq.result;
    const tx = db.transaction('metadata', 'readwrite');
    tx.objectStore('metadata').put(uid, 'userId');
    tx.oncomplete = () => db.close();
  };
}
