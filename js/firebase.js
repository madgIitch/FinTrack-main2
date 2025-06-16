// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging } from "firebase/messaging";
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
    authDomain: "fintrack-1bced.firebaseapp.com",
    projectId: "fintrack-1bced",
    storageBucket: "fintrack-1bced.firebasestorage.app",
    messagingSenderId: "576236535723",
    appId: "1:576236535723:web:4276524c0c6a10a3391cee",
    measurementId: "G-J87Z3NZJ55"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

// ... other imports and Firebase initialization ...
export { app, auth, db, onAuthStateChanged, doc, getDoc, getFirestore, messaging };