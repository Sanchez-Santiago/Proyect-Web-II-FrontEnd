import { navigateTo } from '../../js/router.js';
import { formatAdminCurrency, loadAdminSummary } from './admin-utils.js';

export default {
  async init() {
    this.setupNavigation();
    await this.renderDashboard();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async renderDashboard() {
    const score = document.querySelector('.menu-admin-score strong');
    const heroTitle = document.querySelector('.menu-admin-hero-copy h2');
    const heroText = document.querySelector('.menu-admin-hero-copy p');
    const note = document.querySelector('.menu-admin-sidebar-note strong');
    const grid = document.querySelector('.menu-admin-car-grid');

    try {
      const summary = await loadAdminSummary();
      const totals = summary.totals || {};
      const alerts = summary.alerts || [];

      if (score) score.textContent = alerts.length;
      if (note) note.textContent = `${alerts.length} alertas activas`;
      if (heroTitle) heroTitle.textContent = `${totals.activePublications || 0} publicaciones activas`;
      if (heroText) {
        heroText.textContent = `${totals.pendingPublications || 0} pendientes de moderacion, ${totals.pendingReports || 0} reportes pendientes y precio promedio ${formatAdminCurrency(totals.averagePublicationPrice || 0)}.`;
      }

      if (grid) {
        const top = summary.topPublications || [];
        grid.innerHTML = top.slice(0, 2).map(item => `
          <article class="menu-admin-car-card" data-publication-id="${item.id}">
            <img src="${item.vehicle?.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80'}" alt="${item.title}" />
            <div class="menu-admin-car-body">
              <div class="menu-admin-car-head"><div><h3>${item.title}</h3><p>${item.status}</p></div><span class="menu-admin-car-score">${item.views}</span></div>
              <div class="menu-admin-car-meta"><span><i class="bi bi-graph-up-arrow"></i> ${formatAdminCurrency(item.price, item.currency)}</span><span><i class="bi bi-exclamation-diamond-fill"></i> ${item.reports} reportes</span></div>
              <div class="menu-admin-car-actions"><button type="button" class="menu-admin-ghost-btn" data-detail="${item.id}">Auditar</button><button type="button" class="menu-admin-primary-btn" data-navigate="admin/publications">Moderar</button></div>
            </div>
          </article>
        `).join('') || '<article class="menu-admin-car-card">No hay publicaciones para auditar.</article>';

        grid.querySelectorAll('[data-detail]').forEach(btn => btn.addEventListener('click', () => navigateTo(`vehicles/detail/${btn.dataset.detail}`)));
        this.setupNavigation();
      }
    } catch (err) {
      if (grid) grid.innerHTML = `<article class="menu-admin-car-card">No se pudo cargar dashboard: ${err.message}</article>`;
    }
  }
};
