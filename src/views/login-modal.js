import state from '../state.js';

let modalElement = null;
let isInitialized = false;

function resolveUserRole(email) {
  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === 'admin@driveroom.com' || normalizedEmail.includes('admin')) {
    return 'admin';
  }
  return 'user';
}

function setMessage(text, type) {
  const message = document.getElementById('loginModalMessage');
  if (!message) return;
  message.textContent = text;
  message.classList.remove('error', 'success');
  if (type) {
    message.classList.add(type);
  }
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
  if (emailInput) {
    emailInput.focus();
  }
}

function handleSubmit(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('loginModalEmail');
  const email = emailInput?.value.trim() || '';
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
  
  const role = resolveUserRole(email);
  const sessionUser = {
    email,
    role,
    isAdmin: role === 'admin',
  };
  
  state.saveSession(sessionUser);
  setMessage('¡Bienvenido! Redirigiendo...', 'success');
  
  setTimeout(() => {
    closeModal();
    state.executePendingAction();
    
    const options = state.getLoginModalOptions();
    if (options.showRegister) {
      window.location.hash = 'role';
    }
  }, 600);
}

function setupEventListeners() {
  if (isInitialized) return;
  
  const closeBtn = document.getElementById('closeLoginModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  const overlay = document.querySelector('.login-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeModal);
  }
  
  const form = document.getElementById('loginModalForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  const footerLink = document.getElementById('loginModalFooterLink');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      const options = state.getLoginModalOptions();
      openModal({ showRegister: !options.showRegister });
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalElement && !modalElement.hidden) {
      closeModal();
    }
  });
  
  isInitialized = true;
}

export default {
  init() {
    const app = document.getElementById('app');
    if (!app) return;
    
    const modalHtml = document.getElementById('loginModal');
    if (!modalHtml) {
      fetch('./views/login-modal.html')
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
    state.subscribe((view, session) => {
      const modal = document.getElementById('loginModal');
      if (!modal) return;
      
      const options = state.getLoginModalOptions();
      if (options.showRegister || state.pendingAction) {
        openModal(options);
      }
    });
  },
  
  open(options) {
    if (!modalElement) {
      setTimeout(() => this.open(options), 100);
      return;
    }
    openModal(options);
  },
  
  close() {
    closeModal();
  }
};
