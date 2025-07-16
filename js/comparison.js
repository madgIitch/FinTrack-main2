// ───── Archivo: comparison.js ─────
// Pestaña "Comparación" – compara dos meses seleccionables (ingresos, gastos y categorías)

import { whenVisible } from './analysis.js';

console.log('[COMPARE] Módulo comparison.js cargado');

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

let summaryData = {};
let categoryData = {};

export async function loadComparison(userId) {
  console.log('[COMPARE] ⚙️ Cargando comparación...');

  if (!navigator.onLine) {
    console.warn('[COMPARE] ⚠️ Estás offline. No se puede comparar sin conexión');
    return;
  }

  try {
    const [summaryResp, categoryResp] = await Promise.all([
      fetch(`${apiUrl}/plaid/get_growth_history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }).then(res => res.json()),
      fetch(`${apiUrl}/plaid/get_category_trends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }).then(res => res.json())
    ]);

    summaryData = summaryResp.summary || {};
    categoryData = categoryResp.categoryTrends || {};

    const months = Object.keys(summaryData).sort().reverse();
    console.log('[COMPARE] 🗓️ Meses disponibles:', months);

    populateMonthSelectors(months);
    setupEventListeners();

    // Inicial por defecto: comparar dos últimos meses
    if (months.length >= 2) {
      renderComparison(months[0], months[1]);
    }

  } catch (e) {
    console.error('[COMPARE] ❌ Error al obtener datos:', e);
  }
}

// ───── Pinta opciones en los dropdowns del DOM ─────
function populateMonthSelectors(months) {
  const selectA = document.getElementById('compare-month-a');
  const selectB = document.getElementById('compare-month-b');

  if (!selectA || !selectB) {
    console.warn('[COMPARE] No se encontraron los selectores de mes');
    return;
  }

  months.forEach(month => {
    const optA = document.createElement('option');
    const optB = document.createElement('option');
    optA.value = optB.value = month;
    optA.textContent = optB.textContent = formatMonthLabel(month);
    selectA.appendChild(optA);
    selectB.appendChild(optB);
  });

  selectA.selectedIndex = 0;
  selectB.selectedIndex = 1;
}

// ───── Vincula eventos para cambiar comparación ─────
function setupEventListeners() {
  const selectA = document.getElementById('compare-month-a');
  const selectB = document.getElementById('compare-month-b');

  if (!selectA || !selectB) return;

  selectA.addEventListener('change', () => {
    renderComparison(selectA.value, selectB.value);
  });

  selectB.addEventListener('change', () => {
    renderComparison(selectA.value, selectB.value);
  });
}

// ───── Dibuja KPIs y gráfico con dos meses concretos ─────
function renderComparison(monthA, monthB) {
  console.log(`[COMPARE] Comparando ${monthB} vs ${monthA}`);

  const dataA = summaryData[monthA] || { totalIncomes: 0, totalExpenses: 0 };
  const dataB = summaryData[monthB] || { totalIncomes: 0, totalExpenses: 0 };

  renderKPIs(dataB, dataA, monthA);
  renderCompareBarChart(
    categoryData[monthB] || {},
    categoryData[monthA] || {},
    monthB,
    monthA
  );

  renderCompareRadarChart(
  categoryData[monthB] || {},
  categoryData[monthA] || {},
  monthB,
  monthA
);
}

// ───── Renderizado de KPIs ─────
function renderKPIs(actual, anterior, labelAnterior) {
  const ingresos = actual.totalIncomes || 0;
  const gastos = actual.totalExpenses || 0;
  const ahorro = ingresos - gastos;

  const ingresosPrev = anterior.totalIncomes || 0;
  const gastosPrev = anterior.totalExpenses || 0;
  const ahorroPrev = ingresosPrev - gastosPrev;

  setKPI('compare-revenue', ingresos, ingresosPrev, labelAnterior);
  setKPI('compare-spend', gastos, gastosPrev, labelAnterior);
  setKPI('compare-savings', ahorro, ahorroPrev, labelAnterior);
}

