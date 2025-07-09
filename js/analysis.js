import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral } from './general.js';
import { loadGrowth } from './growth.js';

let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';

console.log('[ANALYSIS] Archivo analysis.js cargado');

// ───── Función utilitaria: render si visible ─────
function whenVisible(el, callback) {
  if (!el) {
    console.warn('[Observer] Elemento no encontrado');
    return;
  }

  console.log('[Observer] Iniciando observer para', el.id);

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      console.log(`[Observer] entry para ${el.id}: isIntersecting=${entry.isIntersecting}`);
      if (entry.isIntersecting) {
        console.log(`[Observer] Panel ${el.id} visible → ejecutando callback`);
        callback();
        observer.disconnect();
      }
    });
  });

  observer.observe(el);
}


// ───── Inicio DOM ─────
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  document.getElementById('open-sidebar').addEventListener('click', () => sidebar.classList.add('open'));
  document.getElementById('close-sidebar').addEventListener('click', () => sidebar.classList.remove('open'));

  document.getElementById('logout-link').addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  // Cambio de periodo en pestaña General
  document.getElementById('period-select').addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    if (userUid) loadGeneral(userUid, selectedPeriod);
  });

  // Pestañas
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      console.log(`[UI] Click en pestaña: ${btn.dataset.filter}`);

      // Reset estado visual
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.filter;
      const panel = document.getElementById(`panel-${selected}`);
      if (!panel) {
        console.warn(`[UI] Panel no encontrado para ${selected}`);
        return;
      }
      panel.classList.add('active');

      const periodSelect = document.getElementById('period-select');
      periodSelect.style.display = (selected === 'overview') ? 'block' : 'none';

      if (!userUid) return;

      switch (selected) {
        case 'overview':
          console.log('[UI] → Cargando pestaña General');
          destroyGrowthCharts();
          await loadGeneral(userUid, selectedPeriod);
          break;
        case 'growth':
          console.log('[UI] → Cargando pestaña Crecimiento');
          destroyGeneralCharts();
          await loadGrowth();

          const growthEl = document.getElementById('panel-growth');
          if (!growthEl) {
            console.warn('[Observer] panel-growth no existe en el DOM');
            return;
          }

          whenVisible(growthEl, () => {
            console.log('[Observer] panel-growth visible → re-render forzado');
            try {
              if (window.growthChart) {
                console.log('[Observer] → rendering growthChart');
                window.growthChart.render();
              } else {
                console.warn('[Observer] growthChart no existe');
              }

              if (window.categoryTrendChart) {
                console.log('[Observer] → rendering categoryTrendChart');
                window.categoryTrendChart.render();
              } else {
                console.warn('[Observer] categoryTrendChart no existe');
              }
            } catch (e) {
              console.error('[Observer] Error al forzar renderización:', e);
            }
          });
          break;
        case 'compare':
          console.log('[UI] → Pestaña Comparación (sin implementación aún)');
          break;
      }
    });

  });

  // Autenticación
  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[ANALYSIS] Usuario autenticado:', userUid);

      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      document.getElementById('period-select').value = savedPeriod;
      selectedPeriod = savedPeriod;

      // Activar pestaña por defecto
      document.querySelector('.filter-btn[data-filter="overview"]').click();
    } else {
      window.location.href = '../index.html';
    }
  });
});

// ───── Funciones de limpieza ─────
function destroyGeneralCharts() {
  try {
    window.trendChart?.destroy();
    window.barChart?.destroy();
    window.pieChart?.destroy();
    window.trendChart = null;
    window.barChart = null;
    window.pieChart = null;
    console.log('[CLEAN] Gráficas generales destruidas');
  } catch (e) {
    console.warn('[CLEAN] Error al destruir gráficas generales:', e);
  }
}

function destroyGrowthCharts() {
  try {
    window.growthChart?.destroy();
    window.categoryTrendChart?.destroy();
    window.growthChart = null;
    window.categoryTrendChart = null;
    console.log('[CLEAN] Gráficas de crecimiento destruidas');
  } catch (e) {
    console.warn('[CLEAN] Error al destruir gráficas de crecimiento:', e);
  }
}
