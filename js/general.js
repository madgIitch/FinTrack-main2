import {auth, app } from './firebase.js';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


console.log('[ANALYSIS] Archivo analysis.js cargado');

const db = getFirestore(app);
let trendChart, barChart, pieChart;
let userId = null;
let selectedPeriod = 'month';
const monthsSet = new Set();
let unsubscribeFns = [];
const catByMonth = new Map();
const daysOfCurrentWeek = new Map();
const subscribedWeeks = new Set();
let lastRevenue = [];
let lastSpend = [];
let lastCatMapStr = '';
let summaryByMonth = new Map(); 


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



document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOM cargado'); // [DEBUG]
  const sidebar = document.getElementById('sidebar');
  
  // Eventos UI
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('[DEBUG] Botón de filtro clicado:', btn.textContent);
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');
    });
  });

  document.getElementById('period-select').addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    console.log('[ANALYSIS] Periodo seleccionado cambiado a:', selectedPeriod); // [DEBUG]
    if (userId) {
      console.log('[DEBUG] Reaplicando filtro tras cambio de periodo'); // [DEBUG]
      applyPeriodFilter(userId, selectedPeriod);
    }
  });

  onAuthStateChanged(auth, async user => {
    if (user) {
      userId = user.uid;
      console.log('[ANALYSIS] Usuario autenticado:', userId); // [DEBUG]
      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      selectedPeriod = savedPeriod;
      document.getElementById('period-select').value = savedPeriod;
      console.log('[DEBUG] Periodo restaurado desde localStorage:', selectedPeriod); // [DEBUG]
      reactiveAnalysis(userId);
      setTimeout(() => {
        console.log('[DEBUG] Ejecutando applyPeriodFilter tras timeout inicial'); // [DEBUG]
        applyPeriodFilter(userId, selectedPeriod);
      }, 200);
    } else {
      console.log('[ANALYSIS] Usuario no autenticado. Redirigiendo...');
      window.location.href = '../index.html';
    }
  });
});

// ───── Utilidad: Ejecutar cuando visible ─────
export function whenVisible(el, callback) {
  if (!el) {
    console.warn('[Observer] Elemento no encontrado');
    return;
  }

  console.log('[Observer] Observando visibilidad de', el.id);

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      const isVisible = entry.isIntersecting && getComputedStyle(el).display !== 'none' && el.classList.contains('active');

      console.log(`[Observer] entry para ${el.id} → isIntersecting=${entry.isIntersecting}, display=${getComputedStyle(el).display}, active=${el.classList.contains('active')}`);

      if (isVisible) {
        console.log(`[Observer] ${el.id} visible y activo → ejecutando callback`);
        callback();
        obs.disconnect();
      }
    });
  });

  observer.observe(el);
}



