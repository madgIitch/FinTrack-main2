// seedTransactions.js
// Ejecutable en Google Cloud con Application Default Credentials
// Importa el cliente Firestore configurado en functions/firebaseAdmin.js

const { db } = require('./firebaseAdmin');
const { v4: uuidv4 } = require('uuid');

// Carga tu JSON de categorías (inclúyelo en el despliegue en la carpeta functions)
const categoriesData = require('./firexport_basic_1749667152478.json');
const categoryIds = categoriesData.map(item => item['Document ID']);

/**
 * Genera un array de transacciones de prueba.
 * @param {number} count  Número de transacciones a crear.
 * @param {string} userId ID del usuario.
 * @param {number} year   Año (e.g. 2025).
 * @param {number} month  Mes (1-12).
 */
function generateTransactions(count, userId, year, month) {
  const transactions = [];
  for (let i = 0; i < count; i++) {
    // Fecha aleatoria dentro del mes y año
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const date = new Date(Date.UTC(year, month - 1, day))
      .toISOString()
      .split('T')[0];

    // Monto aleatorio entre -1000 y 1000
    const amount = parseFloat(((Math.random() * 2000) - 1000).toFixed(2));

    // Selección aleatoria de categoría
    const category = categoryIds[Math.floor(Math.random() * categoryIds.length)];

    transactions.push({
      account_id: userId,
      amount,
      category,
      category_id: null,
      currency: 'USD',
      date,
      description: 'data test',
      fetchedAt: new Date().toISOString(),
      transaction_id: uuidv4(),
    });
  }
  return transactions;
}

/**
 * Inserta las transacciones en Firestore en la ruta:
 * users/{userId}/history/{YYYY-MM}/items/{transaction_id}
 */
async function seed(userId, count, year, month) {
  const txs = generateTransactions(count, userId, year, month);
  const batch = db.batch();
  const monthId = `${year}-${String(month).padStart(2, '0')}`;

  txs.forEach(tx => {
    const ref = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(monthId)
      .collection('items')
      .doc(tx.transaction_id);
    batch.set(ref, tx);
  });

  await batch.commit();
  console.log(`✅ Insertadas ${txs.length} transacciones en users/${userId}/history/${monthId}/items`);
}

// Si se ejecuta como script desde CLI:
if (require.main === module) {
  const [userId, yearArg, monthArg, countArg] = process.argv.slice(2);
  const year = Number(yearArg);
  const month = Number(monthArg);
  const count = Number(countArg);

  if (!userId || !year || !month || !count) {
    console.error('Uso: node seedTransactions.js <userId> <year> <month> <count>');
    process.exit(1);
  }

  seed(userId, count, year, month)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error al insertar transacciones:', err);
      process.exit(1);
    });
}

// Exporta seed para invocar desde Cloud Functions:
module.exports = { seed };
