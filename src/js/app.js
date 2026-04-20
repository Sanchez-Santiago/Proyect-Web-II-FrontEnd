// ==========================================
// DriveRoom - Single File App (No ES Modules)
// ==========================================

// ------------------------------------------
// DATA - Datos de vehículos
// ------------------------------------------
const CARS_DATA = [
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
    seller: { name: 'Juan Pérez', type: 'particular', verified: true, phone: '+54 9 351 123 4567' }
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
    seller: { name: 'Auto Motors', type: 'agencia', verified: true, phone: '+54 9 351 987 6543' }
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
    seller: { name: 'María González', type: 'particular', verified: false, phone: '+54 9 351 456 7890' }
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
    seller: { name: 'Camiones SA', type: 'agencia', verified: true, phone: '+54 9 351 111 2222' }
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
    seller: { name: 'Lucas García', type: 'particular', verified: true, phone: '+54 9 351 333 4444' }
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
    seller: { name: 'Autos Córdoba', type: 'agencia', verified: true, phone: '+54 9 351 555 6666' }
  }
];

// ------------------------------------------
// STATE - Gestión de estado
// ------------------------------------------
const STORAGE_KEY = 'driveroom_session';

const AppState = {
  session: null,
  currentView: 'home',
  pendingAction: null,
  loginModalOptions: { showRegister: false },
  listeners: [],

  init() {
    this.session = this.readSession();
  },

  readSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveSession(sessionData) {
    this.session = sessionData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    this.notify();
  },

  clearSession() {
    this.session = null;
    localStorage.removeItem(STORAGE_KEY);
    this.notify();
  },

  isLoggedIn() {
    return this.session !== null && this.session.email;
  },

  hasAdminAccess() {
    if (!this.session) return false;
    return this.session.isAdmin === true || this.session.role === 'admin';
  },

  getRole() {
    return this.session ? this.session.role : null;
  },

  requireAuth(actionCallback) {
    if (this.isLoggedIn()) {
      actionCallback();
    } else {
      this.pendingAction = actionCallback;
      this.openLoginModal({ showModal: true });
    }
  },

  executePendingAction() {
    if (this.pendingAction && this.isLoggedIn()) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  openLoginModal(options = {}) {
    this.loginModalOptions = { showModal: true, ...options };
    this.notify();
  },

  closeLoginModal() {
    this.loginModalOptions = { showRegister: false };
    this.pendingAction = null;
  },

  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  },

  subscribe(listener) {
    this.listeners.push(listener);
  },

  notify() {
    this.listeners.forEach(fn => fn(this.currentView, this.session));
  },

  getCarById(id) {
    return CARS_DATA.find(c => c.id == id);
  },

  getAllCars() {
    return CARS_DATA;
  }
};

// ------------------------------------------
// ROUTER - Gestión de rutas
// ------------------------------------------
const Routes = {
  '': { template: 'src/views/home.html', title: 'DriveRoom | Autos usados con IA' },
  'home': { template: 'src/views/home.html', title: 'DriveRoom | Autos usados con IA' },
  'login': { template: 'src/views/login.html', title: 'Login | DriveRoom' },
  'car-detail': { template: 'src/views/car-detail.html', title: 'Detalle del auto | DriveRoom' },
  'role': { template: 'src/views/role.html', title: 'Elegir acceso | DriveRoom' },
  'menu-buyer': { template: 'src/views/menu-buyer.html', title: 'Menu comprador | DriveRoom' },
  'menu-seller': { template: 'src/views/menu-seller.html', title: 'Menu vendedor | DriveRoom' },
  'menu-admin': { template: 'src/views/menu-admin.html', title: 'Menu administrador | DriveRoom' },
  'profile-buyer': { template: 'src/views/profile-buyer.html', title: 'Gestionar perfil comprador | DriveRoom' },
  'profile-seller': { template: 'src/views/profile-seller.html', title: 'Gestionar perfil vendedor | DriveRoom' }
};

function navigateTo(hash) {
  window.location.hash = hash;
}

async function loadView(viewName) {
  const route = Routes[viewName];
  if (!route) {
    console.error('Vista no encontrada:', viewName);
    navigateTo('home');
    return;
  }

  const app = document.getElementById('app');
  
  try {
    const response = await fetch(route.template);
    if (!response.ok) throw new Error('Template not found');
    const html = await response.text();
    app.innerHTML = html;
    document.title = route.title;

    AppState.setView(viewName);
    
    // Initialize view-specific functionality
    if (viewName === 'home') {
      initHomeView();
    } else if (viewName === 'login') {
      initLoginView();
    } else if (viewName === 'car-detail') {
      initCarDetailView();
    } else if (viewName === 'role') {
      initRoleView();
    }
    
  } catch (error) {
    console.error('Error loading view:', error);
    app.innerHTML = '<div class="error-view"><h1>Error cargando la vista</h1><p>Por favor recarga la página.</p></div>';
  }
}

