// backend/testFirestore.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Intenta crear un documento de prueba:
async function testWriteRead() {
  try {
    await db.collection('__test').doc('ping').set({ ts: Date.now() });
    console.log('✅ Escritura en Firestore OK.');

    const snap = await db.collection('__test').doc('ping').get();
    if (snap.exists) {
      console.log('✅ Lectura en Firestore OK:', snap.data());
    } else {
      console.log('⚠️ Documento no encontrado al leer.');
    }
  } catch (err) {
    console.error('❌ Error de Firestore:', err);
  }
  process.exit(0);
}

testWriteRead();
