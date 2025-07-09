import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral } from './general.js';
import { loadGrowth } from './growth.js';

let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';

console.log('[ANALYSIS] Archivo analysis.js cargado');

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


// ───── Inicio DOM ─────
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const periodSelect = document.getElementById('period-select');

  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));

  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  periodSelect.addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    if (userUid) loadGeneral(userUid, selectedPeriod);
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const selected = btn.dataset.filter;
      const panel = document.getElementById(`panel-${selected}`);
      console.log(`[UI] Click en pestaña: ${selected}`);

      if (!panel) {
        console.warn(`[UI] No se encontró panel para: ${selected}`);
        return;
      }

      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.classList.add('active');

      periodSelect.style.display = (selected === 'overview') ? 'block' : 'none';

      if (!userUid) return;

      switch (selected) {
        case 'overview':
          console.log('[UI] → Mostrando pestaña General');
          destroyGrowthCharts();

          const panel = document.getElementById('panel-overview');
          if (panel) {
            initCharts();
            renderAnalysis();
          }

          break;


        case 'growth':
          console.log('[UI] → Mostrando pestaña Crecimiento');
          destroyGeneralCharts();

          whenVisible(panel, async () => {
            console.log('[Observer] panel-growth visible → ejecutando loadGrowth');
            try {
              await loadGrowth();
            } catch (e) {
              console.error('[Observer] Error al cargar crecimiento:', e);
            }
          });
          break;

        case 'compare':
          console.log('[UI] → Mostrando pestaña Comparación (sin lógica aún)');
          break;
      }
    });
  });

  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[AUTH] Usuario autenticado:', userUid);

      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      document.getElementById('period-select').value = savedPeriod;
      selectedPeriod = savedPeriod;

      document.querySelector('.filter-btn[data-filter="overview"]').click();
    } else {
      window.location.href = '../index.html';
    }
  });
});

// ───── Destrucción segura de gráficas ─────
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

function destroyGeneralCharts() {
  destroyChart(window.trendChart, 'trendChart');
  destroyChart(window.barChart, 'barChart');
  destroyChart(window.pieChart, 'pieChart');
  window.trendChart = null;
  window.barChart = null;
  window.pieChart = null;
}

function destroyGrowthCharts() {
  destroyChart(window.growthChart, 'growthChart');
  destroyChart(window.categoryTrendChart, 'categoryTrendChart');
  window.growthChart = null;
  window.categoryTrendChart = null;
}
