// ───── Archivo: functions/reportController.js ─────
// Genera un informe PDF para un usuario y lo sube a Firebase Storage

const { db, storage } = require('./firebaseAdmin');
const chromium = require('chrome-aws-lambda');
const { v4: uuidv4 } = require('uuid');
const { generateHtmlForReport } = require('./generateHtml');
const {
  generatePieChartBase64,
  generateBarChartBase64,
  generateLineChartBase64
} = require('./generateChart');

exports.generateAndUploadPdfReport = async (req, res) => {
  const { uid, period } = req.body;

  if (!uid || !period) {
    return res.status(400).json({ error: 'Faltan uid o period en la petición.' });
  }

  console.log(`📄 [PDF] Iniciando generación para uid=${uid}, periodo=${period}`);

  try {
    // ───── Obtener datos del usuario ─────
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const user = userSnap.exists ? userSnap.data() : {};

    const userName =
      user.displayName ||
      `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
      'Sin nombre';

    console.log(`👤 [PDF] Usuario cargado: ${userName}`);

    // ───── Obtener resumen financiero ─────
    const summarySnap = await userRef.collection('historySummary').doc(period).get();
    const summary = summarySnap.exists ? summarySnap.data() : {};

    // ───── Obtener distribución por categoría ─────
    const categoriesSnap = await userRef.collection('historyCategorias').doc(period).get();
    const categories = categoriesSnap.exists ? categoriesSnap.data() : {};

    console.log('📊 [PDF] Categorías cargadas:', categories);

    // ───── Obtener límites de gasto por grupo ─────
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

    // ───── Generar imágenes base64 de los gráficos ─────
    const pieChartImg = await generatePieChartBase64(categories);
    const barChartImg = await generateBarChartBase64(categories);
    const lineChartImg = await generateLineChartBase64(
      [period],                             // solo un mes, o podrías meter 3 anteriores
      [summary.totalIncomes ?? 0],
      [summary.totalExpenses ?? 0]
    );

    console.log('🖼️ [PDF] Imágenes base64 generadas correctamente');

    // ───── Crear HTML del informe con todos los datos y los gráficos ─────
    const html = generateHtmlForReport(
      period,
      summary,
      categories,
      limits,
      user,
      pieChartImg,
      barChartImg,
      lineChartImg
    );

    console.log('✅ [PDF] HTML del informe generado');

    // ───── Renderizar PDF con Puppeteer (Chrome headless) ─────
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

    console.log('📎 [PDF] PDF generado correctamente');

    // ───── Subir PDF a Firebase Storage ─────
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

    console.log(`☁️ [PDF] PDF subido a Storage: ${filePath}`);

    // ───── Construir URL pública de descarga ─────
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    res.json({ success: true, url: downloadURL });
  } catch (error) {
    console.error('❌ [PDF] Error generando o subiendo el PDF:', error.message);
    console.error('❌ [PDF] Stacktrace:', error.stack);
    res.status(500).json({ error: error.message || 'Error al generar o subir el PDF.' });
  }
};
