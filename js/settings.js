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

// Si estamos en localhost, usamos el emulador o la URL local de Functions; 
// en producción, la URL clásica de Functions v1.
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

  // Cada fila de presupuesto tendrá:
  //  <div class="budget-row">
  //    <select class="category-select">...</select>
  //    <input type="number" class="budget-input" placeholder="0,00" min="0" step="0.01" />
  //    <button class="remove-btn">Eliminar</button>
  //  </div>

  let allCategories = []; // Aquí guardaremos la lista completa de nombres de la colección "groups".

  // Función que crea (y devuelve) una fila de presupuesto, pasándole opcionalmente:
  //   - selectedCategory: nombre de categoría ya seleccionado (string)
  //   - amount: número (el presupuesto que ya tenía configurado el usuario)
  function createBudgetRow(selectedCategory = '', amount = '') {
    // Contenedor principal
    const rowDiv = document.createElement('div');
    rowDiv.className = 'budget-row';

    // 1) SELECT para elegir categoría
    const select = document.createElement('select');
    select.className = 'category-select';
    // Agregamos una opción placeholder por defecto
    const placeholderOption = document.createElement('option');
    placeholderOption.value = '';
    placeholderOption.textContent = '— Selecciona categoría —';
    placeholderOption.disabled = true;
    placeholderOption.selected = (selectedCategory === '');
    select.appendChild(placeholderOption);

    // Luego, por cada categoría disponible, agregamos <option>
    allCategories.forEach(catName => {
      const opt = document.createElement('option');
      opt.value = catName;
      opt.textContent = catName;
      if (catName === selectedCategory) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    // 2) INPUT tipo number para el monto
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'budget-input';
    input.placeholder = '0,00';
    input.min = '0';
    input.step = '0.01';
    if (amount !== '' && !isNaN(amount)) {
      // Si amount viene como string o número, mostramos en el input
      input.value = parseFloat(amount).toFixed(2);
    }

    // 3) BOTÓN para eliminar esta fila
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'Eliminar';
    removeBtn.addEventListener('click', () => {
      rowDiv.remove();
    });

    // Finalmente, montamos todo dentro de la fila
    rowDiv.appendChild(select);
    rowDiv.appendChild(input);
    rowDiv.appendChild(removeBtn);

    return rowDiv;
  }

  // Añade una fila vacía al contenedor
  addCategoryBtn.addEventListener('click', () => {
    budgetsContainer.appendChild(createBudgetRow());
  });

  // ----------------------------------------------------------------------
  // Función principal: cargar datos (notificaciones + presupuestos) del usuario
  // ----------------------------------------------------------------------
  onAuthStateChanged(auth, async (user) => {
    console.log('[settings.js] onAuthStateChanged user:', user);
    if (!user) {
      console.log('[settings.js] No user, redirecting to index');
      window.location.href = '../index.html';
      return;
    }

    const uid     = user.uid;
    const userRef = doc(db, 'users', uid);
    console.log('[settings.js] Authenticated uid:', uid);

    // 1) Obtenemos TODAS las categorías desde Firestore → colección "groups"
    try {
      console.log('[settings.js] Loading all categories from Firestore...');
      const groupsSnapshot = await getDocs(collection(db, 'groups'));
      allCategories = [];
      groupsSnapshot.forEach(docSnap => {
        // Cada docSnap.id es el nombre de la categoría (p.ej. "Agricultura y Medio Ambiente")
        // Si en tu colección tienes algún campo extra, podrías hacer docSnap.data().name, etc.
        allCategories.push(docSnap.id);
      });
      console.log('[settings.js] allCategories:', allCategories);
    } catch (err) {
      console.error('[settings.js] Error loading groups collection:', err);
      // Si falla al cargar categorías, dejamos el array vacío, pero la UI de presupuestos no se podrá poblar bien.
      allCategories = [];
    }

    // 2) Obtenemos los ajustes existentes (notificaciones, informes y también presupuestos)
    let loadedSettings = {};
    try {
      console.log('[settings.js] Fetching user settings from Firestore');
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        loadedSettings = snap.data().settings || {};
        console.log('[settings.js] loadedSettings:', loadedSettings);
      }
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
      loadedSettings = {};
    }

    // ── Inicializar checkboxes de notificaciones/informes ─────────────────────
    const notifications = loadedSettings.notifications || {};
    const reports       = loadedSettings.reports       || {};

    chkNotifPush.checked   = Boolean(notifications.push);
    chkNotifEmail.checked  = Boolean(notifications.email);
    chkReportPush.checked  = Boolean(reports.push);
    chkReportEmail.checked = Boolean(reports.email);

    console.log('[settings.js] Checkbox states:', {
      notifPush: chkNotifPush.checked,
      notifEmail: chkNotifEmail.checked,
      reportPush: chkReportPush.checked,
      reportEmail: chkReportEmail.checked
    });

    // ── POBLAR la sección “Presupuestos” con lo que ya existe ─────────────────
    // Supongamos que en Firestore guardamos algo como:
    //    settings.budgets = { "Automoción y Transporte": 500.00, "Ocio": 200.00, ... }
    const budgetsMap = loadedSettings.budgets || {};
    console.log('[settings.js] existing budgetsMap:', budgetsMap);

    // Limpiamos lo que hubiera en el contenedor
    budgetsContainer.innerHTML = '';

    // Por cada par (categoría → monto) preexistente, agregamos una fila
    Object.entries(budgetsMap).forEach(([catName, amount]) => {
      // Verificamos que catName siga existiendo en allCategories
      // Si no existe, igualmente lo mostramos, pero podría quedar al final.
      if (!allCategories.includes(catName)) {
        allCategories.push(catName);
      }
      const row = createBudgetRow(catName, amount);
      budgetsContainer.appendChild(row);
    });

    // Si no hay ningún presupuesto preconfigurado, mostramos al menos una fila vacía
    if (Object.keys(budgetsMap).length === 0) {
      budgetsContainer.appendChild(createBudgetRow());
    }
  });

  // ----------------------------------------------------------------------
  // Función “Guardar Ajustes” (alarma, informes y presupuestos)
  // ----------------------------------------------------------------------
  btnSave.addEventListener('click', async () => {
    // Deshabilitamos temporalmente el botón
    btnSave.disabled   = true;
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Guardando…';
    console.log('[settings.js] save-settings-btn clicked');

    // 1) Construimos el objeto “newSettings”
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

    // 2) Recolectamos todos los rows dentro de budgetsContainer
    const rows = Array.from(budgetsContainer.querySelectorAll('.budget-row'));

    // Para evitar duplicados de categoría, usamos un Set
    const seenCategories = new Set();

    let valid = true;   // Marcaremos false si encontramos algún error de validación
    let errorMessage = '';

    rows.forEach((row, idx) => {
      const select = row.querySelector('.category-select');
      const input  = row.querySelector('.budget-input');
      const cat    = select.value;
      const amtStr = input.value.trim();

      // Si el usuario dejó el select en “placeholder” o no puso nada, omitimos esta fila
      if (!cat) {
        return;
      }

      // Validamos monto: debe ser un número >= 0
      const amtNum = parseFloat(amtStr);
      if (isNaN(amtNum) || amtNum < 0) {
        valid = false;
        errorMessage = `Fila ${idx + 1}: monto inválido para "${cat}".`;
        return;
      }

      // Validamos duplicados en categoría
      if (seenCategories.has(cat)) {
        valid = false;
        errorMessage = `La categoría "${cat}" está repetida en presupuestos.`;
        return;
      }

      seenCategories.add(cat);
      newSettings.budgets[cat] = amtNum;
    });

    if (!valid) {
      alert(errorMessage);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled   = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    // 3) Guardamos en Firestore → doc(db, 'users', uid) { settings: newSettings }
    //    Aquí asumimos que “uid” sigue en scope (lo capturamos en onAuthStateChanged).
    const user = auth.currentUser;
    if (!user) {
      console.error('[settings.js] No currentUser al guardar ajustes.');
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled   = false;
        btnSave.textContent = originalText;
      }, 2000);
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    console.log('[settings.js] newSettings to save:', newSettings);

    try {
      await updateDoc(userRef, { settings: newSettings });
      console.log('[settings.js] Settings successfully updated in Firestore');
      btnSave.textContent = '¡Guardado!';
      setTimeout(() => {
        btnSave.disabled   = false;
        btnSave.textContent = originalText;
      }, 1500);
    } catch (e) {
      console.error('[settings.js] Error updating settings in Firestore:', e);
      btnSave.textContent = 'Error, reintenta';
      setTimeout(() => {
        btnSave.disabled   = false;
        btnSave.textContent = originalText;
      }, 2000);
    }
  });
});
