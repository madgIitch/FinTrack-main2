require('dotenv').config();
const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

// Configuración para el cliente de Plaid
const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
      "Plaid-Version": "2020-09-14"
    }
  }
});

const client = new PlaidApi(config);
module.exports = client;
