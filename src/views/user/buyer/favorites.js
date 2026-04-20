import { useFavorites } from '../../hooks/useFavorites.js';
import { getCars } from '../../data/cars.js';
import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';

const isInspector = typeof window.getInspectorData === 'function';

console.log('[FAVORITES] isInspector:', isInspector, 'state.isLoggedIn():', state.isLoggedIn());

export default {
  async init() {
    console.log('[FAVORITES] init called');
    const grid = document.getElementById('favoritesGrid');
    const empty = document.getElementById('favoritesEmpty');

    state.init();
    console.log('[FAVORITES] After state.init(), isLoggedIn():', state.isLoggedIn(), 'session:', state.getSession());

    if (!state.isLoggedIn()) {
      console.log('[FAVORITES] Not logged in, redirecting to login');
      navigateTo('auth/login');
      return;
    }

    let favs = [];

    if (isInspector) {
      console.log('[FAVORITES] Loading inspector favorites');
      const inspectorData = window.getInspectorData();
      const favoriteIds = inspectorData.favorites || [];
      const cars = getCars();
      favs = favoriteIds.map(id => ({ vehicleId: id }));
      console.log('[FAVORITES] Inspector favorites loaded:', favs);
    } else {
      const favorites = useFavorites();
      try {
        favs = await favorites.getAll();
      } catch (err) {
        console.warn('Mostrando favoritos demo:', err.message);
      }
    }
    
    if (!favs || favs.length === 0) {
      console.log('[FAVORITES] No favorites found');
      if (grid) grid.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    this.renderFavorites(favs);
  },

  renderFavorites(favorites) {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.hidden = false;

    const cars = getCars();

    favorites.forEach(fav => {
      const car = cars.find(c => c.id == fav.vehicleId);
      if (!car) return;

      const card = document.createElement('article');
      card.className = 'favorite-card';
      
      card.innerHTML = `
        <div class="favorite-image">
          <img src="${car.image}" alt="${car.brand} ${car.model}" />
          <button type="button" class="favorite-remove" data-vehicle-id="${car.id}" title="Quitar de favoritos">
            <i class="bi bi-heart-fill"></i>
          </button>
        </div>
        <div class="favorite-info">
          <h3>${car.brand} ${car.model}</h3>
          <p class="favorite-price">${car.priceFormatted}</p>
          <button type="button" class="favorite-detail-btn" data-navigate="vehicles/detail/${car.id}">Ver detalle</button>
        </div>
      `;

      grid.appendChild(card);
    });

    this.setupRemoveHandlers();
    this.setupDetailHandlers();
  },

  setupRemoveHandlers() {
    document.querySelectorAll('.favorite-remove').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const vehicleId = btn.dataset.vehicleId;
        
        if (confirm('¿Quitar de favoritos?')) {
          const favorites = useFavorites();
          try {
            await favorites.remove(vehicleId);
            btn.closest('.favorite-card').remove();
          } catch (err) {
            btn.closest('.favorite-card').remove();
          }
        }
      });
    });
  },

  setupDetailHandlers() {
    document.querySelectorAll('.favorite-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = btn.dataset.navigate;
        if (view) navigateTo(view);
      });
    });
  }
};