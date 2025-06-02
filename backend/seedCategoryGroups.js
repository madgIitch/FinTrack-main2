// backend/seedCategoryGroups.js

/**
 * backend/seedCategoryGroups.js
 * 
 * Este script lee el JSON de categorías agrupadas (categorias_grupos.json)
 * y las escribe en Firestore en la colección "categoryGroups".
 * Requiere que exista un fichero serviceAccountKey.json en la misma carpeta
 * y que firebaseAdmin.js cargue correctamente dichas credenciales.
 */

const path = require('path');
const { db } = require('./firebaseAdmin.js'); //  ← Importa la instancia Firestore admin

// Asegúrate de que este JSON realmente exista en la carpeta del proyecto:
// por ejemplo: backend/categorias_grupos.json
const categoriasPorGrupo = require(path.join(__dirname, 'categorias_grupos.json'));

async function seedCategoryGroups() {
  console.log('▶️ Iniciando seeding de categoryGroups en Firestore…');
  try {
    // 1) Prepara un batch para escritura en lote
    const batch = db.batch();
    let total = 0;

    // 2) Recorre cada entrada de categoriasPorGrupo: 
    //    la clave es el nombre del macro-grupo, y el valor un array de subcategorías.
    for (const [grupo, listaSubcategorias] of Object.entries(categoriasPorGrupo)) {
      if (!Array.isArray(listaSubcategorias)) continue;

      console.log(`   • Procesando macroGrupo "${grupo}" con ${listaSubcategorias.length} subcategorías…`);

      // 3) Para cada nombre de subcategoría, crea/actualiza documento en /categoryGroups
      listaSubcategorias.forEach(subcatName => {
        // Normalizamos el ID del documento (aquí usamos directamente el nombre tal cual,
        // puedes transformar mayúsculas/minúsculas o quitar espacios si quieres).
        const docId = subcatName;  
        const ref   = db.collection('categoryGroups').doc(docId);

        // Batch “set”: establecemos que cada documento contenga el campo { group: <macro-grupo> }
        batch.set(ref, { group: grupo }, { merge: true });
        total++;
      });
    }

    console.log(`⏳ Seeding de ${total} subcategorías a /categoryGroups (batch)…`);
    // 4) Commit del batch
    await batch.commit();
    console.log('✅ Operación completada. Todos los documentos se han creado/actualizado.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seedCategoryGroups:', err);
    process.exit(1);
  }
}

// Arrancamos el seed
seedCategoryGroups();
