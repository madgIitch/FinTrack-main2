// ───── Archivo: firebase.js ─────
// Este archivo centraliza toda la configuración y exportación de servicios Firebase
// para que el resto de la app (auth, Firestore, FCM, etc.) pueda usarlos de forma sencilla.

// ───── Importación de SDKs de Firebase que realmente uso ─────
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';              // Autenticación y escucha de cambios
import { getFirestore, doc, getDoc } from 'firebase/firestore';           // Firestore y helpers
import { getMessaging } from 'firebase/messaging';                        // Notificaciones push con FCM


// ───── Configuración del proyecto Firebase (copiada desde la consola) ─────
// Esta config identifica mi proyecto en Firebase. El measurementId no es obligatorio.
const firebaseConfig = {
  apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
  authDomain: "fintrack-1bced.firebaseapp.com",
  projectId: "fintrack-1bced",
  storageBucket: "fintrack-1bced.firebasestorage.app",
  messagingSenderId: "576236535723",
  appId: "1:576236535723:web:4276524c0c6a10a3391cee",
  measurementId: "G-J87Z3NZJ55"
};

// ───── Inicializo la app y los servicios de Firebase ─────
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// ───── Exporto los servicios que me interesa usar en otros módulos ─────
export {
  app,
  auth,
  db,
  messaging,
  onAuthStateChanged,
  doc,
  getDoc,
  getFirestore
};

// ───── URL base para acceder al backend según el entorno (local o deploy en Firebase) ─────
// Me aseguro de usar la URL local solo en desarrollo
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:5001/fintrack-1bced/us-central1/api'
  : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

export { apiUrl };
