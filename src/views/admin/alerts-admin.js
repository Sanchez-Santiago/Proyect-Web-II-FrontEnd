import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';

export default {
  init() {
    if (!state.isLoggedIn()) { navigateTo('home'); return; }
    this.setupNavigation();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  }
};
