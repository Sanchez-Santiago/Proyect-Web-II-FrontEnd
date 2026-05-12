import { navigateTo } from '../../../js/router.js';
import { useFavorites } from '../../../hooks/useFavorites.js';
import { useApi } from '../../../hooks/useApi.js';
import { normalizePublication, unwrapApiData } from '../../../js/publicationMapper.js';

function renderFavorite(favorite) {
  const publication = favorite.publication || favorite;
  const car = normalizePublication(publication);

  return `
    <article class="favorites-buyer-card" data-favorite-card data-publication-id="${car.id}">
      <div class="fav-card-image">
        <img src="${car.image}" alt="${car.title}" />
        <span class="fav-score-badge">${car.score}% Match</span>
        <button type="button" class="fav-remove-btn" title="Quitar de favoritos" data-remove-favorite="${car.id}">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="favorites-buyer-card-body">
        <div class="fav-card-header">
          <div>
            <h3>${car.title}</h3>
            <p class="fav-price">${car.priceFormatted}</p>
          </div>
        </div>
        <div class="fav-card-specs">
          <span><i class="bi bi-speedometer2"></i> ${car.mileageFormatted}</span>
          <span><i class="bi bi-geo-alt"></i> ${car.location}</span>
        </div>
        <div class="fav-card-actions">
          <button type="button" class="favorites-buyer-ghost-btn" data-detail="${car.id}">Ver detalle</button>
          <button type="button" class="favorites-buyer-primary-btn" data-contact="${car.id}">Contactar</button>
        </div>
      </div>
    </article>
  `;
}

export default {
  async init() {
    this.api = useFavorites();
    this.chatApi = useApi('/chats');
    this.grid = document.getElementById('favoritesGrid');
    this.setupNavigation();
    await this.loadFavorites();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.getAttribute('data-navigate'));
      });
    });
  },

  async loadFavorites() {
    if (!this.grid) return;
    this.grid.innerHTML = '<div class="no-results">Cargando favoritos...</div>';

    try {
      const response = await this.api.getAll();
      const favorites = unwrapApiData(response, 'favorites') || [];

      if (!favorites.length) {
        this.grid.innerHTML = '<div class="no-results">Todavia no guardaste publicaciones favoritas.</div>';
        return;
      }

      this.grid.innerHTML = favorites.map(renderFavorite).join('');
      this.bindCardActions();
    } catch (err) {
      this.grid.innerHTML = `<div class="no-results">No se pudieron cargar favoritos: ${err.message}</div>`;
    }
  },

  bindCardActions() {
    this.grid.querySelectorAll('[data-remove-favorite]').forEach(button => {
      button.addEventListener('click', async () => {
        const publicationId = button.dataset.removeFavorite;
        button.disabled = true;
        try {
          await this.api.remove(publicationId);
          button.closest('[data-favorite-card]')?.remove();
          if (!this.grid.querySelector('[data-favorite-card]')) {
            this.grid.innerHTML = '<div class="no-results">Todavia no guardaste publicaciones favoritas.</div>';
          }
        } catch (err) {
          button.disabled = false;
          alert(err.message || 'No se pudo quitar el favorito');
        }
      });
    });

    this.grid.querySelectorAll('[data-detail]').forEach(button => {
      button.addEventListener('click', () => navigateTo(`vehicles/detail/${button.dataset.detail}`));
    });

    this.grid.querySelectorAll('[data-contact]').forEach(button => {
      button.addEventListener('click', async () => {
        const publicationId = button.dataset.contact;
        button.disabled = true;
        try {
          const response = await this.chatApi.post('', { publicationId });
          const chat = unwrapApiData(response, 'chat') || unwrapApiData(response);
          navigateTo(`messages/buyer/chat/${chat.id}`);
        } catch (err) {
          button.disabled = false;
          alert(err.message || 'No se pudo iniciar el chat');
        }
      });
    });
  }
};
