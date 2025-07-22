// functions/firebaseAdmin.js
const admin = require('firebase-admin');

admin.initializeApp({
    storageBucket: 'fintrack-1bced.firebasestorage.app'
});

const db = admin.firestore();
const authAdmin = admin.auth();
const storage = admin.storage().bucket(); // ya está apuntando correctamente

module.exports = { admin, db, authAdmin, storage };
