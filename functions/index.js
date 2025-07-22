// ───── Archivo: functions/index.js ─────

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

const plaidRoutes = require('./plaidRoutes');
const { seed } = require('./seedTransactions');
const { scheduledSync } = require('./scheduledSync');
const { generateAndUploadPdfReport } = require('./reportController');

// 🔧 Opción global para aumentar memoria si hace falta
setGlobalOptions({ timeoutSeconds: 60 });

// ───── Inicializar Express App ─────
const app = express();

// ───── Configuración CORS ─────
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type'] }));
app.options('*', cors());
app.use(express.json());

// ───── Rutas ─────
app.use('/plaid', plaidRoutes);

app.post('/seed', async (req, res, next) => {
  try {
    const { userId, year, month, count } = req.body;
    if (!userId || !year || !month || !count) {
      return res.status(400).json({ error: 'Debes enviar userId, year, month y count en el cuerpo.' });
    }

    await seed(userId, count, year, month);
    res.json({ success: true, inserted: count });
  } catch (err) {
    next(err);
  }
});

app.post('/generate_pdf_report', generateAndUploadPdfReport);

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor.' });
});

// ───── Exportar funciones ─────
exports.api = onRequest({ memory: '512MiB', timeoutSeconds: 60 }, app);
exports.scheduledSync = scheduledSync;
