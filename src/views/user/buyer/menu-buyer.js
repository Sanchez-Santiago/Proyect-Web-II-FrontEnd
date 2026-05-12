import { navigateTo } from '../../../js/router.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { useFavorites } from '../../../hooks/useFavorites.js';
import { useApi } from '../../../hooks/useApi.js';
import { getPublicationArray, normalizePublication, unwrapApiData } from '../../../js/publicationMapper.js';

export default {
  async init() {
    this.setupNavigation();
    await this.renderMarket();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async renderMarket() {
    const list = document.getElementById('buyerMarketList');
    const count = document.getElementById('buyerMarketCount');
    if (!list) return;
    list.innerHTML = '<article class="menu-buyer-market-card">Cargando publicaciones...</article>';

    try {
      const response = await usePublications().getAll({ status: 'ACTIVE' });
      const cars = getPublicationArray(response).map(normalizePublication);
      if (count) count.textContent = `${cars.length} autos`;

      if (!cars.length) {
        list.innerHTML = '<article class="menu-buyer-market-card">No hay publicaciones activas.</article>';
        return;
      }

      list.innerHTML = cars.map(car => `
        <article class="menu-buyer-market-card" data-publication-id="${car.id}">
          <a class="menu-buyer-market-image" href="#vehicles/detail/${car.id}" data-car-action="detail" data-car-id="${car.id}">
            <img src="${car.image}" alt="${car.title}" loading="lazy" />
          </a>
          <div class="menu-buyer-market-info">
            <div class="menu-buyer-market-title-row">
              <div>
                <h2>${car.title}</h2>
                <p>${car.location} · ${car.seller.type}</p>
              </div>
              <button type="button" class="menu-buyer-fav-btn" data-car-action="favorite" data-car-id="${car.id}">
                <i class="bi bi-heart"></i>
              </button>
            </div>
            <strong class="menu-buyer-market-price">${car.priceFormatted}</strong>
            <div class="menu-buyer-market-specs">
              <span><i class="bi bi-speedometer2"></i>${car.mileageFormatted}</span>
              <span><i class="bi bi-gear"></i>${car.transmission}</span>
              <span><i class="bi bi-fuel-pump"></i>${car.fuel}</span>
              <span><i class="bi bi-patch-check"></i>${car.condition}</span>
            </div>
            <p class="menu-buyer-market-description">${car.description || 'Publicacion disponible para consulta.'}</p>
            <div class="menu-buyer-market-footer">
              <span class="menu-buyer-market-score">${car.score}% match IA</span>
              <div class="menu-buyer-market-actions">
                <button type="button" class="menu-buyer-ghost-btn" data-car-action="contact" data-car-id="${car.id}">Consultar</button>
                <button type="button" class="menu-buyer-primary-btn" data-car-action="detail" data-car-id="${car.id}">Ver detalle</button>
              </div>
            </div>
          </div>
        </article>
      `).join('');

      this.setupMarketActions();
    } catch (err) {
      list.innerHTML = `<article class="menu-buyer-market-card">No se pudieron cargar publicaciones: ${err.message}</article>`;
    }
  },

  setupMarketActions() {
    document.querySelectorAll('[data-car-action]').forEach(action => {
      action.addEventListener('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        const publicationId = action.getAttribute('data-car-id');
        const type = action.getAttribute('data-car-action');

        if (type === 'favorite') {
          try {
            await useFavorites().add(publicationId);
            action.classList.add('is-active');
            action.querySelector('i')?.classList.replace('bi-heart', 'bi-heart-fill');
          } catch (err) {
            alert(err.message || 'No se pudo guardar favorito');
          }
          return;
        }

        if (type === 'contact') {
          try {
            const response = await useApi('/chats').post('', { publicationId });
            const chat = unwrapApiData(response, 'chat') || unwrapApiData(response);
            navigateTo(`messages/buyer/chat/${chat.id}`);
          } catch (err) {
            alert(err.message || 'No se pudo iniciar el chat');
          }
          return;
        }

        navigateTo(`vehicles/detail/${publicationId}`);
      });
    });
  }
};
