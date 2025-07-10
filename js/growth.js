// growth.js – Pestaña de Crecimiento (con carga de categorías por endpoint separado)

import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { whenVisible } from './analysis.js';

console.log('[GROWTH] Módulo growth.js cargado');

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

  
const groupColors = {
  'Agricultura y Medio Ambiente': '#A8D5BA', // Verde menta
  'Alimentos y Restauración': '#FFB6B9',     // Rosa salmón suave
  'Arte y Cultura': '#D2B4F8',              // Lavanda suave
  'Automoción y Transporte': '#B4C5F8',     // Azul pastel
  'Belleza y Cuidado Personal': '#FDC5F5',  // Rosa palo claro
  'Bienes Raíces y Vivienda': '#B0EACD',    // Verde turquesa suave
  'Compras y Retail': '#FFE29A',            // Amarillo pastel cálido
  'Deportes y Recreación': '#FFDAC1',       // Melocotón claro
  'Educación y Capacitación': '#C3FBD8',    // Verde agua
  'Entretenimiento y Ocio': '#D8C2FF',      // Lila pastel
  'Eventos y Celebraciones': '#FFD6A5',     // Naranja melocotón
  'Finanzas y Seguros': '#E6C9A8',          // Beige dorado
  'Gobierno y Servicios Públicos': '#BCD9EA', // Azul celeste grisáceo
  'Hogar y Jardín': '#F3F798',              // Amarillo verdoso
  'Industrial y Manufactura': '#F2C6DE',    // Rosa púrpura pastel
  'Mascotas y Animales': '#C5C6F1',         // Azul lavanda
  'Otros': '#D9D9D9',                       // Gris neutro claro
  'Religión y Comunidad': '#FAD4C0',        // Rosa cálido
  'Salud y Medicina': '#C9F2F2',            // Aqua muy suave
  'Servicios Profesionales': '#E4BAD4',     // Rosa apagado
  'Tecnología e Internet': '#B0D9F8',       // Azul cielo suave
  'Viajes y Hostelería': '#FFC9DE',         // Rosa coral suave
  'Loan Payments': '#B0BEC5'                // Gris azulado Material Design
};


