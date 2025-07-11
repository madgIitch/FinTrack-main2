// ───── Archivo: functions/seedTransactions.js ─────
// Script que genera transacciones aleatorias para pruebas.
// Puede ejecutarse tanto desde la CLI como ser llamado desde una función HTTP de Firebase.

// ───── Dependencias ─────
const { db } = require('./firebaseAdmin');        // Cliente de Firestore ya autenticado
const { v4: uuidv4 } = require('uuid');           // Para generar transaction_id únicos

// Cargo un listado de categorías desde un JSON exportado previamente desde Firestore.
// Este archivo debe estar incluido en la carpeta functions al desplegar.
const categoriesData = require('./firexport_basic_1749667152478.json');
const categoryIds = categoriesData.map(item => item['Document ID']);

// ───── Generador de transacciones de prueba ─────
/**
 * Genera un array de transacciones aleatorias.
 * @param {number} count  Cantidad de transacciones a generar.
 * @param {string} userId ID del usuario (se usa como account_id ficticio).
 * @param {number} year   Año deseado (ej. 2025).
 * @param {number} month  Mes deseado (1-12).
 */
function generateTransactions(count, userId, year, month) {
  const transactions = [];

  for (let i = 0; i < count; i++) {
    // Genero un día aleatorio del mes
    const daysInMonth = new Date(year, month, 0).getDate();
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    const date = new Date(Date.UTC(year, month - 1, day))
      .toISOString()
      .split('T')[0]; // formato YYYY-MM-DD

    // Monto aleatorio entre -1000 (gasto) y +1000 (ingreso)
    const amount = parseFloat(((Math.random() * 2000) - 1000).toFixed(2));

    // Selecciono una categoría aleatoria de las que tengo en el JSON
    const category = categoryIds[Math.floor(Math.random() * categoryIds.length)];

    // Armo la transacción simulada
    transactions.push({
      account_id: userId,
      amount,
      category,
      category_id: null,
      currency: 'USD',
      date,
      description: 'data test',
      fetchedAt: new Date().toISOString(),
      transaction_id: uuidv4(), // identificador único
    });
  }

  return transactions;
}

// ───── Inserción de las transacciones generadas en Firestore ─────
/**
 * Inserta las transacciones generadas en Firestore bajo:
 * users/{userId}/history/{YYYY-MM}/items/{transaction_id}
 */
async function seed(userId, count, year, month) {
  const txs = generateTransactions(count, userId, year, month);
  const batch = db.batch(); // Inserción por lotes para eficiencia
  const monthId = `${year}-${String(month).padStart(2, '0')}`;

  txs.forEach(tx => {
    const ref = db
      .collection('users')
      .doc(userId)
      .collection('history')
      .doc(monthId)
      .collection('items')
      .doc(tx.transaction_id);

    batch.set(ref, tx); // Agrego al batch
  });

  await batch.commit(); // Aplico todas las escrituras
  console.log(`✅ Insertadas ${txs.length} transacciones en users/${userId}/history/${monthId}/items`);
}

// ───── Ejecución desde terminal (modo CLI) ─────
// Permite correr el script con:
// node seedTransactions.js <userId> <year> <month> <count>
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

// ───── Exportación para uso desde una función HTTP (ej. /seed en Express) ─────
module.exports = { seed };
