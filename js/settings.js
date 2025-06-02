// public/js/settings.js

import { auth, app } from './firebase.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const db = getFirestore(app);
const apiUrl = 'https://api-t6634jgkjqu-uc.a.run.app/api'; 


document.addEventListener('DOMContentLoaded', () => {
  console.log('[settings.js] DOMContentLoaded');

  // ── Botón “atrás” ────────────────────────────────────────────────────────
  const backBtn = document.getElementById('back-btn');
  console.log('[settings.js] backBtn element:', backBtn);
  backBtn.addEventListener('click', () => {
    console.log('[settings.js] backBtn clicked');
    window.history.back();
  });

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

    // ── Referencias UI ─────────────────────────────────────────────────
    const chkNotifPush     = document.getElementById('notif-push');
    const chkNotifEmail    = document.getElementById('notif-email');
    const chkReportPush    = document.getElementById('report-push');
    const chkReportEmail   = document.getElementById('report-email');
    const btnSaveSettings  = document.getElementById('save-settings-btn');
    const budgetsContainer = document.getElementById('budgets-container');
    const addCategoryBtn   = document.getElementById('add-category-btn');

    // ── Cargar ajustes existentes (notificaciones y reportes) ──────────
    let loadedSettings = {};
    try {
      console.log('[settings.js] Fetching user settings from Firestore');
      const snap = await getDoc(userRef);
      console.log('[settings.js] userDoc exists?:', snap.exists());
      if (snap.exists()) {
        loadedSettings = snap.data().settings || {};
        console.log('[settings.js] loadedSettings:', loadedSettings);
      }
    } catch (e) {
      console.error('[settings.js] Error loading settings:', e);
    }

    const notifications = loadedSettings.notifications || {};
    const reports       = loadedSettings.reports       || {};

    // ── Rellenar UI con valores de notificaciones/reportes ──────────
    console.log('[settings.js] Populating checkboxes');
    chkNotifPush.checked   = Boolean(notifications.push);
    chkNotifEmail.checked  = Boolean(notifications.email);
    chkReportPush.checked  = Boolean(reports.push);
    chkReportEmail.checked = Boolean(reports.email);

    // ── Guardar ajustes de notificaciones/reportes al pulsar botón ───
    btnSaveSettings.addEventListener('click', async () => {
      console.log('[settings.js] save-settings-btn clicked');
      btnSaveSettings.disabled    = true;
      const originalText           = btnSaveSettings.textContent;
      btnSaveSettings.textContent  = 'Guardando…';

      const newSettings = {
        notifications: {
          push:  chkNotifPush.checked,
          email: chkNotifEmail.checked
        },
        reports: {
          push:  chkReportPush.checked,
          email: chkReportEmail.checked
        }
      };
      console.log('[settings.js] New settings to save:', newSettings);

      try {
        await updateDoc(userRef, { settings: newSettings });
        console.log('[settings.js] Settings successfully updated in Firestore');
        btnSaveSettings.textContent = '¡Guardado!';
        setTimeout(() => {
          btnSaveSettings.disabled   = false;
          btnSaveSettings.textContent = originalText;
        }, 1500);
      } catch (e) {
        console.error('[settings.js] Error updating settings:', e);
        btnSaveSettings.textContent = 'Error, reintenta';
        setTimeout(() => {
          btnSaveSettings.disabled   = false;
          btnSaveSettings.textContent = originalText;
        }, 2000);
      }
    });

    // ── Variables globales para grupos y presupuestos ───────────────────
    let allGroups = [];       // [{ id, name }]
    let budgetsMap = {};      // { [groupId]: { monthlyLimit, periodStart } }

    // ── Carga inicial de grupos y presupuestos ─────────────────────────
    await fetchGroups();
    await fetchBudgetsForUser(uid);
    renderAllBudgetRows();

    // ── Handler “Añadir Categoría” ──────────────────────────────────────
    addCategoryBtn.addEventListener('click', () => {
      showAddBudgetRow();
    });

    // ────────────────────────────────────────────────────────────────────

    /**
     * Obtiene todos los documentos de 'groups' y los almacena en allGroups.
     */
    async function fetchGroups() {
      console.log('[settings.js] fetchGroups → iniciando');
      try {
        const groupsSnap = await getDocs(collection(db, 'groups'));
        allGroups = [];
        groupsSnap.forEach(docSnap => {
          const data = docSnap.data();
          allGroups.push({
            id: docSnap.id,
            name: data.name || 'Sin nombre'
          });
        });
        console.log('[settings.js] Grupos obtenidos:', allGroups);
      } catch (e) {
        console.error('[settings.js] Error fetching groups:', e);
        allGroups = [];
      }
    }

    /**
     * Obtiene todos los presupuestos del usuario actual y los guarda en budgetsMap.
     */
    async function fetchBudgetsForUser(userId) {
      console.log('[settings.js] fetchBudgetsForUser → iniciando');
      budgetsMap = {};
      try {
        const budgetsQuery = query(
          collection(db, 'budgets'),
          where('userId', '==', userId)
        );
        const budSnap = await getDocs(budgetsQuery);
        budSnap.forEach(docSnap => {
          const data = docSnap.data();
          budgetsMap[data.groupId] = {
            monthlyLimit: data.monthlyLimit,
            periodStart: data.periodStart
          };
        });
        console.log('[settings.js] Presupuestos existentes:', budgetsMap);
      } catch (e) {
        console.error('[settings.js] Error fetching budgets:', e);
        budgetsMap = {};
      }
    }

    /**
     * Genera en el DOM una fila por cada presupuesto existente en budgetsMap.
     * Cada fila muestra el nombre del grupo y permite editar/eliminar el presupuesto.
     */
    function renderAllBudgetRows() {
      console.log('[settings.js] renderAllBudgetRows → iniciando');
      budgetsContainer.innerHTML = '';

      // Para cada groupId en budgetsMap, crear fila
      Object.keys(budgetsMap).forEach(groupId => {
        const group = allGroups.find(g => g.id === groupId);
        if (!group) return; // si grupo ya no existe, omitimos

        const { monthlyLimit } = budgetsMap[groupId];
        createBudgetRow({ 
          groupId, 
          groupName: group.name, 
          currentLimit: monthlyLimit,
          isExisting: true 
        });
      });

      console.log('[settings.js] renderAllBudgetRows → completado');
    }

    /**
     * Muestra una nueva fila con un <select> de grupos disponibles (los que aún no tienen presupuesto)
     * y un input para establecer un límite. Al guardar, se crea el documento en Firestore y se re-renderiza.
     */
    function showAddBudgetRow() {
      console.log('[settings.js] showAddBudgetRow → iniciando');
      
      // Si ya hay un row de “añadir” abierto, no creamos otro
      if (document.querySelector('.adding-budget-row')) {
        console.log('[settings.js] Ya existe un row de añadir abierto');
        return;
      }

      // Determinar grupos disponibles (los que no están en budgetsMap)
      const usedGroupIds = new Set(Object.keys(budgetsMap));
      const availableGroups = allGroups.filter(g => !usedGroupIds.has(g.id));

      if (availableGroups.length === 0) {
        alert('Ya no quedan grupos disponibles para asignar presupuesto.');
        return;
      }

      // Crear contenedor de fila
      const row = document.createElement('div');
      row.className = 'budget-row adding-budget-row';

      // Crear <select> con opciones de groups disponibles
      const select = document.createElement('select');
      select.className = 'budget-select';
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Selecciona grupo --';
      select.appendChild(defaultOption);
      availableGroups.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        select.appendChild(opt);
      });
      row.appendChild(select);

      // Input para límite mensual
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.01';
      input.placeholder = '0.00';
      input.className = 'budget-input';
      row.appendChild(input);

      // Botón “Guardar”
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Guardar';
      saveBtn.className = 'budget-save-btn';
      row.appendChild(saveBtn);

      // Botón “Cancelar”
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.className = 'budget-cancel-btn';
      row.appendChild(cancelBtn);

      budgetsContainer.prepend(row);

      // ── Handler “Guardar” en modo agregar ─────────────────────────────────
      saveBtn.addEventListener('click', async () => {
        const selectedGroupId = select.value;
        if (!selectedGroupId) {
          alert('Selecciona un grupo válido.');
          return;
        }
        const value = parseFloat(input.value);
        if (isNaN(value) || value < 0) {
          alert('Ingresa un monto válido (≥ 0).');
          return;
        }

        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const budgetDocId = `${uid}_${selectedGroupId}`;
        const budgetRef = doc(db, 'budgets', budgetDocId);
        const budgetData = {
          userId: uid,
          groupId: selectedGroupId,
          monthlyLimit: value,
          periodStart: periodStart
        };

        try {
          await setDoc(budgetRef, budgetData, { merge: true });
          // Actualizar budgetsMap y re-renderizar
          budgetsMap[selectedGroupId] = {
            monthlyLimit: value,
            periodStart: periodStart
          };
          console.log(`[settings.js] Presupuesto agregado para grupo ${selectedGroupId}:`, budgetData);
          renderAllBudgetRows();
        } catch (e) {
          console.error('[settings.js] Error guardando nuevo presupuesto:', e);
          alert('No se pudo guardar el presupuesto. Intenta de nuevo.');
        }
      });

      // ── Handler “Cancelar” ────────────────────────────────────────────────
      cancelBtn.addEventListener('click', () => {
        row.remove();
      });

      console.log('[settings.js] showAddBudgetRow → completado');
    }

    /**
     * Crea y agrega al DOM una fila correspondiente a un presupuesto existente.
     * Si isExisting = true, se muestran botones de “Editar” y “Eliminar”.
     * @param {Object} params
     * @param {string} params.groupId
     * @param {string} params.groupName
     * @param {number} params.currentLimit
     * @param {boolean} params.isExisting
     */
    function createBudgetRow({ groupId, groupName, currentLimit, isExisting }) {
      console.log(`[settings.js] createBudgetRow → ${groupId}, existente:${isExisting}`);

      const row = document.createElement('div');
      row.className = 'budget-row';

      // Label con el nombre del grupo
      const label = document.createElement('span');
      label.textContent = groupName;
      label.className = 'category-name';
      row.appendChild(label);

      // Input para editar límite
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.01';
      input.value = currentLimit;
      input.className = 'budget-input';
      input.disabled = true; // inicialmente deshabilitado
      row.appendChild(input);

      // Botón “Editar” (permite habilitar el input)
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.className = 'budget-edit-btn';
      row.appendChild(editBtn);

      // Botón “Eliminar”
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.className = 'budget-delete-btn';
      row.appendChild(deleteBtn);

      budgetsContainer.appendChild(row);

      // ── Handler “Editar” ────────────────────────────────────────────────
      let isEditing = false;
      editBtn.addEventListener('click', async () => {
        if (!isEditing) {
          // Cambiar a modo edición
          isEditing = true;
          input.disabled = false;
          editBtn.textContent = 'Guardar';
          row.classList.add('editing');
        } else {
          // Validar y guardar cambios
          const newValue = parseFloat(input.value);
          if (isNaN(newValue) || newValue < 0) {
            alert('Ingresa un monto válido (≥ 0).');
            return;
          }
          const now = new Date();
          const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const budgetDocId = `${uid}_${groupId}`;
          const budgetRef = doc(db, 'budgets', budgetDocId);
          const updatedData = {
            monthlyLimit: newValue,
            periodStart: periodStart
          };
          try {
            await setDoc(budgetRef, updatedData, { merge: true });
            budgetsMap[groupId] = {
              monthlyLimit: newValue,
              periodStart: periodStart
            };
            console.log(`[settings.js] Presupuesto actualizado para grupo ${groupId}:`, updatedData);
            // Salir de modo edición
            isEditing = false;
            input.disabled = true;
            editBtn.textContent = 'Editar';
            row.classList.remove('editing');
          } catch (e) {
            console.error('[settings.js] Error actualizando presupuesto:', e);
            alert('No se pudo actualizar el presupuesto. Intenta de nuevo.');
          }
        }
      });

      // ── Handler “Eliminar” ─────────────────────────────────────────────
      deleteBtn.addEventListener('click', async () => {
        if (!confirm(`¿Eliminar presupuesto para "${groupName}"?`)) return;
        const budgetDocId = `${uid}_${groupId}`;
        const budgetRef = doc(db, 'budgets', budgetDocId);
        try {
          await deleteDoc(budgetRef);
          delete budgetsMap[groupId];
          console.log(`[settings.js] Presupuesto eliminado para grupo ${groupId}`);
          renderAllBudgetRows();
        } catch (e) {
          console.error('[settings.js] Error eliminando presupuesto:', e);
          alert('No se pudo eliminar el presupuesto. Intenta de nuevo.');
        }
      });

      console.log(`[settings.js] createBudgetRow → fila creada para ${groupId}`);
    }
  });
});
