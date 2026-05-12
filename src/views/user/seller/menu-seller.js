import { navigateTo } from '../../../js/router.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { getSession } from '../../../hooks/useApi.js';
import { getPublicationArray, normalizePublication } from '../../../js/publicationMapper.js';

export default {
  async init() {
    this.setupNavigation();
    await this.renderDashboard();
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(link.getAttribute('data-navigate'));
      });
    });
  },

  async renderDashboard() {
    const heroTitle = document.querySelector('.menu-seller-hero-copy h2');
    const heroText = document.querySelector('.menu-seller-hero-copy p');
    const heroImg = document.querySelector('.menu-seller-hero-visual img');
    const score = document.querySelector('.menu-seller-score strong');
    const grid = document.querySelector('.menu-seller-car-grid');

    try {
      const session = getSession();
      const response = await usePublications().getAll(session?.id ? { sellerId: session.id } : {});
      const cars = getPublicationArray(response).map(normalizePublication);
      const best = cars.slice().sort((a, b) => b.score - a.score)[0];

      if (best) {
        if (heroTitle) heroTitle.textContent = best.title;
        if (heroText) heroText.textContent = `${best.priceFormatted}, ${best.mileageFormatted}, estado ${best.status}.`;
        if (heroImg) heroImg.src = best.image;
        if (score) score.textContent = best.score;
      }

      if (grid) {
        grid.innerHTML = cars.slice(0, 2).map(car => `
          <article class="menu-seller-car-card" data-publication-id="${car.id}">
            <img src="${car.image}" alt="${car.title}" />
            <div class="menu-seller-car-body">
              <div class="menu-seller-car-head">
                <div><h3>${car.title}</h3><p>${car.priceFormatted}</p></div>
                <span class="menu-seller-car-score">${car.score}%</span>
              </div>
              <div class="menu-seller-car-meta">
                <span><i class="bi bi-geo-alt-fill"></i> ${car.location}</span>
                <span><i class="bi bi-patch-check"></i> ${car.status}</span>
              </div>
              <div class="menu-seller-car-actions">
                <button type="button" class="menu-seller-ghost-btn" data-detail="${car.id}">Ver</button>
                <button type="button" class="menu-seller-primary-btn" data-navigate="user/seller/publications">Gestionar</button>
              </div>
            </div>
          </article>
        `).join('') || '<article class="menu-seller-car-card">No hay publicaciones cargadas.</article>';

        grid.querySelectorAll('[data-detail]').forEach(btn => {
          btn.addEventListener('click', () => navigateTo(`vehicles/detail/${btn.dataset.detail}`));
        });
        this.setupNavigation();
      }
    } catch (err) {
      if (grid) grid.innerHTML = `<article class="menu-seller-car-card">No se pudo cargar dashboard: ${err.message}</article>`;
    }
  }
};
