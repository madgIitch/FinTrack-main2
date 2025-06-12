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

console.log('[HOME] loaded');

// API URL
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';
console.log('[HOME] apiUrl set to', apiUrl);

// Register service worker & periodicSync
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    console.log('[SW] Registering service worker...');
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('../service-worker.js', import.meta.url),
        { scope: '/' }
      );
      console.log('[SW] Registered SW with scope:', reg.scope);
      if ('periodicSync' in reg) {
        console.log('[SW] Attempting periodicSync...');
        try {
          await reg.periodicSync.register('sync-transactions', { minInterval: 86400000 });
          console.log('[SW] periodicSync registered');
        } catch (err) {
          console.warn('[SW] periodicSync registration failed:', err);
        }
      }
    } catch (e) {
      console.error('[SW] SW registration failed:', e);
    }
  });
}

// DOM ready
console.log('[HOME] Waiting for DOMContentLoaded');
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[HOME] DOMContentLoaded fired');
  const sidebar      = document.getElementById('sidebar');
  const openSidebar  = document.getElementById('open-sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutBtn    = document.getElementById('logout-link');
  const userNameSpan = document.getElementById('user-name');

  // Sidebar logic
  openSidebar.addEventListener('click', () => console.log('[UI] Opening sidebar') || sidebar.classList.add('open'));
  closeSidebar.addEventListener('click', () => console.log('[UI] Closing sidebar') || sidebar.classList.remove('open'));
  logoutBtn.addEventListener('click', async (e) => {
    console.log('[AUTH] logout clicked');
    e.preventDefault();
    await signOut(auth);
    console.log('[AUTH] User signed out');
    window.location.href = '../index.html';
  });

  function updateWelcome(name) {
    console.log('[AUTH] updateWelcome:', name);
    userNameSpan.textContent = name;
  }

  console.log('[AUTH] Setting up onAuthStateChanged');
  onAuthStateChanged(auth, async (user) => {
    console.log('[AUTH] onAuthStateChanged callback, user:', user);
    if (!user) {
      console.log('[AUTH] No user detected, redirecting');
      window.location.href = '../index.html';
      return;
    }
    console.log('[AUTH] User authenticated:', user.uid);
    const db   = getFirestore(app);
    const uRef = doc(db, 'users', user.uid);

    // Load user's name
    console.log('[AUTH] Fetching user document');
    const snap = await getDoc(uRef);
    console.log('[AUTH] getDoc returned exists:', snap.exists());
    const data = snap.exists() ? snap.data() : {};
    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Usuario';
    updateWelcome(fullName);

    console.log('[HOME] Before syncAllCollections');
    await syncAllCollections(user.uid);
    console.log('[HOME] After syncAllCollections');

    console.log('[HOME] Before loadBalances');
    await loadBalances(user.uid);
    console.log('[HOME] After loadBalances');

    console.log('[HOME] Before saveUIDToIndexedDB');
    await saveUIDToIndexedDB(user.uid);
    console.log('[HOME] After saveUIDToIndexedDB');

    console.log('[HOME] Before loadMonthlyChart');
    await loadMonthlyChart(user.uid);
    console.log('[HOME] After loadMonthlyChart');
  });
});

/**
 * Sync all Firestore history collections
 */
async function syncAllCollections(uid) {
  console.log('[SYNC] syncAllCollections start for', uid);
  try {
    console.log('[SYNC] Sending POST to', `${apiUrl}/plaid/sync_transactions_and_store`);
    const res = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
      body: JSON.stringify({ userId: uid })
    });
    console.log('[SYNC] fetch returned status', res.status);
    const json = await res.json();
    console.log('[SYNC] Response body:', json);
    if (res.ok && json.success) {
      console.log('[SYNC] syncAllCollections succeeded');
    } else {
      console.error('[SYNC] syncAllCollections failed:', res.status, json.error || json);
    }
  } catch (err) {
    console.error('[SYNC] syncAllCollections error:', err);
  }
  console.log('[SYNC] syncAllCollections end for', uid);
}

// Load and render balance slider
async function loadBalances(userId) {
  console.log('[BALANCE] loadBalances start for', userId);
  const db = getFirestore(app);
  const uRef = doc(db, 'users', userId);
  const slider = document.querySelector('.balance-slider');
  slider.innerHTML = '';

  const snap = await getDoc(uRef);
  console.log('[BALANCE] user doc exists:', snap.exists());
  const accounts = snap.exists() ? snap.data().plaid?.accounts || [] : [];
  console.log('[BALANCE] accounts count:', accounts.length);

  for (const { accessToken } of accounts) {
    console.log('[BALANCE] Fetching details for token', accessToken);
    try {
      const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, mode: 'cors',
        body: JSON.stringify({ accessToken })
      });
      console.log('[BALANCE] get_account_details status:', res.status);
      const { accounts: accs = [], institution } = await res.json();
      console.log('[BALANCE] got', accs.length, 'accounts');
      const acc = accs[0] || {};
      const name = acc.name || 'Cuenta';
      const bal  = acc.balances?.current ?? 0;
      let logo = '/img/default_bank.png';
      if (institution?.logo) logo = `data:image/png;base64,${institution.logo}`;
      else if (institution?.url) logo = `${institution.url.replace(/\/$/, '')}/favicon.ico`;

      const slide = document.createElement('div'); slide.className = 'balance-slide';
      slide.innerHTML = `
        <div class="card">
          <img src="${logo}" class="card-logo" alt="Logo">
          <p class="card-title">${name}</p>
          <p class="card-subtitle">Saldo actual</p>
          <p class="card-balance">${bal.toFixed(2)} €</p>
        </div>`;
      slider.appendChild(slide);
    } catch (e) {
      console.error('[BALANCE] error fetching account details:', e);
    }
  }
  console.log('[BALANCE] initializing slider with slides:', slider.children.length);
  initBalanceSlider();
}

