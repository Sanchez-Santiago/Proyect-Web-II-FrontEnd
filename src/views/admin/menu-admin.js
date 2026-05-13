import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';

export default {
  async init() {
    this.setupNavigation();
    await this.fetchStats();
  },

  async fetchStats() {
    try {
      const api = useApi();
      const [pubs, users] = await Promise.all([
        api.get('/publications').catch(() => ({ publications: [] })),
        api.get('/users').catch(() => ({ users: [] }))
      ]);

      const alertCount = document.getElementById('adminAlertCount');
      if (alertCount) alertCount.textContent = '12'; // Simulado o real si existe endpoint

      const matchScore = document.getElementById('adminMatchScore');
      if (matchScore) matchScore.textContent = '94%';
      
      console.log('[ADMIN] Stats loaded:', pubs.publications?.length, users.users?.length);
    } catch (err) {
      console.warn('[ADMIN] Error loading stats:', err.message);
    }
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
