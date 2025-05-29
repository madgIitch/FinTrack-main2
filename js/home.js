import { auth, app } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('home.js loaded');

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

      // Carga balances
      await loadBalances(user.uid);

      // Sincronización (periodic + manual)
      await setupTransactionSync(user.uid);

      // Guarda UID para el SW
      await saveUIDToIndexedDB(user.uid);

    } catch (e) {
      console.error('Error cargando usuario:', e);
      updateWelcome('Usuario');
    }
  });

  closeSidebar.onclick = () => sidebar.classList.remove('open');
  logoutLink.onclick   = async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  };
});

async function loadBalances(userId) {
  console.log('[DEBUG] loadBalances → userId:', userId);
  const db       = getFirestore(app);
  const uRef     = doc(db, 'users', userId);
  const snap     = await getDoc(uRef);
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  console.log('[DEBUG] Firestore accounts:', accounts);

  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

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
      console.log(`[DEBUG] HTTP status #${i}:`, res.status);
      const { accounts: accs, institution } = await res.json();
      console.log(`[DEBUG] Response #${i}:`, { accs, institution });

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

      // logo desactivado
      // const img = document.createElement('img');
      // img.src       = logoSrc;
      // img.alt       = `${accountName} logo`;
      // img.className = 'card-logo';
      // card.appendChild(img);

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

// Parcel-compatible SW registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('./service-worker.js', import.meta.url))
      .then(reg => console.log('[SW] Registered', reg))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

async function setupTransactionSync(uid) {
  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await reg.periodicSync.register('sync-transactions', { minInterval: 24*60*60*1000 });
      console.log('[SYNC] periodicSync registrado');
    } catch (e) {
      console.warn('[SYNC] No se pudo registrar periodicSync:', e);
    }
  }

  // Siempre forzamos la primera sincronización
  await doManualSync(uid, apiUrl);
}

async function doManualSync(uid, apiUrl) {
  const lastKey = `lastSync_${uid}`;
  const last = localStorage.getItem(lastKey);
  const now  = Date.now();

  if (!last || now - parseInt(last) > 24*60*60*1000) {
    console.log('[SYNC] Ejecutando sync manual');
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ userId: uid })
      });
      console.log('[SYNC] Resultado manual:', await res.json());
      localStorage.setItem(lastKey, now.toString());
    } catch (e) {
      console.error('[SYNC] Error manual:', e);
    }
  } else {
    console.log('[SYNC] Ya sincronizado hoy');
  }
}

async function saveUIDToIndexedDB(uid) {
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db',1);
  req.onupgradeneeded = () => req.result.createObjectStore('metadata');
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = () => db.close();
  };
}
