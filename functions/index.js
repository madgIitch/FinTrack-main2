const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes');

const app = express();

// CORS (para pruebas permitimos cualquier origen)
const corsOptions = {
  origin: '*',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Montamos rutas bajo /api/plaid
app.use('/api/plaid', plaidRoutes);

// Error handler con CORS
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin','*');
  res.status(err.status || 500).json({ error: err.message });
});

// Exportamos la función
exports.api = functions.https.onRequest(app);