function handleRouteChange() {
  let hash = window.location.hash.slice(1);
  
  if (!hash || hash === '') {
    loadView('home');
    return;
  }
  
  if (hash.startsWith('car-detail')) {
    const carId = hash.split('/')[1];
    if (carId) {
      window.carDetailId = carId;
      loadView('car-detail');
      return;
    }
  }
  
  const viewName = hash;
  const route = Routes[viewName];
  
  // Check if route exists
  if (!route) {
    loadView('home');
    return;
  }
  
  loadView(viewName);
}

// ------------------------------------------
// HOME VIEW - Funcionalidad del home
// ------------------------------------------
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
        <button type="button" class="home-car-detail-btn" data-navigate="vehicles/detail/${car.id}">Ver detalle</button>
        <button type="button" class="home-car-compare-btn" data-action="compare" data-car-id="${car.id}">
          <i class="bi bi-arrow-left-right"></i>
        </button>
      </div>
    </div>
  `;
  return card;
}

function renderHomeCars() {
  const grid = document.getElementById('homeCarsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  CARS_DATA.forEach(car => {
    grid.appendChild(createCarCard(car));
  });
}

function initHomeView() {
  renderHomeCars();
  setupHomeActions();
}

// ------------------------------------------
// LOGIN VIEW - Funcionalidad de login
// ------------------------------------------
function initLoginView() {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const message = document.getElementById('loginMessage');

  if (!form || !emailInput || !message) return;

  function setMessage(text, type) {
    message.textContent = text;
    message.classList.remove('error', 'success');
    if (type) message.classList.add(type);
  }

  function resolveUserRole(email) {
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === 'admin@driveroom.com' || normalizedEmail.includes('admin')) {
      return 'admin';
    }
    return 'user';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      setMessage('Ingresa tu correo para continuar.', 'error');
      emailInput.focus();
      return;
    }

    if (!emailIsValid) {
      setMessage('El formato del email no es válido.', 'error');
      emailInput.focus();
      return;
    }

    const role = resolveUserRole(email);
    const sessionUser = {
      email,
      role,
      isAdmin: role === 'admin',
    };

    AppState.saveSession(sessionUser);
    setMessage('Acceso validado. Redirigiendo para elegir tu modo de ingreso.', 'success');

    window.setTimeout(function () {
      navigateTo('role');
    }, 600);
  });
}

function setupHomeActions() {
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (AppState.isLoggedIn()) {
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
        AppState.requireAuth(() => {
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
      if (AppState.isLoggedIn()) {
        alert('Función de comparar en desarrollo');
      } else {
        AppState.requireAuth(() => {
          alert('Función de comparar en desarrollo');
        });
      }
    });
  });

  document.querySelectorAll('[data-navigate]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.navigate;
      const carId = link.dataset.carId;
      if (carId) {
        navigateTo(view + '/' + carId);
      } else {
        navigateTo(view);
      }
    });
  });

  document.querySelectorAll('[data-action="login"]').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.openLoginModal();
    });
  });

  document.querySelectorAll('[data-action="register"]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('login');
    });
  });
}

// ------------------------------------------
// CAR DETAIL VIEW - Funcionalidad de detalle
// ------------------------------------------
function initCarDetailView() {
  const carId = window.carDetailId;
  const car = AppState.getCarById(carId);

  if (!car) {
    document.getElementById('app').innerHTML = '<div class="error-view"><h1>Auto no encontrado</h1><p>El vehículo que buscas no existe.</p></div>';
    return;
  }

  const mainImage = document.getElementById('carMainImage');
  const carScore = document.getElementById('carScore');
  const carLocation = document.getElementById('carLocation');
  const carTitle = document.getElementById('carTitle');
  const carPrice = document.getElementById('carPrice');
  const carSpecs = document.getElementById('carSpecs');
  const sellerName = document.getElementById('sellerName');
  const sellerType = document.getElementById('sellerType');
  const sellerVerified = document.getElementById('sellerVerified');

  if (mainImage) mainImage.src = car.image;
  if (carScore) carScore.innerHTML = `${car.score}% <small>Match</small>`;
  if (carLocation) carLocation.textContent = car.location;
  if (carTitle) carTitle.textContent = `${car.brand} ${car.model} ${car.year}`;
  if (carPrice) carPrice.textContent = car.priceFormatted;

  if (carSpecs) {
    carSpecs.innerHTML = `
      <div class="car-detail-spec"><i class="bi bi-speedometer2"></i><div><span>Kilometraje</span><strong>${car.mileageFormatted}</strong></div></div>
      <div class="car-detail-spec"><i class="bi bi-gear"></i><div><span>Transmisión</span><strong>${car.transmission}</strong></div></div>
      <div class="car-detail-spec"><i class="bi bi-fuel-pump"></i><div><span>Combustible</span><strong>${car.fuel}</strong></div></div>
      <div class="car-detail-spec"><i class="bi bi-calendar"></i><div><span>Año</span><strong>${car.year}</strong></div></div>
    `;
  }

  if (sellerName) sellerName.textContent = car.seller.name;
  if (sellerType) sellerType.textContent = car.seller.type === 'agencia' ? 'Agencia/Concesionaria' : 'Particular';
  if (sellerVerified && car.seller.verified) {
    sellerVerified.innerHTML = '<i class="bi bi-patch-check-fill"></i> Verificado';
  }

  setupCarDetailActions();
}

function setupCarDetailActions() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(el.dataset.navigate);
    });
  });

  document.querySelectorAll('[data-action="favorite"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (AppState.isLoggedIn()) {
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
        AppState.requireAuth(() => {
          btn.classList.add('is-active');
          btn.querySelector('i').classList.remove('bi-heart');
          btn.querySelector('i').classList.add('bi-heart-fill');
        });
      }
    });
  });

  document.querySelectorAll('[data-action="contact"]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (AppState.isLoggedIn()) {
        const car = AppState.getCarById(window.carDetailId);
        alert('Contacto: ' + car.seller.phone);
      } else {
        AppState.requireAuth(() => {
          const car = AppState.getCarById(window.carDetailId);
          alert('Contacto: ' + car.seller.phone);
        });
      }
    });
  });

  ['offer', 'compare'].forEach(action => {
    document.querySelectorAll(`[data-action="${action}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        if (AppState.isLoggedIn()) {
          alert('Función en desarrollo');
        } else {
          AppState.requireAuth(() => {
            alert('Función en desarrollo');
          });
        }
      });
    });
  });
}

