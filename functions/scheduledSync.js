// functions/scheduledSync.js
// Cloud Function HTTP para sincronizar Plaid y actualizar colecciones.
// Invocar mediante Cloud Scheduler como job HTTP (método POST).
// Construye dinámicamente la URL de la API usando el ID de proyecto.

const functions = require('firebase-functions');
const axios = require('axios');
const { admin, db } = require('./firebaseAdmin');

// Normaliza cadenas (quita acentos, espacios → guiones bajos, minúsculas)
function normalizeKey(str) {
  return str.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '');
}

/**
 * HTTP endpoint para sincronizar:
 * - Migrar legacy history
 * - Llamar a get_transactions
 * - Insertar nuevas transacciones en history/{YYYY-MM}/items
 * - Recalcular historySummary, historyCategorias, historyLimits
 * - Enviar notificaciones de presupuesto excedido
 */
exports.scheduledSync = functions.https.onRequest(async (req, res) => {
  // CORS básico
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  console.log('🕒 scheduledSync HTTP iniciada:', new Date().toISOString());

  // Construir URL base de la API usando ID de proyecto
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) {
    console.error('❌ ERROR: No se ha detectado el ID de proyecto en entorno');
    return res.status(500).send('Project ID not detected');
  }
  const apiBaseUrl = `https://us-central1-${projectId}.cloudfunctions.net`;

  try {
    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      console.log(`🔄 Sync usuario: ${userId}`);

      // --- Migrar documentos legacy en history root a history/{YYYY-MM}/items ---
      const rootSnap = await db.collection('users').doc(userId)
        .collection('history').listDocuments();
      const migrateBatch = db.batch();
      for (const docRef of rootSnap) {
        if (!docRef.parent.id) continue;
        // Si padre directo es 'history' y no existe subcolección 'items'
        if (docRef.parent.id === 'history') {
          const d = await docRef.get();
          const tx = d.data();
          if (tx && tx.date && typeof tx.date === 'string' && tx.date.length >= 7) {
            const month = tx.date.slice(0,7);
            const itemRef = db.collection('users').doc(userId)
              .collection('history').doc(month)
              .collection('items').doc(d.id);
            migrateBatch.set(itemRef, tx, { merge: true });
          }
        }
      }
      await migrateBatch.commit();
      console.log('📦 Migración legacy history completada');

      // 1) get_transactions
      let newTxs = [];
      try {
        const resp = await axios.post(
          `${apiBaseUrl}/api/plaid/get_transactions`,
          { userId }
        );
        newTxs = Array.isArray(resp.data.transactions) ? resp.data.transactions : [];
      } catch (err) {
        console.error(`❌ get_transactions fallo para ${userId}:`, err.message);
      }

      // 2) Insertar nuevas en history/{YYYY-MM}/items
      if (newTxs.length) {
        const batch = db.batch();
        newTxs.forEach(tx => {
          if (!tx.date || typeof tx.date !== 'string' || tx.date.length < 7) {
            console.warn(`⚠️ Ignorando transacción sin fecha válida: ${tx.id}`);
            return;
          }
          const month = tx.date.slice(0,7);
          const ref = db.collection('users').doc(userId)
            .collection('history').doc(month)
            .collection('items').doc(tx.id);
          batch.set(ref, tx, { merge: true });
        });
        await batch.commit();
        console.log(`✅ history actualizado con ${newTxs.length} transacciones`);
      }

            // 3) Recalcular collections basadas en history/{YYYY-MM}/items
      const monthsDocs = await db.collection('users').doc(userId)
        .collection('history').listDocuments();
      const txsByMonth = {};
      for (const monthRef of monthsDocs) {
        const mon = monthRef.id;
        const itemsSnap = await monthRef.collection('items').get();
        // Incluir los IDs de los documentos al data
        txsByMonth[mon] = itemsSnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
      }
      for (const monthRef of monthsDocs) {
        const mon = monthRef.id;
        const itemsSnap = await monthRef.collection('items').get();
        // Incluir los IDs de los documentos al data
        txsByMonth[mon] = itemsSnap.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
      }

      // Cargar budgets y grupos categoría
      const settingsSnap = await db.collection('users').doc(userId).get();
      const budgetsMap = settingsSnap.data().settings?.budgets || {};
      const catGroupsSnap = await db.collection('categoryGroups').get();
      const catToGroup = {};
      catGroupsSnap.forEach(doc => {
        const raw = doc.id;
        const grp = doc.data().group || raw;
        catToGroup[normalizeKey(raw)] = grp;
        (doc.data().subcategories || []).forEach(sub => {
          catToGroup[normalizeKey(sub)] = grp;
        });
      });

      // 4) Actualizar historySummary, historyCategorias, historyLimits por mes
      for (const [month, txs] of Object.entries(txsByMonth)) {
        // historySummary
        const sumRef = db.collection('users').doc(userId)
          .collection('historySummary').doc(month);
        const totalExpenses = txs.filter(t => t.amount < 0)
          .reduce((a,t) => a + Math.abs(t.amount), 0);
        const totalIncomes = txs.filter(t => t.amount >= 0)
          .reduce((a,t) => a + t.amount, 0);
        await sumRef.set({ totalExpenses, totalIncomes, updatedAt: admin.firestore.Timestamp.now() });

        // historyCategorias
        const catRef = db.collection('users').doc(userId)
          .collection('historyCategorias').doc(month);
        const spentByGroup = {};
        const batchCat = db.batch();
        txs.forEach(tx => {
          const key = normalizeKey(tx.category || 'otros');
          const grp = catToGroup[key] || 'Otros';
          const amt = tx.amount < 0 ? Math.abs(tx.amount) : 0;
          spentByGroup[grp] = (spentByGroup[grp] || 0) + amt;
          const detRef = catRef.collection(grp).doc(tx.id);
          batchCat.set(detRef, { amount: tx.amount, date: tx.date, description: tx.description || null }, { merge: true });
        });
        batchCat.set(catRef, spentByGroup, { merge: true });
        await batchCat.commit();

        // historyLimits
        const limRef = db.collection('users').doc(userId)
          .collection('historyLimits').doc(month)
          .collection('groups');
        const batchLim = db.batch();
        Object.entries(budgetsMap).forEach(([grp, limit]) => {
          const spent = spentByGroup[grp] || 0;
          batchLim.set(limRef.doc(grp), { limit, spent }, { merge: true });
        });
        await batchLim.commit();
      }

      // 5) Notificaciones por límites excedidos en mes actual
      const currentMonth = new Date().toISOString().slice(0,7);
      const limitsSnap = await db.collection('users').doc(userId)
        .collection('historyLimits').doc(currentMonth)
        .collection('groups').get();
      const exceeded = [];
      limitsSnap.forEach(doc => {
        const { spent, limit } = doc.data();
        if (spent > limit) exceeded.push({ name: doc.id, spent, limit });
      });
      if (exceeded.length) {
        console.log(`⚠️ Excesos detectados para ${userId}:`, exceeded);
        const subsSnap = await db.collection('users').doc(userId)
          .collection('pushSubscriptions').get();
        const payload = {
          notification: {
            title: '⚠️ Límite Excedido',
            body: exceeded.map(e => `${e.name}: ${e.spent}€/ ${e.limit}€`).join('\n'),
            icon: '/icons/alert.png'
          }
        };
        const messaging = admin.messaging();
        subsSnap.forEach(sub => {
          const { token } = sub.data();
          if (token) messaging.sendToDevice(token, payload);
        });
      }

      console.log(`✅ Sync completo para ${userId}`);
    }
    return res.status(200).send('Sync completo');
  } catch (err) {
    console.error('❌ scheduledSync error:', err);
    return res.status(500).send('Error interno');
  }
});
