import state from './state.js';

const INSPECTOR_MODE = true;
const INSPECTOR_KEY = 'driveroom_inspector_session';

console.log('[INSPECTOR] Mode:', INSPECTOR_MODE);

const INSPECTOR_DATA = {
  session: {
    id: 1,
    name: 'Inspector User',
    email: 'inspector@driveroom.com',
    role: 'buyer',
    roles: ['buyer'],
    avatar: null,
    phone: '+5491155555555',
    createdAt: '2024-01-01T00:00:00Z'
  },
  vehicles: [
    { id: 1, brand: 'Toyota', model: 'Corolla', year: 2021, price: 14500000, km: 25000, fuel: 'Nafta', transmission: 'Manual', images: [], status: 'active' },
    { id: 2, brand: 'Honda', model: 'Civic', year: 2020, price: 12500000, km: 35000, fuel: 'Nafta', transmission: 'CVT', images: [], status: 'active' },
    { id: 3, brand: 'Volkswagen', model: 'Polo', year: 2021, price: 11900000, km: 18000, fuel: 'Nafta', transmission: 'Manual', images: [], status: 'active' },
    { id: 4, brand: 'Volkswagen', model: 'Amarok', year: 2020, price: 24900000, km: 45000, fuel: 'Diiesel', transmission: 'Manual', images: [], status: 'active' },
    { id: 5, brand: 'Peugeot', model: '208', year: 2022, price: 16300000, km: 12000, fuel: 'Nafta', transmission: 'Manual', images: [], status: 'active' },
    { id: 6, brand: 'Chevrolet', model: 'Cruze', year: 2018, price: 9800000, km: 55000, fuel: 'Nafta', transmission: 'Manual', images: [], status: 'active' }
  ],
  favorites: [1, 3, 5],
  messages: [
    { id: 1, vehicleId: 1, fromUserId: 2, fromName: 'Juan Pérez', lastMessage: 'Me interesa el auto, está disponible?', unread: true, timestamp: Date.now() - 7200000 },
    { id: 2, vehicleId: 3, fromUserId: 3, fromName: 'Auto Motors', lastMessage: 'Te envío más fotos del auto', unread: true, timestamp: Date.now() - 86400000 }
  ],
  notifications: [
    { id: 1, type: 'favorite', messageId: 1, vehicleId: 1, message: 'Toyota Corolla guardado en favoritos', timestamp: Date.now() - 3600000, read: false },
    { id: 2, type: 'message', messageId: 1, vehicleId: 1, message: 'Juan te contactó sobre Corolla', timestamp: Date.now() - 7200000, read: false },
    { id: 3, type: 'lead', messageId: 1, vehicleId: 1, message: 'Carlos López interesado en tu auto', timestamp: Date.now() - 14400000, read: false }
  ]
};

function initInspectorSession() {
  console.log('[INSPECTOR] initInspectorSession called');
  const saved = localStorage.getItem(INSPECTOR_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      INSPECTOR_DATA.session.role = parsed.role || 'buyer';
      console.log('[INSPECTOR] Restored role from localStorage:', INSPECTOR_DATA.session.role);
    } catch (e) {
      console.warn('[INSPECTOR] Error parsing saved role:', e);
    }
  }
  localStorage.setItem('driveroom_session', JSON.stringify(INSPECTOR_DATA.session));
  console.log('[INSPECTOR] Session saved to localStorage:', INSPECTOR_DATA.session);
}

function getInspectorData() {
  return INSPECTOR_DATA;
}

function toggleInspectorRole() {
  const newRole = INSPECTOR_DATA.session.role === 'buyer' ? 'seller' : 'buyer';
  INSPECTOR_DATA.session.role = newRole;
  INSPECTOR_DATA.session.roles = [newRole];
  localStorage.setItem(INSPECTOR_KEY, JSON.stringify({ role: newRole }));
  localStorage.setItem('driveroom_session', JSON.stringify(INSPECTOR_DATA.session));
  window.location.reload();
}

window.getInspectorData = getInspectorData;
window.toggleInspectorRole = toggleInspectorRole;

