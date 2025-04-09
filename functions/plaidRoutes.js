const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const { admin, db } = require('./firebaseAdmin');

const router = express.Router();

console.log('--- Plaid Routes ---');
console.log('PLAID_CLIENT_ID:', process.env.PLAID_CLIENT_ID);
console.log('PLAID_SECRET:', process.env.PLAID_SECRET);
console.log('PLAID_ENV:', process.env.PLAID_ENV);

// Middleware CORS local (refuerzo)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoint de prueba para verificar que el router está activo
router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Determinar el entorno de Plaid
const plaidEnvName = process.env.PLAID_ENV || 'sandbox';
const plaidEnvironment = PlaidEnvironments[plaidEnvName] || PlaidEnvironments.sandbox;
console.log('Entorno Plaid:', plaidEnvName);

let plaidClient;
try {
  const configuration = new Configuration({
    basePath: plaidEnvironment,
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'Plaid-Version': '2020-09-14'
      }
    }
  });
  plaidClient = new PlaidApi(configuration);
  console.log('Plaid API client inicializado correctamente con el entorno:', plaidEnvironment);
} catch (error) {
  console.error('Error al inicializar Plaid API client:', error);
}

// Endpoint para crear el link token
router.post('/create_link_token', async (req, res) => {
  const { userId } = req.body;
  console.log(`Solicitud a /create_link_token para el usuario: ${userId}`);
  if (!plaidClient) {
    return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
  }
  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'FinTrack',
      products: ['auth', 'transactions'],
      country_codes: ['US', 'ES'],
      language: 'es'
    });
    console.log(`Link token generado correctamente para ${userId}`);
    res.json({ link_token: tokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creando link token:', error);
    res.status(500).json({ error: error.message || 'Error creando link token' });
  }
});

// Endpoint para intercambiar public token por access token y almacenarlo en Firestore
router.post('/exchange_public_token', async (req, res) => {
  const { public_token, userId } = req.body;
  console.log(`Solicitud a /exchange_public_token para el usuario: ${userId}`);
  if (!plaidClient) {
    return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
  }
  try {
    const tokenResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;
    console.log(`Access token obtenido para ${userId}: ${accessToken}`);
    console.log(`Item ID obtenido para ${userId}: ${itemId}`);

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    let accounts = [];
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.plaid && Array.isArray(userData.plaid.accounts)) {
        accounts = userData.plaid.accounts;
      }
    }
    accounts.push({
      accessToken,
      itemId,
      createdAt: admin.firestore.Timestamp.now()
    });
    await userRef.set({ plaid: { accounts } }, { merge: true });
    console.log(`Cuenta Plaid añadida para el usuario ${userId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error en exchange_public_token:', error);
    res.status(500).json({ error: error.message || 'Error intercambiando public token' });
  }
});

// Endpoint para obtener detalles de la cuenta bancaria
router.post('/get_account_details', async (req, res) => {
  const { accessToken } = req.body;
  console.log('Solicitud a /get_account_details');
  if (!plaidClient) {
    return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
  }
  try {
    const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
    const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
    const institution_id = itemResponse.data.item.institution_id;
    let institutionDetails = null;
    if (institution_id) {
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id,
        country_codes: ['US', 'ES']
      });
      institutionDetails = institutionResponse.data.institution;
    }
    res.json({
      accounts: accountsResponse.data.accounts,
      institution: institutionDetails
    });
  } catch (error) {
    console.error('Error obteniendo detalles de cuenta:', error);
    res.status(500).json({ error: error.message || 'Error al obtener detalles de cuenta' });
  }
});

module.exports = router;
