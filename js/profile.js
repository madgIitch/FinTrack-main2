import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { updateDoc, arrayUnion } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  console.log('profile.js loaded');

  const nombreSpan = document.getElementById('profile-nombre');
  const apellidosSpan = document.getElementById('profile-apellidos');
  const emailSpan = document.getElementById('profile-email');
  const connectBankButton = document.getElementById('link-bank-button');
  const linkedAccountsMessage = document.getElementById('linked-accounts-message');
  const accountsListContainer = document.getElementById('linked-accounts-list');

  let accountsLoaded = false;

  // Establecer la URL de la API según el entorno
  const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3071' 
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

  onAuthStateChanged(auth, async (user) => {
    if (!user || accountsLoaded) return;
    accountsLoaded = true;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        console.log("No se encontró el documento del usuario.");
        return;
      }

      const userData = userDoc.data();
      console.log("Datos del usuario desde Firestore:", userData);
      nombreSpan.textContent = userData.firstName || 'Sin nombre';
      apellidosSpan.textContent = userData.lastName || 'Sin apellidos';
      emailSpan.textContent = user.email || 'Sin email';

      const accounts = userDoc.data().plaid?.accounts || [];

      if (accounts.length === 0) {
        linkedAccountsMessage.style.display = 'block';
        linkedAccountsMessage.textContent = 'No hay cuentas vinculadas actualmente.';
      } else {
        linkedAccountsMessage.style.display = 'none'; // Ocultar el mensaje si hay cuentas
      }

      // Cargar detalles de las cuentas
      for (const [index, account] of accounts.entries()) {
        try {
          const res = await fetch(`${apiUrl}/api/plaid/get_account_details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: account.accessToken })
          });

          if (!res.ok) throw new Error("Error en la respuesta de la API");

          const details = await res.json();
          const accountDetails = details.accounts[0] || {};
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

          // Mostrar cuentas guardadas en caso de error
          const guardadas = userDoc.data().plaid?.accountsGuardadas || [];
          accountsListContainer.innerHTML = '';

          if (guardadas.length > 0) {
            const offlineMsg = document.createElement('p');
            offlineMsg.style.fontStyle = 'italic';
            offlineMsg.style.color = '#777';
            offlineMsg.textContent = 'Mostrando datos guardados debido a un problema de conexión.';
            accountsListContainer.appendChild(offlineMsg);

            guardadas.forEach((acc, idx) => {
              const li = document.createElement('li');
              li.classList.add('linked-account');
              li.innerHTML = `
                <strong>Cuenta ${idx + 1}</strong><br>
                Banco: ${acc.institutionName}<br>
                Nombre de la cuenta: ${acc.accountName}<br>
              `;
              accountsListContainer.appendChild(li);
            });
          } else {
            linkedAccountsMessage.style.display = 'block';
            linkedAccountsMessage.textContent = 'No hay cuentas bancarias disponibles.';
          }
        }
      }

    } catch (err) {
      console.error("Error general al cargar las cuentas:", err);
    }
  });

  // Manejador de eventos para el botón de vinculación de cuentas
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
        const res = await fetch(`${apiUrl}/api/plaid/exchange_public_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId: auth.currentUser.uid })
        });

        if (res.ok) {
          alert('Cuenta bancaria vinculada con éxito.');
          location.reload(); // Recargar la página para actualizar la lista de cuentas
        } else {
          const errorData = await res.json();
          alert(`Error al vincular cuenta: ${errorData.message || 'Desconocido'}`);
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
