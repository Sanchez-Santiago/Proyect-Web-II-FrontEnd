import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { useApi } from '../../../hooks/useApi.js';
import { formatPrice } from '../../../utils/formatters.js';

export default {
  async init() {
    this.setupNavigation();
    await this.loadSellerData();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  },

  async loadSellerData() {
    const session = state.getSession();
    if (!session?.id) return;

    try {
      const api = useApi('/publications');
      const response = await api.get('/filters', { sellerId: session.id });
      const pubs = response?.publications || [];

      this.renderDashboard(pubs);
    } catch (err) {
      console.error('[DASHBOARD] Error loading seller data:', err);
    }
  },

  renderDashboard(pubs) {
    // 1. Render Hero (Featured Unit)
    const heroSection = document.querySelector('.menu-seller-hero');
    if (heroSection && pubs.length > 0) {
      const bestPub = pubs.sort((a, b) => (b.views || 0) - (a.views || 0))[0];
      const v = bestPub.vehicle;
      
      heroSection.innerHTML = `
        <article class="menu-seller-hero-card">
          <div class="menu-seller-hero-copy">
            <span class="menu-seller-chip">Unidad destacada</span>
            <h2>${v.brand} ${v.model} ${v.year}</h2>
            <p>Esta publicación tiene ${bestPub.views || 0} vistas. Optimizando el precio podrías cerrar la venta más rápido.</p>
            <div class="menu-seller-hero-actions">
              <button type="button" class="menu-seller-primary-btn" data-navigate="vehicles/detail/${bestPub.id}">Ver detalle</button>
            </div>
          </div>
          
          <div class="menu-seller-hero-visual">
            <img src="${v.images?.[0]?.imageUrl || 'https://picsum.photos/seed/car/800/600'}" alt="${v.brand} ${v.model}" />
            <div class="menu-seller-score">
              <strong>${v.analytics?.overallScore || 0}</strong>
              <span>Score IA</span>
            </div>
          </div>
        </article>
        
        <aside class="menu-seller-ai-panel">
          <span class="menu-seller-chip">Copiloto IA</span>
          <h3>Sugerencia estratégica</h3>
          <blockquote>
            "Tu ${v.brand} tiene mucho interés. Responde a las consultas pendientes para concretar visitas pronto."
          </blockquote>
          <div class="menu-seller-ai-metrics">
            <div>
              <span>Vistas</span>
              <strong>${bestPub.views || 0}</strong>
            </div>
            <div>
              <span>Consultas</span>
              <strong>${bestPub.queries || 0}</strong>
            </div>
          </div>
        </aside>
      `;
    }

    // 2. Render Car Grid
    const grid = document.querySelector('.menu-seller-car-grid');
    if (grid) {
      grid.innerHTML = pubs.map(pub => {
        const v = pub.vehicle;
        return `
          <article class="menu-seller-car-card">
            <img src="${v.images?.[0]?.imageUrl || 'https://picsum.photos/seed/car/800/600'}" alt="${v.brand} ${v.model}" />
            <div class="menu-seller-car-body">
              <div class="menu-seller-car-head">
                <div>
                  <h3>${v.brand} ${v.model} ${v.year}</h3>
                  <p>${formatPrice(pub.price, pub.currency)}</p>
                </div>
                <span class="menu-seller-car-score">${v.analytics?.overallScore || 0}%</span>
              </div>
              <div class="menu-seller-car-meta">
                <span><i class="bi bi-eye-fill"></i> ${pub.views || 0} vistas</span>
                <span><i class="bi bi-chat-left-dots-fill"></i> ${pub.queries || 0} consultas</span>
              </div>
              <div class="menu-seller-car-actions">
                <button type="button" class="menu-seller-ghost-btn" data-navigate="vehicles/detail/${pub.id}">Ver</button>
                <button type="button" class="menu-seller-primary-btn" data-navigate="vehicles/add?edit=${pub.id}">Editar</button>
              </div>
            </div>
          </article>
        `;
      }).join('') + `
        <article class="menu-seller-chat-card">
          <div class="menu-seller-chat-head">
            <span class="menu-seller-chip">Asistente IA</span>
            <strong>Cierre rápido</strong>
          </div>
          <div class="menu-seller-chat-bubble is-ai">
            Bienvenido a tu consola de vendedor. Aquí verás el rendimiento de tus publicaciones en tiempo real.
          </div>
          <div class="menu-seller-chat-input">
            <input type="text" value="¿Cómo puedo vender más rápido?" readonly />
            <button type="button"><i class="bi bi-arrow-up-right"></i></button>
          </div>
        </article>
      `;

      // Re-bind navigation for new buttons
      grid.querySelectorAll('[data-navigate]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigateTo(link.getAttribute('data-navigate'));
        });
      });
    }

    // Re-bind hero navigation
    heroSection?.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  }
};
