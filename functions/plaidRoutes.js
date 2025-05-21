// functions/plaidRoutes.js

require('dotenv').config();
const express = require('express');
const { admin, db } = require('./firebaseAdmin'); 
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const router = express.Router();

console.log('--- Plaid Routes ---');
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET);
console.log('PLAID_ENV:', process.env.PLAID_ENV);

// ── CORS Middleware ─────────────────────────────────────────────────────────────
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ── Plaid Client Initialization ────────────────────────────────────────────────
const envName = process.env.PLAID_ENV || 'sandbox';
const plaidEnv = PlaidEnvironments[envName] || PlaidEnvironments.sandbox;

const plaidConfig = new Configuration({
  basePath: plaidEnv,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET':    process.env.PLAID_SECRET,
      'Plaid-Version':   '2020-09-14'
    }
  }
});
const plaidClient = new PlaidApi(plaidConfig);

// ── Health Check ───────────────────────────────────────────────────────────────
router.get('/ping', (_req, res) => {
  res.json({ message: 'pong' });
});

// ── Create Link Token ──────────────────────────────────────────────────────────
// Soporta creación normal y modo “update” si recibe accessToken
router.post('/create_link_token', async (req, res) => {
  const { userId, accessToken: updateToken } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    const params = {
      user: { client_user_id: userId },
      client_name: 'FinTrack',
      products: ['auth', 'transactions'],
      country_codes: ['US', 'ES'],
      language: 'es'
    };
    if (updateToken) {
      params.access_token = updateToken;
      console.log(`Modo update: re-autenticando accessToken=${updateToken}`);
    }
    const createResponse = await plaidClient.linkTokenCreate(params);
    res.json({ link_token: createResponse.data.link_token });
  } catch (err) {
    console.error('Error creating link token:', err.response?.data || err, '\n', err.stack);
    res.status(500).json({ error: err.message || 'Error creando link token' });
  }
});

// ── Exchange Public Token ──────────────────────────────────────────────────────
router.post('/exchange_public_token', async (req, res) => {
  const { public_token, userId } = req.body;
  if (!public_token || !userId) {
    return res.status(400).json({ error: 'Falta public_token o userId' });
  }

  try {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;
    const itemId      = exchangeResponse.data.item_id;

    // Guardar en Firestore
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    let accounts = [];
    if (userDoc.exists) {
      const data = userDoc.data();
      if (data.plaid?.accounts) {
        accounts = data.plaid.accounts;
      }
    }

    accounts.push({
      accessToken,
      itemId,
      createdAt: admin.firestore.Timestamp.now()
    });

    await userRef.set({ plaid: { accounts } }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Error exchanging public token:', err.response?.data || err, '\n', err.stack);
    res.status(500).json({ error: err.message || 'Error intercambiando public token' });
  }
});

// ── Get Account Details ────────────────────────────────────────────────────────
router.post('/get_account_details', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'Falta accessToken' });

  try {
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const itemResponse     = await plaidClient.itemGet({ access_token: accessToken });
    const institutionId    = itemResponse.data.item.institution_id;

    let institution = null;
    if (institutionId) {
      const instRes = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: ['US', 'ES']
      });
      institution = instRes.data.institution;
    }

    res.json({
      accounts:    accountsResponse.data.accounts,
      institution: institution
    });
  } catch (err) {
    console.error('Error getting account details:', err.response?.data || err, '\n', err.stack);
    const code = err.response?.data?.error_code;
    if (code === 'ITEM_LOGIN_REQUIRED') {
      return res.json({
        status:      'login_required',
        message:     err.response.data.error_message,
        accessToken
      });
    }
    res.status(500).json({ error: err.message || 'Error al obtener detalles de cuenta' });
  }
});

// ── Get Transactions ───────────────────────────────────────────────────────────
router.post('/get_transactions', async (req, res) => {
  const { userId, startDate, endDate } = req.body;
  if (!userId) return res.status(400).json({ error: 'Falta userId' });

  try {
    // 1) Recupera tokens del usuario
    const userDoc = await db.collection('users').doc(userId).get();
    const accounts = userDoc.exists
      ? userDoc.data().plaid?.accounts || []
      : [];
    if (accounts.length === 0) {
      return res.json({ transactions: [] });
    }

    // 2) Rango de fechas – default 30 días
    const start = startDate || new Date(Date.now() - 30*24*60*60*1000)
      .toISOString().slice(0,10);
    const end = endDate || new Date().toISOString().slice(0,10);

    // 3) Trae transacciones de cada access_token con categoría personal
    let allTxs = [];
    for (const { accessToken } of accounts) {
      const txRes = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date:   start,
        end_date:     end,
        options: {
          count: 500,
          offset: 0,
          include_personal_finance_category: true
        }
      });
      allTxs = allTxs.concat(txRes.data.transactions);
    }

    // 4) Orden descendente por fecha
    allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 5) Limpia payload y saca categoría primaria PFC
    const cleaned = allTxs.map(tx => ({
      id:          tx.transaction_id,
      account_id:  tx.account_id,
      date:        tx.date,
      description: tx.name,
      category:    (tx.personal_finance_category?.[0]) || 'Sin categoría',
      amount:      tx.amount
    }));

    res.json({ transactions: cleaned });
  } catch (err) {
    console.error('Error in get_transactions:', err);
    res.status(500).json({ error: err.message || 'Error obteniendo transacciones' });
  }
});



module.exports = router;
