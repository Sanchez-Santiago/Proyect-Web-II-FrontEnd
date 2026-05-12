import { navigateTo } from '../../../js/router.js';
import { getCars } from '../../../data/cars.js';

const isInspector = typeof window.getInspectorData === 'function';
const isInspectorRoleSwitch = typeof window.toggleInspectorRole === 'function';

export default {
  init() {
    this.setupInspectorSwitch();
    this.renderMarket();
    this.setupNavigation();
    this.setupMarketActions();
  },

  setupInspectorSwitch() {
    if (!isInspector || !isInspectorRoleSwitch) return;

    const sidebar = document.querySelector('.menu-sidebar');
    if (!sidebar) return;

    const switchBtn = document.createElement('button');
    switchBtn.type = 'button';
    switchBtn.className = 'menu-inspector-switch';
    switchBtn.textContent = '🕵️ Cambiar a Vendedor';
    switchBtn.addEventListener('click', () => {
      window.toggleInspectorRole();
    });

    const style = document.createElement('style');
    style.textContent = `
      .menu-inspector-switch {
        width: 100%;
        padding: 10px 12px;
        background: rgba(249,115,22,0.15);
        border: 1px solid rgba(249,115,22,0.3);
        border-radius: 6px;
        color: #f97316;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 8px;
        transition: all 0.2s;
      }
      .menu-inspector-switch:hover {
        background: rgba(249,115,22,0.25);
      }
    `;
    document.head.appendChild(style);

    sidebar.appendChild(switchBtn);
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  },

  renderMarket() {
    const list = document.getElementById('buyerMarketList');
    const count = document.getElementById('buyerMarketCount');
    if (!list) return;

    const cars = getCars();
    if (count) {
      count.textContent = `${cars.length} autos`;
    }

    list.innerHTML = cars.map(car => {
      const title = `${car.brand} ${car.model} ${car.year}`;
      const sellerType = car.seller?.type === 'agencia' ? 'Agencia' : 'Particular';
      const description = car.description.length > 145 ? `${car.description.slice(0, 145)}...` : car.description;

      return `
        <article class="menu-buyer-market-card">
          <a class="menu-buyer-market-image" href="#vehicles/detail/${car.id}" data-car-action="detail" data-car-id="${car.id}" aria-label="Ver ${title}">
            <img src="${car.image}" alt="${title}" loading="lazy" />
          </a>

          <div class="menu-buyer-market-info">
            <div class="menu-buyer-market-title-row">
              <div>
                <h2>${title}</h2>
                <p>${car.location} · ${sellerType}</p>
              </div>
              <button type="button" class="menu-buyer-fav-btn" aria-label="Guardar ${title}">
                <i class="bi bi-heart"></i>
              </button>
            </div>

            <strong class="menu-buyer-market-price">${car.priceFormatted}</strong>

            <div class="menu-buyer-market-specs">
              <span><i class="bi bi-speedometer2"></i>${car.mileageFormatted}</span>
              <span><i class="bi bi-gear"></i>${car.transmission}</span>
              <span><i class="bi bi-fuel-pump"></i>${car.fuel}</span>
              <span><i class="bi bi-patch-check"></i>${car.condition}</span>
            </div>

            <p class="menu-buyer-market-description">${description}</p>

            <div class="menu-buyer-market-footer">
              <span class="menu-buyer-market-score">${car.score}% match IA</span>
              <div class="menu-buyer-market-actions">
                <button type="button" class="menu-buyer-ghost-btn" data-car-action="contact" data-car-id="${car.id}">
                  Consultar
                </button>
                <button type="button" class="menu-buyer-primary-btn" data-car-action="detail" data-car-id="${car.id}">
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  },

  setupMarketActions() {
    document.querySelectorAll('[data-car-action]').forEach(action => {
      action.addEventListener('click', (e) => {
        e.preventDefault();
        const carId = action.getAttribute('data-car-id');
        const type = action.getAttribute('data-car-action');

        if (type === 'contact') {
          navigateTo(`messages/buyer/chat/${carId}`);
          return;
        }

        navigateTo(`vehicles/detail/${carId}`);
      });
    });
  }
};
