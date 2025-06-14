// functions/scheduledSync.js
// Cloud Function HTTP para sincronizar Plaid y actualizar colecciones.
// Invocar mediante Cloud Scheduler como job HTTP (método POST).

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

      // 1) Migrar legacy: docs planos en history → history/{YYYY-MM}/items
      const plainHistory = await db.collection('users').doc(userId)
        .collection('history').listDocuments();
      const migrateBatch = db.batch();
      for (const docRef of plainHistory) {
        if (docRef.parent?.id === 'history') {
          const snap = await docRef.get();
          const tx = snap.data();
          if (tx?.date?.slice?.(0,7)) {
            const mon = tx.date.slice(0,7);
            const itemRef = db.collection('users').doc(userId)
              .collection('history').doc(mon)
              .collection('items').doc(snap.id);
            migrateBatch.set(itemRef, tx, { merge: true });
          }
        }
      }
      await migrateBatch.commit();
      console.log('📦 Migración legacy history completada');

      // 2) get_transactions
      let newTxs = [];
      try {
        const resp = await axios.post(
          `${apiBaseUrl}/api/plaid/get_transactions`,
          { userId }
        );
        newTxs = Array.isArray(resp.data.transactions) ? resp.data.transactions : [];
      } catch (err) {
        console.error(`❌ get_transactions falló para ${userId}:`, err.message);
      }

      // 3) Guardar nuevas transacciones
      if (newTxs.length) {
        const batch = db.batch();
        for (const tx of newTxs) {
          if (!tx.date?.slice?.(0,7)) continue;
          const mon = tx.date.slice(0,7);
          const ref = db.collection('users').doc(userId)
            .collection('history').doc(mon)
            .collection('items').doc(tx.transaction_id || tx.id);
          batch.set(ref, tx, { merge: true });
        }
        await batch.commit();
        console.log(`✅ Insertadas/actualizadas ${newTxs.length} transacciones`);
      }

      // 4) Recalcular por mes
      const monthDocs = await db.collection('users').doc(userId)
        .collection('history').listDocuments();
      const txsByMonth = {};
      for (const monRef of monthDocs) {
        const mon = monRef.id;
        const itemsSnap = await monRef.collection('items').get();
        txsByMonth[mon] = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // Cargar budgets y grupos
      const userSettings = (await db.collection('users').doc(userId).get()).data().settings || {};
      const budgetsMap = userSettings.budgets || {};
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

      // 5) Update summary, categorias y limits
      for (const [mon, txs] of Object.entries(txsByMonth)) {
        // historySummary
        const sumRef = db.collection('users').doc(userId)
          .collection('historySummary').doc(mon);
        const totalExp = txs.filter(t => t.amount < 0).reduce((s,t) => s + Math.abs(t.amount), 0);
        const totalInc = txs.filter(t => t.amount >= 0).reduce((s,t) => s + t.amount, 0);
        await sumRef.set({ totalExpenses: totalExp, totalIncomes: totalInc, updatedAt: admin.firestore.Timestamp.now() });

        // historyCategorias
        const catRef = db.collection('users').doc(userId)
          .collection('historyCategorias').doc(mon);
        const spentByGroup = {};
        const batchCat = db.batch();
        for (const tx of txs) {
          const key = normalizeKey(tx.category || tx.personal_finance_category?.primary || 'otros');
          const grp = catToGroup[key] || 'Otros';
          const amt = tx.amount < 0 ? Math.abs(tx.amount) : 0;
          spentByGroup[grp] = (spentByGroup[grp] || 0) + amt;
          batchCat.set(
            catRef.collection(grp).doc(tx.id),
            { amount: tx.amount, date: tx.date, description: tx.description || null },
            { merge: true }
          );
        }
        batchCat.set(catRef, spentByGroup, { merge: true });
        await batchCat.commit();

        // historyLimits
        const limGroupsRef = db.collection('users').doc(userId)
          .collection('historyLimits').doc(mon)
          .collection('groups');
        const batchLimits = db.batch();
        for (const [grp, limit] of Object.entries(budgetsMap)) {
          const spent = spentByGroup[grp] || 0;
          batchLimits.set(limGroupsRef.doc(grp), { limit, spent }, { merge: true });
        }
        await batchLimits.commit();
      }

      // 6) Notificaciones
      const currentMon = new Date().toISOString().slice(0,7);
      const overSnap = await db.collection('users').doc(userId)
        .collection('historyLimits').doc(currentMon)
        .collection('groups').get();
      const exceeded = [];
      overSnap.forEach(doc => {
        const { spent, limit } = doc.data();
        if (spent > limit) exceeded.push({ name: doc.id, spent, limit });
      });
      if (exceeded.length) {
        console.log(`⚠️ Excesos detectados:`, exceeded);
        const subs = await db.collection('users').doc(userId)
          .collection('pushSubscriptions').get();
        const payload = {
          notification: {
            title: '⚠️ Límite Excedido',
            body: exceeded.map(e => `${e.name}: ${e.spent}€/ ${e.limit}€`).join('\n'),
            icon: '/icons/alert.png'
          }
        };
        const messaging = admin.messaging();
        subs.forEach(s => {
          const token = s.data().token;
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
