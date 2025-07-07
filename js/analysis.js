import { getDocs } from 'firebase/firestore';
import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';

console.log('[ANALYSIS] Archivo analysis.js cargado');

const db = getFirestore(app);
let trendChart, barChart, pieChart;
let userUid = null;
let selectedPeriod = 'month';
const monthsSet = new Set();
let unsubscribeFns = [];
const txsByMonth = new Map();
const catByMonth = new Map();
const daysOfCurrentWeek = new Map();
const subscribedWeeks = new Set();
let lastRevenue = [];
let lastSpend = [];
let lastCatMapStr = '';

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

document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOM cargado');
  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));
  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    console.log('[ANALYSIS] Cierre de sesión solicitado');
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
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    console.log('[ANALYSIS] Periodo seleccionado cambiado a:', selectedPeriod);
    if (userUid) applyPeriodFilter(userUid, selectedPeriod);
  });

  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[ANALYSIS] Usuario autenticado:', userUid);
      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      document.getElementById('period-select').value = savedPeriod;
      selectedPeriod = savedPeriod;
      console.log('[ANALYSIS] Periodo restaurado desde localStorage:', selectedPeriod);
      reactiveAnalysis(userUid);
      setTimeout(() => applyPeriodFilter(userUid, selectedPeriod), 200);
    } else {
      console.log('[ANALYSIS] Usuario no autenticado. Redirigiendo...');
      window.location.href = '../index.html';
    }
  });
});

function getWeekKeyFromDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekNum = Math.floor((parseInt(day) - 1) / 7) + 1;
  const key = `${year}-${month}-S${weekNum}`;
  console.log('[ANALYSIS] Clave de semana generada:', key);
  return key;
}

function reactiveAnalysis(userId) {
  console.log('[ANALYSIS] Suscripciones reactivas iniciadas para usuario:', userId);
  const histRef = collection(db, 'users', userId, 'history');
  const sumRef = collection(db, 'users', userId, 'historySummary');
  initCharts();
  let sourcesReady = { history: false, summary: false };

  const checkIfReadyToRender = () => {
    if (sourcesReady.history && sourcesReady.summary) {
      console.log('[ANALYSIS] Datos cargados. Aplicando filtro de periodo...');
      applyPeriodFilter(userId, selectedPeriod);
    }
  };

  const updateSubscriptionsFromSnapshot = (type, snap) => {
    console.log(`[ANALYSIS] Snapshot recibido para ${type}:`, snap.docs.length);
    const newMonths = new Set();
    snap.docs.forEach(d => newMonths.add(d.id));
    newMonths.forEach(m => monthsSet.add(m));
    sourcesReady[type] = true;
    checkIfReadyToRender();
  };

  onSnapshot(histRef, snap => updateSubscriptionsFromSnapshot('history', snap));
  onSnapshot(sumRef, snap => updateSubscriptionsFromSnapshot('summary', snap));
}

