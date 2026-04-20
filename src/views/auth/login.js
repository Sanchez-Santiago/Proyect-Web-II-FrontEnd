import { useAuth } from '../../hooks/useAuth.js';
import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';

const isInspector = typeof window.getInspectorData === 'function';

export default {
  init() {
    if (isInspector) {
      navigateTo('home');
      return;
    }

    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const message = document.getElementById('loginMessage');

    if (!form || !emailInput || !message) return;

    const auth = useAuth();

    function setMessage(text, type) {
      message.textContent = text;
      message.classList.remove('error', 'success');
      if (type) message.classList.add(type);
    }

    function validateForm() {
      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value || '';

      if (!email) {
        setMessage('Ingresa tu correo.', 'error');
        emailInput?.focus();
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('El email no es valido.', 'error');
        emailInput?.focus();
        return false;
      }

      if (!password) {
        setMessage('Ingresa tu contrasena.', 'error');
        passwordInput?.focus();
        return false;
      }

      return true;
    }

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!validateForm()) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      setMessage('Iniciando sesion...', 'success');

      try {
        const response = await auth.login(email, password);

        if (response?.token) {
          state.saveSession(response);
          setMessage('Sesion iniciada. Redirigiendo...', 'success');
          navigateTo('auth/role');
        } else {
          setMessage(response?.message || 'Email o contrasena incorrectos.', 'error');
        }
      } catch (err) {
        setMessage(err.message || 'Error de conexion. Verifica tu conexion.', 'error');
      }
    });

    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  }
};