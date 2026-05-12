import { navigateTo } from '../../../js/router.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { getSession } from '../../../hooks/useApi.js';
import { getPublicationArray, normalizePublication, formatCurrency } from '../../../js/publicationMapper.js';

function bindNavigation() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-navigate'));
    });
  });
}

export default {
  async init() {
    bindNavigation();
    const timeline = document.querySelector('.sales-timeline');
    const stats = document.querySelectorAll('.sale-stat strong');
    if (!timeline) return;
    timeline.innerHTML = '<article class="sale-card">Cargando ventas...</article>';

    try {
      const session = getSession();
      const response = await usePublications().getAll(session?.id ? { sellerId: session.id } : {});
      const publications = getPublicationArray(response).map(normalizePublication);
      const sold = publications.filter(p => p.status === 'SOLD');
      const inProgress = publications.filter(p => p.status === 'ACTIVE' || p.status === 'PENDING');
      const total = sold.reduce((sum, p) => sum + p.price, 0);

      if (stats[0]) stats[0].textContent = formatCurrency(total, sold[0]?.currency || 'ARS');
      if (stats[1]) stats[1].textContent = inProgress.length;
      if (stats[2]) stats[2].textContent = sold.length;

      const rows = sold.length ? sold : publications;
      timeline.innerHTML = rows.length ? rows.map(car => `
        <article class="sale-card" data-publication-id="${car.id}">
          <img src="${car.image}" alt="${car.title}" />
          <div class="sale-card-content">
            <div class="sale-card-header">
              <h3>${car.title}</h3>
              <span class="sale-status ${car.status === 'SOLD' ? 'is-completed' : 'is-active'}">${car.status === 'SOLD' ? 'Completado' : 'En proceso'}</span>
            </div>
            <div class="sale-card-meta">
              <span><i class="bi bi-geo-alt-fill"></i> ${car.location}</span>
              <span><i class="bi bi-speedometer2"></i> ${car.mileageFormatted}</span>
            </div>
          </div>
          <p class="sale-price">${car.priceFormatted}</p>
        </article>
      `).join('') : '<article class="sale-card">No hay publicaciones para mostrar.</article>';

      timeline.querySelectorAll('[data-publication-id]').forEach(card => {
        card.addEventListener('click', () => navigateTo(`vehicles/detail/${card.dataset.publicationId}`));
      });
    } catch (err) {
      timeline.innerHTML = `<article class="sale-card">No se pudieron cargar ventas: ${err.message}</article>`;
    }
  }
};
