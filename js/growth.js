// growth.js – Pestaña de Crecimiento (versión con endpoint backend)

import { openDB } from 'idb';

console.log('[GROWTH] Módulo growth.js cargado');

const DB_NAME = 'growth-cache';
const DB_VERSION = 1;
const STORE_SUMMARY = 'historySummary';
const STORE_CATEGORIAS = 'historyCategorias';
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com';

export async function loadGrowth() {
  console.log('[GROWTH] ⚙️ Iniciando carga de datos para crecimiento');

  const isOnline = navigator.onLine;
  const months = getLast12Months();
  const summaryData = [];
  const categoryData = new Map();

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

  if (isOnline) {
    try {
      const userId = localStorage.getItem('userUid');
      const res = await fetch(`${API_URL}/get_growth_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const { summary, categories } = await res.json();

      for (const month of months) {
        const ingresos = summary[month]?.totalIncomes || 0;
        const gastos = summary[month]?.totalExpenses || 0;
        const grupos = categories[month] || {};

        summaryData.push({ month, ingresos, gastos });
        categoryData.set(month, grupos);

        await dbLocal.put(STORE_SUMMARY, { ingresos, gastos }, month);
        await dbLocal.put(STORE_CATEGORIAS, grupos, month);
        console.log(`[GROWTH] ✅ Cache actualizada para ${month}`);
      }
    } catch (e) {
      console.error('[GROWTH] ❌ Error durante fetch desde backend:', e);
      await cargarDesdeIndexedDB(months, dbLocal, summaryData, categoryData);
    }
  } else {
    await cargarDesdeIndexedDB(months, dbLocal, summaryData, categoryData);
  }

  console.log('[GROWTH] ✅ Datos finalizados, generando KPIs y gráficas...');
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

async function cargarDesdeIndexedDB(months, dbLocal, summaryData, categoryData) {
  for (const month of months) {
    const resumen = await dbLocal.get(STORE_SUMMARY, month);
    const categorias = await dbLocal.get(STORE_CATEGORIAS, month);
    summaryData.push({ month, ingresos: resumen?.ingresos || 0, gastos: resumen?.gastos || 0 });
    categoryData.set(month, categorias || {});
    console.log(`[GROWTH] ✅ Datos offline obtenidos para ${month}`);
  }
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

  document.getElementById('kpi-growth-revenue').textContent = growthIncomes.toFixed(2) + '%';
  document.getElementById('kpi-growth-spend').textContent = growthExpenses.toFixed(2) + '%';
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

  try {
    const el = document.querySelector('#growthChart');
    if (!el) return console.warn('[GROWTH] ⚠️ growthChart container NO ENCONTRADO');

    if (window.growthChart) {
      console.log('[GROWTH] 🔁 Destruyendo gráfico anterior');
      window.growthChart.destroy();
    }

    window.growthChart = new ApexCharts(el, options);
    window.growthChart.render();
    console.log('[GROWTH] 📈 growthChart renderizado correctamente');
  } catch (e) {
    console.error('[GROWTH] ❌ Error al renderizar growthChart:', e);
  }
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
    stroke: { curve: 'smooth' }
  };

  try {
    const el = document.querySelector('#categoryTrendChart');
    if (!el) return console.warn('[GROWTH] ⚠️ categoryTrendChart container NO ENCONTRADO');

    if (window.categoryTrendChart) {
      console.log('[GROWTH] 🔁 Destruyendo gráfico de categorías anterior');
      window.categoryTrendChart.destroy();
    }

    window.categoryTrendChart = new ApexCharts(el, options);
    window.categoryTrendChart.render();
    console.log('[GROWTH] 📊 categoryTrendChart renderizado correctamente');
  } catch (e) {
    console.error('[GROWTH] ❌ Error al renderizar categoryTrendChart:', e);
  }
}
