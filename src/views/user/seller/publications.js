import { navigateTo } from '../../../js/router.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { getSession } from '../../../hooks/useApi.js';
import { getPublicationArray, normalizePublication } from '../../../js/publicationMapper.js';

const statusLabels = {
  ACTIVE: 'Activa',
  PENDING: 'En revision',
  SOLD: 'Vendida',
  CANCELLED: 'Cancelada',
  EXPIRED: 'Expirada'
};

function statusClass(status) {
  if (status === 'ACTIVE') return 'is-active';
  if (status === 'PENDING') return 'is-review';
  return '';
}

function renderPublication(publication) {
  const car = normalizePublication(publication);
  return `
    <article class="pub-card" data-publication-id="${car.id}" data-status="${car.status}">
      <div class="pub-card-img">
        <img src="${car.image}" alt="${car.title}" />
        <span class="pub-status ${statusClass(car.status)}">${statusLabels[car.status] || car.status}</span>
      </div>
      <div class="pub-card-body">
        <h3>${car.title}</h3>
        <p class="pub-price">${car.priceFormatted}</p>
        <div class="pub-metrics">
          <span><i class="bi bi-speedometer2"></i> ${car.mileageFormatted}</span>
          <span><i class="bi bi-geo-alt"></i> ${car.location}</span>
          <span><i class="bi bi-heart-fill"></i> ${car.score}%</span>
        </div>
        <div class="pub-ai-score">
          <span>Estado</span>
          <strong>${statusLabels[car.status] || car.status}</strong>
        </div>
        <div class="pub-actions">
          <button type="button" class="pub-btn pub-btn-edit" data-detail="${car.id}">Ver</button>
          <button type="button" class="pub-btn pub-btn-optimize" data-status-toggle="${car.id}" data-current-status="${car.status}">
            ${car.status === 'ACTIVE' ? 'Marcar vendida' : 'Activar'}
          </button>
          <button type="button" class="pub-btn pub-btn-edit" data-delete="${car.id}">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

export default {
  async init() {
    this.api = usePublications();
    this.grid = document.getElementById('publicationsGrid');
    this.setupNavigation();
    await this.loadPublications();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(el.getAttribute('data-navigate'));
      });
    });
  },

  async loadPublications() {
    if (!this.grid) return;
    this.grid.innerHTML = '<div class="no-results">Cargando publicaciones...</div>';

    try {
      const session = getSession();
      const filters = session?.id ? { sellerId: session.id } : {};
      const response = await this.api.getAll(filters);
      const publications = getPublicationArray(response);

      if (!publications.length) {
        this.grid.innerHTML = '<div class="no-results">Todavia no tenes publicaciones cargadas.</div>';
        this.updateStats([]);
        return;
      }

      this.grid.innerHTML = publications.map(renderPublication).join('');
      this.updateStats(publications);
      this.bindActions();
    } catch (err) {
      this.grid.innerHTML = `<div class="no-results">No se pudieron cargar publicaciones: ${err.message}</div>`;
    }
  },

  updateStats(publications) {
    const active = publications.filter(p => p.status === 'ACTIVE').length;
    const review = publications.filter(p => p.status === 'PENDING').length;
    const sold = publications.filter(p => p.status === 'SOLD').length;
    const stats = document.querySelectorAll('.pub-stat strong');
    if (stats[0]) stats[0].textContent = active;
    if (stats[1]) stats[1].textContent = review;
    if (stats[2]) stats[2].textContent = sold;
  },

  bindActions() {
    this.grid.querySelectorAll('[data-detail]').forEach(button => {
      button.addEventListener('click', () => navigateTo(`vehicles/detail/${button.dataset.detail}`));
    });

    this.grid.querySelectorAll('[data-status-toggle]').forEach(button => {
      button.addEventListener('click', async () => {
        const publicationId = button.dataset.statusToggle;
        const nextStatus = button.dataset.currentStatus === 'ACTIVE' ? 'SOLD' : 'ACTIVE';
        button.disabled = true;
        try {
          await this.api.updateStatus(publicationId, nextStatus);
          await this.loadPublications();
        } catch (err) {
          button.disabled = false;
          alert(err.message || 'No se pudo actualizar el estado');
        }
      });
    });

    this.grid.querySelectorAll('[data-delete]').forEach(button => {
      button.addEventListener('click', async () => {
        if (!confirm('Eliminar esta publicación?')) return;
        button.disabled = true;
        try {
          await this.api.delete(button.dataset.delete);
          await this.loadPublications();
        } catch (err) {
          button.disabled = false;
          alert(err.message || 'No se pudo eliminar la publicación');
        }
      });
    });
  }
};
