import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral } from './general.js';
import { loadGrowth } from './growth.js';

let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';

console.log('[ANALYSIS] Archivo analysis.js cargado');

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const periodSelect = document.getElementById('period-select');
  const logoutLink = document.getElementById('logout-link');

  document.getElementById('open-sidebar').addEventListener('click', () => {
    sidebar.classList.add('open');
  });

  document.getElementById('close-sidebar').addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  logoutLink.addEventListener('click', async e => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = '../index.html';
  });

  // ───── Cambio de periodo (solo afecta a General) ─────
  periodSelect.addEventListener('change', async e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    if (userUid) {
      destroyGeneralCharts();
      await loadGeneral(userUid, selectedPeriod);
    }
  });

  // ───── Pestañas: General / Crecimiento / Comparación ─────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      // Actualizar UI activa
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.filter;
      const panel = document.getElementById(`panel-${selected}`);
      panel.classList.add('active');

      // Mostrar u ocultar selector de periodo
      periodSelect.style.display = selected === 'overview' ? 'block' : 'none';

      if (!userUid) return;

      switch (selected) {
        case 'overview':
          destroyGrowthCharts();
          destroyGeneralCharts(); // importante
          await loadGeneral(userUid, selectedPeriod);
          break;
        case 'growth':
          destroyGeneralCharts();
          destroyGrowthCharts(); // opcional pero seguro
          await loadGrowth();
          break;
        case 'compare':
          destroyGeneralCharts();
          destroyGrowthCharts();
          // Aquí se añadirá loadComparison() en el futuro
          break;
      }

      // Forzar redibujado de gráficos tras mostrar panel
      setTimeout(() => {
        if (selected === 'overview') {
          window.trendChart?.resize?.();
          window.barChart?.resize?.();
          window.pieChart?.resize?.();
        } else if (selected === 'growth') {
          window.growthChart?.resize?.();
          window.categoryTrendChart?.resize?.();
        }
      }, 150);
    });
  });

  // ───── Autenticación ─────
  onAuthStateChanged(auth, async user => {
    if (user) {
      userUid = user.uid;
      console.log('[ANALYSIS] Usuario autenticado:', userUid);

      const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
      periodSelect.value = savedPeriod;
      selectedPeriod = savedPeriod;

      // Activar pestaña por defecto
      document.querySelector('.filter-btn[data-filter="overview"]').click();
    } else {
      window.location.href = '../index.html';
    }
  });
});

// ───── Funciones para destruir gráficas ─────

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
