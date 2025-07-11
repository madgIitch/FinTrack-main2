// functions/firebaseAdmin.js
// Inicializamos Firebase Admin SDK para poder acceder a Firestore y Auth desde el backend.
// Este archivo se usa para centralizar la configuración y reutilizarla en otros módulos.

const admin = require('firebase-admin');

// No pasamos nada: usa las credenciales de servicio que GCP inyecta
admin.initializeApp();

// Exporta sólo lo que necesites
const db = admin.firestore();
const authAdmin = admin.auth();

module.exports = { admin, db, authAdmin };
