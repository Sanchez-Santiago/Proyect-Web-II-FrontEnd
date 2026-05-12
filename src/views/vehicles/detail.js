import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { useApi } from '../../hooks/useApi.js';

function formatPrice(price, currency) {
  const symbol = currency === 'USD' ? 'USD' : '$';
  return symbol + ' ' + price.toLocaleString('es-AR');
}

function formatMileage(mileage) {
  if (!mileage) return '—';
  return mileage.toLocaleString('es-AR') + ' km';
}

function translateEnum(value, type) {
  const maps = {
    transmission: { AUTOMATIC: 'Automática', MANUAL: 'Manual', SEMI_AUTOMATIC: 'Semi-Automática', CVT: 'CVT', OTHER: 'Otro' },
    fuel: { GASOLINE: 'Nafta', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', LPG: 'GNC', CNG: 'GNC', OTHER: 'Otro' }
  };
  return maps[type]?.[value] || value;
}

function renderConditionBar(label, value) {
  const percentage = Math.min((value / 5) * 100, 100);
  const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : '#ef4444';
  return `
    <div class="car-state-bar">
      <span class="car-state-label">${label}</span>
      <div class="car-state-track">
        <div class="car-state-fill" style="width:${percentage}%;background:${color};"></div>
      </div>
      <span class="car-state-value" style="color:${color};">${percentage}%</span>
    </div>
  `;
}

function renderGallery(pub, vehicle) {
  const images = vehicle?.images || [];
  const firstImage = images[0]?.imageUrl || '';
  const allImageUrls = images.map(i => i.imageUrl);

  let galleryHtml = `
    <div class="car-gallery">
      <div class="car-main-image">
        <img id="carMainImage" src="${firstImage}" alt="${vehicle?.brand} ${vehicle?.model}" />
        <div class="car-score-badge">
          <span class="car-score-value" style="color:#22c55e">—%</span>
          <div class="car-score-bar">
            <div class="car-score-fill" style="width:0%;background:#22c55e;"></div>
          </div>
          <span class="car-score-label">Match IA</span>
        </div>
      </div>
      <div class="car-thumbnails">
  `;

  allImageUrls.forEach((img, index) => {
    galleryHtml += `
      <button type="button" class="car-thumbnail ${index === 0 ? 'active' : ''}" onclick="window.changeCarImage('${img}', this)">
        <img src="${img}" alt="Foto ${index + 1}" />
      </button>
    `;
  });

  galleryHtml += `</div></div>`;
  return galleryHtml;
}

function showPurchaseModal(pub, vehicle) {
  const modal = document.createElement('div');
  modal.className = 'purchase-modal-overlay';
  modal.id = 'purchaseModal';
  modal.innerHTML = `
    <div class="purchase-modal">
      <button type="button" class="purchase-modal-close" onclick="document.getElementById('purchaseModal').remove()">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="purchase-modal-header"><h2>Confirmar Compra</h2></div>
      <div class="purchase-modal-body">
        <div class="purchase-car-image">
          <img src="${vehicle?.images?.[0]?.imageUrl || ''}" alt="${vehicle?.brand} ${vehicle?.model}" />
        </div>
        <h3>${vehicle?.brand} ${vehicle?.model} ${vehicle?.year}</h3>
        <p class="purchase-price">${formatPrice(pub.price, pub.currency)}</p>
        <div class="purchase-details">
          <div class="purchase-detail"><span>Año</span><strong>${vehicle?.year}</strong></div>
          <div class="purchase-detail"><span>Kilómetros</span><strong>${formatMileage(vehicle?.mileage)}</strong></div>
          <div class="purchase-detail"><span>Transmisión</span><strong>${translateEnum(vehicle?.transmission, 'transmission')}</strong></div>
          <div class="purchase-detail"><span>Combustible</span><strong>${translateEnum(vehicle?.fuelType, 'fuel')}</strong></div>
        </div>
        <div class="purchase-total"><span>Precio final</span><strong>${formatPrice(pub.price, pub.currency)}</strong></div>
      </div>
      <div class="purchase-modal-footer">
        <button type="button" class="purchase-cancel-btn" onclick="document.getElementById('purchaseModal').remove()">Cancelar</button>
        <button type="button" class="purchase-confirm-btn" onclick="alert('Compra confirmada. Te contactaremos pronto.')">
          <i class="bi bi-check-lg"></i> Confirmar compra
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

export default {
  async init() {
    await this.renderCarDetail();
    this.setupActions();
  },

  async renderCarDetail() {
    const pubId = window.carDetailId;
    if (!pubId) {
      document.getElementById('app').innerHTML = '<div class="error-view"><h1>Auto no encontrado</h1><p>ID de vehículo no especificado.</p><button data-navigate="home" class="home-auth-btn-primary" style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:12px;cursor:pointer;">Volver al inicio</button></div>';
      return;
    }

    const api = useApi('/publications');
    let pub, vehicle;

    try {
      const response = await api.get(`/${pubId}`);
      pub = response?.publication;
      vehicle = pub?.vehicle;
    } catch (err) {
      console.error('Error fetching publication:', err);
      document.getElementById('app').innerHTML = '<div class="error-view"><h1>Error al cargar</h1><p>No se pudo obtener la información del vehículo.</p><button data-navigate="home" class="home-auth-btn-primary" style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:12px;cursor:pointer;">Volver al inicio</button></div>';
      return;
    }

    if (!pub || !vehicle) {
      document.getElementById('app').innerHTML = '<div class="error-view"><h1>Auto no encontrado</h1><p>El vehículo que buscas no existe.</p><button data-navigate="home" class="home-auth-btn-primary" style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:12px;cursor:pointer;">Volver al inicio</button></div>';
      return;
    }

    const firstImage = vehicle.images?.[0]?.imageUrl || '';

    const gallery = document.querySelector('.car-detail-gallery');
    if (gallery) gallery.innerHTML = renderGallery(pub, vehicle);

    if (document.getElementById('carLocation')) {
      document.getElementById('carLocation').textContent = [pub.province, pub.city].filter(Boolean).join(', ') || 'Córdoba';
    }
    if (document.getElementById('carTitle')) {
      document.getElementById('carTitle').textContent = `${vehicle.brand} ${vehicle.model} ${vehicle.year}`;
    }
    if (document.getElementById('carPrice')) {
      document.getElementById('carPrice').textContent = formatPrice(pub.price, pub.currency);
    }

    const specsHtml = `
      <div class="car-detail-spec">
        <i class="bi bi-speedometer2"></i>
        <div><span>Kilometraje</span><strong>${formatMileage(vehicle.mileage)}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-gear"></i>
        <div><span>Transmisión</span><strong>${translateEnum(vehicle.transmission, 'transmission')}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-fuel-pump"></i>
        <div><span>Combustible</span><strong>${translateEnum(vehicle.fuelType, 'fuel')}</strong></div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-calendar"></i>
        <div><span>Año</span><strong>${vehicle.year}</strong></div>
      </div>
      ${vehicle.color ? `
      <div class="car-detail-spec">
        <i class="bi bi-palette"></i>
        <div><span>Color</span><strong>${vehicle.color}</strong></div>
      </div>
      ` : ''}
      ${vehicle.vehicleType ? `
      <div class="car-detail-spec">
        <i class="bi bi-car-front"></i>
        <div><span>Tipo</span><strong>${vehicle.vehicleType}</strong></div>
      </div>
      ` : ''}
      ${vehicle.engine ? `
      <div class="car-detail-spec">
        <i class="bi bi-gear-wide-connected"></i>
        <div><span>Motor</span><strong>${vehicle.engine}</strong></div>
      </div>
      ` : ''}
    `;

    const specsContainer = document.getElementById('carSpecs');
    if (specsContainer) specsContainer.innerHTML = specsHtml;

    const stateContainer = document.querySelector('.car-detail-state');
    if (stateContainer) {
      const a = vehicle.analytics;
      stateContainer.innerHTML = `
        ${renderConditionBar('Motor', a?.engineCondition || 0)}
        ${renderConditionBar('Interior', a?.interiorCondition || 0)}
        ${renderConditionBar('Pintura', a?.paintCondition || 0)}
        ${renderConditionBar('Gomas', a?.tiresCondition || 0)}
      `;
    }

    const descContainer = document.querySelector('.car-detail-description p');
    if (descContainer && pub.description) {
      descContainer.textContent = pub.description;
    }

    if (document.getElementById('sellerName')) {
      document.getElementById('sellerName').textContent = pub.seller?.fullName || 'Vendedor';
    }

    const sellerTypeLabels = { 'particular': 'Particular', 'agencia': 'Agencia/Concesionaria' };
    if (document.getElementById('sellerType')) {
      document.getElementById('sellerType').textContent = 'Particular';
    }

    if (document.getElementById('sellerVerified')) {
      document.getElementById('sellerVerified').innerHTML = '';
    }
  },

  setupActions() {
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.dataset.navigate;
        navigateTo(view);
      });
    });

    document.querySelectorAll('.car-thumbnail').forEach(btn => {
      btn.addEventListener('click', function() {
        const src = this.querySelector('img').src;
        const mainImg = document.getElementById('carMainImage');
        if (mainImg) mainImg.src = src;
        document.querySelectorAll('.car-thumbnail').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
      });
    });

    document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          btn.classList.toggle('is-active');
          const icon = btn.querySelector('i');
          if (btn.classList.contains('is-active')) {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
          } else {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
          }
        } else {
          state.requireAuth(() => {
            btn.classList.add('is-active');
            btn.querySelector('i').classList.remove('bi-heart');
            btn.querySelector('i').classList.add('bi-heart-fill');
          });
        }
      });
    });

    document.querySelectorAll('[data-action="contact"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          navigateTo(`messages/buyer/chat/${window.carDetailId}`);
        } else {
          state.requireAuth(() => {
            navigateTo(`messages/buyer/chat/${window.carDetailId}`);
          });
        }
      });
    });

    document.querySelectorAll('[data-action="buy"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const pubId = window.carDetailId;
        const api = useApi('/publications');
        try {
          const response = await api.get(`/${pubId}`);
          const pub = response?.publication;
          if (pub) showPurchaseModal(pub, pub.vehicle);
        } catch (err) {
          alert('Error al cargar datos del vehículo.');
        }
      });
    });

    document.querySelectorAll('[data-action="offer"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) alert('Función de oferta en desarrollo');
        else state.requireAuth(() => alert('Función de oferta en desarrollo'));
      });
    });

    document.querySelectorAll('[data-action="compare"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) alert('Función de comparar en desarrollo');
        else state.requireAuth(() => alert('Función de comparar en desarrollo'));
      });
    });
  }
};