// ------------------------------------------
// ROLE VIEW - Funcionalidad de selección de rol
// ------------------------------------------
function initRoleView() {
  const grid = document.getElementById('roleAccessGrid');
  const welcome = document.getElementById('roleAccessWelcome');

  if (!grid) return;

  function hasAdminAccess() {
    return AppState.isLoggedIn() && AppState.hasAdminAccess();
  }

  function renderWelcome() {
    if (!welcome || !AppState.session || !AppState.session.email) return;
    const accessLabel = hasAdminAccess() ? 'Administrador habilitado' : 'Acceso estándar';
    welcome.hidden = false;
    welcome.textContent = AppState.session.email + ' • ' + accessLabel;
  }

  function createAdminCard() {
    if (document.querySelector('.role-card-admin')) return;
    const card = document.createElement('article');
    card.className = 'role-card role-card-admin';
    card.innerHTML = `
      <div class="role-card-header">
        <div class="role-card-icon"><i class="bi bi-shield-lock-fill"></i></div>
        <span class="role-card-badge">Administrador</span>
      </div>
      <h2>Acceder como administrador</h2>
      <p>Disponible solo para cuentas con permisos de gestión.</p>
      <ul>
        <li><i class="bi bi-check-circle-fill"></i> Gestión centralizada de usuarios.</li>
        <li><i class="bi bi-check-circle-fill"></i> Control de validaciones y moderación.</li>
        <li><i class="bi bi-check-circle-fill"></i> Acceso a herramientas internas.</li>
        <li><i class="bi bi-check-circle-fill"></i> Vista operativa del sistema.</li>
      </ul>
      <button type="button" class="role-card-action" data-navigate="menu-admin">Continuar como administrador</button>`;
    grid.appendChild(card);
    
    card.querySelector('[data-navigate]').addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('menu-admin');
    });
  }

  // Setup navigation for existing cards
  document.querySelectorAll('.role-card-action[data-navigate]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(btn.dataset.navigate);
    });
  });

  renderWelcome();
  if (hasAdminAccess()) {
    createAdminCard();
  }
}

