import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';

console.log('[ANALYSIS] loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOMContentLoaded');

  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));
  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');
    });
  });

  document.getElementById('period-select').addEventListener('change', e => {
    console.log('[ANALYSIS] period change:', e.target.value);
  });

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
  const sumRef = collection(db, 'users', userId, 'historySummary');
  const catRef = collection(db, 'users', userId, 'historyCategorias');

  const monthsSet = new Set();
  const txsByMonth = new Map();
  const catByMonth = new Map();

  initCharts();

  function renderAnalysis() {
    const months = Array.from(monthsSet).sort();
    console.log('[RENDER] Months:', months);

    const revenue = months.map(mon => {
      const txs = txsByMonth.get(mon) || [];
      return txs.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);
    });

    const spend = months.map(mon => {
      const txs = txsByMonth.get(mon) || [];
      return txs.reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
    });

    const txCounts = months.map(mon => (txsByMonth.get(mon) || []).length);

    const catMap = {};
    months.forEach(mon => {
      const catObj = catByMonth.get(mon) || {};
      console.log(`[RENDER] Categorías para ${mon}:`, catObj);
      for (const [cat, amount] of Object.entries(catObj)) {
        catMap[cat] = (catMap[cat] || 0) + amount;
      }
    });

    const catLabels = Object.keys(catMap);
    const catData = catLabels.map(c => +catMap[c].toFixed(2));

    console.log('[RENDER] Pie labels:', catLabels);
    console.log('[RENDER] Pie data:', catData);

    const totalRev = revenue.reduce((a, b) => a + b, 0);
    const totalSp = spend.reduce((a, b) => a + b, 0);

    document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
    document.getElementById('kpi-spend').textContent = `€${totalSp.toFixed(2)}`;
    document.getElementById('kpi-revenue-change').textContent = totalRev && revenue.length > 1
      ? `+${((revenue.at(-1) / (totalRev - revenue.at(-1)) - 1) * 100).toFixed(1)}% vs last`
      : '+0% vs last';
    document.getElementById('kpi-spend-change').textContent = totalSp && spend.length > 1
      ? `+${((spend.at(-1) / (totalSp - spend.at(-1)) - 1) * 100).toFixed(1)}% vs last`
      : '+0% vs last';

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

    const pContainer = document.querySelector('#pieChart');
    pContainer.innerHTML = '';
    pieChart = new ApexCharts(pContainer, {
      chart: { type: 'pie', height: 220, animations: { enabled: false } },
      series: catData,
      labels: catLabels,
      legend: { position: 'bottom' },
      noData: {
        text: 'Sin datos de categorías',
        align: 'center',
        verticalAlign: 'middle',
        style: { color: '#999', fontSize: '14px' }
      }
    });
    pieChart.render();
  }

  function subscribeItems() {
    const months = Array.from(monthsSet).sort();
    console.log('[ANALYSIS] subscribeItems for months', months);

    let loaded = 0;
    const total = months.length * 2;

    const maybeRender = () => {
      loaded++;
      if (loaded >= total) {
        console.log('[ANALYSIS] Todos los datos obtenidos. Llamando a renderAnalysis()');
        renderAnalysis();
      }
    };

    months.forEach(mon => {
      const itemsRef = collection(db, 'users', userId, 'history', mon, 'items');
      onSnapshot(itemsRef, snap => {
        console.log('[ANALYSIS] items change in', mon, snap.docs.length);
        txsByMonth.set(mon, snap.docs.map(d => d.data()));
        maybeRender();
      });

      const catDocRef = doc(db, 'users', userId, 'historyCategorias', mon);
      onSnapshot(catDocRef, snap => {
        if (snap.exists()) {
          const data = snap.data();
          delete data.updatedAt;
          catByMonth.set(mon, data);
          console.log(`[ANALYSIS] historyCategorias actualizadas para ${mon}:`, data);
        } else {
          console.log(`[ANALYSIS] No hay historyCategorias para ${mon}`);
        }
        maybeRender();
      });
    });
  }

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
  console.log('[ANALYSIS] initCharts llamado');

  const tEl = document.querySelector('#trendChart'); tEl.innerHTML = '';
  trendChart = new ApexCharts(tEl, {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#eee' }
  });
  trendChart.render();

  const bEl = document.querySelector('#barChart'); bEl.innerHTML = '';
  barChart = new ApexCharts(bEl, {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    plotOptions: { bar: { borderRadius: 4 } },
    dataLabels: { enabled: true, style: { colors: ['#fff'] }, formatter: v => v },
    grid: { borderColor: '#eee' }
  });
  barChart.render();

  const pEl = document.querySelector('#pieChart'); pEl.innerHTML = '';
  pieChart = new ApexCharts(pEl, {
    chart: { type: 'pie', height: 220, animations: { enabled: false } },
    series: [],
    labels: [],
    legend: { position: 'bottom' },
    noData: {
      text: 'Cargando datos...',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: '#999', fontSize: '14px' }
    }
  });
  pieChart.render();
}
