import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';
import state from '../../core/state.js';

export default {
  async init() {
    if (!state.isLoggedIn()) { navigateTo('home'); return; }
    this.setupNavigation();

    try {
      const reportsApi = useApi('/reports');
      const reportsRes = await reportsApi.get('', { status: 'PENDING' });
      const pendingReports = reportsRes.reports?.length || 0;

      document.querySelectorAll('.menu-admin-panel h3').forEach(el => {
        if (el.textContent.includes('142.5k')) {
          el.textContent = `${pendingReports} reportes`;
          const p = el.nextElementSibling;
          if (p) p.textContent = 'Reportes pendientes de revisión';
        } else if (el.textContent.includes('$84.2M')) {
          const publicationsApi = useApi('/publications');
          publicationsApi.get('', { status: 'ACTIVE' }).then(r => {
            const active = r.publications?.length || 0;
            el.textContent = `${active} activas`;
            const p = el.nextElementSibling;
            if (p) p.textContent = 'Publicaciones activas en plataforma';
          }).catch(() => {});
        }
      });
    } catch (err) {
      console.warn('Error cargando analíticas:', err.message);
    }
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
