// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes');

const app = express();

// Configuración de CORS: Para pruebas se permite cualquier origen.
const corsOptions = {
  origin: '*', // En producción puedes restringirlo a 'https://fintrack-1bced.web.app'
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Montamos las rutas bajo "/plaid" (no "/api/plaid" para evitar duplicación)
app.use('/plaid', plaidRoutes);

// Middleware de manejo de errores que añade los encabezados CORS en caso de error
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// No se usa app.listen() ya que Firebase Functions gestiona el puerto automáticamente.
exports.api = functions.https.onRequest(app);
