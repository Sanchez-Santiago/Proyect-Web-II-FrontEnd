import { readSession, saveSession as sessionSave, clearSession as sessionClear, getSession, isLoggedIn, hasAdminAccess, getRole } from './session.js';
import { showMessage, openLoginModal as uiOpenLoginModal, closeLoginModal as uiCloseLoginModal, getLoginModalOptions, onUIChange } from './ui.js';

let sessionCache = readSession();

const state = {
  currentView: 'home',
  params: {},
  listeners: [],
  pendingAction: null,

  init() {
    sessionCache = readSession();
  },

  saveSession(sessionData) {
    sessionCache = sessionData;
    sessionSave(sessionData);
    this.notify();
  },

  clearSession() {
    sessionCache = null;
    sessionClear();
    this.notify();
  },

  getSession() {
    return sessionCache || getSession();
  },

  isLoggedIn() {
    return isLoggedIn();
  },

  hasAdminAccess() {
    return hasAdminAccess();
  },

  getRole() {
    return getRole();
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
      return true;
    }
    return false;
  },

  openLoginModal(options) {
    uiOpenLoginModal(options);
    this.notify();
  },

  closeLoginModal() {
    uiCloseLoginModal();
    this.pendingAction = null;
  },

  getLoginModalOptions() {
    return getLoginModalOptions();
  },

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  },

  setParams(params) {
    this.params = { ...params };
  },

  getParam(key) {
    return this.params?.[key];
  },

  clearParams() {
    this.params = {};
  },

  _persistent: {},

  setPersistent(key, value) {
    this._persistent[key] = value;
  },

  getPersistent(key) {
    return this._persistent[key];
  },

  clearPersistent() {
    this._persistent = {};
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(fn => fn(this.currentView, sessionCache));
  },

  showMessage(message, type, duration) {
    return showMessage(message, type, duration);
  }
};

export default state;
