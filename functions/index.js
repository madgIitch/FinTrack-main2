// ───── Archivo: functions/index.js ─────
// Este es el punto de entrada principal del backend en Firebase Functions.
// Solo contiene definiciones de rutas y lógica mínima. Todo lo demás va en controladores externos.

require('dotenv').config();

const functions     = require('firebase-functions');
const express       = require('express');
const cors          = require('cors');
const plaidRoutes   = require('./plaidRoutes');
const { seed }      = require('./seedTransactions');
const { scheduledSync } = require('./scheduledSync');
const { generateAndUploadPdfReport } = require('./reportController');

const app = express();

// ───── Configuración CORS ─────
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// ───── Rutas API ─────
app.use('/plaid', plaidRoutes);

// ───── Ruta: Sembrar transacciones de prueba ─────
app.post('/seed', async (req, res, next) => {
  try {
    const { userId, year, month, count } = req.body;
    if (!userId || !year || !month || !count) {
      return res.status(400).json({ error: 'Debes enviar userId, year, month y count en el cuerpo.' });
    }

    await seed(userId, count, year, month);
    return res.json({ success: true, inserted: count });
  } catch (err) {
    next(err);
  }
});

// ───── Ruta: Generar informe PDF y subirlo ─────
app.post('/generate_pdf_report', generateAndUploadPdfReport);

// ───── Middleware de errores ─────
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// ───── Exportaciones Firebase Functions ─────
exports.api = functions.https.onRequest(app);
exports.scheduledSync = scheduledSync;
