// backend/server.js
const functions = require('firebase-functions'); // Agregar esta línea
const express = require('express');
const plaidRoutes = require('./plaidRoutes');
const cors = require('cors');

const app = express();

// Agrega middleware para parsear JSON
app.use(express.json());
app.use(cors());

app.use('/api/plaid', plaidRoutes);

// Exportar el servidor Express como una función de Firebase
exports.api = functions.https.onRequest(app);
