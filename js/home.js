// js/home.js

import { auth, app } from './firebase.js';
import {
  doc,
  getDoc,
  getFirestore,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';
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

      if ('periodicSync' in reg) {
        try {
          await reg.periodicSync.register('sync-transactions', {
            minInterval: 24 * 60 * 60 * 1000  // 24h
          });
          console.log('[SYNC] periodicSync registered');
        } catch (err) {
          console.warn('[SYNC] periodicSync failed:', err);
        }
      }
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOMContentLoaded');
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
      window.location.href = '../index.html';
      return;
    }

    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    try {
      const snap = await getDoc(uRef);
      const data = snap.exists() ? snap.data() : {};
      console.log('[HOME] user data:', data);

      const name = [data.firstName, data.lastName]
        .filter(Boolean).join(' ') || 'Usuario';
      updateWelcome(name);

      console.log('[HOME] Manual sync');
      await doManualSync(user.uid);

      console.log('[HOME] Load balances');
      await loadBalances(user.uid);

      console.log('[HOME] Save UID to IndexedDB');
      await saveUIDToIndexedDB(user.uid);

      console.log('[HOME] Load monthly chart');
      await loadMonthlyChart(user.uid);

    } catch (err) {
      console.error('[HOME] Error initializing home:', err);
      updateWelcome('Usuario');
    }
  });

  closeSidebar.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });
});

// ── Carga de saldos ─────────────────────────────────────────────────────────
async function loadBalances(userId) {
  console.log('[BALANCE] loadBalances →', userId);
  const db = getFirestore(app);
  const uRef = doc(db, 'users', userId);

  let accounts = [];
  try {
    const snap = await getDoc(uRef);
    accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
    console.log('[BALANCE] accounts:', accounts);
  } catch (err) {
    console.error('[BALANCE] Error fetching accounts:', err);
  }

  const slider = document.querySelector('.balance-slider');
  if (!slider) return;
  slider.innerHTML = '';

  for (const [i, { accessToken }] of accounts.entries()) {
    console.log(`[BALANCE] account #${i}, token:`, accessToken);
    try {
      const res  = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });
      const { accounts: accs = [], institution } = await res.json();
      const acc = accs[0] || {};
      const name = acc.name || 'Cuenta';
      const bal  = acc.balances?.current ?? 0;

      let logo = '/img/default_bank.png';
      if (institution?.logo) {
        logo = `data:image/png;base64,${institution.logo}`;
      } else if (institution?.url) {
        logo = `${institution.url.replace(/\/$/, '')}/favicon.ico`;
      }

      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <img src="${logo}" class="card-logo" alt="Logo">
          <p class="card-title">${name}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${bal.toFixed(2)} €</p>
        </div>
      `;
      slider.appendChild(slide);
    } catch (err) {
      console.error('[BALANCE] Error for account #'+i, err);
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
  if (!slider || !prev || !next || !dots) return;

  let idx = 0, total = slides.length;
  dots.innerHTML = '';

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { idx = i; update(); });
    dots.appendChild(dot);
  });

  prev.addEventListener('click',  () => { idx = (idx-1+total)%total; update(); });
  next.addEventListener('click',  () => { idx = (idx+1)%total;    update(); });

  function update() {
    slider.style.transform = `translateX(-${idx*100}%)`;
    Array.from(dots.children).forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  update();
}

// ── Manual Sync ───────────────────────────────────────────────────────────────
async function doManualSync(uid) {
  console.log('[SYNC] doManualSync →', uid);
  const key = `lastSync_${uid}`;
  const last = parseInt(localStorage.getItem(key) || '0', 10);
  const now  = Date.now();

  if (!last || now - last > 86400000) {
    try {
      const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ userId: uid })
      });
      const json = await res.json();
      console.log('[SYNC] result:', json);
      if (res.ok) localStorage.setItem(key, now.toString());
    } catch (err) {
      console.error('[SYNC] failed:', err);
    }
  } else {
    console.log('[SYNC] skipped, synced recently');
  }
}

// ── IndexedDB UID ────────────────────────────────────────────────────────────
async function saveUIDToIndexedDB(uid) {
  console.log('[DB] saveUIDToIndexedDB →', uid);
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('metadata');
  req.onsuccess = () => {
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = () => db.close();
  };
}

// ── Cargar y dibujar gráfica mensual con escala logarítmica ──────────────
async function loadMonthlyChart(userId) {
  console.log('[CHART] loadMonthlyChart →', userId);
  const db = getFirestore(app);
  const col = collection(db,'users',userId,'history');
  let snap;
  try { snap = await getDocsFromServer(col); }
  catch { snap = await getDocs(col); }

  const allMonths = snap.docs.map(d=>d.id).sort();
  console.log('[CHART] allMonths:', allMonths);

  // filtrar últimos 12 meses
  const limit = new Date();
  limit.setMonth(limit.getMonth()-11);
  const months = allMonths.filter(m=>{
    const [y,mo]=m.split('-').map(Number);
    return new Date(y,mo-1,1) >= limit;
  });
  console.log('[CHART] filtered months:', months);

  const expenses=[], incomes=[];
  for (const m of months) {
    let e=0,i=0;
    let itemsSnap;
    const itemsCol = collection(db,'users',userId,'history',m,'items');
    try { itemsSnap = await getDocsFromServer(itemsCol); }
    catch{ itemsSnap = await getDocs(itemsCol); }
    itemsSnap.forEach(doc=> {
      const amt = doc.data().amount || 0;
      if (amt<0) e+=Math.abs(amt); else i+=amt;
    });
    console.log(`[CHART] ${m} e=${e}, i=${i}`);
    expenses.push(e);
    incomes.push(i);
  }

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctx, {
    type:'bar',
    data:{ labels:months, datasets:[
      { label:'Gastos',   data:expenses, backgroundColor:'#FF6384', yAxisID:'y' },
      { label:'Ingresos', data:incomes,  backgroundColor:'#36A2EB', yAxisID:'y' }
    ]},
    options:{
      responsive:true,
      scales:{
        y:{
          type:'logarithmic',
          title:{ display:true, text:'€' },
          ticks:{
            callback:v=>{
              const p = 10**Math.floor(Math.log10(v));
              return v%p===0 ? `${v}€` : '';
            }
          }
        }
      },
      plugins:{
        legend:{ position:'bottom' },
        tooltip:{ callbacks:{ label:ctx=>`${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €` } }
      }
    }
  });
  console.log('[CHART] Log chart rendered');
}
