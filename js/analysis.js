// analysis.js - Versión con soporte completo para "Este mes" (semanas) y "Esta semana" (días)

import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';

console.log('[ANALYSIS] loaded');

// ───── VARIABLES GLOBALES ─────
const db = getFirestore(app);
let trendChart, barChart, pieChart;
let userUid = null;
let selectedPeriod = 'month';
const monthsSet = new Set();
let unsubscribeFns = [];
const txsByMonth = new Map();
const catByMonth = new Map();
const daysOfCurrentWeek = new Map();

// ───── MAPA DE COLORES POR CATEGORÍA ─────
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

// ───── EVENTOS DOM ─────
document.addEventListener('DOMContentLoaded', () => {
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
    selectedPeriod = e.target.value;
    if (userUid) applyPeriodFilter(userUid, selectedPeriod);
  });

  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[AUTH] Usuario autenticado:', userUid);

      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      document.getElementById('period-select').value = savedPeriod;
      selectedPeriod = savedPeriod;

      reactiveAnalysis(userUid); // 👈 NECESARIO para que initCharts() se llame
      applyPeriodFilter(userUid, selectedPeriod);

    } else {
      console.warn('[AUTH] Usuario no autenticado');
      window.location.href = '../index.html';
    }
  });



});

function getWeekKeyFromDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekNum = Math.floor((parseInt(day) - 1) / 7) + 1;
  const weekKey = `${year}-${month}-S${weekNum}`;
  console.log('[DEBUG] getWeekKeyFromDate:', weekKey);
  return weekKey;
}


function reactiveAnalysis(userId) {
  const histRef = collection(db, 'users', userId, 'history');
  const sumRef = collection(db, 'users', userId, 'historySummary');
  initCharts();
  let sourcesReady = { history: false, summary: false };

  const checkIfReadyToRender = () => {
    if (sourcesReady.history && sourcesReady.summary) {
      console.log('[DEBUG] 🔄 Datos básicos listos, aplicando filtro');
      applyPeriodFilter(userId, selectedPeriod);

      // ⚠️ Para "week", renderAnalysis se hace solo si daysOfCurrentWeek se llena
      // Pero si ya hay datos locales, puede no saltar onSnapshot → Forzar render una vez
      if (selectedPeriod === 'week' && daysOfCurrentWeek.size > 0) {
        console.log('[DEBUG] Forzando render inicial para week (ya hay días cargados)');
        renderAnalysis();
      }
    }
  };




  const updateSubscriptionsFromSnapshot = (type, snap) => {
    const newMonths = new Set();
    snap.docs.forEach(d => newMonths.add(d.id));
    newMonths.forEach(m => monthsSet.add(m));
    sourcesReady[type] = true;
    checkIfReadyToRender();
  };

  onSnapshot(histRef, snap => updateSubscriptionsFromSnapshot('history', snap));
  onSnapshot(sumRef, snap => updateSubscriptionsFromSnapshot('summary', snap));
}

function renderAnalysis() {
  console.log('[DEBUG] renderAnalysis ejecutada');
  console.log('[DEBUG] selectedPeriod:', selectedPeriod);
  console.log('[DEBUG] txsByMonth keys:', [...txsByMonth.keys()]);
  console.log('[DEBUG] daysOfCurrentWeek keys:', [...daysOfCurrentWeek.keys()]);
  console.log('[DEBUG] catByMonth keys:', [...catByMonth.keys()]);

  let xLabels = [], revenue = [], spend = [], netIncome = [];

  if (selectedPeriod === 'year') {
    const months = Array.from(txsByMonth.keys()).filter(k => /^\d{4}-\d{2}$/.test(k)).sort();
    console.log('[DEBUG] Meses encontrados (year):', months);
    xLabels = months;
    revenue = months.map(m => (txsByMonth.get(m) || []).reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0));
    spend = months.map(m => (txsByMonth.get(m) || []).reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0));

  } else if (selectedPeriod === 'month') {
    const weeks = Array.from(txsByMonth.keys()).filter(k => /\-S\d$/.test(k)).sort();
    console.log('[DEBUG] Semanas encontradas (month):', weeks);
    xLabels = weeks.map(k => k.split('-').at(-1));
    revenue = weeks.map(w => (txsByMonth.get(w) || []).reduce((s, t) => s + (t.amount > 0 ? t.amount : 0), 0));
    spend = weeks.map(w => (txsByMonth.get(w) || []).reduce((s, t) => s + (t.amount < 0 ? Math.abs(t.amount) : 0), 0));

  } else if (selectedPeriod === 'week') {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    xLabels = dias;
    revenue = new Array(7).fill(0);
    spend = new Array(7).fill(0);

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      const date = new Date(key);
      const dayIdx = date.getDay();
      const i = (dayIdx + 6) % 7;
      console.log(`[DEBUG] Día ${key} → ${dias[i]} (índice ${i}) → Ingresos: ${entry?.totalIncomes}, Gastos: ${entry?.totalExpenses}`);
      revenue[i] = entry?.totalIncomes || 0;
      spend[i] = entry?.totalExpenses || 0;
    }
  }

  netIncome = revenue.map((r, i) => r - spend[i]);

  const totalRev = revenue.reduce((a, b) => a + b, 0);
  const totalSpd = spend.reduce((a, b) => a + b, 0);

  console.log('[DEBUG] totalRev:', totalRev, 'totalSpd:', totalSpd);
  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent = `€${totalSpd.toFixed(2)}`;

  const revChange = revenue.length > 1
    ? ((revenue.at(-1) - revenue.at(-2)) / Math.max(revenue.at(-2), 1)) * 100
    : 0;
  const spdChange = spend.length > 1
    ? ((spend.at(-1) - spend.at(-2)) / Math.max(spend.at(-2), 1)) * 100
    : 0;

  document.getElementById('kpi-revenue-change').textContent =
    `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
  document.getElementById('kpi-spend-change').textContent =
    `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;

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

  const catLabels = Object.keys(catMap);
  const catData = catLabels.map(c => +catMap[c].toFixed(2));
  const catColors = catLabels.map(l => groupColors[l] || '#999');

  console.log('[DEBUG] catMap:', catMap);

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



