require('dotenv').config();
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const plaidRoutes = require('./plaidRoutes');  // Importar las rutas de Plaid

// Configuramos la app de Express
const app = express();

// Usamos CORS para permitir peticiones desde el frontend
app.use(cors({ origin: 'https://fintrack-1bced.web.app' }));
app.use(express.json());  // Para manejar JSON en el cuerpo de la solicitud

// Usamos las rutas de Plaid
app.use('/api/plaid', plaidRoutes);

// Exponemos las funciones a Firebase Functions
exports.api = functions.https.onRequest(app);

