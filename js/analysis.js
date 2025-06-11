// js/analysis.js

import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';

console.log('[ANALYSIS] loaded');

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOMContentLoaded');

  // Lógica del sidebar
  const sidebar      = document.getElementById('sidebar');
  const openSidebar  = document.getElementById('open-sidebar');
  const closeSidebar = document.getElementById('close-sidebar');
  const logoutBtn    = document.getElementById('logout-link');

  openSidebar.addEventListener('click',  () => sidebar.classList.add('open'));
  closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));
  logoutBtn.addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  // Filters (demo)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active').classList.remove('active');
      btn.classList.add('active');
      // recargar datos según btn.dataset.filter
    });
  });
  document.getElementById('period-select').addEventListener('change', e => {
    console.log('Periodo:', e.target.value);
    // recargar datos según periodo
  });

  // Auth + load
  onAuthStateChanged(auth, user => {
    if (!user) return window.location.href = '../index.html';
    loadAnalysis(user.uid).catch(console.error);
  });
});

async function loadAnalysis(userId) {
  const db = getFirestore(app);

  // 1) Fetch last 7 periods
  const histCol = collection(db, 'users', userId, 'history');
  let snap;
  try { snap = await getDocsFromServer(histCol); }
  catch { snap = await getDocs(histCol); }
  const periods = snap.docs.map(d => d.id).sort().slice(-7);

  const labels  = [];
  const revenue = [];
  const spend   = [];

  for (const p of periods) {
    labels.push(p);
    const itemsCol = collection(db, 'users', userId, 'history', p, 'items');
    let itemsSnap;
    try { itemsSnap = await getDocsFromServer(itemsCol); }
    catch { itemsSnap = await getDocs(itemsCol); }

    let rev = 0, spd = 0;
    itemsSnap.forEach(doc => {
      const amt = doc.data().amount || 0;
      amt >= 0 ? rev += amt : spd += Math.abs(amt);
    });
    revenue.push(+rev.toFixed(2));
    spend.push(+spd.toFixed(2));
  }

  // 2) Actualizar KPIs
  const totalRev = revenue.reduce((a,b) => a+b, 0);
  const totalSpd = spend.reduce((a,b) => a+b, 0);
  document.getElementById('kpi-revenue').textContent      = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent        = `€${totalSpd.toFixed(2)}`;
  document.getElementById('kpi-revenue-change').textContent = totalRev
    ? `+${((revenue.at(-1) / (totalRev - revenue.at(-1)) -1)*100).toFixed(1)}% vs last` 
    : '+0% vs last';
  document.getElementById('kpi-spend-change').textContent = totalSpd
    ? `+${((spend.at(-1) / (totalSpd - spend.at(-1)) -1)*100).toFixed(1)}% vs last`
    : '+0% vs last';

  // 3) ApexCharts: Line (trend)
  console.log('Trend:', { labels, revenue, spend });
  new ApexCharts(document.querySelector("#trendChart"), {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [
      { name: 'Ingresos', data: revenue },
      { name: 'Gastos',   data: spend   }
    ],
    xaxis: { categories: labels },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#eee' }
  }).render();

  // 4) ApexCharts: Bar (contador de transactions)
  const txCounts = [];
  for (const period of periods) {
    const itemsCol = collection(db, 'users', userId, 'history', period, 'items');
    let snapItems;
    try { snapItems = await getDocsFromServer(itemsCol); }
    catch { snapItems = await getDocs(itemsCol); }
    txCounts.push(snapItems.docs.length);
  }
  console.log('Bar (real tx counts):', { labels, txCounts });

  new ApexCharts(document.querySelector("#barChart"), {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [{ name: 'Transactions', data: txCounts }],
    xaxis: { categories: labels },
    plotOptions: { bar: { borderRadius: 4 } },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'] },
      formatter: v => v
    },
    grid: { borderColor: '#eee' }
  }).render();

  // 5) ApexCharts: Pie (por category)
  const catMap = {};
  for (const p of periods) {
    const colItems = collection(db, 'users', userId, 'history', p, 'items');
    let snapItems;
    try { snapItems = await getDocsFromServer(colItems); }
    catch { snapItems = await getDocs(colItems); }
    snapItems.forEach(doc => {
      const { amount=0, category='Other' } = doc.data();
      catMap[category] = (catMap[category]||0) + Math.abs(amount);
    });
  }
  const catLabels = Object.keys(catMap);
  const catData   = catLabels.map(c => +catMap[c].toFixed(2));
  console.log('Pie:', { catLabels, catData });
  new ApexCharts(document.querySelector("#pieChart"), {
    chart: { type: 'pie', height: 220 },
    series: catData,
    labels: catLabels,
    legend: { position: 'bottom' }
  }).render();
}
