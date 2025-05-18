// functions/firebaseAdmin.js
const admin = require('firebase-admin');

// No pasamos nada: usa las credenciales de servicio que GCP inyecta
admin.initializeApp();

// Exporta sólo lo que necesites
const db = admin.firestore();
const authAdmin = admin.auth();

module.exports = { admin, db, authAdmin };
