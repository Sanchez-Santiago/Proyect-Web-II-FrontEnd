import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';
import { getCars, getCarById } from '../../data/cars.js';

let cars = [];
let isInspector = false;

console.log('[HOME] Module loaded, state.isLoggedIn():', state.isLoggedIn());

function createCarCard(car) {
  const card = document.createElement('article');
  card.className = 'home-car-card';
  
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += i <= rating ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
    }
    return stars;
  }
  
  function renderConditionBar(label, value) {
    const percentage = (value / 5) * 100;
    const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#eab308' : '#ef4444';
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
   
  const conditionClass = car.condition === 'Excelente' ? 'excellent' : car.condition === 'Bueno' ? 'good' : 'regular';
  const scoreColor = car.score >= 85 ? '#22c55e' : car.score >= 70 ? '#eab308' : '#ef4444';
  const scoreWidth = Math.max(car.score - 10, 20);
    
  card.innerHTML = `
    <div class="home-car-image">
      <img src="${car.image}" alt="${car.brand} ${car.model}" />
      <div class="home-car-score-container" style="position:absolute;top:0.75rem;right:0.75rem;display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div style="display:flex;align-items:center;gap:6px;background:rgba(0,0,0,0.7);padding:6px 10px;border-radius:20px;backdrop-filter:blur(4px);">
          <span style="color:${scoreColor};font-weight:800;font-size:14px;">${car.score}%</span>
          <div style="width:40px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px;overflow:hidden;">
            <div style="width:${scoreWidth}%;height:100%;background:${scoreColor};border-radius:2px;transition:width 0.3s ease;"></div>
          </div>
        </div>
        <span style="background:rgba(0,0,0,0.7);padding:4px 8px;border-radius:12px;font-size:10px;font-weight:600;color:rgba(255,255,255,0.9);backdrop-filter:blur(4px);">Match IA</span>
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

function filterCars() {
  const searchInput = document.getElementById('homeSearchInput');
  const filterBrand = document.getElementById('homeFilterBrand');
  const filterPrice = document.getElementById('homeFilterPrice');
  const filterYear = document.getElementById('homeFilterYear');
  
  const search = searchInput?.value.toLowerCase() || '';
  const brand = filterBrand?.value.toLowerCase() || '';
  const price = filterPrice?.value || '';
  const year = filterYear?.value || '';
  
  let filtered = [...getCars()];
  
  if (search) {
    filtered = filtered.filter(car => 
      car.brand.toLowerCase().includes(search) || 
      car.model.toLowerCase().includes(search) ||
      car.year.toString().includes(search)
    );
  }
  
  if (brand) {
    filtered = filtered.filter(car => car.brand.toLowerCase() === brand);
  }
  
  if (price) {
    if (price === 'hasta-10m') {
      filtered = filtered.filter(car => car.price < 10000000);
    } else if (price === '10m-20m') {
      filtered = filtered.filter(car => car.price >= 10000000 && car.price < 20000000);
    } else if (price === '20m-35m') {
      filtered = filtered.filter(car => car.price >= 20000000 && car.price < 35000000);
    } else if (price === 'mas-35m') {
      filtered = filtered.filter(car => car.price >= 35000000);
    }
  }
  
  if (year) {
    filtered = filtered.filter(car => car.year.toString() === year);
  }
  
  cars = filtered;
  renderCars();
}

function clearFilters() {
  cars = getCars();
  renderCars();
}

function setupActions() {
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const carId = btn.dataset.carId;
      
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

export default {
  init() {
    isInspector = typeof window.getInspectorData === 'function' || state.isLoggedIn();
    console.log('[HOME] init called, isInspector:', isInspector);
    
    if (isInspector) {
      console.log('[HOME] Rendering inspector UI');
      const authContainer = document.querySelector('.home-auth');
      const inspectorData = typeof window.getInspectorData === 'function' ? window.getInspectorData() : { session: state.getSession(), notifications: [] };
      console.log('[HOME] inspectorData:', inspectorData?.session?.name);
      const unreadCount = inspectorData?.notifications?.filter(n => !n.read).length || 0;
      console.log('[HOME] unreadCount:', unreadCount);
      
      if (authContainer) {
        const userName = inspectorData?.session?.name || 'Inspector User';
        const favoritesCount = inspectorData?.favorites?.length || 0;
        authContainer.innerHTML = `
          <div style="display:flex;align-items:center;gap:16px;">
            <div style="position:relative;display:flex;align-items:center;cursor:pointer;" onclick="window.toggleInspectorNotifications(event)" title="Notificaciones">
              <i class="bi bi-bell" style="font-size:18px;color:#6b7280;"></i>
              ${unreadCount > 0 ? `
                <span style="position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;font-size:9px;font-weight:bold;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;">${unreadCount}</span>
              ` : ''}
            </div>
            <div style="position:relative;display:flex;align-items:center;cursor:pointer;" onclick="window.navigateTo('user/buyer/favorites')" title="Favoritos">
              <i class="bi bi-heart" style="font-size:18px;color:#6b7280;"></i>
              ${favoritesCount > 0 ? `
                <span style="position:absolute;top:-6px;right:-6px;background:#f97316;color:#fff;font-size:9px;font-weight:bold;min-width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;padding:0 4px;">${favoritesCount}</span>
              ` : ''}
            </div>
            <span style="color:#f97316;font-size:12px;font-weight:600;">${userName}</span>
            <button type="button" class="home-auth-btn" data-navigate="user/buyer/menu">Mi cuenta</button>
          </div>
        `;
      }
      
      window.toggleInspectorNotifications = function(e) {
        e.stopPropagation();
        
        const existing = document.getElementById('inspector-notifications-panel');
        if (existing) {
          existing.remove();
          return;
        }
        
        const inspectorData = typeof window.getInspectorData === 'function' ? window.getInspectorData() : null;
        if (!inspectorData) return;
        
        const notifications = inspectorData.notifications || [];
        const messages = inspectorData.messages || [];
        
        let html = '<div class="notification-panel">';
        html += '<div class="notification-header">';
        html += '<h4>Notificaciones</h4>';
        html += '<button type="button" onclick="document.getElementById(\'inspector-notifications-panel\').remove()" class="notification-close"><i class="bi bi-x-lg"></i></button>';
        html += '</div>';
        html += '<div class="notification-list">';
        
        if (notifications.length === 0) {
          html += '<div class="notification-empty">Sin notificaciones</div>';
        } else {
          notifications.forEach(n => {
            const icon = n.type === 'favorite' ? 'bi-heart-fill' : n.type === 'message' ? 'bi-chat-dots-fill' : 'bi-person-fill';
            const color = n.type === 'favorite' ? '#22c55e' : n.type === 'message' ? '#3b82f6' : '#eab308';
            const title = n.type === 'favorite' ? 'Nuevo favorito' : n.type === 'message' ? 'Nuevo mensaje' : 'Lead nuevo';
            const timeAgo = formatTimeAgo(n.timestamp);
            
            let clickAction = '';
            let cursorStyle = 'cursor:default;';
            
            if (n.type === 'message' || n.type === 'lead') {
              const msg = messages.find(m => m.id === n.messageId);
              const vehicleId = msg?.vehicleId || n.vehicleId || 1;
              clickAction = `onclick="window.navigateTo('messages/buyer/chat/${vehicleId}')"`;
              cursorStyle = 'cursor:pointer;';
            }
            
            html += `
              <div class="notification-item" style="border-left-color:${color};${cursorStyle}" ${clickAction}>
                <div class="notification-icon" style="color:${color};"><i class="bi ${icon}"></i></div>
                <div class="notification-content">
                  <div class="notification-title">${title}</div>
                  <div class="notification-message">${n.message}</div>
                  <div class="notification-time">${timeAgo}</div>
                </div>
              </div>
            `;
          });
        }
        
        html += '</div></div>';
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
          .notification-panel { position:fixed;top:60px;right:10px;width:320px;max-height:450px;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);z-index:99999;overflow:hidden; }
          .notification-header { display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid #e5e7eb; }
          .notification-header h4 { margin:0;font-size:16px;font-weight:600;color:#111; }
          .notification-close { background:none;border:none;cursor:pointer;color:#6b7280;font-size:18px; }
          .notification-close:hover { color:#111; }
          .notification-list { max-height:380px;overflow-y:auto; }
          .notification-item { display:flex;gap:12px;padding:14px;border-left:3px solid #e5e7eb;background:#f9fafb;border-radius:0 8px 8px 0;margin:8px 12px;transition:all 0.2s; }
          .notification-item:hover { background:#f3f4f6; }
          .notification-icon { font-size:18px; }
          .notification-content { flex:1; }
          .notification-title { font-size:12px;font-weight:600;color:#111; }
          .notification-message { font-size:11px;color:#444;margin:2px 0; }
          .notification-time { font-size:10px;color:#9ca3af; }
          .notification-empty { padding:24px;text-align:center;color:#6b7280;font-size:13px; }
        `;
        document.head.appendChild(style);
        
        const panel = document.createElement('div');
        panel.id = 'inspector-notifications-panel';
        panel.innerHTML = html;
        document.body.appendChild(panel);
        
        setTimeout(() => {
          document.addEventListener('click', function closePanel(e) {
            const panel = document.getElementById('inspector-notifications-panel');
            const bell = e.target.closest('[onclick*="toggleInspectorNotifications"]');
            if (panel && !panel.contains(e.target) && !bell) {
              panel.remove();
              document.removeEventListener('click', closePanel);
            }
          });
        }, 100);
      };
      
      function formatTimeAgo(timestamp) {
        if (!timestamp) return '';
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'Ahora';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
        return Math.floor(diff / 86400000) + 'd';
      }
      
      window.navigateTo = function(hash) {
        const panel = document.getElementById('inspector-notifications-panel');
        if (panel) panel.remove();
        window.location.hash = '#' + hash;
      };
    }
    
    cars = getCars();
    renderCars();
    setupActions();
  },
  
  getCars() {
    return cars;
  },
  
  getCarById(id) {
    return getCarById(id);
  }
};