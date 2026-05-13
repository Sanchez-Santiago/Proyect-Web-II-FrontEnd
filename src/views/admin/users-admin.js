import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';
import state from '../../core/state.js';

export default {
  async init() {
    this.setupNavigation();

    try {
      const reportsApi = useApi('/reports');
      const res = await reportsApi.get('', { status: 'PENDING' });
      const reports = res.reports || [];
      const countBadge = document.querySelector('.menu-admin-sidebar-note strong');
      if (countBadge) countBadge.textContent = `${reports.length} reportes`;

      const tbody = document.querySelector('.menu-admin-table tbody');
      if (tbody && reports.length > 0) {
        tbody.innerHTML = reports.slice(0, 10).map(r => `
          <tr>
            <td><strong>${r.publication?.title || 'Publicación'}</strong><br><small>${r.reason || '—'}</small></td>
            <td>${r.user?.email || 'Anónimo'}</td>
            <td><span class="menu-admin-badge ${r.status === 'PENDING' ? 'is-pending' : 'is-active'}">${r.status}</span></td>
            <td><span style="color:var(--muted);font-size:0.85rem;">${r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</span></td>
          </tr>
        `).join('');
      }
    } catch (err) {
      console.warn('Error cargando usuarios/reportes:', err.message);
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