export async function loadGrowth() {
  console.log('[GROWTH] ⚙️ Iniciando carga de datos para crecimiento');

  const isOnline = navigator.onLine;
  const months = getLast12Months();
  const summaryData = [];
  const categoryData = new Map();



  if (!isOnline) {
    console.warn('[GROWTH] ⚠️ Estás offline. No se puede cargar crecimiento desde Firestore.');
    return;
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Usuario no autenticado');

    // ───── Obtener datos de resumen de ingresos/gastos ─────
    const summaryRes = await fetch(`${apiUrl}/plaid/get_growth_history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!summaryRes.ok) throw new Error(`HTTP ${summaryRes.status} en get_growth_history`);
    const { summary } = await summaryRes.json();

    for (const month of months) {
      if (summary[month]) {
        const ingresos = summary[month].totalIncomes || 0;
        const gastos = summary[month].totalExpenses || 0;
        summaryData.push({ month, ingresos, gastos });
        console.log(`[GROWTH] ✅ Datos cargados para ${month}`);
      } else {
        console.log(`[GROWTH] ⏭️ No hay datos para ${month}, se omite`);
      }
    }

    if (summaryData.length === 0) throw new Error('No hay meses con datos disponibles');

    // ───── Obtener datos de categorías agregadas ─────
    const catRes = await fetch(`${apiUrl}/plaid/get_category_trends`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    if (!catRes.ok) throw new Error(`HTTP ${catRes.status} en get_category_trends`);
    const { categoryTrends } = await catRes.json();
    console.log('[GROWTH] 🔎 categoryTrends completos:', categoryTrends);

    for (const month of months) {
     console.log(`[GROWTH] ¿Hay datos para ${month}?`, categoryTrends[month]);
      if (categoryTrends[month]) {
        categoryData.set(month, categoryTrends[month]);
      }
    }

    console.log('[GROWTH] ✅ Datos finalizados, esperando visibilidad de pestaña para renderizar KPIs y gráficas...');

    whenVisible(document.getElementById('panel-growth'), () => {
      console.log('[GROWTH] 👀 Pestaña visible, renderizando KPIs y gráficas');
      renderGrowthKPIs(summaryData);
      renderGrowthChart(summaryData);
      renderCategoryTrendChart(summaryData.map(d => d.month), categoryData);
      renderCategoryHeatmap(months, categoryData);

    });

  } catch (e) {
    console.error('[GROWTH] ❌ Error al obtener datos de crecimiento:', e.message);
  }
}

async function getCurrentUserId() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      if (user) {
        resolve(user.uid);
      } else {
        reject(new Error('No hay usuario autenticado'));
      }
    }, error => {
      reject(error);
    });
  });
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
    chart: {
      type: 'line',
      height: 320,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    series: [
      { name: 'Ingresos', data: incomes },
      { name: 'Gastos', data: expenses },
      { name: 'Ahorro', data: savings }
    ],
    xaxis: {
      categories,
      tickPlacement: 'between',
      labels: {
        rotate: -45,
        style: {
          fontSize: '11px'
        }
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
    stroke: {
      curve: 'smooth',
      width: 2
    },
    markers: {
      size: 4
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#00C49F', '#FF4C4C', '#0074D9'], // Ingresos, Gastos, Ahorro
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '12px',
      horizontalAlign: 'center',
      markers: {
        width: 10,
        height: 10
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4
      }
    },
    grid: {
      borderColor: '#eee',
      padding: {
        left: 20,
        right: 10,
        bottom: 100 // ✅ Añadimos espacio para leyenda y etiquetas X
      }
    },
    noData: {
      text: 'No hay datos disponibles',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#999',
        fontSize: '14px'
      }
    }
  };

  try {
    const el = document.querySelector('#growthChart');
    if (!el) {
      console.warn('[GROWTH] ⚠️ growthChart container NO ENCONTRADO');
      return;
    }

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
  console.log('[GROWTH] 🔍 Iniciando renderCategoryTrendChart...');
  console.log('[GROWTH] 📆 Meses a mostrar:', months);
  console.log('[GROWTH] 📊 Datos de categoría:', categoryData);

  const allGroups = new Set();
  months.forEach(m => {
    const data = categoryData.get(m);
    if (data) Object.keys(data).forEach(g => allGroups.add(g));
  });

  const sortedGroups = Array.from(allGroups).sort();
  const series = sortedGroups.map(group => ({
    name: group,
    data: months.map(m => categoryData.get(m)?.[group] || 0)
  }));

  console.log('[GROWTH] 🧩 Series generadas:', series);

  const colors = sortedGroups.map(group => groupColors[group] || '#D9D9D9');

  const options = {
    chart: {
      type: 'area',
      height: 320,
      stacked: true,
      toolbar: { show: false },
      animations: { enabled: false }
    },
    series,
    colors,
    xaxis: {
      categories: months,
      labels: { rotate: -45 }
    },
    yaxis: {
      labels: {
        formatter: val => val.toFixed(2)
      }
    },
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    legend: { show: false }, // leyenda externa
    noData: {
      text: 'No hay datos disponibles',
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#999',
        fontSize: '14px'
      }
    }
  };

  try {
    const el = document.querySelector('#categoryTrendChart');
    const legendEl = document.querySelector('#categoryTrendLegend');

    if (!el) return console.warn('[GROWTH] ⚠️ categoryTrendChart container NO ENCONTRADO');
    if (!legendEl) return console.warn('[GROWTH] ⚠️ categoryTrendLegend container NO ENCONTRADO');

    if (window.categoryTrendChart) {
      console.log('[GROWTH] 🔁 Destruyendo gráfico anterior');
      window.categoryTrendChart.destroy();
    }

    window.categoryTrendChart = new ApexCharts(el, options);
    window.categoryTrendChart.render().then(() => {
      console.log('[GROWTH] ✅ categoryTrendChart renderizado correctamente');

      // Leyenda externa renderizada manualmente
      legendEl.innerHTML = sortedGroups.map((group, i) => `
        <div class="legend-item">
          <div class="legend-color" style="background-color: ${colors[i]}"></div>
          <span class="legend-label">${group}</span>
        </div>
      `).join('');
    });

  } catch (e) {
    console.error('[GROWTH] ❌ Error al renderizar categoryTrendChart:', e);
  }
}


function renderCategoryHeatmap(months, categoryData) {
  console.log('[GROWTH] 🟡 Generando heatmap por categoría...');

  // ─── Paso 1: Detectar todos los grupos únicos ────────────────
  const allGroups = new Set();
  months.forEach(month => {
    const data = categoryData.get(month);
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(group => allGroups.add(group));
    }
  });

  // ─── Paso 2: Construir y limpiar series ──────────────────────
  const rawSeries = Array.from(allGroups).map(group => {
    const data = months.map(month => {
      const raw = categoryData.get(month)?.[group];
      const value = typeof raw === 'number' && isFinite(raw) ? raw : 0;
      return { x: month, y: parseFloat(value.toFixed(2)) };
    });
    return { name: group, data };
  });

  // ─── Paso 3: Filtrar series inválidas ────────────────────────
  const series = rawSeries.filter(
    s => s && Array.isArray(s.data) && s.data.length === months.length
  );

  if (!series.length) {
    console.warn('[GROWTH] ❌ No hay series válidas para renderizar el heatmap');
    return;
  }

  console.log('[GROWTH] 🔬 Series finales para heatmap:', series);

  // ─── Paso 4: Configuración del gráfico ───────────────────────
  const options = {
  chart: {
    height: 350,
    type: 'heatmap',
    toolbar: { show: false }
  },
  plotOptions: {
    heatmap: {
      shadeIntensity: 0.5,
      colorScale: {
        ranges: [
          {
            from: 0,
            to: 100,
            color: '#DCE775',
            name: '0 - 100'
          },
          {
            from: 101,
            to: 500,
            color: '#FFF176',
            name: '101 - 500'
          },
          {
            from: 501,
            to: 1000,
            color: '#FFB74D',
            name: '501 - 1000'
          },
          {
            from: 1001,
            to: 999999, // 👈 usar un to alto en vez de Infinity
            color: '#F44336',
            name: '≥ 1001' // 👈 lo importante es este `name`
          }
        ]
      }
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'category',
    categories: months
  },
  series
};


  // ─── Paso 5: Renderizar en el DOM ────────────────────────────
  const el = document.querySelector('#categoryHeatmap');
  if (!el) {
    console.warn('[GROWTH] ⚠️ Contenedor #categoryHeatmap no encontrado');
    return;
  }

  if (window.categoryHeatmap && typeof window.categoryHeatmap.destroy === 'function') {
    console.log('[GROWTH] 🔁 Destruyendo gráfico de heatmap anterior');
    window.categoryHeatmap.destroy();
  }

  window.categoryHeatmap = new ApexCharts(el, options);
  window.categoryHeatmap.render();
  console.log('[GROWTH] ✅ Heatmap renderizado correctamente');
}
