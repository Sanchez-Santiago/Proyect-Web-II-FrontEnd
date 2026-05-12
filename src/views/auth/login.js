import { navigateTo } from '../../js/router.js';
import { useAuth } from '../../hooks/useAuth.js';

export default {
  init() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const message = document.getElementById('loginMessage');
    const submitButton = form?.querySelector('button[type="submit"]');
    const auth = useAuth();

    if (!form || !emailInput || !message) return;

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

    function getErrorMessage(error) {
      const details = error?.data?.message || error?.data?.errors;
      if (Array.isArray(details)) {
        return details.join(' ');
      }
      if (typeof details === 'string') {
        return details;
      }
      return error?.message || 'No se pudo iniciar sesion. Revisa los datos e intenta nuevamente.';
    }

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!validateForm()) return;

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      setMessage('Iniciando sesion...', 'success');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Ingresando...';
      }

      try {
        const result = await auth.login(email, password);
        const role = String(result?.user?.role || result?.role || 'BUYER').toLowerCase();
        setMessage('Sesion iniciada. Redirigiendo...', 'success');
        navigateTo(role === 'admin' ? 'admin/menu' : role === 'seller' ? 'user/seller/menu' : 'user/buyer/menu');
      } catch (error) {
        setMessage(getErrorMessage(error), 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Ingresar';
        }
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
