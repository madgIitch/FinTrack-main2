// ───── Cloud Function para generar PDFs mensuales y enviar notificación push ─────

require('dotenv').config();
const functions = require('firebase-functions');
const axios = require('axios');
const { admin, db } = require('./firebaseAdmin');

// Exporto la función HTTP para que pueda ser ejecutada por Cloud Scheduler
exports.scheduledReport = functions.https.onRequest(async (req, res) => {
  // ─── Cabeceras CORS ───
  res.set('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  console.log('🕒 scheduledReport HTTP iniciada:', new Date().toISOString());
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  if (!projectId) return res.status(500).send('Project ID no detectado');

  const reportApiUrl = `https://us-central1-${projectId}.cloudfunctions.net/api/generate_pdf_report`;

  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // formato 'YYYY-MM'
    const usersSnap = await db.collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const userId = userDoc.id;
      console.log(`📄 Generando PDF para usuario: ${userId}`);

      try {
        const response = await axios.post(reportApiUrl, {
          uid: userId,
          period: currentMonth
        });

        if (response.data.success && response.data.url) {
          const pdfUrl = response.data.url;
          console.log(`✅ PDF generado y subido para ${userId}: ${pdfUrl}`);

          // ─── Crear notificación de tipo "report" ───
          const title = `📎 Informe financiero disponible`;
          const body = `Tu informe de ${currentMonth} ya está listo. Puedes consultarlo desde la app.`;

          const notifRef = db
            .collection('users')
            .doc(userId)
            .collection('notifications');

          await notifRef.add({
            title,
            body,
            type: 'report',
            data: {
              period: currentMonth,
              url: pdfUrl,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            }
          });

          console.log(`📌 Notificación de informe creada para ${userId}`);

          // ─── Verificar si el usuario quiere recibir push de informes ───
          const settings = userDoc.data();
          const wantsPush = settings?.reports?.push === true;

          if (!wantsPush) {
            console.log(`🔕 Usuario ${userId} tiene push desactivado para informes`);
            continue;
          }

          // ─── Enviar notificación push ───
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
                reportUrl: pdfUrl,
                alertType: 'monthly_report',
                title,
                body
              }
            };

            try {
              const response = await admin.messaging().send(message);
              console.log(`📲 Notificación push de informe enviada a ${token}:`, response);
            } catch (err) {
              console.warn(`❌ Error al enviar push de informe a ${token}:`, err.message);
              if (
                err.code === 'messaging/registration-token-not-registered' ||
                err.message.includes('Requested entity was not found')
              ) {
                await db.collection('users').doc(userId).collection('fcmTokens').doc(token).delete();
                console.log(`🗑️ Token inválido eliminado: ${token}`);
              }
            }
          }

        } else {
          console.warn(`⚠️ Respuesta sin éxito para ${userId}:`, response.data);
        }
      } catch (err) {
        console.error(`❌ Error generando PDF para ${userId}:`, err.message);
      }
    }

    return res.status(200).send('Generación de informes y notificaciones completada');
  } catch (err) {
    console.error('❌ Error general en scheduledReport:', err);
    return res.status(500).send('Error interno en scheduledReport');
  }
});
