import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { useApi } from '../../../hooks/useApi.js';
import { useFavorites } from '../../../hooks/useFavorites.js';
import { formatMileage, formatPrice } from '../../../utils/formatters.js';

function normalizePublication(pub) {
  const vehicle = pub.vehicle || {};
  const analytics = vehicle.analytics || {};

  return {
    id: pub.id,
    title: pub.title || [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' '),
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || '',
    image: vehicle.images?.[0]?.imageUrl || 'https://picsum.photos/seed/car/800/600',
    price: formatPrice(pub.price, pub.currency),
    mileage: formatMileage(vehicle.mileage),
    location: [pub.province, pub.city].filter(Boolean).join(', ') || 'Sin ubicacion',
    score: analytics.overallScore || 80,
    engineCondition: analytics.engineCondition || 0,
    fuel: vehicle.fuelType || '',
    transmission: vehicle.transmission || '',
  };
}

export default {
  async init() {
    this.setupNavigation();
    await this.loadBuyerData();
  },

  setupNavigation() {
    if (!state.hasAdminAccess()) {
      const adminLink = document.querySelector('.menu-buyer-workspace-switch a[data-navigate="admin/menu"]');
      if (adminLink) adminLink.style.display = 'none';
    }
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

      const publicationsApi = useApi('/publications');
      const publicationsRes = await publicationsApi.get('/filters', { status: 'ACTIVE', limit: 200 });
      const publications = (publicationsRes?.publications || []).map(normalizePublication);

      this.renderDashboard(favorites, searches, publications);
    } catch (err) {
      console.error('[BUYER DASHBOARD] Error loading data:', err);
    }
  },

  renderDashboard(favorites, searches, publications) {
    const featured = publications[0];
    const heroSection = document.querySelector('.menu-buyer-hero');
    if (heroSection) {
      if (featured) {
        heroSection.innerHTML = `
          <article class="menu-buyer-hero-card">
            <div class="menu-buyer-hero-copy">
              <span class="menu-buyer-chip">Auto destacado</span>
              <h2>${featured.title}</h2>
              <p>Una de las oportunidades activas del mercado. Revisá precio, kilometraje, ubicación y score antes de contactar.</p>
              <div class="menu-buyer-hero-actions">
                <button type="button" class="menu-buyer-primary-btn" data-navigate="vehicles/detail/${featured.id}">Ver detalle</button>
                <button type="button" class="menu-buyer-ghost-btn" data-action="contact" data-publication-id="${featured.id}">Contactar</button>
              </div>
            </div>
            
            <div class="menu-buyer-hero-visual">
              <img src="${featured.image}" alt="${featured.title}" />
              <div class="menu-buyer-score">
                <strong>${featured.score}%</strong>
                <span>Match IA</span>
              </div>
            </div>
          </article>
          
          <aside class="menu-buyer-ai-panel">
            <span class="menu-buyer-chip">Copiloto IA</span>
            <h3>Mercado disponible</h3>
            <blockquote>
              "Hay ${publications.length} vehículos activos para comparar. Empezá por los que tienen mejor score, kilometraje y ubicación."
            </blockquote>
            <div class="menu-buyer-ai-metrics">
              <div>
                <span>Disponibles</span>
                <strong>${publications.length}</strong>
              </div>
              <div>
                <span>Busquedas</span>
                <strong>${searches.length}</strong>
              </div>
            </div>
          </aside>
        `;
      } else {
        heroSection.innerHTML = `
          <article class="menu-buyer-hero-card">
            <div class="menu-buyer-hero-copy">
              <span class="menu-buyer-chip">Mercado</span>
              <h2>No hay vehiculos activos por ahora.</h2>
              <p>Cuando haya publicaciones disponibles, van a aparecer en este dashboard igual que en el home.</p>
              <div class="menu-buyer-hero-actions">
                <button type="button" class="menu-buyer-primary-btn" data-navigate="home">Volver al home</button>
              </div>
            </div>
          </article>
        `;
      }
    }

    const grid = document.querySelector('.menu-buyer-car-grid');
    if (grid) {
      grid.innerHTML = publications.length ? publications.map(car => {
        return `
          <article class="menu-buyer-car-card">
            <img src="${car.image}" alt="${car.title}" />
            <div class="menu-buyer-car-body">
              <div class="menu-buyer-car-head">
                <div>
                  <h3>${car.title}</h3>
                  <p>${car.price}</p>
                </div>
                <span class="menu-buyer-car-score">${car.score}%</span>
              </div>
              <div class="menu-buyer-car-meta">
                <span><i class="bi bi-calendar"></i> ${car.year || '-'}</span>
                <span><i class="bi bi-speedometer2"></i> ${car.mileage}</span>
                <span><i class="bi bi-geo-alt"></i> ${car.location}</span>
              </div>
              <div class="menu-buyer-car-actions">
                <button type="button" class="menu-buyer-ghost-btn" data-navigate="vehicles/detail/${car.id}">Ver detalle</button>
                <button type="button" class="menu-buyer-primary-btn" data-action="contact" data-publication-id="${car.id}">Contactar</button>
              </div>
            </div>
          </article>
        `;
      }).join('') : `
        <div class="no-results" style="grid-column:1/-1;padding:2rem;text-align:center;">
          No hay vehiculos disponibles para mostrar.
        </div>
      `;

      grid.insertAdjacentHTML('beforeend', `
        <article class="menu-buyer-chat-card">
          <div class="menu-buyer-chat-head">
            <span class="menu-buyer-chip">Asistente IA</span>
            <strong>Consulta rápida</strong>
          </div>
          <div class="menu-buyer-chat-bubble is-ai">
            Hola ${state.getSession()?.name || 'comprador'}. Hay ${publications.length} vehículos disponibles y ${favorites.length} favoritos guardados.
          </div>
          <div class="menu-buyer-chat-bubble is-user">
            ¿Cuál es el mejor auto para mí?
          </div>
          <div class="menu-buyer-chat-input">
            <input type="text" value="Analiza mis favoritos" readonly />
            <button type="button"><i class="bi bi-arrow-up-right"></i></button>
          </div>
        </article>
      `);

      grid.querySelectorAll('[data-navigate]').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navigateTo(link.getAttribute('data-navigate'));
        });
      });

      grid.querySelectorAll('[data-action="contact"]').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const publicationId = button.dataset.publicationId;
          if (!publicationId) return;
          state.setPersistent('createForPubId', publicationId);
          navigateTo('messages/buyer/chat');
        });
      });
    }

    heroSection?.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });

    heroSection?.querySelectorAll('[data-action="contact"]').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const publicationId = button.dataset.publicationId;
        if (!publicationId) return;
        state.setPersistent('createForPubId', publicationId);
        navigateTo('messages/buyer/chat');
      });
    });

    const sidebarCount = document.querySelector('.menu-buyer-sidebar-note strong');
    const sidebarText = document.querySelector('.menu-buyer-sidebar-note p');
    if (sidebarCount) sidebarCount.textContent = `${publications.length} disponibles`;
    if (sidebarText) sidebarText.textContent = 'Vehiculos activos cargados igual que en el home.';
  }
};
