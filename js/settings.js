// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(app);

// Determina la URL de tu API según el entorno
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';


// ── Crea una fila de presupuesto dinámicamente ──────────────────────────────
function createBudgetRow(selectedCategory = '', amount = '') {
  const rowDiv = document.createElement('div');
  rowDiv.className = 'budget-row';

  const select = document.createElement('select');
  select.className = 'category-select';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '— Selecciona categoría —';
  placeholder.disabled = true;
  placeholder.selected = !selectedCategory;
  select.append(placeholder);

  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selectedCategory) opt.selected = true;
    select.append(opt);
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

let allCategories = [];

document.addEventListener('DOMContentLoaded', () => {
  console.log('[settings.js] DOMContentLoaded');

  // Referencias UI
  const backBtn          = document.getElementById('back-btn');
  const chkNotifPush     = document.getElementById('notif-push');
  const chkNotifEmail    = document.getElementById('notif-email');
  const chkReportPush    = document.getElementById('report-push');
  const chkReportEmail   = document.getElementById('report-email');
  const btnSave          = document.getElementById('save-settings-btn');
  const budgetsContainer = document.getElementById('budgets-container');
  const addCategoryBtn   = document.getElementById('add-category-btn');

  // Navegación atrás
  backBtn.addEventListener('click', () => window.history.back());

  // Añadir nueva fila de presupuesto
  addCategoryBtn.addEventListener('click', () => {
    budgetsContainer.appendChild(createBudgetRow());
  });

  // Guardar solo la preferencia (sin suscribir a nada)
  chkNotifPush.addEventListener('change', () => {
    console.log('[settings.js] notif-push changed (preferencia local):', chkNotifPush.checked);
  });

  // Cuando cambia el estado de auth
  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged:', user);
    if (!user) return window.location.href = '../index.html';
    const uid = user.uid;
    const userRef = doc(db, 'users', uid);

    // 1) Cargar categorías disponibles
    try {
      const snap = await getDocs(collection(db, 'groups'));
      allCategories = snap.docs.map(d => d.id);
      console.log('[settings.js] allCategories:', allCategories);
    } catch (e) {
      console.error('[settings.js] Error loading groups:', e);
      allCategories = [];
    }

    // 2) Cargar ajustes guardados
    let loaded = {};
    try {
      const snap = await getDoc(userRef);
      loaded = snap.exists() ? snap.data().settings || {} : {};
      console.log('[settings.js] loaded settings:', loaded);
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
    }

    // Inicializar checkboxes según lo cargado
    chkNotifPush.checked   = Boolean(loaded.notifications?.push);
    chkNotifEmail.checked  = Boolean(loaded.notifications?.email);
    chkReportPush.checked  = Boolean(loaded.reports?.push);
    chkReportEmail.checked = Boolean(loaded.reports?.email);

    // Poblamos filas de presupuesto
    budgetsContainer.innerHTML = '';
    const map = loaded.budgets || {};
    Object.entries(map).forEach(([cat, amt]) => {
      if (!allCategories.includes(cat)) allCategories.push(cat);
      budgetsContainer.appendChild(createBudgetRow(cat, amt));
    });
    if (!Object.keys(map).length) {
      budgetsContainer.appendChild(createBudgetRow());
    }
  });

  // Guardar ajustes al hacer click
  btnSave.addEventListener('click', async () => {
    console.log('[settings.js] Guardar Ajustes click');
    btnSave.disabled = true;
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Guardando…';

    // Construir objeto settings
    const settings = {
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

    // Validar filas de presupuesto
    const rows = Array.from(budgetsContainer.children);
    const seen = new Set();
    let valid = true, errorMsg = '';

    rows.forEach((row, idx) => {
      const cat = row.querySelector('.category-select').value;
      const amtStr = row.querySelector('.budget-input').value.trim();
      if (!cat) return;
      const amtNum = parseFloat(amtStr);
      if (isNaN(amtNum) || amtNum < 0) {
        valid = false;
        errorMsg = `Fila ${idx+1}: monto inválido para "${cat}".`;
        return;
      }
      if (seen.has(cat)) {
        valid = false;
        errorMsg = `Categoría "${cat}" repetida.`;
        return;
      }
      seen.add(cat);
      settings.budgets[cat] = amtNum;
    });

    if (!valid) {
      alert(errorMsg);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    // Guardar en Firestore y forzar Sync
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { settings });
      console.log('[settings.js] Settings updated in Firestore');

      // Forzar manual sync
      console.log('[settings.js] Calling sync endpoint');
      await fetch(`${apiUrl}/plaid/sync_transactions_and_store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });
      console.log('[settings.js] Sync endpoint called');

      btnSave.textContent = '¡Guardado y sincronizado!';
    } catch (e) {
      console.error('[settings.js] Error saving or syncing:', e);
      btnSave.textContent = 'Error, reintenta';
    } finally {
      setTimeout(() => {
        btnSave.disabled = false;
        btnSave.textContent = originalText;
      }, 1500);
    }
  });
});

let lastScrollTop = 0;
const nav = document.getElementById('bottom-nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  if (!nav) return;

  if (currentScroll > lastScrollTop && currentScroll > 60) {
    // Scroll hacia abajo
    nav.classList.add('hide');
  } else {
    // Scroll hacia arriba
    nav.classList.remove('hide');
  }

  lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });
