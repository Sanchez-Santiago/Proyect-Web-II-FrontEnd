import { navigateTo } from '../../../core/router.js';
import { useApi } from '../../../hooks/useApi.js';
import state from '../../../core/state.js';

export default {
  async init() {
    state.init();
    if (!state.isLoggedIn()) { navigateTo('auth/login'); return; }
    this.setupNavigation();
    await this.loadSearches();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async loadSearches() {
    const list = document.getElementById('savedSearchesList');
    const empty = document.getElementById('savedSearchesEmpty');
    if (!list) return;

    try {
      const api = useApi('/saved-searches');
      const response = await api.get();
      const searches = response.searches || [];

      if (searches.length === 0) {
        list.style.display = 'none';
        if (empty) empty.style.display = 'block';
        return;
      }

      list.style.display = 'flex';
      if (empty) empty.style.display = 'none';

      list.innerHTML = searches.map(s => {
        const filters = s.filters || {};
        const parts = [];
        if (filters.brand) parts.push(`Marca: ${filters.brand}`);
        if (filters.priceMin || filters.priceMax) {
          parts.push(`Precio: ${filters.priceMin ? '$' + filters.priceMin.toLocaleString() : '$0'} - ${filters.priceMax ? '$' + filters.priceMax.toLocaleString() : '∞'}`);
        }
        if (filters.year) parts.push(`Año: ${filters.year}`);
        if (filters.search) parts.push(`"${filters.search}"`);

        return `
          <article class="favorite-card" style="padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;">
            <div>
              <strong style="color:var(--white);font-size:0.95rem;">${parts.join(' · ') || 'Búsqueda personalizada'}</strong>
              <small style="color:var(--muted,#9ca3af);display:block;margin-top:0.25rem;">${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</small>
            </div>
            <div style="display:flex;gap:0.5rem;flex-shrink:0;">
              <button type="button" class="car-detail-compare-btn" data-action="apply" data-id="${s.id}" style="padding:0.4rem 0.75rem;font-size:0.8rem;">
                <i class="bi bi-search"></i> Aplicar
              </button>
              <button type="button" class="car-detail-action" data-action="delete" data-id="${s.id}" style="color:#ef4444;padding:0.4rem 0.75rem;font-size:0.8rem;">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </article>
        `;
      }).join('');

      list.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          if (!confirm('¿Eliminar esta búsqueda guardada?')) return;
          try {
            await api.del(`/${id}`);
            await this.loadSearches();
          } catch (err) {
            console.warn('Error eliminando búsqueda:', err.message);
          }
        });
      });

      list.querySelectorAll('[data-action="apply"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const search = searches.find(s => s.id === id);
          if (search?.filters) {
            const f = search.filters;
            const elBrand = document.getElementById('homeFilterBrand');
            const elPrice = document.getElementById('homeFilterPrice');
            const elYear = document.getElementById('homeFilterYear');
            const elSearch = document.getElementById('homeSearchInput');
            if (elBrand) elBrand.value = f.brand || '';
            if (elPrice) {
              if (f.priceMin === 0 && f.priceMax === 10000000) elPrice.value = 'hasta-10m';
              else if (f.priceMin === 10000000 && f.priceMax === 20000000) elPrice.value = '10m-20m';
              else if (f.priceMin === 20000000 && f.priceMax === 35000000) elPrice.value = '20m-35m';
              else if (f.priceMin === 35000000) elPrice.value = 'mas-35m';
              else elPrice.value = '';
            }
            if (elYear) elYear.value = f.year || '';
            if (elSearch) elSearch.value = f.search || '';
            navigateTo('home');
          }
        });
      });
    } catch (err) {
      console.warn('Error cargando búsquedas:', err.message);
    }
  }
};
