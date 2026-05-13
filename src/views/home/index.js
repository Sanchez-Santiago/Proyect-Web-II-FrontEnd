import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';
import { useApi } from '../../hooks/useApi.js';
import { useFavorites } from '../../hooks/useFavorites.js';
import { formatPrice, formatMileage, translateEnum, renderConditionBar } from '../../utils/formatters.js';

let publications = [];
let vehicleFeatures = [];
let userFavorites = new Set();
let unsubscribeState = null;

function normalizePublication(pub) {
  const v = pub.vehicle;
  const firstImage = v?.images?.[0]?.imageUrl || '';
  const allImages = v?.images?.map(i => i.imageUrl) || [];
  const analytics = v?.analytics;
  const score = analytics?.overallScore || 0;
  const pf = pub.publicationFeatures || [];
  const featureIds = pf.map(f => f.feature?.id).filter(Boolean);
  const featureNames = pf.map(f => f.feature?.featureName).filter(Boolean);

  return {
    id: pub.id,
    featureIds,
    featureNames,
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
  card.className = 'home-car-card glass animate-fade-in-up';
  
  const isFav = userFavorites.has(car.id);
  const heartIcon = isFav ? 'bi-heart-fill' : 'bi-heart';
  const favClass = isFav ? 'is-active' : '';

  const conditionClass = car.condition === 'Excelente' ? 'excellent' : car.condition === 'Bueno' ? 'good' : 'regular';
  const scoreColor = car.score >= 85 ? 'var(--success, #22c55e)' : car.score >= 70 ? 'var(--warning, #eab308)' : 'var(--error, #ef4444)';
  const scoreWidth = Math.max(car.score - 10, 20);

  card.innerHTML = `
    <div class="home-car-image" data-navigate="vehicles/detail/${car.id}">
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
      <button type="button" class="home-car-favorite ${favClass}" data-action="favorite" data-car-id="${car.id}" title="Agregar a favoritos">
        <i class="bi ${heartIcon}"></i>
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
        ${renderConditionBar('Neumaticos', car.tiresCondition)}
      </div>
      <div class="home-car-actions">
        <button type="button" class="home-car-detail-btn" data-navigate="vehicles/detail/${car.id}">Ver detalle</button>
        <button type="button" class="home-car-share-btn" data-action="share" data-car-id="${car.id}" title="Compartir">
          <i class="bi bi-share"></i>
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
    grid.innerHTML = '<div class="no-results">No se encontraron autos que coincidan con tu busqueda.</div>';
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
  const filterFeature = document.getElementById('homeFilterFeature');

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

  const featureId = filterFeature?.value;
  if (featureId) filters.featureId = featureId;

  return filters;
}

async function populateFilterOptions() {
  try {
    const api = useApi('/publications');
    const response = await api.get('/filters', { status: 'ACTIVE', limit: 200 });
    const items = response?.publications || [];
    const normalized = items.map(normalizePublication);

    const brands = [...new Set(normalized.map(c => c.brand).filter(Boolean))].sort();
    const years = [...new Set(normalized.map(c => c.year).filter(Boolean))].sort((a, b) => b - a);

    const brandSelect = document.getElementById('homeFilterBrand');
    if (brandSelect) {
      const currentVal = brandSelect.value;
      brandSelect.innerHTML = '<option value="">Marca</option>';
      brands.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.toLowerCase();
        opt.textContent = b;
        brandSelect.appendChild(opt);
      });
      if (currentVal) brandSelect.value = currentVal;
    }

    const yearSelect = document.getElementById('homeFilterYear');
    if (yearSelect) {
      const currentVal = yearSelect.value;
      yearSelect.innerHTML = '<option value="">Ano</option>';
      years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
      if (currentVal) yearSelect.value = currentVal;
    }
  } catch (err) {
    console.warn('[HOME] Error populating filter options:', err.message);
  }
}

async function fetchPublications() {
  const grid = document.getElementById('homeCarsGrid');
  if (grid) {
    grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="home-car-card skeleton-card">
        <div class="skeleton skeleton-img" style="height:200px; border-radius:12px 12px 0 0;"></div>
        <div style="padding:1.5rem;">
          <div class="skeleton" style="height:24px; width:40%; margin-bottom:1rem;"></div>
          <div class="skeleton" style="height:28px; width:70%; margin-bottom:1rem;"></div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            <div class="skeleton" style="height:16px;"></div>
            <div class="skeleton" style="height:16px;"></div>
            <div class="skeleton" style="height:16px;"></div>
            <div class="skeleton" style="height:16px;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

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

    if (filters.featureId) {
      publications = publications.filter(car =>
        car.featureIds.includes(filters.featureId)
      );
    }

    if (filters.brand) {
      publications = publications.filter(car =>
        car.brand.toLowerCase() === filters.brand.toLowerCase()
      );
    }

    if (filters.priceMin) {
      publications = publications.filter(car => car.price >= filters.priceMin);
    }

    if (filters.priceMax) {
      publications = publications.filter(car => car.price <= filters.priceMax);
    }

    if (filters.year) {
      publications = publications.filter(car => car.year === filters.year);
    }

    renderCars();
  } catch (err) {
    console.error('[HOME] Error fetching publications:', err);
    const grid = document.getElementById('homeCarsGrid');
    if (grid) {
      grid.innerHTML = '<div class="no-results">Error al cargar los vehiculos. Verifica la conexion con el servidor.</div>';
    }
  }
}

function filterCars() {
  fetchPublications();
}

async function loadFeatures() {
  try {
    const api = useApi('/vehicle-features');
    const res = await api.get('');
    const features = res?.features || [];
    vehicleFeatures = features;
    const select = document.getElementById('homeFilterFeature');
    if (!select) return;
    features.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.featureName;
      select.appendChild(opt);
    });
  } catch (err) {
    console.warn('Error loading features:', err.message);
  }
}

function clearFilters() {
  ['homeSearchInput', 'homeFilterBrand', 'homeFilterPrice', 'homeFilterYear', 'homeFilterFeature'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  fetchPublications();
}

function setupActions() {
  const grid = document.getElementById('homeCarsGrid');
  if (!grid) return;

  grid.addEventListener('click', async (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;
    const carId = target.dataset.carId;
    if (!carId) return;

    if (action === 'favorite') {
      e.stopPropagation();
      const icon = target.querySelector('i');
      const isFav = target.classList.contains('is-active');

      if (!state.isLoggedIn()) {
        state.openLoginModal({ title: 'Guardar favorito' });
        return;
      }

      // Optimistic UI update
      target.classList.toggle('is-active');
      if (icon) {
        icon.classList.remove('bi-heart', 'bi-heart-fill');
        icon.classList.add(!isFav ? 'bi-heart-fill' : 'bi-heart');
        
        // Pulse animation
        target.style.transform = 'scale(1.25)';
        setTimeout(() => target.style.transform = '', 200);
      }

      const fav = useFavorites();
      try {
        if (isFav) {
          await fav.remove(carId);
          userFavorites.delete(carId);
        } else {
          await fav.add(carId);
          userFavorites.add(carId);
        }
      } catch (err) {
        // Revert UI on error
        console.warn('[HOME] Error toggling favorite:', err.message);
        target.classList.toggle('is-active');
        if (icon) {
          icon.classList.remove('bi-heart', 'bi-heart-fill');
          icon.classList.add(isFav ? 'bi-heart-fill' : 'bi-heart');
        }
        state.showMessage('Error al actualizar favorito', 'error');
      }
    }

    if (action === 'share') {
      e.stopPropagation();
      const url = window.location.origin + '#vehicles/detail/' + carId;
      try {
        await navigator.clipboard.writeText(url);
        const originalHtml = target.innerHTML;
        target.innerHTML = '<i class="bi bi-check-lg"></i>';
        setTimeout(() => { target.innerHTML = originalHtml; }, 2000);
      } catch {
        alert('Enlace copiado: ' + url);
      }
    }
  });

  document.getElementById('homeSearchBtn')?.addEventListener('click', filterCars);
  document.getElementById('homeSearchInput')?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterCars();
  });
  document.getElementById('homeFilterBrand')?.addEventListener('change', filterCars);
  document.getElementById('homeFilterPrice')?.addEventListener('change', filterCars);
  document.getElementById('homeFilterYear')?.addEventListener('change', filterCars);
  document.getElementById('homeFilterFeature')?.addEventListener('change', filterCars);

  document.getElementById('homeSaveSearchBtn')?.addEventListener('click', async () => {
    if (!state.isLoggedIn()) {
      state.requireAuth(() => {});
      return;
    }
    const filters = buildFilters();
    delete filters.status;
    try {
      const api = useApi('/saved-searches');
      await api.post('', { filters });
      const btn = document.getElementById('homeSaveSearchBtn');
      if (btn) {
        btn.innerHTML = '<i class="bi bi-check-lg" style="color:#22c55e;"></i>';
        setTimeout(() => {
          btn.innerHTML = '<i class="bi bi-bookmark-plus"></i>';
        }, 2000);
      }
    } catch (err) {
      console.warn('Error guardando busqueda:', err.message);
    }
  });
}

function updateAuthUI() {
  const container = document.querySelector('.home-auth');
  if (!container) return;

  if (state.isLoggedIn()) {
    const s = state.getSession();
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="color:#f97316;font-size:12px;font-weight:600;">${s?.name || ''}</span>
        <button type="button" class="home-auth-btn" data-navigate="dashboard">Mi cuenta</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button type="button" class="home-auth-btn" data-navigate="auth/login">Iniciar sesion</button>
      <button type="button" class="home-auth-btn-primary" data-navigate="auth/register">Crear cuenta</button>
    `;
  }
}

export default {
  async init() {
    updateAuthUI();
    unsubscribeState = state.subscribe(() => {
      updateAuthUI();
      this.fetchUserFavorites();
    });
    
    await this.fetchUserFavorites();
    await loadFeatures();
    populateFilterOptions();
    fetchPublications();
    setupActions();
  },

  async fetchUserFavorites() {
    if (!state.isLoggedIn()) {
      userFavorites.clear();
      return;
    }
    try {
      const fav = useFavorites();
      const items = await fav.getAll();
      userFavorites = new Set(items.map(f => f.publicationId));
    } catch (err) {
      console.warn('[HOME] Error fetching user favorites:', err.message);
    }
  },

  destroy() {
    if (unsubscribeState) {
      unsubscribeState();
      unsubscribeState = null;
    }
  },

  getPublications() {
    return publications;
  }
};
