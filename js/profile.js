import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  console.log('profile.js loaded');

  const nombreSpan = document.getElementById('profile-nombre');
  const apellidosSpan = document.getElementById('profile-apellidos');
  const emailSpan = document.getElementById('profile-email');
  const connectBankButton = document.getElementById('link-bank-button');
  const linkedAccountsMessage = document.getElementById('linked-accounts-message');
  const accountsListContainer = document.getElementById('linked-accounts-list');

  let accountsLoaded = false;

  const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3071' 
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

  onAuthStateChanged(auth, async (user) => {
    if (!user || accountsLoaded) return;
    accountsLoaded = true;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      console.log("Datos del usuario desde Firestore:", userData);

      nombreSpan.textContent = userData.firstName || 'Sin nombre';
      apellidosSpan.textContent = userData.lastName || 'Sin apellidos';
      emailSpan.textContent = user.email || 'Sin email';

      const accounts = userData.plaid?.accounts || [];

      if (accounts.length === 0) {
        linkedAccountsMessage.style.display = 'block';
        linkedAccountsMessage.textContent = 'No hay cuentas vinculadas actualmente.';
        return;
      } else {
        linkedAccountsMessage.style.display = 'none';
      }

      for (const [index, account] of accounts.entries()) {
        try {
          const res = await fetch(`${apiUrl}/api/plaid/get_account_details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: account.accessToken }),
          });

          if (!res.ok) throw new Error('Error en la respuesta de la API');

          const details = await res.json();
          const accountDetails = details.accounts?.[0] || {};
          const institutionDetails = details.institution || {};

          const li = document.createElement('li');
          li.classList.add('linked-account');
          li.innerHTML = `
            <strong>Cuenta ${index + 1}</strong><br>
            Banco: ${institutionDetails.name || 'Desconocido'}<br>
            Nombre de la cuenta: ${accountDetails.name || 'No especificado'}<br>
          `;
          accountsListContainer.appendChild(li);
        } catch (err) {
          console.error(`Error al procesar la cuenta ${index + 1}:`, err);
        }
      }

    } catch (err) {
      console.error("Error general al cargar las cuentas:", err);
    }
  });

  if (connectBankButton) {
    connectBankButton.addEventListener('click', () => {
      if (plaidLinkHandler) {
        plaidLinkHandler.open();
      } else {
        alert('Plaid Link no está listo.');
      }
    });
  }
});

let plaidLinkHandler = null;

function initializePlaidLink(linkToken) {
  console.log('Initializing Plaid Link with token:', linkToken);
  plaidLinkHandler = Plaid.create({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log('Plaid onSuccess - Public token:', public_token);
      console.log('Plaid onSuccess - Metadata:', metadata);

      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3071'
          : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

        const res = await fetch(`${apiUrl}/api/plaid/exchange_public_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId: auth.currentUser.uid }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          alert(`Error al vincular cuenta: ${errorData.message || 'Desconocido'}`);
        } else {
          alert('Cuenta bancaria vinculada con éxito.');
          location.reload();
        }
      } catch (err) {
        console.error('Error al vincular cuenta:', err);
        alert('Error al vincular la cuenta bancaria.');
      }
    },
    onExit: (err, metadata) => {
      console.log('Plaid Link exit', err, metadata);
    },
    onEvent: (eventName, metadata) => {
      console.log('Plaid Link event', eventName, metadata);
    }
  });
}
