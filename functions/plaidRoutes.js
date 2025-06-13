require('dotenv').config();
const express = require('express');
const { admin, db } = require('./firebaseAdmin'); // db = admin.firestore()
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const router = express.Router();
console.log('[PLAIDROUTES] Initializing Plaid routes');

// Función de ayuda para normalizar cadenas (quita acentos y diacríticos)
function normalizeKey(str) {
  console.log('[PLAIDROUTES] normalizeKey input:', str);
  return str.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w_]/g, '');
}

// ── CORS ────────────────────────────────────────────────────────────────────────
router.use((req, res, next) => {
  console.log('[PLAIDROUTES] CORS middleware, method:', req.method, 'path:', req.path);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// ── Inicializar Plaid ──────────────────────────────────────────────────────────
const envName = process.env.PLAID_ENV || 'sandbox';
const plaidEnv = PlaidEnvironments[envName] || PlaidEnvironments.sandbox;
const plaidClient = new PlaidApi(new Configuration({
  basePath: plaidEnv,
  baseOptions: { headers: {
    'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
    'PLAID-SECRET':    process.env.PLAID_SECRET,
    'Plaid-Version':   '2020-09-14'
  }}
}));
console.log('[PLAIDROUTES] Plaid client configured for env:', envName);

// ── Health Check ───────────────────────────────────────────────────────────────
router.get('/ping', (req, res) => {
  console.log('[PLAIDROUTES] GET /ping');
  res.json({ message: 'pong' });
});

// ── Create Link Token ──────────────────────────────────────────────────────────
router.post('/create_link_token', async (req, res) => {
  console.log('[PLAIDROUTES] POST /create_link_token body:', req.body);
  const { userId } = req.body;
  if (!userId) {
    console.error('[PLAIDROUTES] Missing userId');
    return res.status(400).json({ error: 'Falta userId' });
  }
  try {
    const resp = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'FinTrack',
      products: ['auth','transactions'],
      country_codes: ['US','ES'],
      language: 'es'
    });
    console.log('[PLAIDROUTES] linkTokenCreate succeeded');
    res.json({ link_token: resp.data.link_token });
  } catch (err) {
    console.error('[PLAIDROUTES] create_link_token error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Exchange Public Token ──────────────────────────────────────────────────────
router.post('/exchange_public_token', async (req, res) => {
  console.log('[PLAIDROUTES] POST /exchange_public_token body:', req.body);
  const { public_token, userId } = req.body;
  if (!public_token || !userId) {
    console.error('[PLAIDROUTES] Missing public_token or userId');
    return res.status(400).json({ error: 'Falta public_token o userId' });
  }
  try {
    const { data } = await plaidClient.itemPublicTokenExchange({ public_token });
    console.log('[PLAIDROUTES] itemPublicTokenExchange succeeded');
    const accessToken = data.access_token;
    const itemId = data.item_id;
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const accounts = userDoc.exists ? userDoc.data().plaid?.accounts || [] : [];
    console.log('[PLAIDROUTES] Existing accounts count:', accounts.length);
    accounts.push({ accessToken, itemId, createdAt: admin.firestore.Timestamp.now() });
    await userRef.set({ plaid: { accounts } }, { merge: true });
    console.log('[PLAIDROUTES] User doc updated with new account');
    res.json({ success: true });
  } catch (err) {
    console.error('[PLAIDROUTES] exchange_public_token error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Get Account Details ────────────────────────────────────────────────────────
router.post('/get_account_details', async (req, res) => {
  console.log('[PLAIDROUTES] POST /get_account_details body:', req.body);
  const { accessToken } = req.body;
  if (!accessToken) {
    console.error('[PLAIDROUTES] Missing accessToken');
    return res.status(400).json({ error: 'Falta accessToken' });
  }
  try {
    const accsResp = await plaidClient.accountsGet({ access_token: accessToken });
    const itemResp = await plaidClient.itemGet({ access_token: accessToken });
    console.log('[PLAIDROUTES] get_account_details succeeded');
    const institution = itemResp.data.item.institution_id || null;
    res.json({ accounts: accsResp.data.accounts, institution });
  } catch (err) {
    console.error('[PLAIDROUTES] get_account_details error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Get Transactions ────────────────────────────────────────────────────────────
router.post('/get_transactions', async (req, res) => {
  console.log('[PLAIDROUTES] POST /get_transactions body:', req.body);
  const { userId, startDate, endDate } = req.body;
  if (!userId) {
    console.error('[PLAIDROUTES] Missing userId');
    return res.status(400).json({ error: 'Falta userId' });
  }
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) throw new Error('Usuario no encontrado');
    const accounts = userDoc.data().plaid?.accounts || [];
    console.log('[PLAIDROUTES] Accounts to fetch:', accounts.length);
    const start = startDate || new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
    const end = endDate   || new Date().toISOString().slice(0,10);
    console.log('[PLAIDROUTES] Fetching transactions from', start, 'to', end);
    let allTxs = [];
    for (const { accessToken } of accounts) {
      const resp = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: start,
        end_date: end,
        options: { count: 500, offset: 0, include_personal_finance_category: true }
      });
      console.log('[PLAIDROUTES] Fetched', resp.data.transactions.length, 'transactions');
      allTxs.push(...resp.data.transactions);
    }
    allTxs.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const cleaned = allTxs.map(tx=>({
      id: tx.transaction_id,
      account_id: tx.account_id,
      date: tx.date,
      description: tx.name,
      personal_finance_category: tx.personal_finance_category||null,
      category: tx.personal_finance_category?.primary||'Sin categoría',
      category_id: tx.category_id||null,
      amount: tx.amount
    }));
    console.log('[PLAIDROUTES] Sending cleaned transactions count:', cleaned.length);
    res.json({ transactions: cleaned });
  } catch (err) {
    console.error('[PLAIDROUTES] get_transactions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Sync transactions, historyCategorias, historyLimits & historySummary ─────
router.post('/sync_transactions_and_store', async (req, res) => {
  console.log('[PLAIDROUTES] → sync_transactions_and_store START');
  console.log('[PLAIDROUTES] body:', req.body);
  const { userId } = req.body;
  if (!userId) {
    console.error('[PLAIDROUTES] Missing userId');
    return res.status(400).json({ error: 'Falta userId' });
  }
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) throw new Error('Usuario no encontrado');
    console.log('[PLAIDROUTES] User found for sync');

    // 1) Leer budgets
    const budgetsMap = userSnap.data().settings?.budgets || {};
    console.log('[PLAIDROUTES] budgetsMap:', budgetsMap);

    // 2) Fetch Plaid transactions
    const accounts = userSnap.data().plaid?.accounts || [];
    let allPlaidTxs = [];
    for (const { accessToken } of accounts) {
      const resp = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10),
        end_date: new Date().toISOString().slice(0,10),
        options: { count: 500, offset: 0, include_personal_finance_category: true }
      });
      allPlaidTxs.push(...resp.data.transactions);
    }
    console.log('[PLAIDROUTES] Total Plaid transactions:', allPlaidTxs.length);

    // 3) Include Firestore transactions
    const monthRefs = await userRef.collection('history').listDocuments();
    const idToTx = new Map(allPlaidTxs.map(tx=>[tx.transaction_id,tx]));
    for (const mRef of monthRefs) {
      const itemsSnap = await mRef.collection('items').get();
      itemsSnap.forEach(docSnap=>{
        const d = docSnap.data();
        const tx = {
          transaction_id: docSnap.id,
          date: d.date,
          amount: d.amount,
          personal_finance_category: d.personal_finance_category,
          category: d.category,
          category_id: d.category_id,
          description: d.description ?? null
        };
        console.log('[PLAIDROUTES] tx from Firestore:', tx);
        idToTx.set(tx.transaction_id, tx);
      });
    }

    // 4) Group by month
    const txsByMonth = {};
    for (const tx of idToTx.values()) {
      const mon = tx.date.slice(0,7);
      (txsByMonth[mon]=txsByMonth[mon]||[]).push(tx);
    }
    console.log('[PLAIDROUTES] Months to process:',Object.keys(txsByMonth));

    // 5) Build category map
    const catGroupsSnap = await db.collection('categoryGroups').get();
    const catToGroup = {};
    catGroupsSnap.forEach(doc=>{
      const rawId = doc.id;
      const disp = doc.data().group||doc.data().grupo||rawId;
      catToGroup[normalizeKey(rawId)] = disp;
      (doc.data().subcategories||[]).forEach(sub=>catToGroup[normalizeKey(sub)] = disp);
    });
    console.log('[PLAIDROUTES] Category groups loaded:',Object.keys(catToGroup));

    // 6) Batch write summary, historyCategorias & historyLimits
    const batch = db.batch();
    for (const [mon,txs] of Object.entries(txsByMonth)) {
      console.log('[PLAIDROUTES] Writing month:',mon);

      // historySummary
      const sumRef = userRef.collection('historySummary').doc(mon);
      const totalExpenses = txs.filter(t=>t.amount<0).reduce((s,t)=>s+Math.abs(t.amount),0);
      const totalIncomes  = txs.filter(t=>t.amount>=0).reduce((s,t)=>s+t.amount,0);
      batch.set(sumRef,{ totalExpenses, totalIncomes, updatedAt: admin.firestore.Timestamp.now() });

      // historyCategorias
      const catRef = userRef.collection('historyCategorias').doc(mon);
      const spentByGroup = {};
      txs.forEach(tx=>{
        const key = normalizeKey(tx.personal_finance_category?.primary||tx.category||'Otros');
        const grp = catToGroup[key]||'Otros';
        const amt = tx.amount<0?Math.abs(tx.amount):0;
        spentByGroup[grp] = (spentByGroup[grp]||0)+amt;
        const detRef = catRef.collection(grp).doc(tx.transaction_id);
        batch.set(detRef,{ amount:tx.amount, date:tx.date, description:tx.description || null },{ merge:true });
      });
      console.log(`[PLAIDROUTES] historyCategorias for ${mon}:`, spentByGroup);
      batch.set(catRef, spentByGroup, { merge:true });

      // historyLimits
      const limGroupsRef = userRef.collection('historyLimits').doc(mon).collection('groups');
      console.log(`[PLAIDROUTES] historyLimits for ${mon}, budgetsMap:`, budgetsMap);
      Object.entries(budgetsMap).forEach(([grp,limit])=>{
        const spent = spentByGroup[grp] || 0;
        console.log(`[PLAIDROUTES] limit for ${grp}:`, limit, 'spent:', spent);
        const grpDocRef = limGroupsRef.doc(grp);
        batch.set(grpDocRef, { limit, spent }, { merge:true });
      });
    }

    console.log('[PLAIDROUTES] About to commit batch for months:', Object.keys(txsByMonth));
    await batch.commit()
      .then(()=>console.log('[PLAIDROUTES] Batch committed successfully!'))
      .catch(e=>console.error('[PLAIDROUTES] Batch commit failed:',e));

    console.log('[PLAIDROUTES] ← sync_transactions_and_store END');
    res.json({ success: true });
  } catch(err) {
    console.error('[PLAIDROUTES] sync_transactions_and_store error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
