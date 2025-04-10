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

  // Definir la URL de la API según el entorno
  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3071'
    : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

  console.log('[DEBUG] apiUrl es:', apiUrl);

  // ===========================
  // Función: fetchAndInitializePlaidLink
  // ===========================
  async function fetchAndInitializePlaidLink() {
    console.log('[DEBUG] => fetchAndInitializePlaidLink() invocada');
    try {
      if (!auth.currentUser) {
        console.error('[ERROR] No hay un usuario autenticado en auth.currentUser');
        return false;
      }
      console.log('[DEBUG] Usuario actual (uid):', auth.currentUser.uid);

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
      console.log('[DEBUG] Recibido (data) de /create_link_token:', data);

      if (!data.link_token) {
        console.error('[ERROR] No se encontró link_token en la respuesta');
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

  // ===========================
  // Observador de estado de autenticación
  // ===========================
  onAuthStateChanged(auth, async (user) => {
    console.log('[DEBUG] onAuthStateChanged => user:', user, ' accountsLoaded:', accountsLoaded);
    if (!user || accountsLoaded) {
      console.log('[DEBUG] No user o cuentas ya cargadas, saliendo...');
      return;
    }
    accountsLoaded = true;
    console.log('[DEBUG] onAuthStateChanged => proceed to load accounts');

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
      console.log(`[DEBUG] Cuentas encontradas: ${accounts.length}`);
      if (accounts.length === 0) {
        linkedAccountsMessage.style.display = 'block';
        linkedAccountsMessage.textContent = 'No hay cuentas vinculadas actualmente.';
        return;
      } else {
        linkedAccountsMessage.style.display = 'none';
      }

      // Iterar sobre las cuentas para generar cada slide
      for (const [index, account] of accounts.entries()) {
        try {
          console.log(`[DEBUG] get_account_details para cuenta #${index + 1}`);
          const res = await fetch(`${apiUrl}/api/plaid/get_account_details`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken: account.accessToken })
          });

          if (!res.ok) {
            throw new Error('[ERROR] Respuesta de la API no OK');
          }

          const details = await res.json();
          const accountDetails = details.accounts?.[0] || {};
          const institutionDetails = details.institution || {};

          // Crear la slide para la cuenta
          const accountDiv = document.createElement('div');
          accountDiv.classList.add('linked-account');
          accountDiv.innerHTML = `
            <p><strong>Cuenta ${index + 1}</strong></p>
            <p>Banco: ${institutionDetails.name || 'Desconocido'}</p>
            <p>Nombre de la cuenta: ${accountDetails.name || 'No especificado'}</p>
          `;

          // Inserción en el slider
          accountsListContainer.appendChild(accountDiv);
          console.log('[DEBUG] Cuenta añadida al slider:', accountDiv);

        } catch (err) {
          console.error(`[ERROR] Al procesar la cuenta #${index + 1}:`, err);
        }
      } // Fin for

      // Antes de llamar initSlider() mostramos un log:
      console.log('[DEBUG] Todas las cuentas inyectadas, llamando initSlider()...');
      initSlider();

    } catch (err) {
      console.error('[ERROR] Error general al cargar cuentas:', err);
    }
  });

  // ===========================
  // Evento para el botón "link-bank-button"
  // ===========================
  if (connectBankButton) {
    connectBankButton.addEventListener('click', async () => {
      console.log('[DEBUG] Botón link-bank-button clickeado...');
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

// ===========================
let plaidLinkHandler = null;

// ===========================
/* Función para inicializar Plaid Link */
function initializePlaidLink(linkToken) {
  console.log('[DEBUG] initializePlaidLink() => linkToken:', linkToken);
  plaidLinkHandler = Plaid.create({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      console.log('[DEBUG] Plaid onSuccess => public_token:', public_token);
      console.log('[DEBUG] Plaid onSuccess => metadata:', metadata);
      try {
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://localhost:3071'
          : 'https://us-central1-fintrack-1bced.cloudfunctions.net';

        console.log('[DEBUG] POST a /exchange_public_token =>', `${apiUrl}/api/plaid/exchange_public_token`);
        const res = await fetch(`${apiUrl}/api/plaid/exchange_public_token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token, userId: auth.currentUser.uid })
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
      console.log('[DEBUG] onExit =>', err, metadata);
    },
    onEvent: (eventName, metadata) => {
      console.log('[DEBUG] onEvent =>', eventName, metadata);
    }
  });
  console.log('[DEBUG] plaidLinkHandler inicializado:', plaidLinkHandler);
}

/*****************************************************
 * Carrusel con Flechas y Puntitos
 *****************************************************/
function initSlider() {
  console.log('[DEBUG] initSlider() => iniciando');

  const slider = document.querySelector('.accounts-slider');
  if (!slider) {
    console.warn('[WARN] No se encontró el contenedor .accounts-slider');
    return;
  }

  const slides = slider.querySelectorAll('.linked-account');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  console.log(`[DEBUG] initSlider => slides encontrados: ${slides.length}`);
  console.log('[DEBUG] initSlider => prevBtn:', !!prevBtn, ' nextBtn:', !!nextBtn, ' dotsContainer:', !!dotsContainer);

  if (slides.length === 0) {
    console.log('[DEBUG] No hay slides en .linked-account, saliendo...');
    return;
  }

  let currentIndex = 0;

  // Crear puntitos para la paginación
  function createDots() {
    console.log('[DEBUG] createDots => generando', slides.length, 'puntitos');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        console.log(`[DEBUG] Dot #${i} clickeado`);
        goToSlide(i);
      });
      dotsContainer.appendChild(dot);
    }
  }

  // Actualizar el "active" en los puntitos
  function updateDots(index) {
    console.log(`[DEBUG] updateDots => nuevo index: ${index}`);
    const dots = dotsContainer.querySelectorAll('.slider-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  // Función para ir a una slide en particular
  function goToSlide(index) {
    console.log('[DEBUG] goToSlide => index solicitado:', index);
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;
    const translateXValue = `${100 * index}`;
    console.log('[DEBUG] goToSlide => translateXValue:', translateXValue);
    slider.style.transform = `translateX(-${translateXValue}%)`;
    updateDots(index);
  }

  // Asignar los listeners a las flechas
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('[DEBUG] prevBtn => clickeado');
      goToSlide(currentIndex - 1);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('[DEBUG] nextBtn => clickeado');
      goToSlide(currentIndex + 1);
    });
  }

  // Inicializamos el carrusel
  createDots();
  goToSlide(0);
  console.log('[DEBUG] initSlider => completado');
}
