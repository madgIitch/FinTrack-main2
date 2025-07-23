// ───── Archivo: analysis.js ─────
// Este archivo gestiona la vista de análisis financiero en FinTrack.
// Maneja pestañas (General, Crecimiento, Comparación), escucha al usuario autenticado,
// coordina la carga de datos desde Firestore y destruye/reinicializa los gráficos al cambiar de pestaña.

import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral, initCharts, renderAnalysis } from './general.js';
import { loadGrowth } from './growth.js';
import { loadComparison } from './comparison.js'; // 👈 Nuevo

let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';

console.log('[ANALYSIS] Archivo analysis.js cargado');

// ───── Utilidad: ejecutar callback cuando un elemento es visible y activo ─────
export function whenVisible(el, callback) {
  if (!el) {
    console.warn('[Observer] Elemento no encontrado');
    return;
  }

  console.log('[Observer] Observando visibilidad de', el.id);

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      const isVisible = entry.isIntersecting &&
                        getComputedStyle(el).display !== 'none' &&
                        el.classList.contains('active');

      console.log(`[Observer] entry para ${el.id} → isIntersecting=${entry.isIntersecting}, display=${getComputedStyle(el).display}, active=${el.classList.contains('active')}`);

      if (isVisible) {
        console.log(`[Observer] ${el.id} visible y activo → ejecutando callback`);
        callback();
        obs.disconnect(); // Detengo la observación tras ejecutarse una vez
      }
    });
  });

  observer.observe(el);
}

// ───── Lógica principal: espera al DOM y prepara la vista ─────
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const periodSelect = document.getElementById('period-select');

  // Eventos para abrir/cerrar el sidebar
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));

  // Logout
  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  // Generar informe PDF
document.getElementById('generate-report-btn').addEventListener('click', async () => {
  if (!userUid) return alert('Usuario no autenticado');
  const period = new Date().toISOString().slice(0, 7); // formato YYYY-MM

  console.log('[REPORT] Generando informe para', userUid, period);
  try {
    const res = await fetch('https://us-central1-fintrack-1bced.cloudfunctions.net/api/generate_pdf_report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userUid, period })
    });

    const data = await res.json();
    if (data.success && data.url) {
      window.open(data.url, '_blank');
    } else {
      console.error('[REPORT] Error al generar informe:', data.error);
      alert('No se pudo generar el informe.');
    }
  } catch (err) {
    console.error('[REPORT] Error de red:', err);
    alert('Error al generar el informe.');
  }
});


  // Cambio de periodo en el selector de "Este mes", "Esta semana", etc.
  periodSelect.addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    if (userUid) loadGeneral(userUid, selectedPeriod); // recarga la pestaña General con el nuevo periodo
  });

  // Navegación entre pestañas
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selected = btn.dataset.filter;
      const panel = document.getElementById(`panel-${selected}`);

      console.log(`[UI] Click en pestaña: ${selected}`);

      if (!panel) {
        console.warn(`[UI] No se encontró panel para: ${selected}`);
        return;
      }

      // Reseteo estilo activo de todas las pestañas
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.classList.add('active');

      // Solo la pestaña General muestra el selector de periodo
      periodSelect.style.display = (selected === 'overview') ? 'block' : 'none';

      if (!userUid) return;

      // Cambio de lógica y render según pestaña activa
      switch (selected) {
        case 'overview':
          console.log('[UI] → Mostrando pestaña General');
          destroyGrowthCharts();
          destroyComparisonCharts();
          initCharts();
          renderAnalysis();
          break;

        case 'growth':
          console.log('[UI] → Mostrando pestaña Crecimiento');
          destroyGeneralCharts();
          destroyComparisonCharts();
          try {
            await loadGrowth();
          } catch (e) {
            console.error('[GROWTH] Error al cargar crecimiento:', e);
          }
          break;

        case 'compare':
          console.log('[UI] → Mostrando pestaña Comparación');
          destroyGeneralCharts();
          destroyGrowthCharts();
          try {
            await loadComparison(userUid, selectedPeriod);
          } catch (e) {
            console.error('[COMPARE] Error al cargar comparación:', e);
          }
          break;
      }
    });
  });

  // ───── Detecta usuario autenticado y activa pestaña por defecto ─────
  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[AUTH] Usuario autenticado:', userUid);

      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      document.getElementById('period-select').value = savedPeriod;
      selectedPeriod = savedPeriod;

      document.querySelector('.filter-btn[data-filter="overview"]').click(); // inicia en General
    } else {
      window.location.href = '../index.html';
    }
  });
});

// ───── Destrucción de gráficas anteriores para evitar overlays ─────
function destroyChart(instance, name) {
  if (instance && typeof instance.destroy === 'function') {
    try {
      instance.destroy();
      console.log(`[CLEAN] ${name} destruido`);
    } catch (e) {
      console.warn(`[CLEAN] Error al destruir ${name}:`, e);
    }
  }
}

// Gráficas de la pestaña General (línea, barras, pastel)
function destroyGeneralCharts() {
  destroyChart(window.trendChart, 'trendChart');
  destroyChart(window.barChart, 'barChart');
  destroyChart(window.pieChart, 'pieChart');
  window.trendChart = null;
  window.barChart = null;
  window.pieChart = null;
}

// Gráficas de la pestaña Crecimiento (evolución mensual, heatmap, stack)
function destroyGrowthCharts() {
  destroyChart(window.growthChart, 'growthChart');
  destroyChart(window.categoryTrendChart, 'categoryTrendChart');
  destroyChart(window.categoryHeatmap, 'categoryHeatmap');
  window.growthChart = null;
  window.categoryTrendChart = null;
  window.categoryHeatmap = null;
}

// Gráfica de la pestaña Comparación
function destroyComparisonCharts() {
  destroyChart(window.compareBarChart, 'compareBarChart');
  window.compareBarChart = null;
}