const routes = {
  '': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'DriveRoom | Autos usados con IA' },
  'home': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'DriveRoom | Autos usados con IA' },
  
  'auth/login': { template: 'src/views/auth/login.html', script: 'src/views/auth/login.js', title: 'Login | DriveRoom' },
  'auth/register': { template: 'src/views/auth/register.html', script: 'src/views/auth/register.js', title: 'Registro | DriveRoom' },
  'auth/role': { template: 'src/views/auth/role.html', script: 'src/views/auth/role.js', title: 'Elegir acceso | DriveRoom' },
  
  'vehicles/detail': { template: 'src/views/vehicles/detail.html', script: 'src/views/vehicles/detail.js', title: 'Detalle del auto | DriveRoom' },
  'vehicles/add': { template: 'src/views/vehicles/add.html', script: 'src/views/vehicles/add.js', title: 'Publicar vehiculo | DriveRoom' },
  
  'user/buyer/menu': { template: 'src/views/user/buyer/menu-buyer.html', script: 'src/views/user/buyer/menu-buyer.js', title: 'Menu comprador | DriveRoom' },
  'user/buyer/profile': { template: 'src/views/user/buyer/profile-buyer.html', script: 'src/views/user/buyer/profile-buyer.js', title: 'Gestionar perfil comprador | DriveRoom' },
  'user/buyer/favorites': { template: 'src/views/user/buyer/favorites.html', script: 'src/views/user/buyer/favorites.js', title: 'Favoritos | DriveRoom' },
  
  'messages/buyer': { template: 'src/views/messages/buyer/list.html', script: 'src/views/messages/buyer/list.js', title: 'Mensajes | DriveRoom' },
  'messages/buyer/chat': { template: 'src/views/messages/buyer/chat.html', script: 'src/views/messages/buyer/chat.js', title: 'Chat | DriveRoom' },
  
  'messages/seller': { template: 'src/views/messages/seller/list.html', script: 'src/views/messages/seller/list.js', title: 'Mensajes | DriveRoom' },
  'messages/seller/chat': { template: 'src/views/messages/seller/chat.html', script: 'src/views/messages/seller/chat.js', title: 'Chat | DriveRoom' },
  
  'user/seller/menu': { template: 'src/views/user/seller/menu-seller.html', script: 'src/views/user/seller/menu-seller.js', title: 'Menu vendedor | DriveRoom' },
  'user/seller/profile': { template: 'src/views/user/seller/profile-seller.html', script: 'src/views/user/seller/profile-seller.js', title: 'Gestionar perfil vendedor | DriveRoom' },
  
  'admin/menu': { template: 'src/views/admin/menu-admin.html', script: 'src/views/admin/menu-admin.js', title: 'Menu administrador | DriveRoom' },

  // Redirects legacy
  'login': { redirect: 'auth/login' },
  'register': { redirect: 'auth/register' },
  'role': { redirect: 'auth/role' },
  'car-detail': { redirect: 'vehicles/detail' },
  'add-vehicle': { redirect: 'vehicles/add' },
  'menu-buyer': { redirect: 'user/buyer/menu' },
  'menu-seller': { redirect: 'user/seller/menu' },
  'menu-admin': { redirect: 'admin/menu' },
  'profile-buyer': { redirect: 'user/buyer/profile' },
  'profile-seller': { redirect: 'user/seller/profile' },
  'favorites': { redirect: 'user/buyer/favorites' },
  'user/messages': { redirect: 'messages/buyer' },
  'user/messages/chat': { redirect: 'messages/buyer/chat' }
};

let currentScriptModule = null;
let currentViewName = null;

function navigateTo(hash) {
  window.location.hash = hash;
}

function extractViewName(hash) {
  if (!hash || hash === '') return 'home';
  
  if (hash.startsWith('vehicles/detail')) {
    const parts = hash.split('/');
    if (parts.length >= 2) {
      window.carDetailId = parts[1];
      return 'vehicles/detail';
    }
    return 'vehicles/detail';
  }

  if (hash.startsWith('messages/buyer/chat')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      window.chatVehicleId = parts[2];
    }
    return 'messages/buyer/chat';
  }

  if (hash.startsWith('messages/seller/chat')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      window.chatVehicleId = parts[2];
    }
    return 'messages/seller/chat';
  }
  
  const route = routes[hash];
  if (route?.redirect) return route.redirect;
  
  return routes[hash] ? hash : 'home';
}

async function loadView(viewName) {
  const route = routes[viewName];
  if (!route) {
    console.error(`Vista no encontrada: ${viewName}`);
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

    if (currentScriptModule) {
      currentScriptModule = null;
    }

    if (route.script) {
      try {
        const scriptPath = '/' + route.script;
        console.log('[ROUTER] Loading script:', scriptPath);
        const module = await import(scriptPath);
        if (module.default && typeof module.default.init === 'function') {
          currentScriptModule = module.default;
          currentScriptModule.init();
        }
      } catch (e) {
        console.warn(`No se pudo cargar script para ${viewName}:`, e.message);
      }
    }

    setupNavigation();
    currentViewName = viewName;
    state.setView(viewName);
  } catch (error) {
    console.error('Error loading view:', error);
    app.innerHTML = '<div class="error-view"><h1>Error cargando la vista</h1><p>Por favor recarga la pagina.</p></div>';
  }
}

function setupNavigation() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const view = el.dataset.navigate?.split('?')[0];
      if (view) navigateTo(view);
    });
  });
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1);
  const viewName = extractViewName(hash);
  loadView(viewName);
}

window.addEventListener('hashchange', handleRouteChange);

window.navigateTo = navigateTo;

export { navigateTo, handleRouteChange };

document.addEventListener('DOMContentLoaded', () => {
  if (INSPECTOR_MODE) {
    initInspectorSession();
    state.init();
    console.log('[INSPECTOR] State initialized, isLoggedIn:', state.isLoggedIn());
  }
  
  if (!window.location.hash) {
    window.location.hash = 'home';
  }
  handleRouteChange();
});