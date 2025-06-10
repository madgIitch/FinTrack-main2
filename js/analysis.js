// js/analysis.js

import { auth, app } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocsFromServer,
  getDocs
} from 'firebase/firestore';
import { initSidebar } from './sidebar.js';

console.log('[ANALYSIS] loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOMContentLoaded');
  initSidebar();

  // Listeners de filtros / período
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active').classList.remove('active');
      btn.classList.add('active');
      // → recarga datos según btn.dataset.filter
    });
  });
  document.getElementById('period-select').addEventListener('change', e => {
    console.log('Periodo seleccionado en Analysis:', e.target.value);
    // → recarga datos según periodo (week/month/year)
  });

  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = '../index.html';
      return;
    }
    loadAnalysis(user.uid).catch(err => console.error('[ANALYSIS] error:', err));
  });
});

async function loadAnalysis(userId) {
  const db = getFirestore(app);

  // 1) Recuperar últimos 7 periodos de history
  const historyCol = collection(db, 'users', userId, 'history');
  let snapHistory;
  try {
    snapHistory = await getDocsFromServer(historyCol);
  } catch {
    snapHistory = await getDocs(historyCol);
  }
  const allPeriods = snapHistory.docs.map(d => d.id).sort();
  const last7 = allPeriods.slice(-7);
  const labels = [], revenue = [], spend = [];

  for (const period of last7) {
    labels.push(period);
    const itemsCol = collection(db, 'users', userId, 'history', period, 'items');
    let snapItems;
    try { snapItems = await getDocsFromServer(itemsCol); }
    catch { snapItems = await getDocs(itemsCol); }
    let rev = 0, spd = 0;
    snapItems.forEach(doc => {
      const amt = doc.data().amount || 0;
      amt >= 0 ? rev += amt : spd += Math.abs(amt);
    });
    revenue.push(rev);
    spend.push(spd);
  }

  // 2) KPIs
  const totalRev = revenue.reduce((a,b) => a+b, 0);
  const totalSpd = spend.reduce((a,b) => a+b, 0);
  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent   = `€${totalSpd.toFixed(2)}`;
  document.getElementById('kpi-revenue-change').textContent = totalRev
    ? `+${((revenue[revenue.length-1]/(totalRev-revenue[revenue.length-1])-1)*100).toFixed(1)}% vs last`
    : '+0% vs last';
  document.getElementById('kpi-spend-change').textContent = totalSpd
    ? `+${((spend[spend.length-1]/(totalSpd-spend[spend.length-1])-1)*100).toFixed(1)}% vs last`
    : '+0% vs last';

  // 3) Chart.js global (incluir chart.min.js en HTML justo antes de analysis.js)
  // Tendencia
  new Chart(
    document.getElementById('trendChart').getContext('2d'),
    {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Revenue', data: revenue, borderWidth:2, fill:false, tension:0.3 },
        { label: 'Spend',   data: spend,   borderWidth:2, fill:false, tension:0.3 }
      ]},
      options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
    }
  );

  // 4) Barras (transacciones diarias de ejemplo)
  const txCounts = labels.map(_ => Math.floor(Math.random()*20)+5);
  new Chart(
    document.getElementById('barChart').getContext('2d'),
    {
      type: 'bar',
      data: { labels, datasets: [{ label:'Transactions', data:txCounts, borderWidth:1 }] },
      options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
    }
  );

  // 5) Pastel por categoría
  const catSums = {};
  for (const period of last7) {
    const itemsCol = collection(db, 'users', userId, 'history', period, 'items');
    let snap;
    try { snap = await getDocsFromServer(itemsCol); }
    catch { snap = await getDocs(itemsCol); }
    snap.forEach(doc => {
      const { amount=0, category='Other' } = doc.data();
      catSums[category] = (catSums[category]||0) + Math.abs(amount);
    });
  }
  const catLabels = Object.keys(catSums);
  const catData   = catLabels.map(c => catSums[c]);
  new Chart(
    document.getElementById('pieChart').getContext('2d'),
    { type:'pie', data:{ labels:catLabels, datasets:[{ data:catData, borderWidth:1 }] }, options:{ responsive:true } }
  );
}