import { useVehicleFeatures } from '../../hooks/useVehicleFeatures.js';
import { bindAdminNavigation, loadAdminSummary } from './admin-utils.js';

export default {
  async init() {
    bindAdminNavigation();
    const grid = document.querySelector('.menu-admin-grid-2');
    if (!grid) return;
    grid.innerHTML = '<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">Cargando motor...</article>';

    try {
      const summary = await loadAdminSummary();
      const totals = summary.totals || {};
      const features = summary.features || [];
      grid.innerHTML = `
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;"><h3 style="color:var(--white);margin:0;">Motor de analisis</h3><span class="menu-admin-badge is-active">Online</span></div>
          <p style="color:var(--muted);font-size:.85rem;margin-top:.5rem;">${totals.analytics || 0} analisis IA, score promedio ${Math.round(totals.averageAiScore || 0)}%, ${totals.verifiedDocuments || 0} documentos verificados.</p>
        </article>
        <article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:1rem;"><h3 style="color:var(--white);margin:0;">Features del catalogo</h3><span class="menu-admin-badge is-active">${features.length}</span></div>
          <form id="featureForm" style="display:flex;gap:.5rem;margin-top:1rem;"><input id="featureName" class="form-control" placeholder="Nueva caracteristica" /><button class="menu-admin-primary-btn" type="submit">Crear</button></form>
          <div id="featureList" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem;">${features.map(f => `<span class="menu-admin-badge is-active">${f.featureName}</span>`).join('') || '<span style="color:var(--muted)">Sin features cargadas</span>'}</div>
        </article>
      `;

      document.getElementById('featureForm')?.addEventListener('submit', async e => {
        e.preventDefault();
        const name = document.getElementById('featureName')?.value.trim();
        if (!name) return;
        try {
          await useVehicleFeatures().create({ featureName: name });
          await this.init();
        } catch (err) {
          alert(err.message || 'No se pudo crear la caracteristica');
        }
      });
    } catch (err) {
      grid.innerHTML = `<article class="menu-admin-panel" style="padding:1.5rem;margin-top:0;">No se pudo cargar motor: ${err.message}</article>`;
    }
  }
};
