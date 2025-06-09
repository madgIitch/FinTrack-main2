// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(app);

// URL de tu API (ajústala según entorno)
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[settings.js] DOMContentLoaded');

  // ----------------------------
  // Referencias a elementos UI
  // ----------------------------
  const backBtn         = document.getElementById('back-btn');
  const chkNotifPush    = document.getElementById('notif-push');
  const chkNotifEmail   = document.getElementById('notif-email');
  const chkReportPush   = document.getElementById('report-push');
  const chkReportEmail  = document.getElementById('report-email');
  const btnSave         = document.getElementById('save-settings-btn');
  const budgetsContainer= document.getElementById('budgets-container');
  const addCategoryBtn  = document.getElementById('add-category-btn');

  backBtn.addEventListener('click', () => {
    console.log('[settings.js] backBtn clicked');
    window.history.back();
  });

  let allCategories = [];

  function createBudgetRow(selectedCategory = '', amount = '') {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'budget-row';

    const select = document.createElement('select');
    select.className = 'category-select';
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '— Selecciona categoría —';
    placeholderOption.disabled = true;
    placeholderOption.selected = !selectedCategory;
    select.appendChild(placeholderOption);

    allCategories.forEach(catName => {
      const opt = document.createElement('option');
      opt.value = catName;
      opt.textContent = catName;
      if (catName === selectedCategory) opt.selected = true;
      select.appendChild(opt);
    });

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'budget-input';
    input.placeholder = '0,00';
    input.min = '0';
    input.step = '0.01';
    if (amount !== '' && !isNaN(amount)) {
      input.value = parseFloat(amount).toFixed(2);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Eliminar';
    removeBtn.addEventListener('click', () => rowDiv.remove());

    rowDiv.append(select, input, removeBtn);
    return rowDiv;
  }

  addCategoryBtn.addEventListener('click', () => {
    budgetsContainer.appendChild(createBudgetRow());
  });

  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged user:', user);
    if (!user) {
      window.location.href = '../index.html';
      return;
    }

    const uid     = user.uid;
    const userRef = doc(db, 'users', uid);

    // 1) Cargar categorías
    try {
      const groupsSnap = await getDocs(collection(db, 'groups'));
      allCategories = groupsSnap.docs.map(d => d.id);
      console.log('[settings.js] allCategories:', allCategories);
    } catch (err) {
      console.error('[settings.js] Error loading groups:', err);
      allCategories = [];
    }

    // 2) Cargar ajustes existentes
    let loadedSettings = {};
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        loadedSettings = snap.data().settings || {};
      }
      console.log('[settings.js] loadedSettings:', loadedSettings);
    } catch (err) {
      console.error('[settings.js] Error loading settings:', err);
      loadedSettings = {};
    }

    // Inicializar checkboxes
    const notifications = loadedSettings.notifications || {};
    chkNotifPush.checked  = Boolean(notifications.push);
    chkNotifEmail.checked = Boolean(notifications.email);
    const reports = loadedSettings.reports || {};
    chkReportPush.checked = Boolean(reports.push);
    chkReportEmail.checked= Boolean(reports.email);

    // Poblamos presupuestos
    budgetsContainer.innerHTML = '';
    const budgetsMap = loadedSettings.budgets || {};
    Object.entries(budgetsMap).forEach(([cat, amt]) => {
      if (!allCategories.includes(cat)) allCategories.push(cat);
      budgetsContainer.appendChild(createBudgetRow(cat, amt));
    });
    if (!Object.keys(budgetsMap).length) {
      budgetsContainer.appendChild(createBudgetRow());
    }
  });

  btnSave.addEventListener('click', async () => {
    btnSave.disabled = true;
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Guardando…';
    console.log('[settings.js] save-settings-btn clicked');

    // 1) Construir newSettings
    const newSettings = {
      notifications: {
        push:  chkNotifPush.checked,
        email: chkNotifEmail.checked
      },
      reports: {
        push:  chkReportPush.checked,
        email: chkReportEmail.checked
      },
      budgets: {}
    };

    // 2) Validar y extraer filas
    const rows = Array.from(budgetsContainer.querySelectorAll('.budget-row'));
    const seen = new Set();
    let valid = true, errorMessage = '';

    rows.forEach((row, idx) => {
      const cat = row.querySelector('.category-select').value;
      const amtStr = row.querySelector('.budget-input').value.trim();
      if (!cat) return;

      const amtNum = parseFloat(amtStr);
      if (isNaN(amtNum) || amtNum < 0) {
        valid = false;
        errorMessage = `Fila ${idx+1}: monto inválido para "${cat}".`;
        return;
      }
      if (seen.has(cat)) {
        valid = false;
        errorMessage = `La categoría "${cat}" está repetida.`;
        return;
      }
      seen.add(cat);
      newSettings.budgets[cat] = amtNum;
    });

    if (!valid) {
      alert(errorMessage);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    // 3) Guardar en Firestore
    const user = auth.currentUser;
    if (!user) {
      console.error('[settings.js] No currentUser');
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { settings: newSettings });
      console.log('[settings.js] Settings updated in Firestore');

      // 4) Forzar sync para regenerar historyLimits
      console.log('[settings.js] Calling sync endpoint...');
      const resp = await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      const json = await resp.json();
      console.log('[settings.js] sync_transactions_and_store response:', json);

      btnSave.textContent = '¡Guardado y sincronizado!';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 1500);
    } catch (err) {
      console.error('[settings.js] Error saving settings or syncing:', err);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 2000);
    }
  });
});
