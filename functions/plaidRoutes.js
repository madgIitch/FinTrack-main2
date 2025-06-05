// plaidRoutes.js

require('dotenv').config();            // Carga variables de entorno
const express = require('express');
const { admin, db } = require('./firebaseAdmin');  // db = admin.firestore()
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const router = express.Router();

// ── CORS ────────────────────────────────────────────────────────────────────────
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ── Inicializar Plaid ──────────────────────────────────────────────────────────
const envName  = process.env.PLAID_ENV || 'sandbox';
const plaidEnv = PlaidEnvironments[envName] || PlaidEnvironments.sandbox;
const config   = new Configuration({
  basePath:    plaidEnv,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET':    process.env.PLAID_SECRET,
      'Plaid-Version':   '2020-09-14'
    }
  }
});
const plaidClient = new PlaidApi(config);

// ── Health Check ───────────────────────────────────────────────────────────────
router.get('/ping', (_req, res) => res.json({ message: 'pong' }));

// ── Create Link Token ──────────────────────────────────────────────────────────
router.post('/create_link_token', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const resp = await plaidClient.linkTokenCreate({
      user:          { client_user_id: userId },
      client_name:   'FinTrack',
      products:      ['auth','transactions'],
      country_codes: ['US','ES'],
      language:      'es'
    });
    res.json({ link_token: resp.data.link_token });
  } catch (err) {
    console.error('[PLAIDROUTES] Error creating link token:', err.response?.data || err);
    res.status(500).json({ error: err.message });
  }
});

