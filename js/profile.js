import { auth, db } from '../js/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c[DEBUG] profile.js loaded', 'color: green; font-weight: bold;');

  const nombreSpan = document.getElementById('profile-nombre');
  const apellidosSpan = document.getElementById('profile-apellidos');
  const emailSpan = document.getElementById('profile-email');
  const connectBankButton = document.getElementById('link-bank-button');
  const linkedAccountsMessage = document.getElementById('linked-accounts-message');
  const accountsListContainer = document.getElementById('linked-accounts-list');

  let accountsLoaded = false;

  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3071'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

  console.log('[DEBUG] apiUrl es:', apiUrl);

  async function fetchAndInitializePlaidLink(updateToken = null) {
    if (!auth.currentUser) return false;

    const payload = { userId: auth.currentUser.uid };
    if (updateToken) payload.accessToken = updateToken;

    try {
      const res = await fetch(`${apiUrl}/plaid/create_link_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (!data.link_token) return false;

      initializePlaidLink(data.link_token);
      return true;
    } catch (error) {
      console.error('[ERROR] fetchAndInitializePlaidLink:', error);
      return false;
    }
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user || accountsLoaded) return;
    accountsLoaded = true;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
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
          const res = await fetch(`${apiUrl}/plaid/get_account_details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: account.accessToken })
          });

          const details = await res.json();

          if (details.status === 'login_required') {
            const accountDiv = document.createElement('div');
            accountDiv.classList.add('linked-account');
            accountDiv.innerHTML = `
              <p><strong>Cuenta ${index + 1}</strong></p>
              <p style="color: #c00;">Credenciales caducadas.</p>
              <button class="reauth-btn">Re-autenticar cuenta</button>
            `;
            accountDiv.querySelector('.reauth-btn').addEventListener('click', async () => {
              const ok = await fetchAndInitializePlaidLink(details.accessToken);
              if (ok) plaidLinkHandler.open();
              else alert('No se pudo iniciar Plaid Link.');
            });
            accountsListContainer.appendChild(accountDiv);
            continue;
          }

          const accountDetails = details.accounts?.[0] || {};
          const institutionDetails = details.institution || {};

          const accountDiv = document.createElement('div');
          accountDiv.classList.add('linked-account');
          accountDiv.innerHTML = `
            <p><strong>Cuenta ${index + 1}</strong></p>
            <p>Banco: ${institutionDetails.name || 'Desconocido'}</p>
            <p>Nombre de la cuenta: ${accountDetails.name || 'No especificado'}</p>
          `;

          accountsListContainer.appendChild(accountDiv);

        } catch (err) {
          console.error(`[ERROR] al procesar la cuenta #${index + 1}:`, err);
        }
      }

      initSlider();

    } catch (err) {
      console.error('[ERROR] Error general al cargar cuentas:', err);
    }
  });

  if (connectBankButton) {
    connectBankButton.addEventListener('click', async () => {
      if (!plaidLinkHandler) {
        const initialized = await fetchAndInitializePlaidLink();
        if (!initialized) {
          alert('No se pudo iniciar Plaid Link. Revisa la consola.');
          return;
        }
      }
      plaidLinkHandler.open();
    });
  }
});

let plaidLinkHandler = null;

function initializePlaidLink(linkToken) {
  plaidLinkHandler = Plaid.create({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3071'
          : 'https://us-central1-fintrack-1bced.cloudfunctions.net/api';

        const res = await fetch(`${apiUrl}/plaid/exchange_public_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId: auth.currentUser.uid })
        });

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
    onExit: (err, metadata) => {},
    onEvent: (eventName, metadata) => {}
  });
}

function initSlider() {
  const slider = document.querySelector('.accounts-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.linked-account');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  if (slides.length === 0) return;

  let currentIndex = 0;

  function createDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots(index) {
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function goToSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;
    slider.style.transform = `translateX(-${100 * index}%)`;
    updateDots(index);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  createDots();
  goToSlide(0);
}
