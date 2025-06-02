// functions/index.js

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes');

const app = express();

// ── Configuración CORS ───────────────────────────────────────────────────────────
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ── Middleware para parsear JSON ───────────────────────────────────────────────
app.use(express.json());

// ── RUTAS DE PLAID ──────────────────────────────────────────────────────────────
app.use('/api/plaid', plaidRoutes);

// ── Manejo de errores añadiendo cabeceras CORS ─────────────────────────────────
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// Firebase Functions expone este servidor HTTP
exports.api = functions.https.onRequest(app);
