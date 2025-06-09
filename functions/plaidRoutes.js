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

    // 1) Leer límites de gasto desde settings.budgets
    const settings     = userSnap.data().settings || {};
    const budgetsMap   = settings.budgets || {}; // e.g. { 'Ocio': 100, 'Transporte': 200 }
    console.log('[sync] budgetsMap:', budgetsMap);

    // 2) Fetch transacciones Plaid últimos 30 días
    const accounts = userSnap.data().plaid?.accounts || [];
    const endDate   = new Date().toISOString().slice(0,10);
    const startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);
    let allTxs = [];
    for (const { accessToken } of accounts) {
      const txRes = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date:   startDate,
        end_date:     endDate,
        options: {
          count: 500,
          offset: 0,
          include_personal_finance_category: true
        }
      });
      allTxs.push(...txRes.data.transactions);
    }
    allTxs.sort((a,b) => new Date(b.date) - new Date(a.date));
    console.log('[sync] fetched', allTxs.length, 'transactions');

    // 3) Agrupar por mes
    const txsPorMes = {};
    allTxs.forEach(tx => {
      const mes = tx.date.slice(0,7); // '2025-06'
      (txsPorMes[mes] = txsPorMes[mes]||[]).push(tx);
    });
    console.log('[sync] months:', Object.keys(txsPorMes));

    // 4) Leer categoryGroups → mapa subcat_key → grupoEspañol
    const catGroupsSnap = await db.collection('categoryGroups').get();
    const catToGroupMap = {};
    catGroupsSnap.forEach(docSnap => {
      const rawId = docSnap.id;                        // 'Loan Payments'
      const key   = rawId.toLowerCase().replace(/\s+/g,'_');
      const grupo = docSnap.data().grupo || rawId;     // 'Finanzas y Seguros'
      catToGroupMap[key] = grupo;
    });
    console.log('[sync] catToGroupMap:', catToGroupMap);

    // 5) Batch para writes
    const batch = db.batch();

    // Para cada mes...
    for (const [mes, txs] of Object.entries(txsPorMes)) {
      console.log(`[sync] processing month ${mes} (${txs.length} txs)`);
      const histCatRef   = userRef.collection('historyCategorias').doc(mes);
      const histLimitsRef= userRef.collection('historyLimits').doc(mes);

      // acumuladores de gasto por grupo
      const spentByGroup = {};

      for (const tx of txs) {
        const raw = tx.personal_finance_category?.primary || tx.category || '';
        const key = raw.toString().toLowerCase();                // 'loan_payments'
        const grp = catToGroupMap[key] || 'Otros';               // 'Finanzas y Seguros' o 'Otros'
        const amt = tx.amount < 0 ? Math.abs(tx.amount) : 0;     // solo gastos

        // → historyCategorias (igual que antes)
        const docCat = histCatRef.collection(grp).doc(tx.transaction_id);
        batch.set(docCat, { amount: tx.amount }, { merge: true });

        // acumular gasto
        spentByGroup[grp] = (spentByGroup[grp]||0) + amt;
      }

      console.log(`[sync] spentByGroup for ${mes}:`, spentByGroup);

      // → historyLimits: solo grupos con límite en budgetsMap
      Object.entries(budgetsMap).forEach(([grpName, limit]) => {
        // grpName coincide con clave de budgetsMap (mismo texto)
        const spent = spentByGroup[grpName] || 0;
        const docLim = histLimitsRef.collection('groups').doc(grpName);
        batch.set(docLim, {
          limit: limit,
          spent: spent
        }, { merge: true });
        console.log(`[sync] set limit for ${mes}/${grpName} →`, { limit, spent });
      });
    }

    // ejecutar batch
    await batch.commit();
    console.log('[sync] batch committed');

    return res.json({ success: true });
  } catch (err) {
    console.error('[sync] error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
