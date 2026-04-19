import { useAuth } from '../../hooks/useAuth.js';
import { navigateTo } from '../router.js';
import state from '../state.js';

const isInspector = typeof window.getInspectorData === 'function';

export default {
  init() {
    if (isInspector) {
      navigateTo('home');
      return;
    }

    const form = document.getElementById('registerForm');
    const nameInput = document.getElementById('registerName');
    const emailInput = document.getElementById('registerEmail');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const roleSelect = document.getElementById('registerRole');
    const provinceInput = document.getElementById('registerProvince');
    const cityInput = document.getElementById('registerCity');
    const message = document.getElementById('registerMessage');

    if (!form || !message) return;

    const auth = useAuth();

    function setMessage(text, type) {
      message.textContent = text;
      message.classList.remove('error', 'success');
      if (type) message.classList.add(type);
    }

    function validateForm() {
      const name = nameInput?.value.trim() || '';
      const email = emailInput?.value.trim() || '';
      const password = passwordInput?.value || '';
      const confirmPassword = confirmPasswordInput?.value || '';
      const role = roleSelect?.value || '';
      const province = provinceInput?.value.trim() || '';
      const city = cityInput?.value.trim() || '';

      if (!name) {
        setMessage('Ingresa tu nombre completo.', 'error');
        nameInput?.focus();
        return false;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('Ingresa un email valido.', 'error');
        emailInput?.focus();
        return false;
      }

      if (!password || password.length < 6) {
        setMessage('La contrasena debe tener al menos 6 caracteres.', 'error');
        passwordInput?.focus();
        return false;
      }

      if (password !== confirmPassword) {
        setMessage('Las contrasenas no coinciden.', 'error');
        confirmPasswordInput?.focus();
        return false;
      }

      if (!role) {
        setMessage('Selecciona si quieres comprar o vender.', 'error');
        roleSelect?.focus();
        return false;
      }

      if (!province) {
        setMessage('Ingresa tu provincia.', 'error');
        provinceInput?.focus();
        return false;
      }

      if (!city) {
        setMessage('Ingresa tu ciudad.', 'error');
        cityInput?.focus();
        return false;
      }

      return true;
    }

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!validateForm()) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const role = roleSelect.value;
      const province = provinceInput.value.trim();
      const city = cityInput.value.trim();

      setMessage('Creando cuenta...', 'success');

      try {
        const response = await auth.register({
          name,
          email,
          password,
          role,
          province,
          city
        });

        if (response?.token) {
          state.saveSession(response);
          setMessage('Cuenta creada. Redirigiendo...', 'success');
          navigateTo(ROLE_SELECTION_URL);
        } else {
          setMessage(response?.message || 'Error al crear cuenta.', 'error');
        }
      } catch (err) {
        setMessage(err.message || 'Error de conexion.', 'error');
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