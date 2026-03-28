import { navigateTo } from '../router.js';
import state from '../state.js';

const cars = [
  {
    id: 1,
    brand: 'Toyota',
    model: 'Corolla XEi',
    year: 2021,
    price: 14500000,
    priceFormatted: '$14.500.000',
    mileage: 45000,
    mileageFormatted: '45.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=600&q=80',
    score: 96,
    seller: {
      name: 'Juan Pérez',
      type: 'particular',
      verified: true,
      phone: '+54 9 351 123 4567'
    }
  },
  {
    id: 2,
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    price: 12500000,
    priceFormatted: '$12.500.000',
    mileage: 63000,
    mileageFormatted: '63.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80',
    score: 92,
    seller: {
      name: 'Auto Motors',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 987 6543'
    }
  },
  {
    id: 3,
    brand: 'Volkswagen',
    model: 'Polo',
    year: 2021,
    price: 11900000,
    priceFormatted: '$11.900.000',
    mileage: 48000,
    mileageFormatted: '48.000 km',
    transmission: 'Manual',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
    score: 89,
    seller: {
      name: 'María González',
      type: 'particular',
      verified: false,
      phone: '+54 9 351 456 7890'
    }
  },
  {
    id: 4,
    brand: 'Volkswagen',
    model: 'Amarok',
    year: 2020,
    price: 24900000,
    priceFormatted: '$24.900.000',
    mileage: 72000,
    mileageFormatted: '72.000 km',
    transmission: 'Automática',
    fuel: 'Diésel',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=600&q=80',
    score: 88,
    seller: {
      name: 'Camiones SA',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 111 2222'
    }
  },
  {
    id: 5,
    brand: 'Peugeot',
    model: '208',
    year: 2022,
    price: 16300000,
    priceFormatted: '$16.300.000',
    mileage: 28000,
    mileageFormatted: '28.000 km',
    transmission: 'Automática',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80',
    score: 91,
    seller: {
      name: 'Lucas García',
      type: 'particular',
      verified: true,
      phone: '+54 9 351 333 4444'
    }
  },
  {
    id: 6,
    brand: 'Chevrolet',
    model: 'Cruze LT',
    year: 2018,
    price: 9800000,
    priceFormatted: '$9.800.000',
    mileage: 85000,
    mileageFormatted: '85.000 km',
    transmission: 'Manual',
    fuel: 'Nafta',
    location: 'Córdoba',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    score: 74,
    seller: {
      name: 'Autos Córdoba',
      type: 'agencia',
      verified: true,
      phone: '+54 9 351 555 6666'
    }
  }
];

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(price);
}

function createCarCard(car) {
  const card = document.createElement('article');
  card.className = 'home-car-card';
  card.innerHTML = `
    <div class="home-car-image">
      <img src="${car.image}" alt="${car.brand} ${car.model}" />
      <span class="home-car-score">${car.score}% <small>Match</small></span>
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
      </div>
      <div class="home-car-meta">
        <span><i class="bi bi-calendar"></i> ${car.year}</span>
        <span><i class="bi bi-speedometer2"></i> ${car.mileageFormatted}</span>
        <span><i class="bi bi-geo-alt"></i> ${car.location}</span>
      </div>
      <div class="home-car-actions">
        <button type="button" class="home-car-detail-btn" data-navigate="car-detail" data-car-id="${car.id}">Ver detalle</button>
        <button type="button" class="home-car-compare-btn" data-action="compare" data-car-id="${car.id}">
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
  cars.forEach(car => {
    grid.appendChild(createCarCard(car));
  });
}

function setupActions() {
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const carId = btn.dataset.carId;
      const car = cars.find(c => c.id == carId);
      
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

  document.querySelectorAll('[data-action="login"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.openLoginModal();
    });
  });

  document.querySelectorAll('[data-action="register"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.openLoginModal({ showRegister: true });
    });
  });
}

export default {
  init() {
    renderCars();
    setupActions();
  },
  
  getCars() {
    return cars;
  },
  
  getCarById(id) {
    return cars.find(c => c.id == id);
  }
};
