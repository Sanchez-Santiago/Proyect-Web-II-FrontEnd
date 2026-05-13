import { usePublications } from '../../../hooks/usePublications.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { formatPrice } from '../../../utils/formatters.js';

const statusLabels = {
  ACTIVE: 'Activa', PENDING: 'En Revisión', SOLD: 'Vendido',
  CANCELLED: 'Cancelada', EXPIRED: 'Expirada'
};

const statusClasses = {
  ACTIVE: 'is-active', PENDING: 'is-review', SOLD: 'is-sold',
  CANCELLED: 'is-cancelled', EXPIRED: 'is-expired'
};

export default {
  async init() {
    const grid = document.getElementById('publicationsGrid');
    const stats = document.querySelectorAll('.pub-stat strong');

    if (!grid) return;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    const session = state.getSession();
    const publications = usePublications();

    try {
      const response = await publications.getAll({ sellerId: session.id });
      const list = response.publications || [];

      const active = list.filter(p => p.status === 'ACTIVE').length;
      const pending = list.filter(p => p.status === 'PENDING').length;
      const sold = list.filter(p => p.status === 'SOLD').length;

      if (stats.length >= 3) {
        stats[0].textContent = active;
        stats[1].textContent = pending;
        stats[2].textContent = sold;
      }

      if (list.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)">No tenés publicaciones aún. <button class="menu-seller-primary-btn" data-navigate="vehicles/add" style="display:block;margin:1rem auto">Crear primera publicación</button></div>';
        return;
      }

      grid.innerHTML = list.map(pub => {
        const vehicle = pub.vehicle || {};
        const image = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/600x400';
        const title = pub.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';
        const score = vehicle.analytics?.overallScore || vehicle.analytics?.confidenceScore || null;

        return `
          <article class="pub-card">
            <div class="pub-card-img">
              <img src="${image}" alt="${title}" />
              <span class="pub-status ${statusClasses[pub.status] || ''}">${statusLabels[pub.status] || pub.status}</span>
            </div>
            <div class="pub-card-body">
              <h3>${title}</h3>
              <p class="pub-price">${formatPrice(pub.price, pub.currency)}</p>
              <div class="pub-metrics">
                <span><i class="bi bi-geo-alt"></i> ${[pub.province, pub.city].filter(Boolean).join(', ') || '—'}</span>
              </div>
              ${score ? `<div class="pub-ai-score"><span>Puntuación IA</span><strong>${Math.round(score)}%</strong></div>` : ''}
              <div class="pub-actions">
                <button type="button" class="pub-btn pub-btn-detail" data-id="${pub.id}">Ver detalle</button>
                <button type="button" class="pub-btn ${pub.status === 'ACTIVE' ? 'pub-btn-sold' : 'pub-btn-activate'}" data-action="toggle-status" data-id="${pub.id}" data-current="${pub.status}">
                  ${pub.status === 'ACTIVE' ? 'Marcar vendido' : pub.status === 'SOLD' ? 'Reactivar' : '—'}
                </button>
                <button type="button" class="pub-btn pub-btn-delete" data-action="delete" data-id="${pub.id}">Eliminar</button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      this.setupActions(grid, publications, list);
    } catch (err) {
      console.error('Error loading publications:', err);
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted)">Error al cargar publicaciones.</div>';
    }
  },

  setupActions(grid, publications, list) {
    grid.querySelectorAll('.pub-btn-detail').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(`vehicles/detail/${btn.dataset.id}`));
    });

    grid.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const newStatus = btn.dataset.current === 'ACTIVE' ? 'SOLD' : 'ACTIVE';
        btn.disabled = true;
        btn.textContent = 'Actualizando...';
        try {
          await publications.updateStatus(id, newStatus);
          this.init();
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Error';
          console.error('Error updating status:', err);
        }
      });
    });

    grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('¿Eliminar esta publicación?')) return;
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
        try {
          await publications.delete(btn.dataset.id);
          this.init();
        } catch (err) {
          btn.disabled = false;
          btn.textContent = 'Error';
          console.error('Error deleting publication:', err);
        }
      });
    });
  }
};