function applyPeriodFilter(userId, period) {
  console.log('[ANALYSIS] Aplicando filtro para periodo:', period);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}-${month}`;
  let monthsToSubscribe = [];

  if (period === 'week' || period === 'month') {
    monthsToSubscribe = Array.from(monthsSet).filter(m => m.startsWith(prefix));
  } else if (period === 'year') {
    monthsToSubscribe = Array.from(monthsSet).filter(m => m.startsWith(`${year}-`));
  }

  console.log('[ANALYSIS] Meses a suscribirse:', monthsToSubscribe);
  refreshSubscriptions(monthsToSubscribe, userId);
}

function refreshSubscriptions(months, userId) {
  console.log('[ANALYSIS] Refrescando suscripciones...');
  clearPreviousSubscriptions();

  months.forEach(mon => {
    subscribeToMonth(mon, userId);

    if (selectedPeriod === 'month' || selectedPeriod === 'week') {
      for (let i = 1; i <= 5; i++) {
        const weekId = `S${i}`;
        const daysRef = collection(db, 'users', userId, 'historySummary', mon, 'weeks', weekId, 'days');
        const unsubDays = onSnapshot(daysRef, snap => {
          console.log(`[ANALYSIS] Snapshot días para ${mon}/weeks/${weekId}:`, snap.docs.length);
          for (const doc of snap.docs) {
            const fullKey = `${mon}/weeks/${weekId}/${doc.id}`; // clave única por día
            daysOfCurrentWeek.set(fullKey, doc.data());
          }
          renderAnalysis();
        });
        unsubscribeFns.push(unsubDays);
      }
    }
  });
}

function clearPreviousSubscriptions() {
  console.log('[ANALYSIS] Limpiando suscripciones anteriores');
  unsubscribeFns.forEach(unsub => unsub());
  unsubscribeFns = [];
  subscribedWeeks.clear();
}

function subscribeToMonth(mon, userId) {
  console.log('[ANALYSIS] Subscribiendo a mes (solo categorías):', mon);

  // Categorías (sí se mantiene)
  const catDocRef = doc(db, 'users', userId, 'historyCategorias', mon);
  const unsubCat = onSnapshot(catDocRef, snap => {
    console.log('[ANALYSIS] Snapshot categorías:', mon, snap.exists());
    if (snap.exists()) {
      const data = snap.data();
      delete data.updatedAt;
      catByMonth.set(mon, data);
    }
    renderAnalysis(); // se renderiza siempre
  });
  unsubscribeFns.push(unsubCat);

}



function renderAnalysis() {
  console.log('[ANALYSIS] Renderizando análisis...');

  if ((selectedPeriod === 'month' || selectedPeriod === 'week') && daysOfCurrentWeek.size === 0) {
    console.log('[ANALYSIS] No hay datos diarios disponibles');
    return;
  }

  let xLabels = [], revenue = [], spend = [], netIncome = [];

  if (selectedPeriod === 'month') {
    const semanas = ['S1', 'S2', 'S3', 'S4', 'S5'];
    xLabels = semanas;
    revenue = new Array(5).fill(0);
    spend = new Array(5).fill(0);

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      const parts = key.split('/');
      const weekIdx = semanas.indexOf(parts[2]);
      if (weekIdx === -1) continue;
      revenue[weekIdx] += entry?.totalIncomes || 0;
      spend[weekIdx] += entry?.totalExpenses || 0;
    }

  } else if (selectedPeriod === 'week') {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    xLabels = dias;
    revenue = new Array(7).fill(0);
    spend = new Array(7).fill(0);

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      const dateStr = key.split('/').at(-1);
      const date = new Date(dateStr);
      const idx = (date.getDay() + 6) % 7;
      revenue[idx] += entry?.totalIncomes || 0;
      spend[idx] += entry?.totalExpenses || 0;
    }

  } else if (selectedPeriod === 'year') {
    const months = [...catByMonth.keys()].sort(); // usamos las claves de categorías como fallback
    xLabels = months;
    revenue = months.map(m => 0);
    spend = months.map(m => 0);
  }

  if (selectedPeriod !== 'year' && arraysEqual(revenue, lastRevenue) && arraysEqual(spend, lastSpend)) {
    console.log('[ANALYSIS] No hay cambios detectados. Render omitido.');
    return;
  }

  netIncome = revenue.map((r, i) => r - spend[i]);
  const totalRev = revenue.reduce((a, b) => a + b, 0);
  const totalSpd = spend.reduce((a, b) => a + b, 0);

  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent = `€${totalSpd.toFixed(2)}`;

  const revChange = revenue.length > 1 ? ((revenue.at(-1) - revenue.at(-2)) / Math.max(revenue.at(-2), 1)) * 100 : 0;
  const spdChange = spend.length > 1 ? ((spend.at(-1) - spend.at(-2)) / Math.max(spend.at(-2), 1)) * 100 : 0;

  document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
  document.getElementById('kpi-spend-change').textContent = `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;

  trendChart.updateOptions({
    series: [
      { name: 'Ingresos', data: revenue },
      { name: 'Gastos', data: spend }
    ],
    xaxis: { categories: xLabels }
  });

  barChart.updateOptions({
    series: [{ name: 'Saldo Neto', data: netIncome }],
    xaxis: { categories: xLabels }
  });

  const catMap = {};
  catByMonth.forEach(cats => {
    for (const [k, v] of Object.entries(cats)) {
      catMap[k] = (catMap[k] || 0) + v;
    }
  });

  const currentCatMapStr = JSON.stringify(catMap);
  if (currentCatMapStr !== lastCatMapStr) {
    lastCatMapStr = currentCatMapStr;
    const catLabels = Object.keys(catMap);
    const catData = catLabels.map(c => +catMap[c].toFixed(2));
    const catColors = catLabels.map(l => groupColors[l] || '#999');
    const pieContainer = document.querySelector('#pieChart');
    pieContainer.innerHTML = '';
    pieChart = new ApexCharts(pieContainer, {
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

  lastRevenue = [...revenue];
  lastSpend = [...spend];
}


function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.0001) return false;
  return true;
}

function initCharts() {
  console.log('[ANALYSIS] Inicializando gráficos');
  trendChart = new ApexCharts(document.querySelector('#trendChart'), {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [], xaxis: { categories: [] },
    yaxis: { labels: { formatter: val => Math.round(val) } },
    colors: ['#4ADE80', '#F87171'], stroke: { curve: 'smooth', width: 2 }, grid: { borderColor: '#eee' }
  });
  trendChart.render();

  barChart = new ApexCharts(document.querySelector('#barChart'), {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [], xaxis: { categories: [] },
    yaxis: { labels: { formatter: val => Math.round(val) } },
    plotOptions: {
      bar: {
        borderRadius: 4,
        colors: {
          ranges: [
            { from: -Infinity, to: 0, color: '#F87171' },
            { from: 0.01, to: Infinity, color: '#4ADE80' }
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: val => `€${val.toFixed(2)}` } },
    grid: { borderColor: '#eee' }
  });
  barChart.render();

  pieChart = new ApexCharts(document.querySelector('#pieChart'), {
    chart: { type: 'pie', height: 220, animations: { enabled: false } },
    series: [], labels: [], colors: [],
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
  if (currentScroll > lastScrollTop && currentScroll > 60) nav.classList.add('hide');
  else nav.classList.remove('hide');
  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });
