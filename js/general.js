import {auth, app } from './firebase.js';
import { getFirestore, collection, onSnapshot, doc } from 'firebase/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


console.log('[ANALYSIS] Archivo analysis.js cargado');

// ───── Inicializo Firestore y declaro variables globales ─────
const db = getFirestore(app);
let trendChart, barChart, pieChart; // Instancias de gráficos
let userId = null; // UID del usuario actual
let selectedPeriod = 'month'; // Periodo actual seleccionado

// Estructuras auxiliares para caching y control
const monthsSet = new Set();                    // Guarda los meses ya procesados
let unsubscribeFns = [];                        // Para cancelar listeners de Firebase cuando haga falta
const catByMonth = new Map();                   // Map mes → categorías con gasto
const daysOfCurrentWeek = new Map();            // Para análisis por día en la semana actual
const subscribedWeeks = new Set();              // Para evitar múltiples subscripciones a la misma semana
let lastRevenue = [];                           // Ingresos anteriores para comparar
let lastSpend = [];                             // Gastos anteriores para comparar
let lastCatMapStr = '';                         // Stringified de último mapa de categorías (para evitar renders redundantes)
let summaryByMonth = new Map();                 // Map mes → resumen de ingresos/gastos

// ───── Colores de cada grupo de categoría para las gráficas ─────
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


// ───── Inicio del DOM: Configuro eventos y autenticación ─────
document.addEventListener('DOMContentLoaded', () => {
  console.log('[ANALYSIS] DOM cargado'); // [DEBUG]
  const sidebar = document.getElementById('sidebar');
  
  // Evento: marcar botón de filtro activo visualmente
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('[DEBUG] Botón de filtro clicado:', btn.textContent);
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');
    });
  });

  // Evento: cambio de periodo (semana, mes, año)
  document.getElementById('period-select').addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    console.log('[ANALYSIS] Periodo seleccionado cambiado a:', selectedPeriod); // [DEBUG]
    if (userId) {
      console.log('[DEBUG] Reaplicando filtro tras cambio de periodo'); // [DEBUG]
      applyPeriodFilter(userId, selectedPeriod);
    }
  });

  // Evento: cuando el estado de auth cambia (login/logout)
  onAuthStateChanged(auth, async user => {
    if (user) {
      userId = user.uid;
      console.log('[ANALYSIS] Usuario autenticado:', userId); // [DEBUG]

      // Restaura el periodo guardado en localStorage
      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      selectedPeriod = savedPeriod;
      document.getElementById('period-select').value = savedPeriod;
      console.log('[DEBUG] Periodo restaurado desde localStorage:', selectedPeriod);

      // Inicio del sistema reactivo
      reactiveAnalysis(userId);

      // Aplico filtro tras un pequeño timeout para asegurar que los datos ya están renderizados
      setTimeout(() => {
        console.log('[DEBUG] Ejecutando applyPeriodFilter tras timeout inicial');
        applyPeriodFilter(userId, selectedPeriod);
      }, 200);
    } else {
      console.log('[ANALYSIS] Usuario no autenticado. Redirigiendo...');
      window.location.href = '../index.html';
    }
  });
});

// ───── Utilidad: Ejecutar una función cuando un elemento sea visible en el viewport ─────
// La uso para asegurar que los gráficos se renderizan solo cuando la pestaña está activa
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
        obs.disconnect(); // Una vez que se ve, dejo de observarlo
      }
    });
  });

  observer.observe(el);
}


// ───── Función principal reactiva: suscribe a history e historySummary ─────
async function reactiveAnalysis(userId) {
  console.log('[RENDER] Entrando en renderAnalysis con periodo:', selectedPeriod); // [DEBUG]

  const histRef = collection(db, 'users', userId, 'history');
  const sumRef = collection(db, 'users', userId, 'historySummary');

  // Inicializo las instancias de los gráficos (los vacía si ya existen)
  initCharts();

  // Marcadores para saber cuándo ambos listeners han respondido al menos una vez
  let sourcesReady = { history: false, summary: false };

  return new Promise((resolve) => {
    // Función que se ejecuta cada vez que uno de los dos listeners responde
    const checkIfReadyToRender = () => {
      if (sourcesReady.history && sourcesReady.summary) {
        console.log('[ANALYSIS] Datos cargados. Aplicando filtro de periodo...');
        applyPeriodFilter(userId, selectedPeriod); //Se renderiza solo cuando tengo ambos conjuntos
        resolve(); // Marco la promesa como completada
      }
    };
    
    // Utilidad para manejar un snapshot recibido (ya sea de history o de summary)
    const updateSubscriptionsFromSnapshot = (type, snap) => {
      const newMonths = new Set();

      // Si es de summary, limpio el mapa actual
      if (type === 'summary') summaryByMonth.clear();

      snap.docs.forEach(doc => {
        newMonths.add(doc.id);

        // Si es summary, guardo el documento completo para KPIs
        if (type === 'summary') summaryByMonth.set(doc.id, doc.data());
      });

      // Guardo en el conjunto global de meses detectados
      newMonths.forEach(m => monthsSet.add(m));
      sourcesReady[type] = true;

      checkIfReadyToRender();
    };

    // Suscripción reactiva al historial de transacciones (estructura base)
    onSnapshot(histRef, snap => {
      console.log('[ANALYSIS] Snapshot recibido para history:', snap.docs.length);
      updateSubscriptionsFromSnapshot('history', snap);
    });

    // Suscripción reactiva al resumen mensual (estructura agregada)
    onSnapshot(sumRef, snap => {
      console.log('[ANALYSIS] Snapshot recibido para summary:', snap.docs.length);
      updateSubscriptionsFromSnapshot('summary', snap);
    });
  });
}

// ───── Filtro según el periodo seleccionado (semana, mes, año) ─────
function applyPeriodFilter(userId, period) {
  console.log('[ANALYSIS] Aplicando filtro para periodo:', period);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}-${month}`;
  let monthsToSubscribe = [];

  // Si el periodo es semana o mes, solo me interesa el mes actual
  if (period === 'week' || period === 'month') {
    monthsToSubscribe = Array.from(monthsSet).filter(m => m.startsWith(prefix));
  }

  // Si es año, me quedo con todos los meses del año actual
  else if (period === 'year') {
    monthsToSubscribe = Array.from(monthsSet).filter(m => m.startsWith(`${year}-`));
  }

  console.log('[ANALYSIS] Meses a suscribirse:', monthsToSubscribe);

  // 🔁 Actualizo las suscripciones con los meses pertinentes
  refreshSubscriptions(monthsToSubscribe, userId);
}

// ───── Se encarga de limpiar y volver a suscribirse a los datos por mes y semana ─────
function refreshSubscriptions(months, userId) {
  console.log('[ANALYSIS] Refrescando suscripciones...');

  // Elimina listeners antiguos para evitar fugas de memoria y duplicados
  clearPreviousSubscriptions();

  months.forEach(mon => {
    // Suscribo a los datos de categorías para este mes
    subscribeToMonth(mon, userId);

    // Si el periodo es semana o mes, también me suscribo a los datos diarios de cada semana
    if (selectedPeriod === 'month' || selectedPeriod === 'week') {
      for (let i = 1; i <= 5; i++) {
        const weekId = `S${i}`;

        // Ruta: historySummary/{mon}/weeks/{Sx}/days
        const daysRef = collection(db, 'users', userId, 'historySummary', mon, 'weeks', weekId, 'days');

        // Me suscribo a los documentos de cada día de esa semana
        const unsubDays = onSnapshot(daysRef, snap => {
          console.log(`[ANALYSIS] Snapshot días para ${mon}/weeks/${weekId}:`, snap.docs.length);

          for (const doc of snap.docs) {
            const fullKey = `${mon}/weeks/${weekId}/${doc.id}`; // identificador único del día
            daysOfCurrentWeek.set(fullKey, doc.data());
          }

          // ⚡ Re-renderizo cada vez que llegan nuevos días
          renderAnalysis();
        });

        // Registro la función para poder desuscribirme luego
        unsubscribeFns.push(unsubDays);
      }
    }
  });
}

// ───── Limpia todos los listeners previos antes de nuevas suscripciones ─────
function clearPreviousSubscriptions() {
  console.log('[ANALYSIS] Limpiando suscripciones anteriores');

  // Llamo a cada función de desuscripción activa
  unsubscribeFns.forEach(unsub => unsub());

  // Reinicio los arrays y sets de control
  unsubscribeFns = [];
  subscribedWeeks.clear();
}

// ───── Suscribe a los datos de categorías agregadas para un mes concreto ─────
function subscribeToMonth(mon, userId) {
  console.log('[ANALYSIS] Subscribiendo a mes (solo categorías):', mon);

  const catDocRef = doc(db, 'users', userId, 'historyCategorias', mon);

  // Escucho el documento de categorías para el mes dado
  const unsubCat = onSnapshot(catDocRef, snap => {
    console.log('[ANALYSIS] Snapshot categorías:', mon, snap.exists());

    if (snap.exists()) {
      const data = snap.data();
      delete data.updatedAt; // No necesito este campo para renderizar
      catByMonth.set(mon, data);
    }

    // 🔁 Actualizo la visualización al recibir nuevos datos
    renderAnalysis();
  });

  // Guardo el listener para desuscribirlo después
  unsubscribeFns.push(unsubCat);
}

// ───── Función principal de renderizado de análisis financiero ─────
export function renderAnalysis() {
  console.log('[ANALYSIS] Renderizando análisis...');

  // Si estamos en modo semana o mes pero no tenemos datos diarios, no tiene sentido continuar
  if ((selectedPeriod === 'month' || selectedPeriod === 'week') && daysOfCurrentWeek.size === 0) {
    console.log('[ANALYSIS] No hay datos diarios disponibles');
    return;
  }

  // Inicializo las estructuras de datos base
  let xLabels = [], revenue = [], spend = [], netIncome = [];

  // ───── Agrupación por semanas (cuando el periodo es mensual) ─────
  if (selectedPeriod === 'month') {
    const semanas = ['S1', 'S2', 'S3', 'S4', 'S5'];
    xLabels = semanas;
    revenue = new Array(5).fill(0);
    spend = new Array(5).fill(0);

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      if (!key || typeof key !== 'string') continue;

      const parts = key.split('/');
      const weekIdx = semanas.indexOf(parts[2]); // Ej: key = "2025-07/weeks/S3/2025-07-15"
      if (weekIdx === -1) continue;

      // Sumo ingresos/gastos en la semana correspondiente
      revenue[weekIdx] += entry?.totalIncomes || 0;
      spend[weekIdx] += entry?.totalExpenses || 0;
    }

  }

  // ───── Agrupación por días (cuando el periodo es semanal) ─────
  else if (selectedPeriod === 'week') {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    xLabels = dias;
    revenue = new Array(7).fill(0);
    spend = new Array(7).fill(0);

    for (const [key, entry] of daysOfCurrentWeek.entries()) {
      const dateStr = key.split('/').at(-1); // Extraigo la fecha
      const date = new Date(dateStr);
      const idx = (date.getDay() + 6) % 7; // Ajuste para que Lunes sea 0
      revenue[idx] += entry?.totalIncomes || 0;
      spend[idx] += entry?.totalExpenses || 0;
    }
  }

  // ───── Agrupación por meses (cuando el periodo es anual) ─────
  else if (selectedPeriod === 'year') {
    const year = new Date().getFullYear().toString();
    const months = [...summaryByMonth.keys()].filter(k => k.startsWith(year)).sort();

    if (months.length === 0) {
      console.log('[ANALYSIS] No hay datos mensuales para el año actual');
      return;
    }

    xLabels = months.map(m => m.split('-')[1]); // Extraigo número de mes
    revenue = months.map(m => summaryByMonth.get(m)?.totalIncomes || 0);
    spend = months.map(m => summaryByMonth.get(m)?.totalExpenses || 0);
  }

  // ───── Evito renders innecesarios si los datos no han cambiado ─────
  if (selectedPeriod !== 'week' && arraysEqual(revenue, lastRevenue) && arraysEqual(spend, lastSpend)) {
    console.log('[ANALYSIS] No hay cambios en ingresos/gastos. Render omitido.');
    return;
  }

  // Calculo el saldo neto como diferencia ingreso - gasto
  netIncome = revenue.map((r, i) => r - spend[i]);
  const totalRev = revenue.reduce((a, b) => a + b, 0);
  const totalSpd = spend.reduce((a, b) => a + b, 0);

  // Actualizo KPIs absolutos
  document.getElementById('kpi-revenue').textContent = `€${totalRev.toFixed(2)}`;
  document.getElementById('kpi-spend').textContent = `€${totalSpd.toFixed(2)}`;

  // ───── Cálculo del % de variación respecto al periodo anterior ─────
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
  }

  // ───── Lógica alternativa para comparación semanal ─────
  else if (selectedPeriod === 'week') {
    function getWeekDates(baseDate = new Date()) {
      const weekday = baseDate.getDay();
      const startCurrentWeek = new Date(baseDate);
      startCurrentWeek.setDate(baseDate.getDate() - ((weekday + 6) % 7)); // Lunes actual

      const startPrevWeek = new Date(startCurrentWeek);
      startPrevWeek.setDate(startPrevWeek.getDate() - 7); // Lunes anterior

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

  // Actualizo los elementos de cambio de KPI (con signo + o -)
  document.getElementById('kpi-revenue-change').textContent = `${revChange >= 0 ? '+' : ''}${revChange.toFixed(1)}% vs periodo anterior`;
  document.getElementById('kpi-spend-change').textContent = `${spdChange >= 0 ? '+' : ''}${spdChange.toFixed(1)}% vs periodo anterior`;

  console.log('[ANALYSIS] KPI actualizados. Redibujando gráficas...');

  // ───── Renderizo las gráficas de ingresos/gastos y saldo neto ─────
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

  // Guardo los datos actuales para detectar futuros cambios
  lastRevenue = [...revenue];
  lastSpend = [...spend];

  //Renderizo el gráfico de pastel para el periodo actual
  renderPieChartForCurrentPeriod();

  console.log('[RENDER] renderAnalysis completado.');
}






function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 0.0001) return false;
  return true;
}

// ───── Función para inicializar todos los gráficos de la pestaña de análisis ─────
export function initCharts() {
  console.log('[ANALYSIS] Inicializando gráficos');

  // ───── Gráfico de línea: Ingresos vs Gastos ─────
  trendChart = new ApexCharts(document.querySelector('#trendChart'), {
    chart: {
      type: 'line',           // Tipo línea para mostrar evolución temporal
      height: 240,            // Altura del gráfico
      toolbar: { show: false } // Oculto el menú interactivo
    },
    series: [],               // Se llenará dinámicamente con datos reales
    xaxis: {
      categories: [],         // Ejes X (semanas, días o meses)
      tickPlacement: 'between', // Para que los puntos se alineen bien
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: val => Math.round(val) // Simplifico etiquetas Y
      }
    },
    colors: ['#4ADE80', '#F87171'], // Verde (Ingresos) y Rojo (Gastos)
    stroke: {
      curve: 'smooth',       // Línea suave
      width: 2
    },
    grid: {
      borderColor: '#eee',   // Color suave para cuadrícula
      padding: {
        left: 20,            // Añadido margen para que no se corte el valor más a la izquierda
        right: 10
      }
    },
    legend: {
      show: false // Oculto leyenda del gráfico, se pone manual más abajo
    }
  });

  // Renderizo el gráfico de línea en pantalla
  trendChart.render();

  // ───── Leyenda personalizada para Ingresos y Gastos ─────
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

  // ───── Gráfico de barras: Saldo neto (Ingresos - Gastos) ─────
  barChart = new ApexCharts(document.querySelector('#barChart'), {
    chart: {
      type: 'bar',
      height: 200,
      toolbar: { show: false }
    },
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
            { from: -Infinity, to: 0, color: '#F87171' },  // Negativo → rojo
            { from: 0.01, to: Infinity, color: '#4ADE80' } // Positivo → verde
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
    grid: {
      borderColor: '#eee'
    }
  });

  // Renderizo gráfico de barras
  barChart.render();

  // ───── Gráfico de pastel: Distribución por categoría ─────
  pieChart = new ApexCharts(document.querySelector('#pieChart'), {
    chart: {
      type: 'pie',
      height: 220,
      animations: { enabled: false } // Evito animaciones para que no se rompa al cambiar de pestaña
    },
    series: [],   // Se rellenará según los datos de categoría disponibles
    labels: [],
    colors: [],
    legend: {
      position: 'bottom' // Coloco leyenda abajo para facilitar lectura en móviles
    },
    noData: {
      text: 'Cargando datos...', // Mensaje por defecto mientras no hay datos
      align: 'center',
      verticalAlign: 'middle',
      style: {
        color: '#999',
        fontSize: '14px'
      }
    }
  });

  // Renderizo gráfico de pastel
  pieChart.render();
}


// Devuelve la semana del mes actual ('S1' a 'S5') según el día del mes
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
    // Leer directamente el doc mensual
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
  reactiveAnalysis(userId).then(() => {
    renderAnalysis(); // ✅ Solo renderizas una vez los datos están listos
  });

}


