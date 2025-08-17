# 💸 FinTrack — Personal Finance PWA

![Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Made with](https://img.shields.io/badge/made%20with-Firebase-orange)
![Frontend](https://img.shields.io/badge/frontend-HTML%2FCSS%2FJS-yellow)
![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express-green)

> **FinTrack** is a Progressive Web App (PWA) that helps users **manage their personal finances**, by connecting real bank accounts via **Plaid API** and storing data in **Firebase**.  
> Developed as my **Computer Engineering Bachelor's Thesis**.

---

## ✨ Key Features

- 🔐 **Secure authentication** with Firebase Auth.  
- 🏦 **Bank account linking** through Plaid API.  
- 📊 **Transaction visualization** (chronological & categorized views).  
- 📈 **Financial analysis** with interactive charts (income, expenses, budgets).  
- 📅 **Monthly budget management** with overspending alerts.  
- 🔔 **Push notifications** (e.g., budget alerts).  
- 📑 **Automated PDF report generation** with financial summaries.  
- 📱 **Offline support** using IndexedDB & Service Workers.  
- 💻 **Installable PWA** for desktop and mobile.  

---

## 🖼️ Screenshots

> _Add screenshots or GIFs of your app in action here._  

Suggested examples:  

- **Login screen**  
- **Dashboard with accounts and balances**  
- **Transactions & analytics view**  

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3, JavaScript ES6+
- ApexCharts (data visualizations)
- Service Workers + IndexedDB (offline support)
- Responsive design + PWA

**Backend**
- Node.js + Express
- Firebase Cloud Functions
- Firebase Firestore (NoSQL DB)
- Firebase Messaging (push notifications)

**External integrations**
- Plaid API (bank connectivity)
- Puppeteer (PDF generation)

---

## 🚀 Demo

🔗 [Live demo](https://your-demo-url.com)  
*(deploy via Firebase Hosting or Vercel)*  

---

## ⚙️ Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/madgIitch/FinTrack-main2.git
cd FinTrack-main2

# 2. Install dependencies
npm install

# 3. Configure environment variables
#   - Firebase API keys
#   - Plaid API keys
#   (see .env.example)

# 4. Run in development
npm run dev
