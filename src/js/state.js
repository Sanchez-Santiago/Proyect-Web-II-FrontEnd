const STORAGE_KEY = 'motormarket_session';

const state = {
  session: null,
  currentView: 'home',
  listeners: [],
  pendingAction: null,
  loginModalOptions: { showRegister: false },

  init() {
    this.session = this.readSession();
  },

  readSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveSession(sessionData) {
    this.session = sessionData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    this.notify();
  },

  clearSession() {
    this.session = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  },

  getSession() {
    return this.session;
  },

  isLoggedIn() {
    return this.session !== null && this.session.email;
  },

  hasAdminAccess() {
    if (!this.session) return false;
    if (this.session.isAdmin === true || this.session.role === 'admin') return true;
    if (Array.isArray(this.session.roles)) {
      return this.session.roles.includes('admin');
    }
    return false;
  },

  getRole() {
    return this.session ? this.session.role : null;
  },

  requireAuth(actionCallback) {
    if (this.isLoggedIn()) {
      actionCallback();
    } else {
      this.pendingAction = actionCallback;
      this.openLoginModal();
    }
  },

  executePendingAction() {
    if (this.pendingAction && this.isLoggedIn()) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  openLoginModal(options = {}) {
    this.loginModalOptions = options;
    this.notify();
  },

  closeLoginModal() {
    this.loginModalOptions = { showRegister: false };
    this.pendingAction = null;
  },

  getLoginModalOptions() {
    return this.loginModalOptions;
  },

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  },

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
    this.listeners.forEach(fn => fn(this.currentView, this.session));
  }
};

export default state;
