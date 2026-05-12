import { bindAdminNavigation, formatAdminCurrency, loadAdminSummary, loadAdminTimeline } from './admin-utils.js';

export default {
  async init() {
    bindAdminNavigation();
    const grid = document.querySelector('.menu-admin-grid-3');
    if (!grid) return;
    grid.innerHTML = '<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">Cargando analytics...</article>';

    try {
      const [summary, timeline] = await Promise.all([loadAdminSummary(), loadAdminTimeline(30)]);
      const totals = summary.totals || {};
      const lastPoint = timeline.points?.[timeline.points.length - 1] || {};

      grid.innerHTML = `
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${totals.users || 0}</h3><p style="color:var(--muted);font-size:.85rem;">Usuarios totales</p></article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${totals.activePublications || 0}</h3><p style="color:var(--muted);font-size:.85rem;">Publicaciones activas</p></article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${totals.views || 0}</h3><p style="color:var(--muted);font-size:.85rem;">Vistas registradas</p></article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${formatAdminCurrency(totals.averagePublicationPrice || 0)}</h3><p style="color:var(--muted);font-size:.85rem;">Precio promedio</p></article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${Math.round(totals.averageAiScore || 0)}%</h3><p style="color:var(--muted);font-size:.85rem;">Score IA promedio</p></article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;"><h3 style="color:var(--white);margin:0;">${lastPoint.messages || 0}</h3><p style="color:var(--muted);font-size:.85rem;">Mensajes de hoy</p></article>
      `;
    } catch (err) {
      grid.innerHTML = `<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">No se pudieron cargar analytics: ${err.message}</article>`;
    }
  }
};
