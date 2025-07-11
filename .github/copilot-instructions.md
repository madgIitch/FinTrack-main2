# Guía de Desarrollo de FinTrack AI

## Visión General de la Arquitectura

FinTrack es una PWA (Aplicación Web Progresiva) para gestión de finanzas personales con capacidades *offline-first*, combinando:
- **Frontend**: JS Vanilla con módulos ES + SDK de Firebase + funcionalidades PWA
- **Backend**: API con Express.js desplegada como Cloud Functions de Firebase
- **Capa de Datos**: Firebase Firestore + IndexedDB para almacenamiento offline + integración con API de Plaid

### Límites de Servicio Clave
- `js/firebase.js` – Configuración centralizada de Firebase con cambio automático de URL según entorno
- `functions/` – API backend con integración Plaid y despliegue como Firebase Functions
- `backend/` – Espejo del backend para desarrollo local (la versión desplegada es `functions/`)
- Los Service Workers gestionan la sincronización offline, notificaciones push y sincronización periódica en segundo plano

## Flujos de Trabajo Críticos de Desarrollo

### Desarrollo Local
```bash
# Build del frontend con Parcel
npm run build  # Compila en el directorio public/

# Pruebas locales del backend
cd functions && npm run serve  # Emulador de Firebase en el puerto 5001
```

### Despliegue en Firebase
```bash
firebase deploy --only functions  # Despliega solo la API del backend
firebase deploy --only hosting    # Despliega solo el frontend en Firebase Hosting
```

### Patrón de Cambio de Entorno
La app detecta el hostname para cambiar la URL de la API (ver `js/firebase.js`, línea 42):
- Local: `http://localhost:5001/fintrack-1bced/us-central1/api`  
- Producción: `https://us-central1-fintrack-1bced.cloudfunctions.net/api`

## Patrones Específicos del Proyecto

### Estructura Modular
- **Controladores por Página**: `js/home.js`, `js/analysis.js`, `js/transactions.js` – Cada página tiene su propio controlador
- **Servicios Compartidos**: Se importan desde `js/firebase.js` (auth/db), usando siempre módulos ES
- **Integración PWA**: Service Workers en la raíz manejan la sincronización offline y mensajes push de Firebase

### Patrón de Flujo de Datos
1. El frontend llama a los endpoints de `functions/plaidRoutes.js` mediante `fetch`
2. El backend integra la API de Plaid → normaliza los datos → los guarda en Firestore
3. El frontend se suscribe a los cambios en Firestore con `onSnapshot`
4. IndexedDB cachea los datos para acceso offline (ver `js/transactions.js`, líneas 26-45)

### Implementación Offline-First
- `service-worker.js` gestiona la sincronización periódica con la función `doFullSync()`
- Cada página implementa un patrón de caché con IndexedDB para soporte offline
- La sincronización en segundo plano se registra al cargar la página: `registration.sync.register('sync-transactions')`

### Autenticación y Seguridad
- Autenticación con Firebase Auth y listeners `onAuthStateChanged` en todas las páginas
- Los datos del usuario se almacenan en Firestore bajo `users/{userId}` junto con los tokens de Plaid
- CORS configurado en `functions/plaidRoutes.js` con `origin: '*'` para desarrollo

### Convenciones de Organización del Código
- Comentarios extensos en español con separadores ASCII (`───── Sección ─────`)
- Logging en consola con etiquetas prefijadas: `console.log('[PLAIDROUTES] mensaje')`
- Manejo de errores con patrón try/catch y `console.error` detallado
- Organización de rutas: todas las rutas API bajo el prefijo `/api/plaid/*`

### Puntos Clave de Integración
- **Plaid SDK**: `functions/plaidRoutes.js` gestiona el intercambio de tokens y la sincronización de transacciones
- **Firebase Messaging**: Notificaciones en segundo plano vía `firebase-messaging-sw.js`
- **ApexCharts**: Visualización de datos financieros en las páginas de análisis
- **PWA Manifest**: Configurado para experiencia de app móvil independiente

### Categorización de Transacciones
Sistema personalizado de categorización en `functions/plaidRoutes.js` usando `normalizeKey()` para mapear categorías al español. Las categorías se agrupan y almacenan en Firestore para el seguimiento de presupuestos.

### Notas de Desarrollo
- Estructura duplicada de backend (`backend/` vs `functions/`) – usar `functions/` para desarrollo activo
- Parcel compila el frontend en el directorio `public/` para Firebase Hosting
- El registro del Service Worker se realiza desde los controladores de página, no de forma global
