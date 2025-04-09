// functions/plaidRoutes.js
const express = require('express');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const router = express.Router();

// Importa Firebase Admin para acceder a Firestore
const { admin, db } = require('./firebaseAdmin');

console.log("--- Plaid Routes ---");
console.log("PLAID_SECRET from env:", process.env.PLAID_SECRET);
console.log("PLAID_CLIENT_ID from env:", process.env.PLAID_CLIENT_ID);
console.log("PLAID_ENV from env:", process.env.PLAID_ENV);
console.log("Utilizando PlaidEnvironments:", PlaidEnvironments);

// Determinar el entorno de Plaid según la variable de entorno PLAID_ENV
let plaidEnvironment;
if (process.env.PLAID_ENV === 'development') {
    plaidEnvironment = PlaidEnvironments.development;
    console.log("Configurando entorno de Plaid a: development");
} else if (process.env.PLAID_ENV === 'sandbox') {
    plaidEnvironment = PlaidEnvironments.sandbox;
    console.log("Configurando entorno de Plaid a: sandbox");
} else {
    plaidEnvironment = PlaidEnvironments.sandbox; // Por defecto a sandbox
    console.warn("PLAID_ENV no está configurado a 'development'. Se usará sandbox por defecto.");
}

let plaidClient;
try {
    // Configuración del cliente de Plaid
    const configuration = new Configuration({
        basePath: plaidEnvironment,
        baseOptions: {
            headers: {
                "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
                "PLAID-SECRET": process.env.PLAID_SECRET,
                "Plaid-Version": "2020-09-14",
            },
        },
    });
    plaidClient = new PlaidApi(configuration);
    console.log("Cliente de Plaid inicializado correctamente con el entorno:", plaidEnvironment);
} catch (error) {
    console.error("Error al inicializar el Cliente de Plaid:", error);
}

// Endpoint para crear el link token
router.post('/create_link_token', async (req, res) => {
    const { userId } = req.body;
    console.log("Recibiendo solicitud a /create_link_token para el usuario:", userId);

    if (!plaidClient) {
        return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
    }

    try {
        const tokenResponse = await plaidClient.linkTokenCreate({
            user: { client_user_id: userId },
            client_name: "FinTrack",
            products: ["auth", "transactions"],
            country_codes: ["US", "ES"],
            language: "es",
        });
        console.log("Link token creado correctamente para el usuario:", userId);
        res.json({ link_token: tokenResponse.data.link_token });
    } catch (error) {
        console.error('Error al crear el link token:', error);
        res.status(500).json({ error: error.message || 'Error al crear el link token' });
    }
});

// Nuevo endpoint para intercambiar el public token y almacenar el access token en Firestore
router.post('/exchange_public_token', async (req, res) => {
    const { public_token, userId } = req.body;
    console.log(`Recibiendo solicitud a /exchange_public_token para el usuario: ${userId}`);
  
    if (!plaidClient) {
      return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
    }
    
    try {
      const tokenResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });
      const accessToken = tokenResponse.data.access_token;
      const itemId = tokenResponse.data.item_id;
      
      console.log(`Access token para el usuario ${userId}: ${accessToken}`);
      console.log(`Item ID para el usuario ${userId}: ${itemId}`);
      
      // Obtener el documento del usuario y actualizar el array 'accounts'
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();
      let accounts = [];
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.plaid && Array.isArray(userData.plaid.accounts)) {
          accounts = userData.plaid.accounts;
        }
      }
      
      // Agregar la nueva cuenta
      accounts.push({
        accessToken,
        itemId,
        createdAt: admin.firestore.Timestamp.now()
      });
      
      // Actualizar el documento del usuario sin sobrescribir otros datos
      await userRef.set({ plaid: { accounts } }, { merge: true });
      console.log(`Se han almacenado las cuentas en Firestore para el usuario ${userId}:`, accounts);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error al intercambiar el public token:', error);
      res.status(500).json({ error: error.message || 'Error al intercambiar el public token' });
    }
});

// Endpoint para obtener los detalles de la cuenta
router.post('/get_account_details', async (req, res) => {
  const { accessToken } = req.body;
  console.log("Recibiendo solicitud a /get_account_details con accessToken:", accessToken);
  
  if (!plaidClient) {
      return res.status(500).json({ error: 'Cliente de Plaid no inicializado.' });
  }
  
  try {
      // Obtener datos de las cuentas asociadas
      const accountsResponse = await plaidClient.accountsGet({ access_token: accessToken });
      // Obtener información del item (para el institution_id)
      const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
      const institution_id = itemResponse.data.item.institution_id;
      // Obtener detalles de la institución
      const institutionResponse = await plaidClient.institutionsGetById({
          institution_id,
          country_codes: ['US', 'ES']
      });
      
      res.json({
          accounts: accountsResponse.data.accounts,
          institution: institutionResponse.data.institution
      });
  } catch (error) {
      console.error("Error en get_account_details:", error);
      res.status(500).json({ error: error.message });
  }
});

module.exports = router;
