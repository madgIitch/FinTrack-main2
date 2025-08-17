# 💸 FinTrack — Personal Finance PWA

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with](https://img.shields.io/badge/made%20with-Firebase-orange)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-yellow)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)

> **FinTrack** es una Progressive Web App (PWA) que ayuda a los usuarios a **gestionar sus finanzas personales**, conectando cuentas bancarias reales mediante **Plaid API** y almacenando los datos en **Firebase**.  
> Proyecto desarrollado como **Trabajo Fin de Grado en Ingeniería Informática**.

---

## ✨ Funcionalidades principales

- 🔐 **Autenticación segura** con Firebase Auth.  
- 🏦 **Vinculación de cuentas bancarias** con Plaid API.  
- 📊 **Visualización de transacciones** (cronológica y por categorías).  
- 📈 **Análisis financiero** con gráficas interactivas (ingresos, gastos, presupuestos).  
- 📅 **Gestión de presupuestos mensuales** con alertas de exceso de gasto.  
- 🔔 **Notificaciones push** (ej. avisos de presupuesto).  
- 📑 **Generación automática de informes PDF** con resumen financiero.  
- 📱 **Soporte offline** mediante IndexedDB y Service Workers.  
- 💻 **PWA instalable** en escritorio o móvil.

---

## 🖼️ Capturas de pantalla

> _Añade aquí imágenes o GIFs de tu app en funcionamiento._  

Ejemplo de estructura:  

- **Pantalla de login**  
- **Dashboard con cuentas y saldos**  
- **Vista de transacciones y análisis**  

---

## 🛠️ Stack Tecnológico

**Frontend**
- HTML5, CSS3, JavaScript ES6+
- ApexCharts (visualizaciones)
- Service Workers + IndexedDB (offline support)
- Responsive design + PWA

**Backend**
- Node.js + Express
- Firebase Functions (Cloud backend)
- Firebase Firestore (NoSQL DB)
- Firebase Messaging (push notifications)

**Integraciones externas**
- Plaid API (conexión bancaria)
- Puppeteer (generación de PDFs)

---

## 🚀 Demo

🔗 [Prueba la aplicación en vivo](https://tu-demo-url.com)  
*(si lo despliegas en Firebase Hosting o Vercel)*  

---

## ⚙️ Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/madgIitch/FinTrack-main2.git
cd FinTrack-main2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
#   - Firebase API keys
#   - Plaid API keys
#   (ver archivo .env.example)

# 4. Ejecutar en desarrollo
npm run dev