// Initialize balance slider
function initBalanceSlider() {
  console.log('[SLIDER] initBalanceSlider');
  const slider = document.querySelector('.balance-slider');
  const slides = Array.from(slider.children);
  const prev   = document.getElementById('balance-prev');
  const next   = document.getElementById('balance-next');
  const dots   = document.getElementById('balance-dots');
  if (!slider) return;
  console.log('[SLIDER] slides length:', slides.length);

  let idx = 0; const total = slides.length;
  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i===0? ' active' : '');
    d.onclick = () => { idx = i; update(); };
    dots.appendChild(d);
  });
  prev.onclick = () => { idx=(idx-1+total)%total; update(); };
  next.onclick = () => { idx=(idx+1)%total; update(); };

  function update() {
    console.log('[SLIDER] update slide idx:', idx);
    slider.style.transform = `translateX(-${idx*100}%)`;
    dots.childNodes.forEach((d,i)=>d.classList.toggle('active', i===idx));
  }
  update();
}

// Save UID to IndexedDB
async function saveUIDToIndexedDB(uid) {
  console.log('[IDB] saveUIDToIndexedDB start for', uid);
  if (!('indexedDB' in window)) { console.warn('[IDB] IndexedDB not supported'); return; }
  const req = indexedDB.open('fintrack-db',1);
  req.onupgradeneeded = () => { console.log('[IDB] onupgradeneeded'); req.result.createObjectStore('metadata'); };
  req.onsuccess = () => {
    console.log('[IDB] DB opened');
    const db = req.result;
    const tx = db.transaction('metadata','readwrite');
    tx.objectStore('metadata').put(uid,'userId');
    tx.oncomplete = () => { console.log('[IDB] UID saved'); db.close(); };
  };
  req.onerror = (e) => console.error('[IDB] error opening DB:', e);
}

// Load monthly chart
async function loadMonthlyChart(userId) {
  console.log('[CHART] loadMonthlyChart start for', userId);
  const db  = getFirestore(app);
  const col = collection(db, 'users', userId, 'history');
  let snap;
  try { console.log('[CHART] getDocsFromServer'); snap = await getDocsFromServer(col); }
  catch (err) { console.warn('[CHART] getDocsFromServer failed:', err); snap = await getDocs(col); }
  const allMonths = snap.docs.map(d=>d.id).sort();
  console.log('[CHART] allMonths:', allMonths);
  const cutoff=new Date(); cutoff.setMonth(cutoff.getMonth()-11);
  const months = allMonths.filter(m=>{ const [y,M]=m.split('-').map(Number); return new Date(y,M-1,1)>=cutoff; });
  console.log('[CHART] filtered months:', months);
  const expenses=[], incomes=[];
  for(const m of months) {
    console.log('[CHART] processing month', m);
    const itemsCol=collection(db,'users',userId,'history',m,'items');
    let itemsSnap;
    try{ itemsSnap=await getDocsFromServer(itemsCol); }
    catch{ itemsSnap=await getDocs(itemsCol); }
    let e=0,i=0;
    itemsSnap.forEach(doc=>{const amt=doc.data().amount||0; amt<0?e+=Math.abs(amt):i+=amt;});
    console.log(`[CHART] month ${m} e:${e} i:${i}`);
    expenses.push(e); incomes.push(i);
  }
  const options={chart:{type:'bar',height:350,toolbar:{show:false}},series:[{name:'Gastos',data:expenses},{name:'Ingresos',data:incomes}],colors:['#e74c3c','#3498db'],dataLabels:{enabled:true,formatter:v=>v.toFixed(2),style:{colors:['#333']}},xaxis:{categories:months,labels:{style:{colors:'#555'}}},yaxis:{logarithmic:true,title:{text:'€ (escala log)',style:{color:'#555'}},labels:{formatter:v=>`${v.toFixed(2)} €`,style:{colors:'#555'}}},plotOptions:{bar:{borderRadius:4,columnWidth:'40%'}},tooltip:{y:{formatter:v=>`${v.toFixed(2)} €`}},legend:{position:'bottom',labels:{colors:'#666'}},grid:{borderColor:'#eee'}};
  console.log('[CHART] rendering chart');
  const chartEl=document.querySelector('#monthlyChart'); chartEl.innerHTML='';
  const chart=new ApexCharts(chartEl,options);
  chart.render(); console.log('[CHART] chart rendered');
}
