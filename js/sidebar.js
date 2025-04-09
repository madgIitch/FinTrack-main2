import { auth } from './firebase.js'; // Importa la instancia de auth de Firebase
import { signOut } from "firebase/auth";

console.log('sidebar.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('sidebar.js DOMContentLoaded');
    const logoHome = document.querySelector('.logo-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');

    console.log('sidebar.js elements:', { logoHome, sidebar, closeSidebarBtn, logoutLink });

    if (logoHome && sidebar && closeSidebarBtn && logoutLink) {
        console.log('sidebar.js All elements found.');
        logoHome.addEventListener('click', () => {
            console.log('sidebar.js logoHome clicked');
            sidebar.classList.toggle('open');
            console.log('sidebar.js sidebar.classList:', sidebar.classList);
        });

        closeSidebarBtn.addEventListener('click', () => {
            console.log('sidebar.js closeSidebarBtn clicked');
            sidebar.classList.remove('open');
            console.log('sidebar.js sidebar.classList:', sidebar.classList);
        });

        logoutLink.addEventListener('click', (event) => {
            console.log('sidebar.js logoutLink clicked');
            event.preventDefault(); // Evita la redirección por defecto del enlace
            signOut(auth)
                .then(() => {
                    console.log('sidebar.js Cierre de sesión exitoso.');
                    // Cierre de sesión exitoso, redirige a la página de inicio de sesión
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("sidebar.js Error al cerrar sesión:", error);
                    alert("sidebar.js Error al cerrar sesión. Inténtalo de nuevo.");
                });
        });

        // Función para marcar el enlace activo como seleccionado (opcional)
        function markActiveLink() {
            console.log('sidebar.js markActiveLink called');
            const currentPage = window.location.pathname;
            const profileLink = document.querySelector('#sidebar a[href="profile.html"]');

            console.log('sidebar.js markActiveLink elements:', { profileLink, logoutLink });

            if (profileLink && logoutLink) { // Añade esta comprobación
                console.log('sidebar.js profileLink and logoutLink found in markActiveLink');
                if (currentPage.includes("profile.html")) {
                    profileLink.classList.add('selected');
                    logoutLink.classList.remove('selected');
                    console.log('sidebar.js markActiveLink profile.html active');
                } else {
                    profileLink.classList.remove('selected');
                    logoutLink.classList.remove('selected');
                    console.log('sidebar.js markActiveLink profile.html not active');
                    // Puedes añadir lógica para marcar otros enlaces si tienes más secciones
                }
            } else {
                console.warn("sidebar.js No se encontraron los elementos profileLink o logoutLink en esta página.");
            }
        }

        markActiveLink(); // Llama a la función al cargar la página
    } else {
        console.log('sidebar.js One or more elements (logoHome, sidebar, closeSidebarBtn, logoutLink) are missing.');
    }
});