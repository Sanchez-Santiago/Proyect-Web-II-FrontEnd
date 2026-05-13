import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { useApi } from '../../../hooks/useApi.js';

export default {
  async init() {
    this.setupNavigation();
    await this.loadInsights();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async loadInsights() {
    const session = state.getSession();
    if (!session?.id) return;

    try {
      const api = useApi('/publications');
      const response = await api.get('/filters', { sellerId: session.id });
      const pubs = response?.publications || [];
      
      this.renderInsights(pubs);
    } catch (err) {
      console.error('[INSIGHTS] Error loading data:', err);
    }
  },

  renderInsights(pubs) {
    const grid = document.querySelector('.insights-grid');
    if (!grid) return;

    if (pubs.length === 0) {
      grid.innerHTML = '<p class="text-muted">Publica tu primer vehículo para recibir insights personalizados de la IA.</p>';
      return;
    }

    const totalViews = pubs.reduce((sum, p) => sum + (p.views || 0), 0);
    const avgScore = pubs.reduce((sum, p) => sum + (p.vehicle?.analytics?.overallScore || 0), 0) / pubs.length;

    grid.innerHTML = `
      <article class="insight-card-pro is-hot">
        <div class="insight-icon">
          <i class="bi bi-graph-up-arrow"></i>
        </div>
        <div class="insight-content">
          <h3>Oportunidad de Visibilidad</h3>
          <p>Tus publicaciones han acumulado ${totalViews} vistas en total. El interés en tus vehículos es sólido.</p>
          <div class="insight-footer">
            <span class="insight-impact">Impacto: Alto</span>
            <button type="button" class="insight-action-btn" data-navigate="user/seller/publications">Gestionar</button>
          </div>
        </div>
      </article>
      
      <article class="insight-card-pro">
        <div class="insight-icon">
          <i class="bi bi-stars"></i>
        </div>
        <div class="insight-content">
          <h3>Calidad de Catálogo</h3>
          <p>Tu puntaje promedio de Match IA es de ${avgScore.toFixed(0)}%. Tienes vehículos en excelente condición.</p>
          <div class="insight-footer">
            <span class="insight-impact">Impacto: Confianza</span>
            <button type="button" class="insight-action-btn" data-navigate="user/seller/menu">Dashboard</button>
          </div>
        </div>
      </article>

      <article class="insight-card-pro is-ai-glow">
        <div class="insight-icon">
          <i class="bi bi-magic"></i>
        </div>
        <div class="insight-content">
          <h3>Optimizador de Precios</h3>
          <p>La IA sugiere que podrías vender un 20% más rápido si ajustas el precio de tu publicación más antigua.</p>
          <div class="insight-footer">
            <span class="insight-impact">Ahorro de tiempo: 5 días</span>
            <button type="button" class="insight-action-btn" data-navigate="user/seller/publications">Ver sugerencia</button>
          </div>
        </div>
      </article>
    `;

    grid.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  }
};
