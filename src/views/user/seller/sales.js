import { useApi } from '../../../hooks/useApi.js';
import state from '../../../core/state.js';
import { formatPrice } from '../../../utils/formatters.js';

function normalizePublication(pub) {
  const v = pub.vehicle;
  const firstImage = v?.images?.[0]?.imageUrl || '';
  return {
    id: pub.id,
    brand: v?.brand || '',
    model: v?.model || '',
    year: v?.year || '',
    price: pub.price || 0,
    priceFormatted: formatPrice(pub.price, pub.currency),
    image: firstImage,
    status: pub.status,
    sellerId: pub.sellerId,
    buyerName: pub.buyer?.fullName || 'Comprador',
    createdAt: pub.createdAt
  };
}

function createSaleCard(pub) {
  const statusLabel = pub.status === 'SOLD' ? 'Completado' : 'En Proceso';
  const statusClass = pub.status === 'SOLD' ? 'is-completed' : 'is-active';
  const date = pub.createdAt ? new Date(pub.createdAt).toLocaleDateString('es-AR') : '';

  const article = document.createElement('article');
  article.className = 'sale-card';
  article.dataset.navigate = 'vehicles/detail/' + pub.id;
  article.innerHTML = `
    <img src="${pub.image}" alt="${pub.brand} ${pub.model}" loading="lazy" />
    <div class="sale-card-content">
      <div class="sale-card-header">
        <h3>${pub.brand} ${pub.model} ${pub.year}</h3>
        <span class="sale-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="sale-card-meta">
        <span><i class="bi bi-person-fill"></i> ${pub.buyerName}</span>
        ${date ? '<span><i class="bi bi-calendar3"></i> ' + date + '</span>' : ''}
      </div>
    </div>
    <p class="sale-price">${pub.priceFormatted}</p>
  `;
  return article;
}

function showSkeleton() {
  const timeline = document.getElementById('salesTimeline');
  if (!timeline) return;
  timeline.innerHTML = Array(4).fill(0).map(() => `
    <article class="sale-card skeleton-card" style="pointer-events:none;">
      <div class="skeleton" style="height:100px;width:120px;border-radius:12px 0 0 12px;flex-shrink:0;"></div>
      <div class="sale-card-content" style="flex:1;padding:1.25rem;">
        <div class="skeleton" style="height:20px;width:60%;margin-bottom:0.75rem;"></div>
        <div class="skeleton" style="height:14px;width:40%;margin-bottom:0.5rem;"></div>
        <div class="skeleton" style="height:14px;width:30%;"></div>
      </div>
    </article>
  `).join('');
}

export default {
  async init() {
    showSkeleton();

    const session = state.getSession();
    if (!session?.id) {
      document.getElementById('salesTimeline').innerHTML = '<div class="no-results">Debes iniciar sesion para ver tus ventas.</div>';
      return;
    }

    try {
      const api = useApi('/publications');
      const [soldRes, activeRes] = await Promise.all([
        api.get('/filters', { sellerId: session.id, status: 'SOLD' }),
        api.get('/filters', { sellerId: session.id, status: 'ACTIVE' })
      ]);

      const sold = (soldRes?.publications || []).map(normalizePublication);
      const active = (activeRes?.publications || []).map(normalizePublication);
      const all = [...sold, ...active];

      const totalAmount = sold.reduce((sum, p) => sum + p.price, 0);
      document.getElementById('totalSalesAmount').textContent = formatPrice(totalAmount, 'ARS') || '$0';
      document.getElementById('inProcessCount').textContent = active.length;
      document.getElementById('completedCount').textContent = sold.length;

      const timeline = document.getElementById('salesTimeline');
      timeline.innerHTML = '';

      if (all.length === 0) {
        timeline.innerHTML = '<div class="no-results">No tienes ventas registradas aun.</div>';
        return;
      }

      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      all.forEach(pub => timeline.appendChild(createSaleCard(pub)));

      document.getElementById('salesLeadsCount').textContent = all.length + ' transacciones';
    } catch (err) {
      console.error('[SALES] Error loading sales:', err.message);
      document.getElementById('salesTimeline').innerHTML = '<div class="no-results">Error al cargar las ventas.</div>';
    }
  }
};