async function reactiveAnalysis(userId) {
  console.log('[RENDER] Entrando en renderAnalysis con periodo:', selectedPeriod); // [DEBUG]

  const histRef = collection(db, 'users', userId, 'history');
  const sumRef = collection(db, 'users', userId, 'historySummary');

  initCharts();

  let sourcesReady = { history: false, summary: false };

  return new Promise((resolve) => {
    const checkIfReadyToRender = () => {
      if (sourcesReady.history && sourcesReady.summary) {
        console.log('[ANALYSIS] Datos cargados. Aplicando filtro de periodo...');
        applyPeriodFilter(userId, selectedPeriod);
        resolve();  // <- Ahora sí podemos continuar
      }
    };

    const updateSubscriptionsFromSnapshot = (type, snap) => {
      const newMonths = new Set();
      if (type === 'summary') summaryByMonth.clear();

      snap.docs.forEach(doc => {
        newMonths.add(doc.id);
        if (type === 'summary') summaryByMonth.set(doc.id, doc.data());
      });

      newMonths.forEach(m => monthsSet.add(m));
      sourcesReady[type] = true;
      checkIfReadyToRender();
    };

    onSnapshot(histRef, snap => {
      console.log('[ANALYSIS] Snapshot recibido para history:', snap.docs.length);
      updateSubscriptionsFromSnapshot('history', snap);
    });

    onSnapshot(sumRef, snap => {
      console.log('[ANALYSIS] Snapshot recibido para summary:', snap.docs.length);
      updateSubscriptionsFromSnapshot('summary', snap);
    });
  });
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



export function renderAnalysis() {
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
        if (!key || typeof key !== 'string') continue;

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
    const year = new Date().getFullYear().toString();
    const months = [...summaryByMonth.keys()].filter(k => k.startsWith(year)).sort();

    if (months.length === 0) {
      console.log('[ANALYSIS] No hay datos mensuales para el año actual');
      return;
    }

    xLabels = months.map(m => m.split('-')[1]);
    revenue = months.map(m => summaryByMonth.get(m)?.totalIncomes || 0);
    spend = months.map(m => summaryByMonth.get(m)?.totalExpenses || 0);
  }

  if (selectedPeriod !== 'week' && arraysEqual(revenue, lastRevenue) && arraysEqual(spend, lastSpend)) {
    console.log('[ANALYSIS] No hay cambios en ingresos/gastos. Render omitido.');
    return;
  }


  netIncome = revenue.map((r, i) => r - spend[i]);
  const totalRev = revenue.reduce((a, b) => a + b, 0);
  const totalSpd = spend.reduce((a, b) => a + b, 0);

  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent = `€${totalSpd.toFixed(2)}`;

  // ───── Cálculo del cambio porcentual según el periodo ─────
  let revChange = 0, spdChange = 0;

  if (selectedPeriod === 'year' || selectedPeriod === 'month') {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const currSummary = summaryByMonth.get(currentMonthKey);
    const prevSummary = summaryByMonth.get(prevMonthKey);

    const currRev = currSummary?.totalIncomes || 0;
    const prevRev = prevSummary?.totalIncomes || 0;
    const currSpd = currSummary?.totalExpenses || 0;
    const prevSpd = prevSummary?.totalExpenses || 0;

    revChange = ((currRev - prevRev) / Math.max(prevRev, 1)) * 100;
    spdChange = ((currSpd - prevSpd) / Math.max(prevSpd, 1)) * 100;

    console.log('[KPI] Comparando mes actual:', currentMonthKey, 'vs anterior:', prevMonthKey);
    console.log('[KPI] Ingresos: actual', currRev, ', anterior', prevRev);
    console.log('[KPI] Gastos: actual', currSpd, ', anterior', prevSpd);

  } else if (selectedPeriod === 'week') {
    function getWeekDates(baseDate = new Date()) {
      const weekday = baseDate.getDay();
      const startCurrentWeek = new Date(baseDate);
      startCurrentWeek.setDate(baseDate.getDate() - ((weekday + 6) % 7));

      const startPrevWeek = new Date(startCurrentWeek);
      startPrevWeek.setDate(startPrevWeek.getDate() - 7);

      const thisWeekDates = [], lastWeekDates = [];
      for (let i = 0; i < 7; i++) {
        thisWeekDates.push(new Date(startCurrentWeek.getTime() + i * 86400000).toISOString().split('T')[0]);
        lastWeekDates.push(new Date(startPrevWeek.getTime() + i * 86400000).toISOString().split('T')[0]);
      }
      return [thisWeekDates, lastWeekDates];
    }

    const [thisWeekDates, lastWeekDates] = getWeekDates();
    let thisWeekRev = 0, lastWeekRev = 0, thisWeekSpd = 0, lastWeekSpd = 0;

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      const dateKey = key.split('/').pop();
      if (thisWeekDates.includes(dateKey)) {
        thisWeekRev += entry?.totalIncomes || 0;
        thisWeekSpd += entry?.totalExpenses || 0;
      } else if (lastWeekDates.includes(dateKey)) {
        lastWeekRev += entry?.totalIncomes || 0;
        lastWeekSpd += entry?.totalExpenses || 0;
      }
    }

    revChange = ((thisWeekRev - lastWeekRev) / Math.max(lastWeekRev, 1)) * 100;
    spdChange = ((thisWeekSpd - lastWeekSpd) / Math.max(lastWeekSpd, 1)) * 100;

    console.log('[KPI] Comparando semana actual vs anterior');
    console.log('[KPI] Ingresos: actual', thisWeekRev, ', anterior', lastWeekRev);
    console.log('[KPI] Gastos: actual', thisWeekSpd, ', anterior', lastWeekSpd);
  }

  document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
  document.getElementById('kpi-spend-change').textContent = `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;

  console.log('[ANALYSIS] KPI actualizados. Redibujando gráficas...');

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

  lastRevenue = [...revenue];
  lastSpend = [...spend];

  renderPieChartForCurrentPeriod();

  console.log('[RENDER] renderAnalysis completado.'); // [DEBUG]

}






function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.0001) return false;
  return true;
}

export function initCharts() {
  console.log('[ANALYSIS] Inicializando gráficos');
  trendChart = new ApexCharts(document.querySelector('#trendChart'), {
    chart: {
      type: 'line',
      height: 240,
      toolbar: { show: false }
    },
    series: [],
    xaxis: {
      categories: [],
      tickPlacement: 'between', // Alineación centrada entre ticks
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: val => Math.round(val)
      }
    },
    colors: ['#4ADE80', '#F87171'], // Ingresos (verde), Gastos (rojo)
    stroke: {
      curve: 'smooth',
      width: 2
    },
    grid: {
      borderColor: '#eee',
      padding: {
        left: 20,  // 👈 Añadido margen para que no se corte el primer valor
        right: 10
      }
    },
    legend: {
      show: false
    }
  });



  trendChart.render();

  const trendLegend = document.getElementById('trendLegend');
    if (trendLegend) {
      trendLegend.innerHTML = `
        <div class="legend-item">
          <span class="legend-color" style="background:#4ADE80"></span> Ingresos
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background:#F87171"></span> Gastos
        </div>
      `;
    }

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


// ─────────────────────────────────────────────────────────────────────────────
// Devuelve la semana del mes actual ('S1' a 'S5') según el día del mes
// ─────────────────────────────────────────────────────────────────────────────
function getCurrentWeekInMonth() {
  const today = new Date();
  const day = today.getDate();

  if (day <= 7) return 'S1';
  if (day <= 14) return 'S2';
  if (day <= 21) return 'S3';
  if (day <= 28) return 'S4';
  return 'S5';
}



// Renderiza gráfico de pastel (por categoría) según el periodo seleccionado
async function renderPieChartForCurrentPeriod() {
  console.log(`[PieChart] Iniciando render según periodo: ${selectedPeriod}`);

  const catMap = {};
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}-${month}`;
  const semanas = ['S1', 'S2', 'S3', 'S4', 'S5'];

  if (selectedPeriod === 'month') {
    // ✅ Leer directamente el doc mensual
    const monthRef = doc(db, 'users', userId, 'historyCategorias', prefix);
    try {
      const snap = await getDoc(monthRef);
      if (snap.exists()) {
        const data = snap.data();
        console.log(`[PieChart] Categorías mensuales para ${prefix}:`, data);
        for (const [cat, val] of Object.entries(data)) {
          if (cat === 'weeks') continue; // saltar referencia a subcolección
          catMap[cat] = val;
        }
      } else {
        console.warn(`[PieChart] No existe el documento mensual ${prefix}`);
      }
    } catch (err) {
      console.error(`[PieChart] Error al leer ${prefix}:`, err);
    } finally {
      renderPieFinal(catMap);
    }

    } else if (selectedPeriod === 'week') {
  console.log('[PieChart] → Modo semana activado');

  const selectedWeek = getCurrentWeekInMonth();
  const weekRef = doc(db, 'users', userId, 'historyCategorias', prefix, 'weeks', selectedWeek);

  try {
    const snap = await getDoc(weekRef);
    if (snap.exists()) {
      const data = snap.data();
      if (!data || Object.keys(data).length === 0) {
        console.warn(`[PieChart] Semana ${selectedWeek} existe pero sin datos`);
      } else {
        console.log(`[PieChart] Datos de ${prefix}/weeks/${selectedWeek}:`, data);
        for (const [cat, val] of Object.entries(data)) {
          catMap[cat] = val;
        }
      }
    } else {
      console.warn(`[PieChart] No existe el documento de semana ${selectedWeek}`);
    }
  } catch (err) {
    console.error(`[PieChart] Error al leer semana ${selectedWeek}:`, err);
  } finally {
    console.log('[PieChart] Acumulado semanal →', catMap);
    renderPieFinal(catMap);
  }
}
else if (selectedPeriod === 'year') {
    const months = Array.from(monthsSet).filter(m => m.startsWith(year));
    console.log(`[PieChart] Procesando meses del año: ${months.join(', ')}`);
    let pendingMonths = months.length;

    if (pendingMonths === 0) {
      console.warn('[PieChart] No hay meses en monthsSet');
      return renderPieFinal(catMap);
    }

    months.forEach(m => {
      const monthRef = doc(db, 'users', userId, 'historyCategorias', m);
      getDoc(monthRef)
        .then(snap => {
          if (snap.exists()) {
            const data = snap.data();
            console.log(`[PieChart] Año→ ${m}:`, data);
            for (const [cat, val] of Object.entries(data)) {
              if (cat === 'weeks') continue;
              catMap[cat] = (catMap[cat] || 0) + val;
            }
          } else {
            console.warn(`[PieChart] No existe el mes ${m}`);
          }
        })
        .catch(err => {
          console.error(`[PieChart] Error al leer mes ${m}:`, err);
        })
        .finally(() => {
          if (--pendingMonths === 0) {
            console.log('[PieChart] Acumulado anual →', catMap);
            renderPieFinal(catMap);
          }
        });
    });
  }
}

