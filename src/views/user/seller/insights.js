import { navigateTo } from '../../../js/router.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { getSession } from '../../../hooks/useApi.js';
import { getPublicationArray, normalizePublication } from '../../../js/publicationMapper.js';

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
    const grid = document.querySelector('.insights-grid');
    const heroText = document.querySelector('.insights-ai-hero p');
    if (!grid) return;
    grid.innerHTML = '<article class="insight-card-pro">Calculando insights...</article>';

    try {
      const session = getSession();
      const response = await usePublications().getAll(session?.id ? { sellerId: session.id } : {});
      const cars = getPublicationArray(response).map(normalizePublication);
      const active = cars.filter(c => c.status === 'ACTIVE');
      const pending = cars.filter(c => c.status === 'PENDING');
      const average = cars.length ? cars.reduce((sum, c) => sum + c.price, 0) / cars.length : 0;
      const best = cars.slice().sort((a, b) => b.score - a.score)[0];

      if (heroText) {
        heroText.textContent = `Basado en ${cars.length} publicaciones reales de tu cuenta.`;
      }

      grid.innerHTML = `
        <article class="insight-card-pro is-hot">
          <div class="insight-icon"><i class="bi bi-graph-up-arrow"></i></div>
          <div class="insight-content">
            <h3>Estado del inventario</h3>
            <p>Tenes ${active.length} publicaciones activas y ${pending.length} en revision. ${pending.length ? 'Conviene resolver pendientes para ganar exposicion.' : 'La cola de revision esta limpia.'}</p>
            <div class="insight-footer">
              <span class="insight-impact">Precio promedio: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: best?.currency || 'ARS', maximumFractionDigits: 0 }).format(average)}</span>
              <button type="button" class="insight-action-btn" data-navigate="user/seller/publications">Ver publicaciones</button>
            </div>
          </div>
        </article>
        <article class="insight-card-pro">
          <div class="insight-icon"><i class="bi bi-camera-fill"></i></div>
          <div class="insight-content">
            <h3>Mejor publicacion</h3>
            <p>${best ? `${best.title} lidera tu inventario con ${best.score}% de score IA.` : 'Carga publicaciones para calcular oportunidades.'}</p>
            <div class="insight-footer">
              <span class="insight-impact">${best ? best.priceFormatted : 'Sin datos'}</span>
              ${best ? `<button type="button" class="insight-action-btn" data-detail="${best.id}">Ver detalle</button>` : ''}
            </div>
          </div>
        </article>
        <article class="insight-card-pro is-ai-glow">
          <div class="insight-icon"><i class="bi bi-magic"></i></div>
          <div class="insight-content">
            <h3>Siguiente accion</h3>
            <p>${active.length ? 'Mantene actualizadas fotos, precio y estado para mejorar conversion.' : 'Activa una publicacion para empezar a recibir leads reales.'}</p>
            <div class="insight-footer">
              <span class="insight-impact">Datos conectados al backend</span>
              <button type="button" class="insight-action-btn" data-navigate="vehicles/add">Crear publicacion</button>
            </div>
          </div>
        </article>
      `;

      grid.querySelectorAll('[data-navigate]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.navigate));
      });
      grid.querySelectorAll('[data-detail]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(`vehicles/detail/${btn.dataset.detail}`));
      });
    } catch (err) {
      grid.innerHTML = `<article class="insight-card-pro">No se pudieron calcular insights: ${err.message}</article>`;
    }
  }
};
