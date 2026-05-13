const loginModalOptions = { showRegister: false };

function getLoginModalOptions() {
  return loginModalOptions;
}

function openLoginModal(options = {}) {
  loginModalOptions.showRegister = options.showRegister || false;
  notifyUIListeners();
}

function closeLoginModal() {
  loginModalOptions.showRegister = false;
  notifyUIListeners();
}

let uiListeners = [];

function onUIChange(callback) {
  uiListeners.push(callback);
  return () => {
    uiListeners = uiListeners.filter(l => l !== callback);
  };
}

function notifyUIListeners() {
  uiListeners.forEach(fn => fn());
}

function showMessage(message, type = 'info', duration = 3000) {
  const existing = document.getElementById('globalMessage');
  if (existing) existing.remove();

  const colors = {
    success: '#22c55e',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#eab308'
  };

  const el = document.createElement('div');
  el.id = 'globalMessage';
  el.style.cssText = `
    position:fixed;top:1rem;right:1rem;z-index:99999;
    padding:0.75rem 1.25rem;border-radius:8px;
    background:${colors[type] || colors.info};color:white;
    font-size:0.9rem;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);
    transition:opacity 0.3s;max-width:400px;
  `;
  el.textContent = message;
  document.body.appendChild(el);

  const timer = setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 300);
  }, duration);

  return () => clearTimeout(timer);
}

export { showMessage, openLoginModal, closeLoginModal, getLoginModalOptions, onUIChange };
