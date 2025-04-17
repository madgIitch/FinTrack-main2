import { auth } from './firebase.js';
import { doc, getDoc, getFirestore, collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { app } from './firebase.js';

console.log('home.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('home.js DOMContentLoaded');
    const userNameSpan = document.getElementById('user-name');
    const logoHome = document.querySelector('.logo-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');

    const updateWelcomeMessage = (firstName, lastName) => {
        userNameSpan.textContent = `${firstName} ${lastName}`.trim();
    };

    const cachedFirstName = localStorage.getItem('firstName');
    const cachedLastName = localStorage.getItem('lastName');

    if (cachedFirstName && cachedLastName) {
        console.log('Nombre encontrado en localStorage (carga inicial):', cachedFirstName, cachedLastName);
        updateWelcomeMessage(cachedFirstName, cachedLastName);
    }

    // Función para obtener las cuentas bancarias vinculadas
    const getLinkedAccountsFn = async (userId) => {
        const db = getFirestore(app);
        const accountsRef = collection(db, 'users', userId, 'linkedAccounts');
        try {
            const snapshot = await getDocs(accountsRef);
            const linkedAccounts = snapshot.docs.map(doc => doc.data());
            console.log('Cuentas bancarias vinculadas:', linkedAccounts);
            // Aquí puedes renderizar las cuentas en el DOM si lo deseas
        } catch (error) {
            console.error('Error al obtener las cuentas vinculadas:', error);
        }
    };

    onAuthStateChanged(auth, async (user) => {
        console.log('home.js onAuthStateChanged triggered');
        if (user) {
            const userId = user.uid;
            const db = getFirestore(app);
            const userDocRef = doc(db, 'users', userId);

            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const firstName = userData.firstName || '';
                    const lastName = userData.lastName || '';
                    updateWelcomeMessage(firstName, lastName);
                    localStorage.setItem('firstName', firstName);
                    localStorage.setItem('lastName', lastName);

                    // Llamamos a la función para obtener cuentas bancarias vinculadas
                    await getLinkedAccountsFn(userId);
                } else {
                    userNameSpan.textContent = 'Usuario - Datos no encontrados';
                    localStorage.removeItem('firstName');
                    localStorage.removeItem('lastName');
                }
            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
                userNameSpan.textContent = 'Usuario - Error al cargar';
            }
        } else {
            userNameSpan.textContent = 'No autenticado';
            localStorage.removeItem('firstName');
            localStorage.removeItem('lastName');
        }
    });

    if (logoHome && sidebar && closeSidebarBtn && logoutLink) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });

        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            signOut(auth)
                .then(() => {
                    localStorage.removeItem('firstName');
                    localStorage.removeItem('lastName');
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                    alert("Error al cerrar sesión. Inténtalo de nuevo.");
                });
        });
    }
});
