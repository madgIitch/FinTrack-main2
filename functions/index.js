// ───── Archivo: functions/index.js ─────
// Punto de entrada del backend en Firebase Functions.
// Monta el servidor Express, configura CORS, rutas API y funciones programadas.

require('dotenv').config();

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const plaidRoutes = require('./plaidRoutes');
const { seed } = require('./seedTransactions');
const { scheduledSync } = require('./scheduledSync');
const puppeteer = require('puppeteer');
const { generateHtmlForReport } = require('./generateHtml');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// ───── Inicializa Firebase Admin ─────
admin.initializeApp();
const storage = admin.storage().bucket();

const app = express();

// ───── Configuración CORS ─────
const corsOptions = {
  origin: '*', // En producción: restringir a tu dominio
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ───── Middleware JSON ─────
app.use(express.json());

// ───── Rutas API ─────
app.use('/plaid', plaidRoutes);

// ───── Ruta: Sembrar transacciones de prueba ─────
app.post('/seed', async (req, res, next) => {
  try {
    const { userId, year, month, count } = req.body;
    if (!userId || !year || !month || !count) {
      return res.status(400).json({ error: 'Debes enviar userId, year, month y count en el cuerpo.' });
    }

    await seed(userId, count, year, month);
    return res.json({ success: true, inserted: count });
  } catch (err) {
    next(err);
  }
});

// ───── Ruta: Generar informe PDF y subirlo a Firebase Storage ─────
app.post('/generate_pdf_report', async (req, res) => {
  const { uid, period } = req.body;

  if (!uid || !period) {
    return res.status(400).json({ error: 'Faltan uid o period en la petición.' });
  }

  try {
    const db = getFirestore();

    // ───── Recuperar resumen financiero ─────
    const summarySnap = await db.doc(`historySummary/${period}/users/${uid}`).get();
    const summary = summarySnap.exists ? summarySnap.data() : {};

    // ───── Recuperar categorías de gasto ─────
    const categoriesSnap = await db.doc(`historyCategorias/${period}/users/${uid}`).get();
    const categories = categoriesSnap.exists ? categoriesSnap.data() : {};

    // ───── Recuperar nombre del usuario ─────
    const userSnap = await db.doc(`users/${uid}`).get();
    const user = userSnap.exists ? userSnap.data() : {};

    // ───── Generar HTML del informe ─────
    const html = generateHtmlForReport(period, summary, categories, user);

    // ───── Generar PDF con Puppeteer ─────
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    // ───── Subir a Firebase Storage ─────
    const filePath = `users/${uid}/reports/${period}.pdf`;
    const file = storage.file(filePath);
    const token = uuidv4();

    await file.save(pdfBuffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });

    // ───── Generar URL de descarga pública ─────
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    res.json({ success: true, url: downloadURL });
  } catch (error) {
    console.error('❌ Error generando o subiendo PDF:', error);
    res.status(500).json({ error: 'Error al generar o subir el PDF.' });
  }
});


// ───── Middleware de errores ─────
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.status(err.status || 500).json({ error: err.message });
});

// ───── Exportaciones Firebase Functions ─────
exports.api = functions.https.onRequest(app);
exports.scheduledSync = scheduledSync;
