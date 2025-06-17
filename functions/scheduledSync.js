// functions/scheduledSync.js
// Cloud Function HTTP para sincronizar Plaid, recalcular datos y enviar notificaciones push vía FCM y almacenarlas en Firestore

require('dotenv').config();
const functions = require('firebase-functions');
const axios = require('axios');
const { admin, db } = require('./firebaseAdmin');

function normalizeKey(str) {
  return str.toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '');
}

exports.scheduledSync = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  console.log('🕒 scheduledSync HTTP iniciada:', new Date().toISOString());
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) return res.status(500).send('Project ID not detected');
  const apiBaseUrl = `https://us-central1-${projectId}.cloudfunctions.net`;

  try {
    const usersSnap = await db.collection('users').get();
    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      console.log(`🔄 Sync usuario: ${userId}`);

      // 1. Migrar transacciones legacy
      const plainHistory = await db.collection('users').doc(userId).collection('history').listDocuments();
      const migrateBatch = db.batch();
      for (const docRef of plainHistory) {
        const snap = await docRef.get();
        const tx = snap.data();
        if (tx?.date?.slice?.(0, 7)) {
          const mon = tx.date.slice(0, 7);
          const newRef = db.collection('users').doc(userId).collection('history').doc(mon).collection('items').doc(snap.id);
          migrateBatch.set(newRef, tx, { merge: true });
        }
      }
      await migrateBatch.commit();

      // 2. Obtener transacciones desde la API
      let newTxs = [];
      try {
        const resp = await axios.post(`${apiBaseUrl}/api/plaid/get_transactions`, { userId });
        newTxs = Array.isArray(resp.data.transactions) ? resp.data.transactions : [];
      } catch (err) {
        console.error(`❌ get_transactions falló para ${userId}:`, err.message);
      }

      // 3. Guardar nuevas transacciones
      if (newTxs.length) {
        const batch = db.batch();
        for (const tx of newTxs) {
          const mon = tx.date.slice(0, 7);
          const ref = db.collection('users').doc(userId).collection('history').doc(mon).collection('items').doc(tx.transaction_id || tx.id);
          batch.set(ref, tx, { merge: true });
        }
        await batch.commit();
      }

      // 4. Recolectar transacciones agrupadas por mes
      const monthDocs = await db.collection('users').doc(userId).collection('history').listDocuments();
      const txsByMonth = {};
      for (const monRef of monthDocs) {
        const mon = monRef.id;
        const itemsSnap = await monRef.collection('items').get();
        txsByMonth[mon] = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // 5. Cargar presupuestos y grupos de categorías
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

      // 6. Recalcular resúmenes
      for (const [mon, txs] of Object.entries(txsByMonth)) {
        const sumRef = db.collection('users').doc(userId).collection('historySummary').doc(mon);
        const totalExp = txs.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const totalInc = txs.filter(t => t.amount >= 0).reduce((s, t) => s + t.amount, 0);
        await sumRef.set({ totalExpenses: totalExp, totalIncomes: totalInc, updatedAt: admin.firestore.Timestamp.now() });

        const catRef = db.collection('users').doc(userId).collection('historyCategorias').doc(mon);
        const spentByGroup = {};
        const batchCat = db.batch();
        for (const tx of txs) {
          const key = normalizeKey(tx.personal_finance_category?.primary || tx.category || 'otros');
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

        const limGroupsRef = db.collection('users').doc(userId).collection('historyLimits').doc(mon).collection('groups');
        const batchLim = db.batch();
        for (const [grp, limit] of Object.entries(budgetsMap)) {
          const spent = spentByGroup[grp] || 0;
          batchLim.set(limGroupsRef.doc(grp), { limit, spent }, { merge: true });
        }
        await batchLim.commit();
      }

      // 7. Detectar excesos y notificar (guardar + enviar)
      const currentMon = new Date().toISOString().slice(0, 7);
      const overSnap = await db.collection('users').doc(userId).collection('historyLimits').doc(currentMon).collection('groups').get();
      const exceeded = [];
      overSnap.forEach(doc => {
        const { spent, limit } = doc.data();
        if (spent > limit) exceeded.push({ group: doc.id, spent, limit });
      });

      if (exceeded.length) {
        console.log(`⚠️ Excesos detectados para ${userId}:`, exceeded);

        const tokensSnap = await db.collection('users').doc(userId).collection('fcmTokens').get();
        const tokens = tokensSnap.docs.map(d => d.id);
        console.log(`[FCM] Tokens detectados:`, tokens);

        const title = exceeded.length === 1
          ? `⚠️ Exceso en ${exceeded[0].group}`
          : 'Presupuesto superado en varias categorías';

        const body = exceeded.map(e => `${e.group}: ${e.spent.toFixed(2)}€ de ${e.limit.toFixed(2)}€`).join('\n');

        // Guardar notificación en Firestore
        await db.collection('users').doc(userId).collection('notifications').add({
          title,
          body,
          type: 'alert',
          data: {
            period: currentMon,
            categories: exceeded.map(e => e.group),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          }
        });

        // Enviar notificación a todos los tokens válidos
        for (const token of tokens) {
          const message = {
            token,
            notification: { title, body },
            android: { priority: 'high' },
            apns: { headers: { 'apns-priority': '10' } },
            data: {
              period: currentMon,
              userId,
              alertType: 'budget_overrun',
              categories: JSON.stringify(exceeded.map(e => e.group))
            }
          };

          try {
            const response = await admin.messaging().send(message);
            console.log(`✅ Notificación enviada a ${token}:`, response);
          } catch (err) {
            console.warn(`❌ Falló el envío al token ${token}:`, err.message);
            if (
              err.code === 'messaging/registration-token-not-registered' ||
              err.message.includes('Requested entity was not found')
            ) {
              await db.collection('users').doc(userId).collection('fcmTokens').doc(token).delete();
              console.log(`🗑️ Token inválido eliminado: ${token}`);
            }
          }
        }
      }

      console.log(`✅ Sync completo para ${userId}`);
    }

    return res.status(200).send('Sync completo');
  } catch (err) {
    console.error('❌ scheduledSync error:', err);
    return res.status(500).send('Error interno');
  }
});