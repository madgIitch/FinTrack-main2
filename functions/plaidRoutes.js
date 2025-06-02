// functions/plaidRoutes.js

require('dotenv').config();            // Carga variables de entorno
const express = require('express');
const { admin, db } = require('./firebaseAdmin');  // db = admin.firestore()
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const router = express.Router();

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
router.get('/ping', (_req, res) => {
  return res.json({ message: 'pong' });
});

// ── Create Link Token ──────────────────────────────────────────────────────────
router.post('/create_link_token', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  try {
    const resp = await plaidClient.linkTokenCreate({
      user:          { client_user_id: userId },
      client_name:   'FinTrack',
      products:      ['auth','transactions'],
      country_codes: ['US','ES'],
      language:      'es'
    });
    return res.json({ link_token: resp.data.link_token });
  } catch (err) {
    console.error('[PLAIDROUTES] Error creating link token:', err.response?.data || err);
    return res.status(500).json({ error: err.message });
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

    return res.json({ success: true });
  } catch (err) {
    console.error('[PLAIDROUTES] Error exchanging public token:', err.response?.data || err);
    return res.status(500).json({ error: err.message });
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

    return res.json({
      accounts:    accsResp.data.accounts,
      institution
    });
  } catch (err) {
    console.error('[PLAIDROUTES] Error in get_account_details:', err.response?.data || err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Get Transactions ────────────────────────────────────────────────────────────
router.post('/get_transactions', async (req, res) => {
  const { userId, startDate, endDate } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

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

    return res.json({ transactions: cleaned });
  } catch (err) {
    console.error('[PLAIDROUTES] Error in get_transactions:', err.response?.data || err);
    return res.status(500).json({ error: err.message });
  }
});

// ── Sync transactions and store ───────────────────────────────────────────────
router.post('/sync_transactions_and_store', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Falta userId' });
  }

  try {
    const userRef  = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const accounts = userSnap.data().plaid?.accounts || [];
    if (accounts.length === 0) {
      return res.json({ message: 'Sin cuentas vinculadas' });
    }

    const endDate   = new Date().toISOString().slice(0,10);
    const startDate = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0,10);

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
      const txs = txRes.data.transactions;

      for (const tx of txs) {
        const monthYear = tx.date.slice(0,7);
        const txRef = userRef
          .collection('history')
          .doc(monthYear)
          .collection('items')
          .doc(tx.transaction_id);

        const existing = await txRef.get();
        if (!existing.exists) {
          await txRef.set({
            transaction_id: tx.transaction_id,
            account_id:     tx.account_id,
            date:           tx.date,
            description:    tx.name,
            category:       tx.personal_finance_category?.primary || 'Sin categoría',
            detailed:       tx.personal_finance_category?.detailed || null,
            category_id:    tx.category_id || null,
            amount:         tx.amount,
            currency:       tx.iso_currency_code || null,
            fetchedAt:      admin.firestore.Timestamp.now()
          });
        }
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[PLAIDROUTES] Error in sync_transactions_and_store:', err.response?.data || err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
