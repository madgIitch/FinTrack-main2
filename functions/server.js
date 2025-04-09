const functions = require('firebase-functions');
const express = require('express');
const plaidRoutes = require('./plaidRoutes');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use('/api/plaid', plaidRoutes);

// Exporta la función de Firebase sin el app.listen()
exports.api = functions.https.onRequest(app);
