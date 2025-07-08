// growth.js – Pestaña de Crecimiento

import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';
import { openDB } from 'idb';
import { app } from './firebase.js';

console.log('[GROWTH] Módulo growth.js cargado');

const db = getFirestore(app);
const DB_NAME = 'growth-cache';
const DB_VERSION = 1;
const STORE_SUMMARY = 'historySummary';
const STORE_CATEGORIAS = 'historyCategorias';

let growthChart, categoryTrendChart;

export async function loadGrowth() {
  console.log('[GROWTH] Iniciando carga de datos para crecimiento');

  const months = getLast12Months();
  const summaryData = [];
  const categoryData = new Map();

  const isOnline = navigator.onLine;
  const dbLocal = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_SUMMARY)) {
        db.createObjectStore(STORE_SUMMARY);
      }
      if (!db.objectStoreNames.contains(STORE_CATEGORIAS)) {
        db.createObjectStore(STORE_CATEGORIAS);
      }
    }
  });

  for (const month of months) {
    if (isOnline) {
      const docRef = doc(db, `historySummary/${month}`);
      const snap = await getDocs(collection(docRef, 'weeks'));

      let ingresos = 0;
      let gastos = 0;

      snap.forEach(doc => {
        ingresos += doc.data().totalIncomes || 0;
        gastos += doc.data().totalExpenses || 0;
      });

      summaryData.push({ month, ingresos, gastos });
      await dbLocal.put(STORE_SUMMARY, { ingresos, gastos }, month);

      const catDoc = doc(db, `historyCategorias/${month}`);
      const catSnap = await getDocs(collection(catDoc, 'weeks'));
      const groupTotals = {};

      catSnap.forEach(semana => {
        const datos = semana.data().totals || {};
        for (const [group, value] of Object.entries(datos)) {
          groupTotals[group] = (groupTotals[group] || 0) + value;
        }
      });

      categoryData.set(month, groupTotals);
      await dbLocal.put(STORE_CATEGORIAS, groupTotals, month);
    } else {
      const resumen = await dbLocal.get(STORE_SUMMARY, month);
      const categorias = await dbLocal.get(STORE_CATEGORIAS, month);
      summaryData.push({ month, ingresos: resumen?.ingresos || 0, gastos: resumen?.gastos || 0 });
      categoryData.set(month, categorias || {});
    }
  }

  renderGrowthKPIs(summaryData);
  renderGrowthChart(summaryData);
  renderCategoryTrendChart(months, categoryData);
}

function getLast12Months() {
  const months = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(date.toISOString().slice(0, 7));
  }
  return months;
}

function renderGrowthKPIs(data) {
  const len = data.length;
  if (len < 2) return;

  const prev = data[len - 2];
  const curr = data[len - 1];

  const growthIncomes = ((curr.ingresos - prev.ingresos) / (prev.ingresos || 1)) * 100;
  const growthExpenses = ((curr.gastos - prev.gastos) / (prev.gastos || 1)) * 100;

  const bestMonth = data.reduce((acc, m) => {
    const ahorro = m.ingresos - m.gastos;
    return ahorro > (acc.ahorro || 0) ? { ...m, ahorro } : acc;
  }, {});

  document.getElementById('kpi-growth-incomes').textContent = growthIncomes.toFixed(2) + '%';
  document.getElementById('kpi-growth-expenses').textContent = growthExpenses.toFixed(2) + '%';
  document.getElementById('kpi-best-month').textContent = bestMonth.month || '-';

  console.log('[GROWTH] KPIs renderizados');
}

function renderGrowthChart(data) {
  const categories = data.map(e => e.month);
  const incomes = data.map(e => e.ingresos);
  const expenses = data.map(e => e.gastos);
  const savings = data.map(e => e.ingresos - e.gastos);

  const options = {
    chart: { type: 'line', height: 300 },
    series: [
      { name: 'Ingresos', data: incomes },
      { name: 'Gastos', data: expenses },
      { name: 'Ahorro', data: savings }
    ],
    xaxis: { categories },
    stroke: { curve: 'smooth' },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    colors: ['#00C49F', '#FF4C4C', '#0074D9']
  };

  if (growthChart) growthChart.destroy();
  growthChart = new ApexCharts(document.querySelector('#growth-chart'), options);
  growthChart.render();

  console.log('[GROWTH] Gráfico principal renderizado');
}

function renderCategoryTrendChart(months, categoryData) {
  const allGroups = new Set();
  months.forEach(m => {
    const data = categoryData.get(m);
    if (data) Object.keys(data).forEach(g => allGroups.add(g));
  });

  const series = Array.from(allGroups).map(group => ({
    name: group,
    data: months.map(m => categoryData.get(m)?.[group] || 0)
  }));

  const options = {
    chart: { type: 'area', height: 300, stacked: true },
    series,
    xaxis: { categories: months },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' },
    colors: undefined // que Apex decida
  };

  if (categoryTrendChart) categoryTrendChart.destroy();
  categoryTrendChart = new ApexCharts(document.querySelector('#category-trend-chart'), options);
  categoryTrendChart.render();

  console.log('[GROWTH] Gráfico de categorías renderizado');

  
}