// ------------------------------------------
// LOGIN MODAL - Funcionalidad del modal
// ------------------------------------------
function resolveUserRole(email) {
  const normalizedEmail = email.toLowerCase();
  if (normalizedEmail === 'admin@driveroom.com' || normalizedEmail.includes('admin')) {
    return 'admin';
  }
  return 'user';
}

function setLoginMessage(text, type) {
  const message = document.getElementById('loginModalMessage');
  if (!message) return;
  message.textContent = text;
  message.className = 'login-message';
  if (type) message.classList.add(type);
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.hidden = true;
  const form = document.getElementById('loginModalForm');
  if (form) form.reset();
  setLoginMessage('', '');
  AppState.closeLoginModal();
}

function openLoginModalView(options = {}) {
  const modal = document.getElementById('loginModal');
  if (!modal) return;
  
  modal.hidden = false;
  
  const title = document.getElementById('loginModalTitle');
  const subtitle = document.getElementById('loginModalSubtitle');
  const footerText = document.getElementById('loginModalFooterText');
  const footerLink = document.getElementById('loginModalFooterLink');
  
  if (options.showRegister) {
    if (title) title.textContent = 'Crear cuenta';
    if (subtitle) subtitle.textContent = 'Ingresa tu email para registrarte';
    if (footerText) footerText.textContent = '¿Ya tenés cuenta?';
    if (footerLink) footerLink.textContent = 'Iniciar sesión';
  } else {
    if (title) title.textContent = 'Iniciar sesión';
    if (subtitle) subtitle.textContent = 'Ingresa tu email para continuar';
    if (footerText) footerText.textContent = '¿No tenés cuenta?';
    if (footerLink) footerLink.textContent = 'Crear cuenta';
  }
  
  const emailInput = document.getElementById('loginModalEmail');
  if (emailInput) emailInput.focus();
}

function handleLoginSubmit(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('loginModalEmail');
  const email = emailInput?.value.trim() || '';
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  if (!email) {
    setLoginMessage('Ingresa tu correo para continuar.', 'error');
    emailInput?.focus();
    return;
  }
  
  if (!emailIsValid) {
    setLoginMessage('El formato del email no es válido.', 'error');
    emailInput?.focus();
    return;
  }
  
  const role = resolveUserRole(email);
  const sessionUser = {
    email,
    role,
    isAdmin: role === 'admin',
  };
  
  AppState.saveSession(sessionUser);
  setLoginMessage('¡Bienvenido! Redirigiendo...', 'success');
  
  setTimeout(() => {
    closeLoginModal();
    AppState.executePendingAction();
    
    const options = AppState.loginModalOptions;
    if (options.showRegister) {
      navigateTo('role');
    }
  }, 600);
}

function setupLoginModal() {
  const closeBtn = document.getElementById('closeLoginModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLoginModal);
  }
  
  const overlay = document.querySelector('.login-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeLoginModal);
  }
  
  const form = document.getElementById('loginModalForm');
  if (form) {
    form.addEventListener('submit', handleLoginSubmit);
  }
  
  const footerLink = document.getElementById('loginModalFooterLink');
  if (footerLink) {
    footerLink.addEventListener('click', (e) => {
      e.preventDefault();
      const options = AppState.loginModalOptions;
      openLoginModalView({ showRegister: !options.showRegister });
    });
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('loginModal');
      if (modal && !modal.hidden) {
        closeLoginModal();
      }
    }
  });
}

// ------------------------------------------
// MAIN INIT - Inicialización de la app
// ------------------------------------------
async function initApp() {
  AppState.init();
  
  const app = document.getElementById('app');
  
  // Load login modal HTML FIRST (before subscribing to state)
  try {
    const response = await fetch('./src/views/login-modal.html');
    const modalHtml = await response.text();
    app.insertAdjacentHTML('beforeend', modalHtml);
    setupLoginModal();
  } catch (e) {
    console.warn('No se pudo cargar el modal de login');
  }
  
  // THEN subscribe to state changes
  AppState.subscribe((view, session) => {
    const modal = document.getElementById('loginModal');
    if (!modal) return;
    
    const options = AppState.loginModalOptions;
    if (options.showRegister || AppState.pendingAction) {
      modal.hidden = false;
      openLoginModalView(options);
    } else if (!AppState.pendingAction) {
      modal.hidden = true;
    }
  });
  
  // Setup route change listener
  window.addEventListener('hashchange', handleRouteChange);
  
  // Set default route
  if (!window.location.hash) {
    window.location.hash = 'home';
  }
  
  // Handle initial route
  handleRouteChange();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
