import { useReports } from '../../hooks/useReports.js';
import { bindAdminNavigation, loadAdminSummary } from './admin-utils.js';

export default {
  async init() {
    bindAdminNavigation();
    const grid = document.querySelector('.menu-admin-grid-3');
    if (!grid) return;
    grid.innerHTML = '<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">Cargando alertas...</article>';

    try {
      const summary = await loadAdminSummary();
      const alerts = summary.alerts || [];

      if (!alerts.length) {
        grid.innerHTML = '<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">No hay alertas activas.</article>';
        return;
      }

      grid.innerHTML = alerts.map(alert => `
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">
          <span class="menu-admin-badge ${alert.severity === 'HIGH' ? 'is-rejected' : 'is-pending'}">${alert.severity}</span>
          <h3 style="color:var(--white);margin:.5rem 0;">${alert.title}</h3>
          <p style="color:var(--muted);font-size:.85rem;">${alert.message}</p>
          ${alert.reportId ? `<button class="menu-admin-primary-btn" data-resolve="${alert.reportId}">Resolver</button>` : ''}
        </article>
      `).join('');

      grid.querySelectorAll('[data-resolve]').forEach(button => {
        button.addEventListener('click', async () => {
          try {
            await useReports().updateStatus(button.dataset.resolve, 'RESOLVED');
            await this.init();
          } catch (err) {
            alert(err.message || 'No se pudo resolver el reporte');
          }
        });
      });
    } catch (err) {
      grid.innerHTML = `<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">No se pudieron cargar alertas: ${err.message}</article>`;
    }
  }
};
