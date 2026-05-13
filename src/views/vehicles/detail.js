import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { useApi } from '../../hooks/useApi.js';
import { formatPrice, formatMileage, translateEnum } from '../../utils/formatters.js';
import { useFavorites } from '../../hooks/useFavorites.js';

// Helper: robust image extraction
function getImages(pub, vehicle) {
  const images = vehicle?.images || pub?.images || pub?.vehicle?.images || [];
  return images.map(img => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      return img.imageUrl || img.url || img.path || '';
    }
    return '';
  }).filter(Boolean);
}

export default {
  async init() {
    console.log('[DETAIL] Script loaded and init called');
    await this.renderCarDetail();
    this.setupActions();
  },

  async renderCarDetail() {
    const pubId = state.getParam('carDetailId');
    const container = document.getElementById('app');
    
    if (!pubId) {
      console.error('[DETAIL] No pubId found in params');
      return;
    }

    try {
      const api = useApi('/publications');
      console.log('[DETAIL] Fetching publication:', pubId);
      const response = await api.get(`/${pubId}`);
      console.log('[DETAIL] API Data received:', response);

      const pub = response?.publication || response;
      const vehicle = pub?.vehicle || response?.vehicle;

      if (!pub || !vehicle) {
        throw new Error('No se encontraron datos del vehículo');
      }

      // Update UI elements directly
      this.updateUI(pub, vehicle);

      // Track view
      const viewsApi = useApi('/vehicle-views');
      viewsApi.post(`/publication/${pubId}`).catch(() => {});

    } catch (err) {
      console.error('[DETAIL] Render error:', err);
      if (container) {
        container.innerHTML = `<div class="error-view"><h1>Error</h1><p>${err.message}</p></div>`;
      }
    }
  },

  updateUI(pub, vehicle) {
    const el = (id) => document.getElementById(id);
    const sel = (s) => document.querySelector(s);

    if (el('carTitle')) el('carTitle').textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    if (el('carPrice')) el('carPrice').textContent = formatPrice(pub.price, pub.currency);
    if (el('carLocation')) el('carLocation').textContent = [pub.province, pub.city].filter(Boolean).join(', ') || 'Córdoba';
    
    // Gallery
    const images = getImages(pub, vehicle);
    const mainImg = el('carMainImage');
    if (mainImg) {
      mainImg.src = images[0] || 'https://placehold.co/800x600/111/fff?text=Sin+Imagen';
    }

    const thumbnails = sel('.car-thumbnails') || this.createThumbnailsContainer();
    if (thumbnails) {
      thumbnails.innerHTML = images.map((img, idx) => `
        <button type="button" class="car-thumbnail ${idx === 0 ? 'active' : ''}" onclick="window.changeCarImage('${img}', this)">
          <img src="${img}" alt="Foto ${idx + 1}" />
        </button>
      `).join('');
    }

    // Score
    const score = vehicle.analytics?.overallScore || 0;
    const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
    const scoreBadge = el('carScore');
    if (scoreBadge) {
      scoreBadge.innerHTML = `
        <span class="car-score-value" style="color:${scoreColor}">${score}%</span>
        <div class="car-score-bar"><div class="car-score-fill" style="width:${score}%;background:${scoreColor};"></div></div>
        <span class="car-score-label">Match IA</span>
      `;
    }

    // Specs
    const specs = el('carSpecs');
    if (specs) {
      specs.innerHTML = `
        <div class="car-detail-spec"><i class="bi bi-speedometer2"></i><div><span>KM</span><strong>${formatMileage(vehicle.mileage)}</strong></div></div>
        <div class="car-detail-spec"><i class="bi bi-gear"></i><div><span>Caja</span><strong>${translateEnum(vehicle.transmission, 'transmission')}</strong></div></div>
        <div class="car-detail-spec"><i class="bi bi-fuel-pump"></i><div><span>Motor</span><strong>${translateEnum(vehicle.fuelType, 'fuel')}</strong></div></div>
        <div class="car-detail-spec"><i class="bi bi-calendar"></i><div><span>Año</span><strong>${vehicle.year}</strong></div></div>
      `;
    }

    // Analytics
    const ai = sel('.car-detail-ai');
    if (ai) {
      const a = vehicle.analytics || {};
      ai.querySelector('p').textContent = a.damageDetected || 'Análisis optimizado por IA.';
      const priceDiff = pub.price && a.estimatedPrice ? ((pub.price - a.estimatedPrice) / a.estimatedPrice * 100).toFixed(1) : 0;
      const priceLabel = priceDiff < -5 ? 'Por debajo' : priceDiff > 5 ? 'Por encima' : 'En mercado';
      
      const metrics = ai.querySelector('.car-detail-ai-metrics');
      if (metrics) {
        metrics.innerHTML = `
          <div class="car-detail-ai-metric"><span>Mercado</span><strong>${priceLabel}</strong></div>
          <div class="car-detail-ai-metric"><span>Estado</span><strong>${score >= 60 ? 'Bueno' : 'Regular'}</strong></div>
          <div class="car-detail-ai-metric"><span>Confianza</span><strong>${Math.round((a.confidenceScore || 0.8) * 100)}%</strong></div>
        `;
      }
    }

    // Seller
    if (el('sellerName')) el('sellerName').textContent = pub.seller?.fullName || 'Vendedor Particular';
    if (el('sellerType')) el('sellerType').textContent = pub.seller?.type || 'Usuario';

    // Hide actions if owner
    const session = state.getSession();
    const sellerId = pub.seller?.id || pub.sellerId;
    const userId = session?.id || session?.user?.id;
    
    console.log('[DETAIL] Ownership check:', { sellerId, userId });

    if (session && sellerId && userId && String(sellerId) === String(userId)) {
      document.querySelectorAll('[data-action="contact"], [data-action="buy"]').forEach(btn => {
        btn.style.display = 'none';
      });
      const btnContainer = document.querySelector('.car-detail-buttons');
      if (btnContainer && !btnContainer.querySelector('.owner-msg')) {
        const msg = document.createElement('p');
        msg.className = 'owner-msg';
        msg.style.color = 'var(--orange)';
        msg.style.fontWeight = '600';
        msg.style.textAlign = 'center';
        msg.style.width = '100%';
        msg.textContent = 'Esta es tu propia publicación.';
        btnContainer.appendChild(msg);
      }
    }
  },

  createThumbnailsContainer() {
    const gallery = document.querySelector('.car-detail-gallery');
    if (!gallery) return null;
    let thumbs = gallery.querySelector('.car-thumbnails');
    if (!thumbs) {
      thumbs = document.createElement('div');
      thumbs.className = 'car-thumbnails';
      gallery.appendChild(thumbs);
    }
    return thumbs;
  },

  setupActions() {
    const pubId = state.getParam('carDetailId');

    window.changeCarImage = (src, btn) => {
      const mainImg = document.getElementById('carMainImage');
      if (mainImg) mainImg.src = src;
      document.querySelectorAll('.car-thumbnail').forEach(t => t.classList.remove('active'));
      if (btn) btn.classList.add('active');
    };

    document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
      btn.onclick = async () => {
        if (!state.isLoggedIn()) { state.openLoginModal(); return; }
        const fav = useFavorites();
        const isFav = btn.classList.contains('is-active');
        btn.classList.toggle('is-active');
        try {
          if (isFav) await fav.remove(pubId); else await fav.add(pubId);
        } catch (e) { btn.classList.toggle('is-active'); }
      };
    });

    document.querySelectorAll('[data-action="contact"]').forEach(btn => {
      btn.onclick = async () => {
        const action = async () => {
          try {
            state.showMessage('Iniciando chat...', 'info');
            const chats = (await import('../../hooks/useChats.js')).useChats();
            const res = await chats.createOrGet(pubId);
            const chat = res.chat || res;
            if (chat?.id) {
              navigateTo(`messages/buyer/chat/${chat.id}`);
            } else {
              throw new Error('No se pudo crear el chat');
            }
          } catch (err) {
            console.error('[DETAIL] Chat error:', err);
            state.showMessage('Error al iniciar el chat: ' + err.message, 'error');
          }
        };

        if (state.isLoggedIn()) {
          await action();
        } else {
          state.requireAuth(action);
        }
      };
    });

    document.querySelectorAll('[data-action="buy"]').forEach(btn => {
      btn.onclick = () => {
        state.showMessage('Procesando solicitud de compra...', 'info');
        // Aquí iría el modal de compra que ya definimos antes si es necesario
      };
    });

    // Check favorite status
    if (state.isLoggedIn()) {
      useFavorites().check(pubId).then(res => {
        if (res?.isFavorite) {
          const btn = document.querySelector('[data-action="favorite"]');
          if (btn) btn.classList.add('is-active');
        }
      }).catch(() => {});
    }
  }
};
