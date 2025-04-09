require('dotenv').config();
const admin = require('firebase-admin');
const plaidClient = require('./plaidConfig'); // Importa el cliente Plaid

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const authAdmin = admin.auth();

module.exports = { admin, db, authAdmin, plaidClient };
