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

const groupColors = {
  'Agricultura y Medio Ambiente': '#A8D5BA',
  'Alimentos y Restauración': '#FFB6B9',
  'Arte y Cultura': '#FFD3B4',
  'Automoción y Transporte': '#C3B1E1',
  'Belleza y Cuidado Personal': '#FFDAC1',
  'Bienes Raíces y Vivienda': '#E2F0CB',
  'Compras y Retail': '#C0E8F9',
  'Deportes y Recreación': '#FFC3A0',
  'Educación y Capacitación': '#B5EAD7',
  'Entretenimiento y Ocio': '#D5AAFF',
  'Eventos y Celebraciones': '#FDCBBA',
  'Finanzas y Seguros': '#D4A5A5',
  'Gobierno y Servicios Públicos': '#AED9E0',
  'Hogar y Jardín': '#FFF5BA',
  'Industrial y Manufactura': '#F1C0E8',
  'Mascotas y Animales': '#B5B9F8',
  'Otros': '#D9D9D9',
  'Religión y Comunidad': '#FFCBC1',
  'Salud y Medicina': '#BEE1E6',
  'Servicios Profesionales': '#E4BAD4',
  'Tecnología e Internet': '#A2D2FF',
  'Viajes y Hostelería': '#FFC9DE',
  'Loan Payments': '#B0BEC5'
};

function reactiveAnalysis(userId) {
  console.log('[ANALYSIS] Start reactiveAnalysis for', userId);
  const db = getFirestore(app);
  const histRef = collection(db, 'users', userId, 'history');
  const sumRef = collection(db, 'users', userId, 'historySummary');

  const txsByMonth = new Map();
  const catByMonth = new Map();
  let unsubscribeFns = [];

  initCharts();

  function renderAnalysis() {
  const months = Array.from(txsByMonth.keys()).sort();
  console.log('[RENDER] Months:', months);

  const revenue = months.map(mon => {
    const txs = txsByMonth.get(mon) || [];
    return txs.reduce((sum, tx) => sum + (tx.amount > 0 ? tx.amount : 0), 0);
  });

  const spend = months.map(mon => {
    const txs = txsByMonth.get(mon) || [];
    return txs.reduce((sum, tx) => sum + (tx.amount < 0 ? Math.abs(tx.amount) : 0), 0);
  });

  const netIncome = months.map((_, i) => revenue[i] - spend[i]);

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
  const catColors = catLabels.map(label => groupColors[label] || '#999');

  const totalRev = revenue.reduce((a, b) => a + b, 0);
  const totalSp = spend.reduce((a, b) => a + b, 0);

  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent = `€${totalSp.toFixed(2)}`;

  const revChange = revenue.length > 1
    ? ((revenue.at(-1) - revenue.at(-2)) / Math.max(revenue.at(-2), 1)) * 100
    : 0;
  const spendChange = spend.length > 1
    ? ((spend.at(-1) - spend.at(-2)) / Math.max(spend.at(-2), 1)) * 100
    : 0;

  document.getElementById('kpi-revenue-change').textContent =
    `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs anterior mes`;
  document.getElementById('kpi-spend-change').textContent =
    `${spendChange >= 0 ? '+' : ''}${spendChange.toFixed(1)}% vs anterior mes`;

  trendChart.updateOptions({
    series: [
      { name: 'Ingresos', data: revenue },
      { name: 'Gastos', data: spend }
    ],
    xaxis: { categories: months }
  });

  barChart.updateOptions({
    series: [{ name: 'Saldo Neto', data: netIncome }],
    xaxis: { categories: months }
  });

  const pContainer = document.querySelector('#pieChart');
  pContainer.innerHTML = '';
  pieChart = new ApexCharts(pContainer, {
    chart: { type: 'pie', height: 220, animations: { enabled: false } },
    series: catData,
    labels: catLabels,
    colors: catColors,
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


  function clearPreviousSubscriptions() {
    unsubscribeFns.forEach(unsub => unsub());
    unsubscribeFns = [];
  }

  function subscribeToMonth(mon) {
    const itemsRef = collection(db, 'users', userId, 'history', mon, 'items');
    const unsubItems = onSnapshot(itemsRef, snap => {
      console.log('[ANALYSIS] items change in', mon, snap.docs.length);
      txsByMonth.set(mon, snap.docs.map(d => d.data()));
      renderAnalysis();
    });
    unsubscribeFns.push(unsubItems);

    const catDocRef = doc(db, 'users', userId, 'historyCategorias', mon);
    const unsubCat = onSnapshot(catDocRef, snap => {
      if (snap.exists()) {
        const data = snap.data();
        delete data.updatedAt;
        catByMonth.set(mon, data);
        console.log(`[ANALYSIS] historyCategorias actualizadas para ${mon}:`, data);
      } else {
        console.log(`[ANALYSIS] No hay historyCategorias para ${mon}`);
      }
      renderAnalysis();
    });
    unsubscribeFns.push(unsubCat);
  }

  function refreshSubscriptions(months) {
    clearPreviousSubscriptions();
    months.forEach(mon => subscribeToMonth(mon));
  }

  const monthsSet = new Set();

  function updateSubscriptions() {
    const allMonths = Array.from(monthsSet).sort();
    console.log('[ANALYSIS] Subscribing to months:', allMonths);
    refreshSubscriptions(allMonths);
  }

  function collectMonthsFromSnapshot(snap) {
    const newMonths = new Set();
    snap.docs.forEach(d => newMonths.add(d.id));
    return newMonths;
  }

  onSnapshot(histRef, snap => {
    const newMonths = collectMonthsFromSnapshot(snap);
    newMonths.forEach(m => monthsSet.add(m));
    console.log('[ANALYSIS] history months updated:', Array.from(monthsSet));
    updateSubscriptions();
  });

  onSnapshot(sumRef, snap => {
    const newMonths = collectMonthsFromSnapshot(snap);
    newMonths.forEach(m => monthsSet.add(m));
    console.log('[ANALYSIS] summary months updated:', Array.from(monthsSet));
    updateSubscriptions();
  });
}

function initCharts() {
  console.log('[ANALYSIS] initCharts llamado');

  const tEl = document.querySelector('#trendChart'); tEl.innerHTML = '';
  trendChart = new ApexCharts(tEl, {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    yaxis: {
      labels: {
        formatter: val => Math.round(val)
      }
    },
    colors: ['#4ADE80', '#F87171'], // verde para ingresos, rojo para gastos
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#eee' }
  });
  trendChart.render();

  const bEl = document.querySelector('#barChart'); bEl.innerHTML = '';
  barChart = new ApexCharts(bEl, {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    yaxis: {
      labels: {
        formatter: val => Math.round(val)
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        colors: {
          ranges: [
            { from: -Infinity, to: 0, color: '#F87171' }, // rojo
            { from: 0.01, to: Infinity, color: '#4ADE80' } // verde
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: val => `€${val.toFixed(2)}`
      }
    },
    grid: { borderColor: '#eee' }
  });
  barChart.render();

  const pEl = document.querySelector('#pieChart'); pEl.innerHTML = '';
  pieChart = new ApexCharts(pEl, {
    chart: { type: 'pie', height: 220, animations: { enabled: false } },
    series: [],
    labels: [],
    colors: [],
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


let lastScrollTop = 0;
const nav = document.getElementById('bottom-nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (!nav) return;

  if (currentScroll > lastScrollTop && currentScroll > 60) {
    nav.classList.add('hide');
  } else {
    nav.classList.remove('hide');
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });
