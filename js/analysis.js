import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

console.log('[ANALYSIS] loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOMContentLoaded');

  // Sidebar logic
  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));
  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  // Filters (demo)
  document.querySelectorAll('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
  }));
  document.getElementById('period-select').addEventListener('change', e => {
    console.log('[ANALYSIS] period change:', e.target.value);
  });

  // Start reactive analysis
  onAuthStateChanged(auth, user => {
    if (!user) return window.location.href = '../index.html';
    reactiveAnalysis(user.uid);
  });
});

let trendChart, barChart, pieChart;
function reactiveAnalysis(userId) {
  console.log('[ANALYSIS] Start reactiveAnalysis for', userId);
  const db = getFirestore(app);
  const histRef = collection(db, 'users', userId, 'history');
  const sumRef  = collection(db, 'users', userId, 'historySummary');

  // Local state
  const monthsSet = new Set();
  const txsByMonth = new Map();

  // Initialize charts once
  initCharts();

  // Render function closes over monthsSet and txsByMonth
  function renderAnalysis() {
    // Obtener todos los meses disponibles en orden
    const months = Array.from(monthsSet).sort();

    const revenue = months.map(mon => {
      const txs = txsByMonth.get(mon) || [];
      return txs.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0).toFixed(2);
    }).map(Number);

    const spend = months.map(mon => {
      const txs = txsByMonth.get(mon) || [];
      return txs.reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0).toFixed(2);
    }).map(Number);

    const txCounts = months.map(mon => (txsByMonth.get(mon) || []).length);

    const catMap = {};
    months.forEach(mon => {
      (txsByMonth.get(mon) || []).forEach(tx => {
        const cat = tx.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + Math.abs(tx.amount);
      });
    });
    const catLabels = Object.keys(catMap);
    const catData   = catLabels.map(c => +catMap[c].toFixed(2));

    // Update KPIs
    const totalRev = revenue.reduce((a, b) => a + b, 0);
    const totalSp  = spend.reduce((a, b) => a + b, 0);
    document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
    document.getElementById('kpi-spend').textContent   = `€${totalSp.toFixed(2)}`;
    document.getElementById('kpi-revenue-change').textContent = totalRev
      ? `+${((revenue.at(-1) / (totalRev - revenue.at(-1)) - 1) * 100).toFixed(1)}% vs last`
      : '+0% vs last';
    document.getElementById('kpi-spend-change').textContent = totalSp
      ? `+${((spend.at(-1) / (totalSp - spend.at(-1)) - 1) * 100).toFixed(1)}% vs last`
      : '+0% vs last';

    // Update charts
    trendChart.updateOptions({
      series: [
        { name: 'Ingresos', data: revenue },
        { name: 'Gastos', data: spend }
      ],
      xaxis: { categories: months }
    });

    barChart.updateOptions({
      series: [{ name: 'Transactions', data: txCounts }],
      xaxis: { categories: months }
    });

    pieChart.updateOptions({
      series: catData,
      labels: catLabels
    });
  }

  // Subscribe to items for current months
  function subscribeItems() {
    const months = Array.from(monthsSet).sort();
    console.log('[ANALYSIS] subscribeItems for months', months);
    months.forEach(mon => {
      const itemsRef = collection(db, 'users', userId, 'history', mon, 'items');
      onSnapshot(itemsRef, snap => {
        console.log('[ANALYSIS] items change in', mon, snap.docs.length);
        txsByMonth.set(mon, snap.docs.map(d => d.data()));
        renderAnalysis();
      });
    });
  }

  // Watch months collections
  onSnapshot(histRef, snap => {
    snap.docs.forEach(d => monthsSet.add(d.id));
    console.log('[ANALYSIS] history months updated:', Array.from(monthsSet));
    subscribeItems();
  });
  onSnapshot(sumRef, snap => {
    snap.docs.forEach(d => monthsSet.add(d.id));
    console.log('[ANALYSIS] summary months updated:', Array.from(monthsSet));
    subscribeItems();
  });
}

function initCharts() {
  // Trend
  const tEl = document.querySelector('#trendChart'); tEl.innerHTML = '';
  trendChart = new ApexCharts(tEl, {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [], xaxis: { categories: [] }, stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#eee' }
  }); trendChart.render();

  // Bar
  const bEl = document.querySelector('#barChart'); bEl.innerHTML = '';
  barChart = new ApexCharts(bEl, {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [], xaxis: { categories: [] }, plotOptions: { bar: { borderRadius: 4 } },
    dataLabels: { enabled: true, style: { colors: ['#fff'] }, formatter: v => v },
    grid: { borderColor: '#eee' }
  }); barChart.render();

  // Pie
  const pEl = document.querySelector('#pieChart'); pEl.innerHTML = '';
  pieChart = new ApexCharts(pEl, {
    chart: { type: 'pie', height: 220 }, series: [], labels: [], legend: { position: 'bottom' }
  }); pieChart.render();
}
