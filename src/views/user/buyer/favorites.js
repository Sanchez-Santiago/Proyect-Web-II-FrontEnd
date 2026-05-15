import { useFavorites } from '../../../hooks/useFavorites.js';
import { useApi } from '../../../hooks/useApi.js';
import { formatPrice, formatMileage } from '../../../utils/formatters.js';

function normalizeFavorite(fav) {
  const pub = fav.publication;
  const v = pub?.vehicle;
  const firstImage = v?.images?.[0]?.imageUrl || '';
  return {
    id: fav.id,
    publicationId: pub?.id,
    vehicleId: v?.id,
    brand: v?.brand || '',
    model: v?.model || '',
    year: v?.year || '',
    price: pub?.price || 0,
    priceFormatted: formatPrice(pub?.price, pub?.currency),
    mileage: v?.mileage || 0,
    mileageFormatted: formatMileage(v?.mileage),
    location: [pub?.province, pub?.city].filter(Boolean).join(', '),
    image: firstImage,
    sellerName: pub?.seller?.fullName || 'Vendedor'
  };
}

function createCard(fav) {
  const card = document.createElement('article');
  card.className = 'favorites-buyer-card';
  card.dataset.favId = fav.id;
  card.dataset.publicationId = fav.publicationId;
  card.innerHTML = `
    <div class="fav-card-image" data-navigate="vehicles/detail/${fav.publicationId}">
      <img src="${fav.image}" alt="${fav.brand} ${fav.model}" loading="lazy" />
      <button type="button" class="fav-remove-btn" data-action="remove-fav" title="Quitar de favoritos">
        <i class="bi bi-x-lg"></i>
      </button>
    </div>
    <div class="favorites-buyer-card-body">
      <div class="fav-card-header">
        <div>
          <h3>${fav.brand} ${fav.model} ${fav.year}</h3>
          <p class="fav-price">${fav.priceFormatted}</p>
        </div>
      </div>
      <div class="fav-card-specs">
        <span><i class="bi bi-speedometer2"></i> ${fav.mileageFormatted}</span>
        <span><i class="bi bi-geo-alt"></i> ${fav.location}</span>
      </div>
      <div class="fav-card-actions">
        <button type="button" class="favorites-buyer-ghost-btn" data-navigate="vehicles/detail/${fav.publicationId}">Ver detalle</button>
        <button type="button" class="favorites-buyer-primary-btn">Contactar</button>
      </div>
    </div>
  `;
  return card;
}

function updateSidebar(count) {
  const countEl = document.getElementById('favoritesCount');
  const insightEl = document.getElementById('favoritesInsight');
  if (countEl) countEl.textContent = count + ' ' + (count === 1 ? 'oportunidad' : 'oportunidades');
  if (insightEl) {
    insightEl.textContent = count >= 3
      ? 'Tienes una lista util para comparar.'
      : 'Agrega mas autos para tener una mejor comparativa.';
  }
}

function showEmpty() {
  const grid = document.getElementById('favoritesGrid');
  if (grid) {
    grid.innerHTML = '<div class="no-results">No tienes autos favoritos aun. Explora el home para agregar.</div>';
  }
}

function showSkeleton(grid) {
  if (!grid) return;
  grid.innerHTML = Array(6).fill(0).map(() => `
    <article class="favorites-buyer-card skeleton-card">
      <div class="fav-card-image">
        <div class="skeleton" style="height:200px;border-radius:12px 12px 0 0;"></div>
      </div>
      <div class="favorites-buyer-card-body">
        <div class="skeleton" style="height:24px;width:60%;margin-bottom:0.75rem;"></div>
        <div class="skeleton" style="height:18px;width:40%;margin-bottom:1rem;"></div>
        <div style="display:flex;gap:0.75rem;">
          <div class="skeleton" style="height:14px;width:30%;"></div>
          <div class="skeleton" style="height:14px;width:30%;"></div>
        </div>
      </div>
    </article>
  `).join('');
}

export default {
  async init() {
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;

    showSkeleton(grid);

    try {
      const favApi = useFavorites();
      const response = await favApi.getAll();
      const favorites = response?.favorites || [];

      if (favorites.length === 0) {
        showEmpty();
        updateSidebar(0);
        return;
      }

      const normalized = favorites.map(normalizeFavorite);
      grid.innerHTML = '';
      normalized.forEach(fav => grid.appendChild(createCard(fav)));
      updateSidebar(normalized.length);

      grid.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action="remove-fav"]');
        if (!btn) return;
        const card = btn.closest('.favorites-buyer-card');
        if (!card) return;
        const publicationId = card.dataset.publicationId;
        if (!publicationId) return;

        try {
          await favApi.remove(publicationId);
          card.remove();
          const remaining = grid.querySelectorAll('.favorites-buyer-card').length;
          updateSidebar(remaining);
          if (remaining === 0) showEmpty();
        } catch (err) {
          console.error('[FAVORITES] Error removing favorite:', err.message);
        }
      });
    } catch (err) {
      console.error('[FAVORITES] Error loading favorites:', err.message);
      showEmpty();
      updateSidebar(0);
    }
  }
};
