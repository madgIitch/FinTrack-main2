// ───── Archivo: functions/api.js (o index.js según despliegue) ─────
// Este archivo configura el servidor Express que actúa como backend REST de FinTrack.
// Expone todas las rutas bajo /api/plaid y las conecta con Firebase Functions como endpoint HTTP.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes'); // Todas las rutas que he definido para Plaid + Firestore

const app = express();

// ───── CORS ─────
// Durante desarrollo dejo origin: '*' para permitir llamadas desde cualquier lugar.
// En producción debería restringir a mi dominio (ej. https://miapp.com).
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

// Aplico CORS globalmente a todas las rutas
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight

// ───── Middleware para parsear JSON en los cuerpos de las peticiones ─────
app.use(express.json());

// ───── Montaje de rutas bajo /api/plaid ─────
// Ejemplo: POST a /api/plaid/get_transactions
app.use('/api/plaid', plaidRoutes);

// ───── Middleware de errores ─────
// Asegura que incluso en errores se devuelven cabeceras CORS válidas
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// ───── Exporto la función HTTP de Express para ser usada por Firebase ─────
// No necesito app.listen() porque Firebase se encarga del servidor.
exports.api = functions.https.onRequest(app);
