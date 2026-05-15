import state from '../../core/state.js';
import { useAuth } from '../../hooks/useAuth.js';

let modalElement = null;
let isInitialized = false;
let unsubscribeState = null;
let timeouts = [];
let keydownHandler = null;

function setMessage(text, type) {
  const message = document.getElementById('loginModalMessage');
  if (!message) return;
  message.textContent = text;
  message.classList.remove('error', 'success');
  if (type) message.classList.add(type);
}

function closeModal() {
  if (modalElement) {
    modalElement.hidden = true;
    const form = document.getElementById('loginModalForm');
    if (form) form.reset();
    setMessage('', '');
    state.closeLoginModal();
  }
}

function openModal(options = {}) {
  if (!modalElement) return;
  modalElement.hidden = false;

  const title = document.getElementById('loginModalTitle');
  const subtitle = document.getElementById('loginModalSubtitle');
  const footerText = document.getElementById('loginModalFooterText');
  const footerLink = document.getElementById('loginModalFooterLink');

  if (options.showRegister) {
    title.textContent = 'Crear cuenta';
    subtitle.textContent = 'Ingresa tu email para registrarte';
    footerText.textContent = '¿Ya tenés cuenta?';
    footerLink.textContent = 'Iniciar sesión';
  } else {
    title.textContent = 'Iniciar sesión';
    subtitle.textContent = 'Ingresa tu email para continuar';
    footerText.textContent = '¿No tenés cuenta?';
    footerLink.textContent = 'Crear cuenta';
  }

  const emailInput = document.getElementById('loginModalEmail');
  if (emailInput) emailInput.focus();
}

async function handleSubmit(event) {
  event.preventDefault();

  const emailInput = document.getElementById('loginModalEmail');
  const passwordInput = document.getElementById('loginModalPassword');
  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!email) {
    setMessage('Ingresa tu correo para continuar.', 'error');
    emailInput?.focus();
    return;
  }
  if (!emailIsValid) {
    setMessage('El formato del email no es válido.', 'error');
    emailInput?.focus();
    return;
  }
  if (!password) {
    setMessage('Ingresa tu contraseña.', 'error');
    passwordInput?.focus();
    return;
  }

  setMessage('Iniciando sesión...', 'success');

  try {
    const auth = useAuth();
    const session = await auth.login(email, password);

    if (session?.token) {
      state.saveSession(session);
      setMessage('¡Bienvenido! Redirigiendo...', 'success');

      const t = setTimeout(() => {
        closeModal();
        const hadAction = state.executePendingAction();
        if (!hadAction) window.location.hash = 'home';
      }, 600);
      timeouts.push(t);
    } else {
      setMessage(session?.message || 'Error al iniciar sesión.', 'error');
    }
  } catch (err) {
    setMessage(err.message || 'Error de conexión.', 'error');
  }
}

function setupEventListeners() {
  if (isInitialized) return;

  const closeBtn = document.getElementById('closeLoginModal');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  const overlay = document.querySelector('.login-modal-overlay');
  if (overlay) overlay.addEventListener('click', closeModal);

  const form = document.getElementById('loginModalForm');
  if (form) form.addEventListener('submit', handleSubmit);

  const footerLink = document.getElementById('loginModalFooterLink');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      const options = state.getLoginModalOptions();
      openModal({ showRegister: !options.showRegister });
    });
  }

  keydownHandler = (e) => {
    if (e.key === 'Escape' && modalElement && !modalElement.hidden) {
      closeModal();
    }
  };
  document.addEventListener('keydown', keydownHandler);

  isInitialized = true;
}

export default {
  init() {
    const app = document.getElementById('app');
    if (!app) return;

    const modalHtml = document.getElementById('loginModal');
    if (!modalHtml) {
      fetch('./src/views/login-modal.html')
        .then(res => res.text())
        .then(html => {
          app.insertAdjacentHTML('beforeend', html);
          modalElement = document.getElementById('loginModal');
          setupEventListeners();
          this.watchState();
        });
    } else {
      modalElement = modalHtml;
      setupEventListeners();
      this.watchState();
    }
  },

  watchState() {
    unsubscribeState = state.subscribe((view, session) => {
      const modal = document.getElementById('loginModal');
      if (!modal) return;
      const options = state.getLoginModalOptions();
      if (options.showRegister || state.pendingAction) {
        openModal(options);
      }
    });
  },

  destroy() {
    if (unsubscribeState) {
      unsubscribeState();
      unsubscribeState = null;
    }
    timeouts.forEach(t => clearTimeout(t));
    timeouts = [];
    if (keydownHandler) {
      document.removeEventListener('keydown', keydownHandler);
      keydownHandler = null;
    }
    isInitialized = false;
    modalElement = null;
  },

  open(options) {
    if (!modalElement) {
      const t = setTimeout(() => this.open(options), 100);
      timeouts.push(t);
      return;
    }
    openModal(options);
  },

  close() {
    closeModal();
  }
};
