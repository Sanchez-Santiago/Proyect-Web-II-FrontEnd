import { navigateTo } from '../router.js';
import state from '../state.js';
import home from './home.js';

export default {
  init() {
    this.renderCarDetail();
    this.setupActions();
  },

  renderCarDetail() {
    const carId = window.carDetailId;
    const car = home.getCarById(carId);

    if (!car) {
      document.getElementById('app').innerHTML = '<div class="error-view"><h1>Auto no encontrado</h1><p>El vehículo que buscas no existe.</p><button data-navigate="home" class="home-auth-btn-primary" style="margin-top:1rem;padding:0.75rem 1.5rem;border-radius:12px;cursor:pointer;">Volver al inicio</button></div>';
      return;
    }

    document.getElementById('carMainImage').src = car.image;
    document.getElementById('carMainImage').alt = `${car.brand} ${car.model}`;
    document.getElementById('carScore').innerHTML = `${car.score}% <small>Match</small>`;
    document.getElementById('carLocation').textContent = car.location;
    document.getElementById('carTitle').textContent = `${car.brand} ${car.model} ${car.year}`;
    document.getElementById('carPrice').textContent = car.priceFormatted;

    const specsHtml = `
      <div class="car-detail-spec">
        <i class="bi bi-speedometer2"></i>
        <div>
          <span>Kilometraje</span>
          <strong>${car.mileageFormatted}</strong>
        </div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-gear"></i>
        <div>
          <span>Transmisión</span>
          <strong>${car.transmission}</strong>
        </div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-fuel-pump"></i>
        <div>
          <span>Combustible</span>
          <strong>${car.fuel}</strong>
        </div>
      </div>
      <div class="car-detail-spec">
        <i class="bi bi-calendar"></i>
        <div>
          <span>Año</span>
          <strong>${car.year}</strong>
        </div>
      </div>
    `;
    document.getElementById('carSpecs').innerHTML = specsHtml;

    document.getElementById('sellerName').textContent = car.seller.name;
    
    const sellerTypeLabels = {
      'particular': 'Particular',
      'agencia': 'Agencia/Concesionaria'
    };
    document.getElementById('sellerType').textContent = sellerTypeLabels[car.seller.type] || car.seller.type;

    if (car.seller.verified) {
      document.getElementById('sellerVerified').innerHTML = '<i class="bi bi-patch-check-fill"></i> Verificado';
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
          const carId = window.carDetailId;
          const car = home.getCarById(carId);
          alert(`Contacto: ${car.seller.phone}`);
        } else {
          state.requireAuth(() => {
            const carId = window.carDetailId;
            const car = home.getCarById(carId);
            alert(`Contacto: ${car.seller.phone}`);
          });
        }
      });
    });

    document.querySelectorAll('[data-action="offer"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          alert('Función de oferta en desarrollo');
        } else {
          state.requireAuth(() => {
            alert('Función de oferta en desarrollo');
          });
        }
      });
    });

    document.querySelectorAll('[data-action="compare"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isLoggedIn()) {
          alert('Función de comparar en desarrollo');
        } else {
          state.requireAuth(() => {
            alert('Función de comparar en desarrollo');
          });
        }
      });
    });
  }
};
