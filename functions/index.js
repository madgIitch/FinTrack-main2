// functions/index.js

// Carga variables de entorno
require('dotenv').config();

const functions   = require('firebase-functions');
const express     = require('express');
const cors        = require('cors');
const plaidRoutes = require('./plaidRoutes');
const { seed }    = require('./seedTransactions');
// Importamos la función programada
const { scheduledSync } = require('./scheduledSync');

const app = express();

// Configuración de CORS: permite orígenes según entornos.
const corsOptions = {
  origin: '*', // En producción restringir al dominio de tu frontend
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Parseo de JSON
app.use(express.json());

// Rutas de Plaid
app.use('/plaid', plaidRoutes);

// Ruta para sembrar transacciones de prueba
// POST /seed
// Body JSON: { userId: string, year: number, month: number, count: number }
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

// Middleware de manejo de errores (agrega CORS en caso de fallo)
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// Exporta la API REST
exports.api = functions.https.onRequest(app);

// Exporta la función programada para que Firebase la despliegue y la vincule con Cloud Scheduler
exports.scheduledSync = scheduledSync;
