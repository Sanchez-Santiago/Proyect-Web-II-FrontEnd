import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { useApi } from '../../../hooks/useApi.js';
import { useFavorites } from '../../../hooks/useFavorites.js';
import { formatPrice } from '../../../utils/formatters.js';

export default {
  async init() {
    this.setupNavigation();
    await this.loadBuyerData();
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

  async loadBuyerData() {
    const session = state.getSession();
    if (!session?.id) return;

    try {
      const fav = useFavorites();
      const favRes = await fav.getAll();
      const favorites = favRes?.favorites || [];

      const searchApi = useApi('/saved-searches');
      const searchRes = await searchApi.get();
      const searches = searchRes?.searches || [];

      this.renderDashboard(favorites, searches);
    } catch (err) {
      console.error('[BUYER DASHBOARD] Error loading data:', err);
    }
  },

  renderDashboard(favorites, searches) {
    // 1. Render Hero (Featured Favorite)
    const heroSection = document.querySelector('.menu-buyer-hero');
    if (heroSection && favorites.length > 0) {
      const bestFav = favorites[0]; // Take the first one for now
      const p = bestFav.publication;
      const v = p?.vehicle;
      
      if (p && v) {
        heroSection.innerHTML = `
          <article class="menu-buyer-hero-card">
            <div class="menu-buyer-hero-copy">
              <span class="menu-buyer-chip">Favorito destacado</span>
              <h2>${v.brand} ${v.model} ${v.year}</h2>
              <p>Este vehículo tiene un excelente score de Match IA basado en tus preferencias de búsqueda.</p>
              <div class="menu-buyer-hero-actions">
                <button type="button" class="menu-buyer-primary-btn" data-navigate="vehicles/detail/${p.id}">Ver detalle</button>
              </div>
            </div>
            
            <div class="menu-buyer-hero-visual">
              <img src="${v.images?.[0]?.imageUrl || 'https://picsum.photos/seed/car/800/600'}" alt="${v.brand} ${v.model}" />
              <div class="menu-buyer-score">
                <strong>${v.analytics?.overallScore || 0}%</strong>
                <span>Match IA</span>
              </div>
            </div>
          </article>
          
          <aside class="menu-buyer-ai-panel">
            <span class="menu-buyer-chip">Copiloto IA</span>
            <h3>Recomendación IA</h3>
            <blockquote>
              "Basado en tus ${searches.length} búsquedas guardadas, este ${v.brand} es una de las mejores opciones actuales."
            </blockquote>
            <div class="menu-buyer-ai-metrics">
              <div>
                <span>Favoritos</span>
                <strong>${favorites.length}</strong>
              </div>
              <div>
                <span>Búsquedas</span>
                <strong>${searches.length}</strong>
              </div>
            </div>
          </aside>
        `;
      }
    }

    // 2. Render Car Grid (Other Favorites)
    const grid = document.querySelector('.menu-buyer-car-grid');
    if (grid) {
      const otherFavs = favorites.slice(1, 3); // Take 2 more
      grid.innerHTML = otherFavs.map(fav => {
        const p = fav.publication;
        const v = p?.vehicle;
        if (!p || !v) return '';
        return `
          <article class="menu-buyer-car-card">
            <img src="${v.images?.[0]?.imageUrl || 'https://picsum.photos/seed/car/800/600'}" alt="${v.brand} ${v.model}" />
            <div class="menu-buyer-car-body">
              <div class="menu-buyer-car-head">
                <div>
                  <h3>${v.brand} ${v.model} ${v.year}</h3>
                  <p>${formatPrice(p.price, p.currency)}</p>
                </div>
                <span class="menu-buyer-car-score">${v.analytics?.overallScore || 0}%</span>
              </div>
              <div class="menu-buyer-car-meta">
                <span><i class="bi bi-speedometer2"></i> ${v.mileage || 0} km</span>
                <span><i class="bi bi-geo-alt"></i> ${p.province || ''}</span>
              </div>
              <div class="menu-buyer-car-actions">
                <button type="button" class="menu-buyer-ghost-btn" data-navigate="vehicles/detail/${p.id}">Ver</button>
                <button type="button" class="menu-buyer-primary-btn" data-navigate="messages/buyer/chat/${p.id}">Contactar</button>
              </div>
            </div>
          </article>
        `;
      }).join('') + `
        <article class="menu-buyer-chat-card">
          <div class="menu-buyer-chat-head">
            <span class="menu-buyer-chip">Asistente IA</span>
            <strong>Consulta rápida</strong>
          </div>
          <div class="menu-buyer-chat-bubble is-ai">
            Hola ${state.getSession()?.name || 'comprador'}. Tienes ${favorites.length} vehículos en tus favoritos y ${searches.length} búsquedas activas.
          </div>
          <div class="menu-buyer-chat-bubble is-user">
            ¿Cuál es el mejor auto para mí?
          </div>
          <div class="menu-buyer-chat-input">
            <input type="text" value="Analiza mis favoritos" readonly />
            <button type="button"><i class="bi bi-arrow-up-right"></i></button>
          </div>
        </article>
      `;

      // Re-bind navigation
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
