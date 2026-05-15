import { navigateTo } from '../../../core/router.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { useApi } from '../../../hooks/useApi.js';
import state from '../../../core/state.js';

export default {
  async init() {
    this.setupNavigation();
    await this.loadProfile();
    this.setupProfileForm();
    this.setupPasswordForm();
    this.setupLogout();
  },

  async loadProfile() {
    const nameInput = document.getElementById('buyerName');
    const emailInput = document.getElementById('buyerEmail');

    const session = state.getSession();
    if (session) {
      if (nameInput) nameInput.value = session.name || '';
      if (emailInput) emailInput.value = session.email || '';
    }

    try {
      const auth = useAuth();
      const user = await auth.me();
      if (user) {
        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
      }
    } catch (err) {
      console.warn('No se pudo cargar perfil desde API:', err.message);
    }
  },

  setupProfileForm() {
    const form = document.getElementById('buyerProfileForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const message = document.getElementById('buyerProfileMessage');
      if (message) {
        message.textContent = 'Perfil guardado exitosamente!';
        message.classList.remove('error');
        message.classList.add('success');
      }
      setTimeout(() => navigateTo('user/buyer/menu'), 1000);
    });
  },

  setupLogout() {
    const btn = document.getElementById('buyerLogoutBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Cerrando sesión...';
      try {
        const auth = useAuth();
        await auth.logout();
      } catch (e) {
        state.clearSession();
      }
      navigateTo('home');
    });
  },

  setupPasswordForm() {
    const form = document.getElementById('buyerChangePasswordForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const current = document.getElementById('buyerCurrentPassword');
      const newPw = document.getElementById('buyerNewPassword');
      const msg = document.getElementById('buyerPasswordMessage');

      if (!current || !newPw || !msg) return;

      const newVal = newPw.value.trim();
      if (newVal.length < 8 || !/[A-Z]/.test(newVal) || !/[0-9]/.test(newVal)) {
        msg.textContent = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.';
        msg.classList.add('error');
        return;
      }

      msg.textContent = 'Cambiando contraseña...';
      msg.className = 'form-message';

      try {
        console.log('[PROFILE] Changing password...');
        const api = useApi('/auth');
        const response = await api.post('/change-password', {
          currentPassword: current.value,
          newPassword: newVal
        });
        console.log('[PROFILE] Password changed successfully:', response);
        msg.textContent = 'Contraseña cambiada exitosamente!';
        msg.classList.remove('error');
        msg.classList.add('success');
        current.value = '';
        newPw.value = '';
      } catch (err) {
        console.error('[PROFILE] Password change error:', err);
        msg.textContent = err.message || 'Error al cambiar la contraseña.';
        msg.classList.remove('success');
        msg.classList.add('error');
      }
    });
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  }
};
