import { navigateTo } from '../../../js/router.js';
import { useFavorites } from '../../../hooks/useFavorites.js';
import { usePublications } from '../../../hooks/usePublications.js';
import { normalizePublication, unwrapApiData, getPublicationArray } from '../../../js/publicationMapper.js';

function bindNavigation() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-navigate'));
    });
  });
}

function buildInsight(cars) {
  if (!cars.length) {
    return {
      title: 'Sin favoritos para analizar',
      text: 'Guarda publicaciones en favoritos para calcular depreciacion, riesgo y oportunidades reales.',
      best: null,
      average: 0
    };
  }

  const sorted = cars.slice().sort((a, b) => b.score - a.score);
  const best = sorted[0];
  const average = Math.round(cars.reduce((sum, c) => sum + c.score, 0) / cars.length);
  return {
    title: average >= 85 ? 'Cartera saludable' : 'Cartera a revisar',
    text: `${cars.length} favoritos analizados. Score promedio ${average}%. La mejor opcion actual es ${best.title}.`,
    best,
    average
  };
}

export default {
  async init() {
    bindNavigation();
    const heroTitle = document.querySelector('.investment-ai-hero h2');
    const heroText = document.querySelector('.investment-ai-hero p');
    const grid = document.querySelector('.investment-grid');
    if (!grid) return;
    grid.innerHTML = '<article class="investment-card-pro">Analizando datos reales...</article>';

    try {
      const favResponse = await useFavorites().getAll();
      const favorites = unwrapApiData(favResponse, 'favorites') || [];
      let cars = favorites.map(f => normalizePublication(f.publication || f));

      if (!cars.length) {
        const pubResponse = await usePublications().getAll({ status: 'ACTIVE' });
        cars = getPublicationArray(pubResponse).slice(0, 3).map(normalizePublication);
      }

      const insight = buildInsight(cars);
      if (heroTitle) heroTitle.textContent = insight.title;
      if (heroText) heroText.textContent = insight.text;

      grid.innerHTML = `
        <article class="investment-card-pro">
          <div class="inv-icon"><i class="bi bi-graph-down"></i></div>
          <div class="inv-content">
            <h3>Analisis de riesgo</h3>
            <p>Score promedio de la seleccion: ${insight.average}%. ${insight.average >= 85 ? 'El riesgo estimado es bajo.' : 'Conviene revisar historial y documentacion antes de avanzar.'}</p>
          </div>
        </article>
        <article class="investment-card-pro is-highlight">
          <div class="inv-icon"><i class="bi bi-lightning-charge"></i></div>
          <div class="inv-content">
            <h3>Mejor oportunidad</h3>
            <p>${insight.best ? `${insight.best.title} combina precio ${insight.best.priceFormatted}, ${insight.best.mileageFormatted} y score ${insight.best.score}%.` : 'No hay oportunidades suficientes para calcular.'}</p>
            ${insight.best ? `<button type="button" class="inv-action-btn" data-detail="${insight.best.id}">Ver oportunidad</button>` : ''}
          </div>
        </article>
      `;

      grid.querySelectorAll('[data-detail]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(`vehicles/detail/${btn.dataset.detail}`));
      });
    } catch (err) {
      grid.innerHTML = `<article class="investment-card-pro">No se pudo calcular el advisor: ${err.message}</article>`;
    }
  }
};
