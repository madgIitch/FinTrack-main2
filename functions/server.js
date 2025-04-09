const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes');

const app = express();

// Para propósitos de depuración y evitar problemas CORS, usamos origin: '*'.
// Si necesitas restringirlo a tu dominio, deberás ajustar también el manejo de credentials.
const corsOptions = {
  origin: '*', // Para pruebas: permite cualquier origen.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// Middleware para CORS para todas las rutas.
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Montamos nuestras rutas en /api/plaid
app.use('/api/plaid', plaidRoutes);

// Middleware de manejo de errores que añade los encabezados CORS en caso de error.
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// No se usa app.listen() ya que Firebase Functions se encarga del manejo del puerto.
exports.api = functions.https.onRequest(app);
