import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

console.log('[HOME] loaded');

// ── Firestore instance ────────────────────────────────────────────────────
const db = getFirestore(app);

// API URL
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

// ── Request and register background sync & notifications ─────────────────────
async function setupBackgroundFeatures() {
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      console.log('[HOME] Notification permission:', permission);
    } catch (e) {
      console.error('[HOME] Notification request error:', e);
    }
  }

  // Register Service Worker and Sync
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[HOME] SW registered with scope:', registration.scope);

      // One-off sync
      if ('sync' in registration) {
        try {
          await registration.sync.register('sync-transactions');
          console.log('[HOME] One-off sync registered');
        } catch (e) {
          console.warn('[HOME] One-off sync failed:', e);
        }
      }

      // Periodic sync
      if ('periodicSync' in registration) {
        try {
          const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
          console.log('[HOME] periodic-background-sync permission:', status.state);
          if (status.state === 'granted') {
            await registration.periodicSync.register('sync-transactions', {
              minInterval: 15 * 60 * 1000
            });
            console.log('[HOME] periodicSync registered');
          }
        } catch (e) {
          console.warn('[HOME] periodicSync failed:', e);
        }
      }

    } catch (err) {
      console.error('[HOME] SW registration failed:', err);
    }
  }
}

window.addEventListener('load', setupBackgroundFeatures);

// ── DOM & Auth Setup ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('[HOME] DOM ready');

  // Sidebar controls
  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));

  // Logout
  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    try {
      await signOut(auth);
      location.href = '../index.html';
    } catch (e) {
      console.error('[HOME] signOut failed:', e);
    }
  });

  onAuthStateChanged(auth, async user => {
    console.log('[HOME] Auth state changed:', user);
    if (!user) return location.href = '../index.html';

    // Display user name
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
      document.getElementById('user-name').textContent = name;
    } catch (e) {
      console.error('[HOME] Load profile error:', e);
    }

    // App logic
    await manualSync(user.uid);
    await loadBalances(user.uid);
    await saveUID(user.uid);
    await loadMonthlyChart(user.uid);
  });
});

// ── Manual Sync (24h throttle) ─────────────────────────────────────────────
async function manualSync(uid) {
  const key = `lastSync_${uid}`;
  const last = +localStorage.getItem(key);
  if (last && Date.now() - last < 24*60*60*1000) {
    console.log('[HOME] Manual sync skipped');
    return;
  }
  console.log('[HOME] Performing manual sync');
  try {
    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ userId: uid })
    });
    if (res.ok) {
      localStorage.setItem(key, Date.now().toString());
      console.log('[HOME] Manual sync OK');
    } else console.warn('[HOME] Manual sync failed:', res.status);
  } catch (e) {
    console.error('[HOME] Manual sync error:', e);
  }
}

// ── Balances Slider ────────────────────────────────────────────────────────
async function loadBalances(userId) {
  console.log('[HOME] Loading balances for', userId);
  const snap = await getDoc(doc(db, 'users', userId));
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';
  
  for (const { accessToken } of accounts) {
    try {
      const resp = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ accessToken })
      });
      if (!resp.ok) continue;
      const { accounts: accs=[] } = await resp.json();
      const acc = accs[0] || {};
      const slide = document.createElement('div');
      slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <p class="card-title">${acc.name||'Cuenta'}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${(acc.balances?.current||0).toFixed(2)} €</p>
        </div>`;
      slider.appendChild(slide);
    } catch(e) { console.error('[HOME] Balance fetch error:', e); }
  }
  initSlider();
}

function initSlider() {
  const slider = document.querySelector('.balance-slider');
  if (!slider) return;
  const slides = Array.from(slider.children);
  let idx = 0;
  const dots = document.getElementById('balance-dots');
  const prev = document.getElementById('balance-prev');
  const next = document.getElementById('balance-next');
  dots.innerHTML = '';
  slides.forEach((_,i)=>{
    const d = document.createElement('div');
    d.className = `slider-dot${i===0?' active':''}`;
    d.onclick = ()=>{ idx=i; update(); };
    dots.appendChild(d);
  });
  prev.onclick = ()=>{ idx = (idx-1+slides.length)%slides.length; update(); };
  next.onclick = ()=>{ idx = (idx+1)%slides.length; update(); };
  function update() {
    slider.style.transform = `translateX(-${idx*100}%)`;
    dots.childNodes.forEach((d,i)=>d.classList.toggle('active', i===idx));
  }
  update();
}

// ── Save UID ──────────────────────────────────────────────────────────────
async function saveUID(uid) {
  if (!('indexedDB' in window)) return;
  const req = indexedDB.open('fintrack-db',1);
  req.onupgradeneeded = ()=> req.result.createObjectStore('metadata');
  req.onsuccess = ()=>{
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = ()=> db.close();
  };
}

// ── Monthly Chart ────────────────────────────────────────────────────────
let monthlyChart;
async function loadMonthlyChart(userId) {
  console.log('[HOME] Loading chart for', userId);
  const col = collection(db, 'users', userId, 'historySummary');
  let snap;
  try { snap = await getDocsFromServer(col); }
  catch { snap = await getDocs(col); }
  const docs = snap.docs.sort((a,b)=>a.id.localeCompare(b.id));
  const categories = docs.map(d=>d.id);
  const expenses = docs.map(d=>d.data().totalExpenses||0);
  const incomes  = docs.map(d=>d.data().totalIncomes||0);
  const opts = { chart:{type:'bar',toolbar:{show:false}}, series:[{name:'Gastos',data:expenses},{name:'Ingresos',data:incomes}], plotOptions:{bar:{borderRadius:4,columnWidth:'40%'}}, dataLabels:{enabled:true,offsetY:-10,style:{fontSize:'12px'},formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)}, xaxis:{categories}, yaxis:{labels:{formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)}}, tooltip:{y:{formatter:v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(v)}}, legend:{position:'bottom'}, grid:{borderColor:'#eee'}};
  const el = document.querySelector('#monthlyChart');
  if (!el) return;
  el.innerHTML='';
  if (monthlyChart) monthlyChart.destroy();
  monthlyChart = new ApexCharts(el, opts);
  monthlyChart.render();
}
