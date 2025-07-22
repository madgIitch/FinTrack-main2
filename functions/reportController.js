// ───── Archivo: functions/reportController.js ─────
// Lógica para generar y subir informes PDF a Firebase Storage en Firebase Functions

const { db, storage } = require('./firebaseAdmin');
const chromium = require('chrome-aws-lambda'); // puppeteer-core ya viene dentro
const { v4: uuidv4 } = require('uuid');
const { generateHtmlForReport } = require('./generateHtml');


exports.generateAndUploadPdfReport = async (req, res) => {
  const { uid, period } = req.body;

  if (!uid || !period) {
    return res.status(400).json({ error: 'Faltan uid o period en la petición.' });
  }

  try {
    console.log(`[PDF] Generando informe para uid=${uid}, periodo=${period}`);

    // ───── Leer datos del usuario y sus históricos ─────
    const userRef = db.collection('users').doc(uid);

    const userSnap = await userRef.get();
    const user = userSnap.exists ? userSnap.data() : {};
    const userName = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre';
    console.log('[PDF] Usuario cargado:', userName);

    const summarySnap = await userRef.collection('historySummary').doc(period).get();
    const summary = summarySnap.exists ? summarySnap.data() : {};

    const categoriesSnap = await userRef.collection('historyCategorias').doc(period).get();
    const categories = categoriesSnap.exists ? categoriesSnap.data() : {};

    const limitsSnap = await userRef
      .collection('historyLimits')
      .doc(period)
      .collection('groups')
      .get();

    const limits = {};
    limitsSnap.forEach(doc => {
      const data = doc.data();
      limits[doc.id] = {
        limit: data.limit ?? 0,
        spent: data.spent ?? 0
      };
    });

    // ───── Generar HTML para el informe ─────
    const html = generateHtmlForReport(period, summary, categories, limits, user);
    console.log('[PDF] HTML generado correctamente');

    // ───── Lanzar navegador con chrome-aws-lambda (Cloud Functions) ─────
    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    console.log('[PDF] PDF generado correctamente');

    // ───── Subir el PDF generado a Firebase Storage ─────
    const filePath = `users/${uid}/reports/${period}.pdf`;
    const file = storage.file(filePath);
    const token = uuidv4();

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });

    console.log('[PDF] PDF subido a Storage:', filePath);

    // ───── Generar URL pública de descarga ─────
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    res.json({ success: true, url: downloadURL });
  } catch (error) {
    console.error('❌ Error generando o subiendo PDF:', error.message);
    console.error('❌ Stacktrace:', error.stack);
    res.status(500).json({ error: error.message || 'Error al generar o subir el PDF.' });
  }
};