function setKPI(id, actual, anterior, labelAnterior) {
  const valorEl = document.getElementById(`kpi-${id}`);
  const diffEl = document.getElementById(`kpi-${id}-diff`);

  if (!valorEl || !diffEl) return;

  valorEl.textContent = `€${actual.toFixed(2)}`;

  const diferencia = actual - anterior;
  const porcentaje = anterior === 0 ? 100 : (diferencia / anterior) * 100;
  const texto = `${diferencia >= 0 ? '+' : ''}${porcentaje.toFixed(1)}% vs ${labelAnterior}`;

  diffEl.textContent = texto;
  diffEl.style.color = diferencia >= 0 ? '#4ADE80' : '#F87171';
}

// ───── Gráfico comparativo de barras por categoría ─────
function renderCompareBarChart(currentMap, prevMap, labelActual, labelAnterior) {
  const allKeys = new Set([...Object.keys(currentMap), ...Object.keys(prevMap)]);
  const categories = Array.from(allKeys).sort();

  const dataActual = categories.map(k => currentMap[k] || 0);
  const dataAnterior = categories.map(k => prevMap[k] || 0);

  const options = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    series: [
      { name: labelAnterior, data: dataAnterior },
      { name: labelActual, data: dataActual }
    ],
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { fontSize: '12px' }
      }
    },
     yaxis: {
      labels: {
        formatter: val => Math.round(val),
        style: {
          fontSize: '11px'
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%'
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    colors: ['#FBBF24', '#60A5FA'],  
    grid: {
      borderColor: '#eee',
      padding: { left: 20, right: 10 }
    }
  };

  if (window.compareBarChart) {
    try {
      window.compareBarChart.destroy();
      console.log('[COMPARE] 🔄 Gráfico anterior destruido');
    } catch (err) {
      console.warn('[COMPARE] Error al destruir gráfico previo:', err);
    }
  }

  window.compareBarChart = new ApexCharts(
    document.querySelector('#compareBarChart'),
    options
  );
  window.compareBarChart.render();
  console.log('[COMPARE] 📊 Gráfico de comparación renderizado');
}

// ───── Gráfico comparativo tipo Radar ─────
function renderCompareRadarChart(currentMap, prevMap, labelActual, labelAnterior) {
  const allKeys = new Set([...Object.keys(currentMap), ...Object.keys(prevMap)]);
  const categories = Array.from(allKeys).sort();

  const dataActual = categories.map(k => currentMap[k] || 0);
  const dataAnterior = categories.map(k => prevMap[k] || 0);

  const options = {
    chart: {
      type: 'radar',
      height: 620, 
      dropShadow: {
        enabled: true,
        blur: 1,
        left: 1,
        top: 1
      },
      toolbar: { show: false }
    },
    series: [
      { name: labelAnterior, data: dataAnterior },
      { name: labelActual, data: dataActual }
    ],
    labels: categories,
    xaxis: {
      labels: {
        show: true,
        style: {
          fontWeight: 600,           
          fontSize: '13px',
          colors: '#333'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontWeight: 400,           
          fontSize: '11px',
          colors: '#888'
        }
      }
    },
    stroke: {
      width: 2,
      colors: ['#FBBF24', '#60A5FA']
    },
    fill: {
      opacity: 0.15
    },
    markers: {
      size: 0
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 2
      }
    },
    colors: ['#FBBF2480', '#60A5FA80']
  };

  if (window.compareRadarChart) {
    try {
      window.compareRadarChart.destroy();
      console.log('[COMPARE] 🧨 Radar chart anterior destruido');
    } catch (err) {
      console.warn('[COMPARE] Error al destruir radar chart previo:', err);
    }
  }

  window.compareRadarChart = new ApexCharts(
    document.querySelector('#compareRadarChart'),
    options
  );
  window.compareRadarChart.render();
  console.log('[COMPARE] 🕸️ Radar chart de comparación renderizado');
}





// ───── Utilidad para formatear "2025-07" como "julio 2025" ─────
function formatMonthLabel(key) {
  const [y, m] = key.split('-');
  const date = new Date(`${y}-${m || '01'}-01`);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
}
