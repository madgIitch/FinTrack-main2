import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral } from './general.js';
import { loadGrowth } from './growth.js';

let userUid = null;
let selectedPeriod = localStorage.getItem('selectedPeriod') || 'month';

console.log('[ANALYSIS] Archivo analysis.js cargado');

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

  // Manejo de pestañas
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      const selected = btn.dataset.filter;
      const panel = document.getElementById(`panel-${selected}`);
      panel.classList.add('active');

      const periodSelect = document.getElementById('period-select');
      periodSelect.style.display = (selected === 'overview') ? 'block' : 'none';

      if (!userUid) return;

      switch (selected) {
        case 'overview':
          destroyGrowthCharts();
          await loadGeneral(userUid, selectedPeriod);
          break;
        case 'growth':
          destroyGeneralCharts();
          await loadGrowth();
          break;
        case 'compare':
          // Aquí irá loadComparison() más adelante
          break;
      }

      // Forzar redibujado de gráficos
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
