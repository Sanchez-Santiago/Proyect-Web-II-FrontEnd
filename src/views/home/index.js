import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { useApi } from '../../hooks/useApi.js';

let publications = [];

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
    fuel: { GASOLINE: 'Nafta', DIESEL: 'Diésel', ELECTRIC: 'Eléctrico', HYBRID: 'Híbrido', LPG: 'GNC', CNG: 'GNC', OTHER: 'Otro' },
    condition: { ACTIVE: 'Activo', PENDING: 'Pendiente', SOLD: 'Vendido', CANCELLED: 'Cancelado', EXPIRED: 'Expirado' }
  };
  return maps[type]?.[value] || value;
}

function renderConditionBar(label, value) {
  const percentage = Math.min((value / 5) * 100, 100);
  const color = percentage >= 80 ? 'var(--success, #22c55e)' : percentage >= 60 ? 'var(--warning, #eab308)' : 'var(--error, #ef4444)';
  return `
    <div class="condition-bar">
      <span class="condition-label">${label}</span>
      <div class="condition-bar-track">
        <div class="condition-bar-fill" style="width:${percentage}%;background:${color};"></div>
      </div>
      <span class="condition-value" style="color:${color};">${percentage}%</span>
    </div>
  `;
}

function normalizePublication(pub) {
  const v = pub.vehicle;
  const firstImage = v?.images?.[0]?.imageUrl || '';
  const allImages = v?.images?.map(i => i.imageUrl) || [];
  const analytics = v?.analytics;
  const score = analytics?.overallScore || 0;

  return {
    id: pub.id,
    vehicleId: v?.id,
    brand: v?.brand || '',
    model: v?.model || '',
    year: v?.year || '',
    price: pub.price,
    priceFormatted: formatPrice(pub.price, pub.currency),
    mileage: v?.mileage || 0,
    mileageFormatted: formatMileage(v?.mileage),
    transmission: translateEnum(v?.transmission, 'transmission'),
    fuel: translateEnum(v?.fuelType, 'fuel'),
    color: v?.color || '',
    location: [pub.province, pub.city].filter(Boolean).join(', '),
    image: firstImage,
    images: allImages,
    score: score,
    condition: score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : 'Regular',
    interiorCondition: analytics?.interiorCondition || 0,
    paintCondition: analytics?.paintCondition || 0,
    tiresCondition: analytics?.tiresCondition || 0,
    dashboardCondition: analytics?.engineCondition || 0,
    description: pub.description || '',
    seller: {
      name: pub.seller?.fullName || 'Vendedor',
      type: 'particular',
      verified: false,
      phone: pub.seller?.phone || ''
    },
    status: pub.status,
    currency: pub.currency,
    province: pub.province,
    city: pub.city
  };
}

function createCarCard(car) {
  const card = document.createElement('article');
  card.className = 'home-car-card';

  const conditionClass = car.condition === 'Excelente' ? 'excellent' : car.condition === 'Bueno' ? 'good' : 'regular';
  const scoreColor = car.score >= 85 ? 'var(--success, #22c55e)' : car.score >= 70 ? 'var(--warning, #eab308)' : 'var(--error, #ef4444)';
  const scoreWidth = Math.max(car.score - 10, 20);

  card.innerHTML = `
    <div class="home-car-image">
      <img src="${car.image}" alt="${car.brand} ${car.model}" loading="lazy" />
      <div class="home-car-score-badge">
        <div class="score-pill">
          <span class="score-number" style="color:${scoreColor}">${car.score}%</span>
          <div class="score-bar-track">
            <div class="score-bar-fill" style="width:${scoreWidth}%;background:${scoreColor};"></div>
          </div>
        </div>
        <span class="score-label">Match IA</span>
      </div>
      <button type="button" class="home-car-favorite" data-action="favorite" data-car-id="${car.id}" title="Agregar a favoritos">
        <i class="bi bi-heart"></i>
      </button>
    </div>
    <div class="home-car-body">
      <div class="home-car-header">
        <div>
          <h3>${car.brand} ${car.model}</h3>
          <p class="home-car-price">${car.priceFormatted}</p>
        </div>
        <span class="home-car-condition ${conditionClass}">${car.condition}</span>
      </div>
      <div class="home-car-meta">
        <span><i class="bi bi-calendar"></i> ${car.year}</span>
        <span><i class="bi bi-speedometer2"></i> ${car.mileageFormatted}</span>
        <span><i class="bi bi-geo-alt"></i> ${car.location}</span>
      </div>
      <div class="home-car-condition-details">
        ${renderConditionBar('Motor', car.dashboardCondition || 4)}
        ${renderConditionBar('Interior', car.interiorCondition)}
        ${renderConditionBar('Pintura', car.paintCondition)}
        ${renderConditionBar('Neumáticos', car.tiresCondition)}
      </div>
      <div class="home-car-actions">
        <button type="button" class="home-car-detail-btn" data-navigate="vehicles/detail/${car.id}">Ver detalle</button>
        <button type="button" class="home-car-compare-btn" data-action="compare" data-car-id="${car.id}" title="Comparar">
          <i class="bi bi-arrow-left-right"></i>
        </button>
      </div>
    </div>
  `;
  return card;
}

