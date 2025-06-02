// functions/index.js

const functions = require('firebase-functions');
const express   = require('express');
const cors      = require('cors');
const plaidRoutes = require('./plaidRoutes');

const app = express();

// ── Configuración CORS ───────────────────────────────────────────────────────────
// Este middleware debe ir ANTES de cualquier app.use('/api/plaid', …)
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
// Responder automáticamente a preflight OPTIONS
app.options('*', cors(corsOptions));

// ── Middleware para parsear JSON ───────────────────────────────────────────────
app.use(express.json());

// ── RUTAS DE PLAID ──────────────────────────────────────────────────────────────
app.use('/api/plaid', plaidRoutes);

// ── Manejo de errores añadiendo cabeceras CORS ─────────────────────────────────
// (Deja esta parte para que, en caso de error interno, también se incluya CORS)
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// Firebase Functions expone este servidor HTTP
exports.api = functions.https.onRequest(app);
