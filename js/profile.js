import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] profile.js loaded');

  const nombreSpan = document.getElementById('profile-nombre');
  const apellidosSpan = document.getElementById('profile-apellidos');
  const emailSpan = document.getElementById('profile-email');
  const connectBankButton = document.getElementById('link-bank-button');
  const linkedAccountsMessage = document.getElementById('linked-accounts-message');
  const accountsListContainer = document.getElementById('linked-accounts-list');

  console.log('[DEBUG] connectBankButton:', connectBankButton);

  let accountsLoaded = false;

  // Definir la URL de la API según el entorno
  const apiUrl = window.location.hostname === 'localhost' 
    ? 'http://localhost:3071' 
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

  console.log('[DEBUG] apiUrl es:', apiUrl);

  // Función para obtener el link token e inicializar Plaid Link
  async function fetchAndInitializePlaidLink() {
    console.log('[DEBUG] => fetchAndInitializePlaidLink() invocada');
    try {
      // Verifica si hay usuario autenticado
      if (!auth.currentUser) {
        console.error('[ERROR] No hay un usuario autenticado en auth.currentUser');
        return false;
      }
      console.log('[DEBUG] Usuario actual (uid):', auth.currentUser.uid);

      // Llamada al endpoint create_link_token
      const createLinkTokenUrl = `${apiUrl}/api/plaid/create_link_token`;
      console.log('[DEBUG] Llamando a:', createLinkTokenUrl);
      const res = await fetch(createLinkTokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.currentUser.uid })
      });

      console.log('[DEBUG] Status de create_link_token:', res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => {});
        console.error('[ERROR] create_link_token errorData:', errorData);
        return false;
      }

      const data = await res.json();
      console.log('[DEBUG] Recibido (data):', data);

      if (!data.link_token) {
        console.error('[ERROR] No se encontró link_token en la respuesta de /create_link_token');
        return false;
      }

      // Inicializa Plaid Link
      initializePlaidLink(data.link_token);
      console.log('[DEBUG] Plaid Link se ha inicializado satisfactoriamente.');
      return true;

    } catch (error) {
      console.error('[ERROR] Excepción en fetchAndInitializePlaidLink():', error);
      return false;
    }
  }

  // Observador de estado de autenticación
  onAuthStateChanged(auth, async (user) => {
    if (!user || accountsLoaded) {
      console.log('[DEBUG] onAuthStateChanged => usuario null o cuentas ya cargadas:', user, accountsLoaded);
      return;
    }
    accountsLoaded = true;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        console.error('[ERROR] No se encontró documento de usuario en Firestore');
        return;
      }
      const userData = userDoc.data();
      console.log('[DEBUG] Datos del usuario desde Firestore:', userData);

      // Asignar nombre, apellidos, email
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

      // Iterar sobre las cuentas
      for (const [index, account] of accounts.entries()) {
        try {
          console.log(`[DEBUG] Llamando get_account_details para la cuenta #${index+1}`);
          const res = await fetch(`${apiUrl}/api/plaid/get_account_details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: account.accessToken }),
          });
          if (!res.ok) throw new Error('[ERROR] Respuesta de la API no OK');

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
          console.error(`[ERROR] Al procesar la cuenta #${index+1}:`, err);
        }
      }

    } catch (err) {
      console.error('[ERROR] Error general al cargar cuentas:', err);
    }
  });

  // Evento para el botón "link-bank-button"
  if (connectBankButton) {
    connectBankButton.addEventListener('click', async () => {
      console.log('[DEBUG] Botón link-bank-button clickeado. Revisando si plaidLinkHandler es null...');
      if (!plaidLinkHandler) {
        console.log('[DEBUG] plaidLinkHandler es null, intentando inicializar...');
        const initialized = await fetchAndInitializePlaidLink();
        console.log('[DEBUG] fetchAndInitializePlaidLink =>', initialized);
        if (!initialized) {
          alert('No se pudo iniciar Plaid Link. Revisa la consola para más detalles.');
          return;
        }
      }
      console.log('[DEBUG] Abriendo Plaid Link...');
      plaidLinkHandler.open();
    });
  } else {
    console.warn('[WARN] No se encontró el botón con ID "link-bank-button" en la página.');
  }
});

// Variable global de Plaid Link
let plaidLinkHandler = null;

function initializePlaidLink(linkToken) {
  console.log('[DEBUG] initializePlaidLink() => linkToken recibido:', linkToken);
  plaidLinkHandler = Plaid.create({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log('[DEBUG] Plaid onSuccess - Public token:', public_token);
      console.log('[DEBUG] Plaid onSuccess - Metadata:', metadata);
      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3071'
          : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

        console.log('[DEBUG] Haciendo POST a exchange_public_token en:', `${apiUrl}/api/plaid/exchange_public_token`);
        const res = await fetch(`${apiUrl}/api/plaid/exchange_public_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId: auth.currentUser.uid }),
        });

        console.log('[DEBUG] Respuesta exchange_public_token => status:', res.status);
        if (!res.ok) {
          const errorData = await res.json();
          alert(`Error al vincular cuenta: ${errorData.message || 'Desconocido'}`);
        } else {
          alert('Cuenta bancaria vinculada con éxito.');
          location.reload();
        }
      } catch (err) {
        console.error('[ERROR] onSuccess => exchange_public_token:', err);
        alert('Error al vincular la cuenta bancaria.');
      }
    },
    onExit: (err, metadata) => {
      console.log('[DEBUG] onExit de Plaid Link =>', err, metadata);
    },
    onEvent: (eventName, metadata) => {
      console.log('[DEBUG] onEvent de Plaid Link =>', eventName, metadata);
    }
  });
  console.log('[DEBUG] plaidLinkHandler inicializado:', plaidLinkHandler);
}
