import { navigateTo } from '../../js/router.js';
import { useAuth } from '../../hooks/useAuth.js';

export default {
  init() {
    const form = document.getElementById('registerForm');
    const nameInput = document.getElementById('registerName');
    const birthDateInput = document.getElementById('registerBirthDate');
    const emailInput = document.getElementById('registerEmail');
    const phoneInput = document.getElementById('registerPhone');
    const alternatePhoneInput = document.getElementById('registerAlternatePhone');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const provinceInput = document.getElementById('registerProvince');
    const cityInput = document.getElementById('registerCity');
    const addressInput = document.getElementById('registerAddress');
    const message = document.getElementById('registerMessage');
    const submitButton = form?.querySelector('button[type="submit"]');
    const auth = useAuth();

    if (!form || !message) return;

    function setMessage(text, type) {
      message.textContent = text;
      message.classList.remove('error', 'success');
      if (type) message.classList.add(type);
    }

    function validateForm() {
      const name = nameInput?.value.trim() || '';
      const birthDate = birthDateInput?.value || '';
      const email = emailInput?.value.trim() || '';
      const phone = phoneInput?.value.trim() || '';
      const password = passwordInput?.value || '';
      const confirmPassword = confirmPasswordInput?.value || '';
      const province = provinceInput?.value.trim() || '';
      const city = cityInput?.value.trim() || '';
      const address = addressInput?.value.trim() || '';

      if (!name) {
        setMessage('Ingresa tu nombre completo.', 'error');
        nameInput?.focus();
        return false;
      }

      if (!birthDate) {
        setMessage('Ingresa tu fecha de nacimiento.', 'error');
        birthDateInput?.focus();
        return false;
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMessage('Ingresa un email valido.', 'error');
        emailInput?.focus();
        return false;
      }

      if (!phone) {
        setMessage('Ingresa tu telefono principal.', 'error');
        phoneInput?.focus();
        return false;
      }

      if (!password || password.length < 8) {
        setMessage('La contrasena debe tener al menos 8 caracteres.', 'error');
        passwordInput?.focus();
        return false;
      }

      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        setMessage('La contrasena debe tener mayuscula, minuscula y numero.', 'error');
        passwordInput?.focus();
        return false;
      }

      if (password !== confirmPassword) {
        setMessage('Las contrasenas no coinciden.', 'error');
        confirmPasswordInput?.focus();
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

      if (!address) {
        setMessage('Ingresa tu direccion.', 'error');
        addressInput?.focus();
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
      return error?.message || 'No se pudo crear la cuenta. Revisa los datos e intenta nuevamente.';
    }

    form.addEventListener('submit', async function(event) {
      event.preventDefault();

      if (!validateForm()) return;

      const fullName = nameInput.value.trim();
      const birthDate = birthDateInput.value;
      const email = emailInput.value.trim();
      const phone = phoneInput.value.trim();
      const alternatePhone = alternatePhoneInput.value.trim();
      const password = passwordInput.value;
      const province = provinceInput.value.trim();
      const city = cityInput.value.trim();
      const address = addressInput.value.trim();

      setMessage('Creando cuenta...', 'success');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Creando cuenta...';
      }

      try {
        await auth.register({
          name: fullName,
          birthDate,
          phone,
          alternatePhone: alternatePhone || undefined,
          email,
          password,
          role: 'BUYER',
          province,
          city,
          address
        });

        setMessage('Cuenta creada. Redirigiendo...', 'success');
        navigateTo('auth/role');
      } catch (error) {
        setMessage(getErrorMessage(error), 'error');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Crear cuenta';
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