function renderCars() {
  const grid = document.getElementById('homeCarsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  if (publications.length === 0) {
    grid.innerHTML = '<div class="no-results">No se encontraron autos que coincidan con tu búsqueda.</div>';
    return;
  }

  publications.forEach(car => {
    grid.appendChild(createCarCard(car));
  });
}

function buildFilters() {
  const searchInput = document.getElementById('homeSearchInput');
  const filterBrand = document.getElementById('homeFilterBrand');
  const filterPrice = document.getElementById('homeFilterPrice');
  const filterYear = document.getElementById('homeFilterYear');

  const filters = { status: 'ACTIVE' };

  const search = searchInput?.value.toLowerCase() || '';
  if (search) {
    filters.search = search;
  }

  const brand = filterBrand?.value;
  if (brand) filters.brand = brand;

  const price = filterPrice?.value;
  if (price === 'hasta-10m') filters.priceMax = 10000000;
  else if (price === '10m-20m') { filters.priceMin = 10000000; filters.priceMax = 20000000; }
  else if (price === '20m-35m') { filters.priceMin = 20000000; filters.priceMax = 35000000; }
  else if (price === 'mas-35m') filters.priceMin = 35000000;

  const year = filterYear?.value;
  if (year) filters.year = parseInt(year);

  return filters;
}

async function fetchPublications() {
  const api = useApi('/publications');
  const filters = buildFilters();

  try {
    const response = await api.get('/filters', filters);
    const items = response?.publications || [];
    publications = items.map(normalizePublication);

    if (filters.search) {
      const q = filters.search.toLowerCase();
      publications = publications.filter(car =>
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        car.year.toString().includes(q)
      );
    }

    renderCars();
  } catch (err) {
    console.error('Error fetching publications:', err);
    const grid = document.getElementById('homeCarsGrid');
    if (grid) {
      grid.innerHTML = '<div class="no-results">Error al cargar los vehículos. Verifica la conexión con el servidor.</div>';
    }
  }
}

function filterCars() {
  fetchPublications();
}

function clearFilters() {
  ['homeSearchInput', 'homeFilterBrand', 'homeFilterPrice', 'homeFilterYear'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  fetchPublications();
}

function setupActions() {
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
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

  document.querySelectorAll('[data-action="compare"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.isLoggedIn()) {
        alert('Función de comparar en desarrollo');
      } else {
        state.requireAuth(() => {
          alert('Función de comparar en desarrollo');
        });
      }
    });
  });

  document.getElementById('homeSearchBtn')?.addEventListener('click', filterCars);
  document.getElementById('homeSearchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterCars();
  });
  document.getElementById('homeFilterBrand')?.addEventListener('change', filterCars);
  document.getElementById('homeFilterPrice')?.addEventListener('change', filterCars);
  document.getElementById('homeFilterYear')?.addEventListener('change', filterCars);
}

function updateAuthUI() {
  const container = document.querySelector('.home-auth');
  if (!container) return;

  if (state.isLoggedIn()) {
    const s = state.getSession();
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="color:#f97316;font-size:12px;font-weight:600;">${s?.name || ''}</span>
        <button type="button" class="home-auth-btn" data-navigate="${s?.role === 'seller' ? 'user/seller/menu' : s?.role === 'admin' ? 'admin/menu' : 'user/buyer/menu'}">Mi cuenta</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button type="button" class="home-auth-btn" data-navigate="auth/login">Iniciar sesión</button>
      <button type="button" class="home-auth-btn-primary" data-navigate="auth/register">Crear cuenta</button>
    `;
  }
}

export default {
  init() {
    updateAuthUI();
    fetchPublications();
    setupActions();
  },

  getPublications() {
    return publications;
  }
};
