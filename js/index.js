import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    console.log('index.js loaded');

    const loginForm = document.getElementById('login-form');
    const resetForm = document.getElementById('reset-form');
    const showResetFormButton = document.getElementById('show-reset-form');
    const backToLoginButton = document.getElementById('back-to-login');
    const registerLink = document.getElementById('register-link');

    // Mostrar formulario de recuperación de contraseña
    if (showResetFormButton) {
        showResetFormButton.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Mostrando formulario de recuperación de contraseña.");
            // Oculta el formulario de login, el enlace de recuperación y el botón de registro
            loginForm.style.display = 'none';
            showResetFormButton.style.display = 'none';
            if (registerLink) {
              registerLink.style.display = 'none';
            }
            // Muestra el formulario de recuperación
            resetForm.style.display = 'block';
            console.log("reset-form computed display:", getComputedStyle(resetForm).display);
        });
    }

    // Volver al formulario de login
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', (event) => {
            event.preventDefault();
            console.log("Volviendo al formulario de inicio de sesión.");
            // Oculta el formulario de recuperación
            resetForm.style.display = 'none';
            // Muestra el formulario de login, el registro y el enlace de recuperación
            loginForm.style.display = 'block';
            showResetFormButton.style.display = 'inline-block';
            if (registerLink) {
              registerLink.style.display = 'inline-block';
            }
            console.log("login-form computed display:", getComputedStyle(loginForm).display);
        });
    }

    // Lógica del formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await setPersistence(auth, browserLocalPersistence);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (user.emailVerified) {
                    console.log('Usuario logueado y correo verificado, redirigiendo.');
                    sessionStorage.setItem('hasRedirected', 'true');
                    window.location.href = '/pages/home.html';
                } else {
                    console.log('Usuario logueado pero correo no verificado.');
                    alert('Por favor, verifica tu dirección de correo electrónico antes de continuar.');
                }
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
                if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Contraseña incorrecta.';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Usuario no encontrado.';
                }
                alert(errorMessage);
            }
        });
    }

    // Lógica del formulario de recuperación de contraseña
    if (resetForm) {
        resetForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const resetEmail = document.getElementById('reset-email').value;
            console.log('Enviando instrucciones de recuperación a: ' + resetEmail);

            try {
                await sendPasswordResetEmail(auth, resetEmail);
                console.log('Instrucciones enviadas a ' + resetEmail);
                alert('Se han enviado instrucciones a tu correo electrónico.');
                // Volver al formulario de inicio de sesión
                resetForm.style.display = 'none';
                loginForm.style.display = 'block';
                showResetFormButton.style.display = 'inline-block';
                if (registerLink) {
                  registerLink.style.display = 'inline-block';
                }
            } catch (error) {
                console.error('Error al enviar correo de recuperación:', error);
                alert('Hubo un error al enviar las instrucciones. Intenta de nuevo.');
            }
        });
    }
});