function renderPieFinal(catMap) {
  const currentCatMapStr = JSON.stringify(catMap);

  if (currentCatMapStr === lastCatMapStr) {
    console.log('[PieChart] Sin cambios en categorías. Render omitido.');
    return;
  }

  lastCatMapStr = currentCatMapStr;

  const catLabels = Object.keys(catMap);
  const catData = catLabels.map(cat => +catMap[cat].toFixed(2));

  if (catLabels.length === 0) {
    console.log('[PieChart] No hay datos de categorías. Render cancelado.');
    return;
  }

  console.log('[PieChart] Etiquetas a mostrar:', catLabels);
  console.log('[PieChart] Valores por categoría:', catData);

  const catColors = catLabels.map(label => groupColors[label] || '#999');
  const pieContainer = document.querySelector('#pieChart');

  if (!pieContainer) {
    console.warn('[PieChart] No se encontró el contenedor #pieChart');
    return;
  }

  // ─── Destruir gráfico anterior si existe ──────────────────────
  if (pieChart && typeof pieChart.destroy === 'function') {
    try {
      pieChart.destroy();
      console.log('[PieChart] Gráfico anterior destruido');
    } catch (err) {
      console.warn('[PieChart] Error al destruir gráfico anterior:', err);
    }
  }

  pieChart = new ApexCharts(pieContainer, {
    chart: {
      type: 'pie',
      height: 260,
      animations: { enabled: false }
    },
    series: catData,
    labels: catLabels,
    colors: catColors,
    legend: {
      show: false
    },
    noData: {
      text: 'Sin datos de categorías',
      align: 'center',
      verticalAlign: 'middle',
      style: { color: '#999', fontSize: '14px' }
    }
  });


  pieChart.render().then(() => {
    console.log('[PieChart] Gráfico renderizado correctamente');

    const legendContainer = document.getElementById('pieLegend');
    if (!legendContainer) return;

    const total = catData.reduce((acc, val) => acc + val, 0);

    legendContainer.innerHTML = catLabels.map((label, idx) => {
      const value = catData[idx];
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
      return `
        <div style="display:flex;align-items:center;margin-bottom:4px;font-size:0.85rem">
          <span style="display:inline-block;width:12px;height:12px;background:${catColors[idx]};margin-right:6px;border-radius:2px;"></span>
          ${label} (${percentage}%)
        </div>
      `;
    }).join('');

  });

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



export function loadGeneral(userId, selectedPeriod) {
  console.log('[TAB] → loadGeneral() invocado con:', { userId, selectedPeriod }); // [DEBUG]

  reactiveAnalysis(userId, selectedPeriod).then(() => {
    const overviewPanel = document.getElementById('panel-overview');
    if (!overviewPanel) {
      console.warn('[TAB] No se encontró el panel-overview'); // [DEBUG]
      return;
    }
  });


  initCharts();
  renderAnalysis();
}


