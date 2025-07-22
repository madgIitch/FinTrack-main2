const admin = require('firebase-admin');

// ✅ Añade el nombre explícito del bucket
admin.initializeApp({
  storageBucket: 'fintrack-1bced.appspot.com'
});

const db = admin.firestore();
const authAdmin = admin.auth();

module.exports = { admin, db, authAdmin };
