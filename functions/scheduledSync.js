// functions/scheduledSync.js
// Cloud Function HTTP para sincronizar Plaid, recalcular datos y enviar notificaciones push vía FCM y almacenarlas en Firestore

require('dotenv').config();
const functions = require('firebase-functions');
const axios = require('axios');
const { admin, db } = require('./firebaseAdmin');

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

      // Paso 1: sincronizar transacciones y datos agrupados desde backend centralizado
      try {
        await axios.post(`${apiBaseUrl}/api/plaid/sync_transactions_and_store`, { userId });
        console.log(`✅ sync_transactions_and_store ejecutado para ${userId}`);
      } catch (err) {
        console.error(`❌ sync_transactions_and_store falló para ${userId}:`, err.message);
        continue; // no tiene sentido seguir si no hay transacciones procesadas
      }

      // Paso 2: cargar datos de límites del mes actual
      const currentMonth = new Date().toISOString().slice(0, 7);
      const limitsColRef = db
        .collection('users')
        .doc(userId)
        .collection('historyLimits')
        .doc(currentMonth)
        .collection('groups');

      let exceeded = [];
      let gastosPorCategoria = {};

      try {
        const limitsSnap = await limitsColRef.get();

        limitsSnap.forEach(doc => {
          const { spent = 0, limit = 0 } = doc.data();
          if (spent > limit) {
            exceeded.push({ group: doc.id, spent, limit });
            gastosPorCategoria[doc.id] = spent;
          }
        });
      } catch (err) {
        console.error(`❌ Error leyendo historyLimits para ${userId}:`, err.message);
        continue;
      }

      // Paso 3: gestionar notificación si hay excesos detectados
      if (exceeded.length > 0) {
        console.log(`⚠️ Excesos detectados para ${userId}:`, exceeded);

        const notifRef = db
          .collection('users')
          .doc(userId)
          .collection('notifications');

        const existingSnap = await notifRef
          .where('data.period', '==', currentMonth)
          .limit(1)
          .get();

        let hayCambios = true;

        if (!existingSnap.empty) {
          const prev = existingSnap.docs[0];
          const prevGastos = prev.data().gastosPorCategoria || {};
          hayCambios = Object.keys(gastosPorCategoria).some(cat => gastosPorCategoria[cat] !== prevGastos[cat]);

          if (!hayCambios) {
            console.log('🔁 Gastos sin cambios → no se envía ni guarda nueva notificación');
            continue;
          }

          await notifRef.doc(prev.id).delete();
          console.log('♻️ Notificación previa eliminada');
        }

        const title = exceeded.length === 1
          ? `⚠️ Exceso en ${exceeded[0].group}`
          : 'Presupuesto superado en varias categorías';

        const body = exceeded
          .map(e => `${e.group}: ${e.spent.toFixed(2)}€ de ${e.limit.toFixed(2)}€`)
          .join('\n');

        await notifRef.add({
          title,
          body,
          type: 'alert',
          data: {
            period: currentMonth,
            categories: exceeded.map(e => e.group),
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          },
          gastosPorCategoria
        });

        // Paso 4: Enviar notificaciones push por FCM
        const tokensSnap = await db
          .collection('users')
          .doc(userId)
          .collection('fcmTokens')
          .get();

        const tokens = tokensSnap.docs.map(d => d.id);

        for (const token of tokens) {
          const message = {
            token,
            notification: { title, body },
            android: { priority: 'high' },
            apns: { headers: { 'apns-priority': '10' } },
            data: {
              period: currentMonth,
              userId,
              alertType: 'budget_overrun',
              body,
              title,
              categories: JSON.stringify(exceeded.map(e => e.group))
            }
          };

          try {
            const response = await admin.messaging().send(message);
            console.log(`📲 Notificación enviada a ${token}:`, response);
          } catch (err) {
            console.warn(`❌ Error al enviar a ${token}:`, err.message);
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
    console.error('❌ scheduledSync error general:', err);
    return res.status(500).send('Error interno en scheduledSync');
  }
});
