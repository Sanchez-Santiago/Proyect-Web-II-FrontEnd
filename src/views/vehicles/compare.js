import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';
import { formatPrice, formatMileage, translateEnum } from '../../utils/formatters.js';

const STORAGE_KEY = 'motormarket_compare';

function getCompareIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCompareIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function getConditionLabel(score) {
  if (score >= 80) return { label: 'Excelente', cls: 'is-excellent' };
  if (score >= 60) return { label: 'Bueno', cls: 'is-good' };
  if (score >= 40) return { label: 'Regular', cls: 'is-regular' };
  return { label: 'Requiere reparación', cls: 'is-poor' };
}

const rows = [
  { key: 'image', label: '' },
  { key: 'price', label: 'Precio' },
  { key: 'year', label: 'Año' },
  { key: 'mileage', label: 'Kilometraje' },
  { key: 'transmission', label: 'Transmisión' },
  { key: 'fuel', label: 'Combustible' },
  { key: 'color', label: 'Color' },
  { key: 'location', label: 'Ubicación' },
  { key: 'score', label: 'Score IA' },
  { key: 'condition', label: 'Estado IA' },
  { key: 'type', label: 'Tipo' },
  { key: 'engine', label: 'Motor' }
];

function extractVehicleData(pub) {
  const v = pub.vehicle || {};
  const a = v.analytics || {};
  return {
    id: pub.id,
    image: v.images?.[0]?.imageUrl || '',
    title: `${v.brand || ''} ${v.model || ''} ${v.year || ''}`.trim() || 'Vehículo',
    price: formatPrice(pub.price, pub.currency),
    year: v.year || '—',
    mileage: formatMileage(v.mileage),
    transmission: translateEnum(v.transmission, 'transmission'),
    fuel: translateEnum(v.fuelType, 'fuel'),
    color: v.color || '—',
    location: [pub.province, pub.city].filter(Boolean).join(', ') || '—',
    score: a.overallScore || 0,
    condition: getConditionLabel(a.overallScore || 0),
    type: v.vehicleType || '—',
    engine: v.engine || '—'
  };
}

export default {
  async init() {
    const ids = getCompareIds();
    const empty = document.getElementById('compareEmpty');
    const container = document.getElementById('compareTableContainer');

    if (ids.length < 2) {
      if (empty) empty.style.display = '';
      if (container) container.style.display = 'none';
      this.setupNavigation();
      return;
    }

    if (empty) empty.style.display = 'none';
    if (container) container.style.display = '';

    const api = useApi('/publications');
    const vehicles = [];

    try {
      const results = await Promise.allSettled(
        ids.map(id => api.get(`/${id}`))
      );

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const pub = result.value?.publication;
          if (pub) vehicles.push(extractVehicleData(pub));
        }
      });
    } catch (err) {
      console.error('Error loading comparisons:', err);
    }

    if (vehicles.length < 2) {
      if (empty) empty.innerHTML = '<i class="bi bi-exclamation-triangle"></i><h2>Error al cargar</h2><p>No se pudieron cargar suficientes vehículos para comparar.</p>';
      if (empty) empty.style.display = '';
      if (container) container.style.display = 'none';
      this.setupNavigation();
      return;
    }

    this.renderTable(vehicles);
    this.setupNavigation();

    document.getElementById('compareClearBtn')?.addEventListener('click', () => {
      setCompareIds([]);
      navigateTo('home');
    });
  },

  renderTable(vehicles) {
    const headerRow = document.getElementById('compareHeaderRow');
    const body = document.getElementById('compareBody');

    headerRow.innerHTML = '<th class="compare-label-cell">Característica</th>' +
      vehicles.map(v => `<th class="compare-car-cell">
        <div class="compare-car-title">${v.title}</div>
        <button type="button" class="compare-remove-btn" data-id="${v.id}" title="Quitar">×</button>
      </th>`).join('');

    headerRow.querySelectorAll('.compare-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const ids = getCompareIds().filter(i => i !== id);
        setCompareIds(ids);
        this.init();
      });
    });

    body.innerHTML = rows.map(row => {
      const cells = vehicles.map(v => {
        if (row.key === 'image') {
          return `<div class="compare-img-cell"><img src="${v.image}" alt="${v.title}" /></div>`;
        }
        if (row.key === 'score') {
          const color = v.score >= 80 ? '#22c55e' : v.score >= 60 ? '#eab308' : '#ef4444';
          return `<strong style="color:${color}">${v.score}%</strong>`;
        }
        if (row.key === 'condition') {
          return `<span class="compare-condition ${v.condition.cls}">${v.condition.label}</span>`;
        }
        if (row.key === 'price') {
          return `<strong>${v.price}</strong>`;
        }
        return v[row.key] || '—';
      });

      return `<tr>
        <td class="compare-label-cell">${row.label}</td>
        ${cells.map(c => `<td class="compare-value-cell">${c}</td>`).join('')}
      </tr>`;
    }).join('');
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  }
};