function applyPeriodFilter(userId, period) {
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

  console.log('[DEBUG] Periodo seleccionado:', period);
  console.log('[DEBUG] monthsSet:', Array.from(monthsSet));
  console.log('[DEBUG] monthsToSubscribe:', monthsToSubscribe);

  refreshSubscriptions(monthsToSubscribe, userId); // 👈 ← necesario también en "week"
}



function refreshSubscriptions(months, userId) {
  clearPreviousSubscriptions();
  console.log('[DEBUG] → Refrescando suscripciones a meses:', months);

  months.forEach(mon => subscribeToMonth(mon, userId));

  if (selectedPeriod === 'week') {
    const weekKey = getWeekKeyFromDate();
    const weekDaysRef = collection(db, 'users', userId, 'historySummary', weekKey, 'days');

    console.log('[DEBUG] Subscribing to daily summary of:', weekKey);

    const unsubDays = onSnapshot(weekDaysRef, snap => {
      console.log('[DEBUG] Snapshot diario recibido (week)', snap.size, 'documentos');
      daysOfCurrentWeek.clear();
      snap.docs.forEach(doc => {
        console.log(`[DEBUG] Día ${doc.id}:`, doc.data());
        daysOfCurrentWeek.set(doc.id, doc.data());
      });

      if (snap.size > 0) {
        console.log('[DEBUG] Forzando renderAnalysis tras snapshot de days');
        renderAnalysis();
      } else {
        console.warn('[DEBUG] Snapshot de days está vacío');
      }
    });


    unsubscribeFns.push(unsubDays);
  }
}


function clearPreviousSubscriptions() {
  unsubscribeFns.forEach(unsub => unsub());
  unsubscribeFns = [];
}

function subscribeToMonth(mon, userId) {
  const itemsRef = collection(db, 'users', userId, 'history', mon, 'items');
  const catDocRef = doc(db, 'users', userId, 'historyCategorias', mon);

  console.log('[DEBUG] Suscribiéndose a items de:', mon);

  const unsubItems = onSnapshot(itemsRef, snap => {
    const txs = snap.docs.map(d => d.data());
    txsByMonth.set(mon, txs);
    console.log(`[DEBUG] Transacciones recibidas (${mon}):`, txs.length, 'transacciones');
    if (selectedPeriod !== 'week') {
      renderAnalysis();
    }
  });

  const unsubCat = onSnapshot(catDocRef, snap => {
    if (snap.exists()) {
      const data = snap.data();
      delete data.updatedAt;
      catByMonth.set(mon, data);
      console.log(`[DEBUG] Categorías recibidas (${mon}):`, data);
    } else {
      console.warn(`[DEBUG] Documento de categorías no existe para ${mon}`);
    }

    if (selectedPeriod !== 'week') {
      renderAnalysis();
    }
  });

  unsubscribeFns.push(unsubItems, unsubCat);
}



function initCharts() {
  trendChart = new ApexCharts(document.querySelector('#trendChart'), {
    chart: { type: 'line', height: 240, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    yaxis: { labels: { formatter: val => Math.round(val) } },
    colors: ['#4ADE80', '#F87171'],
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: '#eee' }
  });
  trendChart.render();

  barChart = new ApexCharts(document.querySelector('#barChart'), {
    chart: { type: 'bar', height: 200, toolbar: { show: false } },
    series: [],
    xaxis: { categories: [] },
    yaxis: { labels: { formatter: val => Math.round(val) } },
    plotOptions: {
      bar: {
        borderRadius: 4,
        colors: {
          ranges: [ { from: -Infinity, to: 0, color: '#F87171' }, { from: 0.01, to: Infinity, color: '#4ADE80' } ]
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
    series: [],
    labels: [],
    colors: [],
    legend: { position: 'bottom' },
    noData: {
      text: 'Cargando datos...',
      align: 'center', verticalAlign: 'middle', style: { color: '#999', fontSize: '14px' }
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