// ── Exchange Public Token ──────────────────────────────────────────────────────
router.post('/exchange_public_token', async (req, res) => {
  const { public_token, userId } = req.body;
  if (!public_token || !userId) {
    return res.status(400).json({ error: 'Falta public_token o userId' });
  }

  try {
    const resp = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = resp.data.access_token;
    const itemId      = resp.data.item_id;

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const accounts = userDoc.exists
      ? userDoc.data().plaid?.accounts || []
      : [];

    accounts.push({
      accessToken,
      itemId,
      createdAt: admin.firestore.Timestamp.now()
    });
    await userRef.set({ plaid: { accounts } }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    console.error('[PLAIDROUTES] Error exchanging public token:', err.response?.data || err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get Account Details ────────────────────────────────────────────────────────
router.post('/get_account_details', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    return res.status(400).json({ error: 'Falta accessToken' });
  }

  try {
    const accsResp = await plaidClient.accountsGet({ access_token: accessToken });
    const itemResp = await plaidClient.itemGet({ access_token: accessToken });

    const instId = itemResp.data.item.institution_id;
    let institution = null;
    if (instId) {
      const inst = await plaidClient.institutionsGetById({
        institution_id: instId,
        country_codes:  ['US','ES'],
        options:        { include_optional_metadata: true }
      });
      institution = inst.data.institution;
    }

    res.json({
      accounts:    accsResp.data.accounts,
      institution
    });
  } catch (err) {
    console.error('[PLAIDROUTES] Error in get_account_details:', err.response?.data || err);
    res.status(500).json({ error: err.message });
  }
});

// ── Get Transactions ────────────────────────────────────────────────────────────
router.post('/get_transactions', async (req, res) => {
  const { userId, startDate, endDate } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const accounts = userDoc.data().plaid?.accounts || [];
    if (accounts.length === 0) {
      return res.json({ transactions: [] });
    }

    const start = startDate
      || new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);
    const end   = endDate
      || new Date().toISOString().slice(0,10);

    let allTxs = [];
    for (const { accessToken } of accounts) {
      const txRes = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date:   start,
        end_date:     end,
        options: {
          count:  500,
          offset: 0,
          include_personal_finance_category: true
        }
      });
      allTxs = allTxs.concat(txRes.data.transactions);
    }

    allTxs.sort((a,b) => new Date(b.date) - new Date(a.date));

    const cleaned = allTxs.map(tx => ({
      id:                         tx.transaction_id,
      account_id:                 tx.account_id,
      date:                       tx.date,
      description:                tx.name,
      personal_finance_category:  tx.personal_finance_category || null,
      category:                   tx.personal_finance_category?.primary || 'Sin categoría',
      category_id:                tx.category_id || null,
      amount:                     tx.amount
    }));

    res.json({ transactions: cleaned });
  } catch (err) {
    console.error('[PLAIDROUTES] Error in get_transactions:', err.response?.data || err);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync transactions and store (with historyCategorias) ─────────────────────
router.post('/sync_transactions_and_store', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const userRef  = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // 1) Obtén todas las cuentas Plaid del usuario
    const accounts = userSnap.data().plaid?.accounts || [];
    console.log('[PLAIDROUTES] Accounts for user:', accounts);
    if (accounts.length === 0) {
      return res.json({ message: 'Sin cuentas vinculadas' });
    }

    // 2) Fecha de inicio y fin (últimos 30 días)
    const endDate   = new Date().toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10);

    // 3) Recolecta todas las transacciones en ese rango
    let allTxs = [];
    for (const { accessToken } of accounts) {
      const txRes = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date:   startDate,
        end_date:     endDate,
        options:      {
          count: 500,
          offset: 0,
          include_personal_finance_category: true
        }
      });
      allTxs = allTxs.concat(txRes.data.transactions);
    }
    console.log('[PLAIDROUTES] Total transactions fetched:', allTxs.length);

    // 4) Ordena cronológicamente (más reciente primero)
    allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 5) Agrupa transacciones por mes (“YYYY-MM”)
    const txsPorMes = {};
    allTxs.forEach(tx => {
      const mes = tx.date.slice(0, 7); // “2025-06”
      if (!txsPorMes[mes]) txsPorMes[mes] = [];
      txsPorMes[mes].push(tx);
    });
    console.log('[PLAIDROUTES] Transactions grouped by month:', Object.keys(txsPorMes));

    // 6) Carga TODOS los categoryGroups y construye un mapa “subcategory_normalized → grupoOriginal”
    const categoryGroupsSnap = await db.collection('categoryGroups').get();
    const catToGroupMap = {};

    categoryGroupsSnap.forEach(docSnap => {
      const docIdRaw = docSnap.id; // p.ej. “Loan Payments”
      // Normalizamos el ID a minúsculas y reemplazamos espacios por guiones bajos
      const subcatKey = docIdRaw.toLowerCase().replace(/\s+/g, '_'); 
      const data      = docSnap.data();
      // El campo "grupo" contiene el nombre en español, p.ej. “Finanzas y Seguros”
      const grupoEs   = data.grupo || docIdRaw; 
      catToGroupMap[subcatKey] = grupoEs;
      console.log(`[PLAIDROUTES] Mapping subcategory "${docIdRaw}" (key="${subcatKey}") → grupo="${grupoEs}"`);
    });

    // 7) Itera por cada mes y cada transacción, determinando el grupoSuperior en español
    const batchOverall = db.batch();

    for (const [mesKey, transacciones] of Object.entries(txsPorMes)) {
      console.log(`[PLAIDROUTES] Processing month "${mesKey}" with ${transacciones.length} transactions`);
      const mesDocRef = userRef
        .collection('historyCategorias')
        .doc(mesKey);

      for (const tx of transacciones) {
        // A) Extraer la categoría en mayúsculas, pasar a minúsculas y reemplazar "_" por " "
        //    Preferimos personal_finance_category.primary, si existe; si no, usamos tx.category
        const rawCatSource = tx.personal_finance_category?.primary || tx.category || '';
        // Algunas categorías vienen con guiones bajos, p.ej. "LOAN_PAYMENTS"
        const rawCatLowerUnderscore = rawCatSource.toString().toLowerCase();          // e.g. "loan_payments"
        const rawCatNormalized = rawCatLowerUnderscore.replace(/_/g, '_');            // sigue siendo "loan_payments"
        // Buscamos grupo en el mapa; si no existe, agrupamos en "Otros"
        const grupoSuperiorEs = catToGroupMap[rawCatNormalized] || 'Otros';
        console.log(`[PLAIDROUTES] TxID=${tx.transaction_id} | rawCat="${rawCatSource}" → normalized="${rawCatNormalized}" → grupoEs="${grupoSuperiorEs}"`);

        // C) Ruta final en Firestore:
        //    users/{userId}/historyCategorias/{mesKey}/{grupoSuperiorEs}/{txId}
        const docRef = mesDocRef
          .collection(grupoSuperiorEs)
          .doc(tx.transaction_id);

        // Guardamos únicamente el campo “amount”
        batchOverall.set(
          docRef,
          { amount: tx.amount },
          { merge: true }
        );
        console.log(`[PLAIDROUTES] batch.set → path: users/${userId}/historyCategorias/${mesKey}/${grupoSuperiorEs}/${tx.transaction_id} | { amount: ${tx.amount} }`);
      }
    }

    // 8) Ejecutar todas las operaciones en un solo batch
    await batchOverall.commit();
    console.log('[PLAIDROUTES] batchOverall.commit → All writes committed');

    return res.json({ success: true, message: 'historyCategorias updated successfully' });
  } catch (err) {
    console.error('[PLAIDROUTES] Error updating historyCategorias:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
