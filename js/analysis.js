import { auth, app } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { loadGeneral } from './general.js';

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

  document.getElementById('period-select').addEventListener('change', e => {
    selectedPeriod = e.target.value;
    localStorage.setItem('selectedPeriod', selectedPeriod);
    if (userUid) loadGeneral(userUid, selectedPeriod);
  });

  onAuthStateChanged(auth, async user => {
  if (user) {
    userId = user.uid;
    console.log('[ANALYSIS] Usuario autenticado:', userId);

    const savedPeriod = localStorage.getItem('selectedPeriod') || 'month';
    document.getElementById('period-select').value = savedPeriod;
    selectedPeriod = savedPeriod;

    console.log('[ANALYSIS] Periodo restaurado desde localStorage:', selectedPeriod);

    // Ahora llama primero a applyPeriodFilter, y renderiza dentro del flujo de datos cargados
    await reactiveAnalysis(userId);
  } else {
    window.location.href = '../index.html';
  }
});

});
