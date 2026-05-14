/**
 * Router - Sistema de navegación SPA (Single Page Application)
 * Maneja las rutas, carga de vistas y transición entre páginas sin recargar
 * 
 * Modo Inspector: Permite simular una base de datos completa para testing
 * sin necesidad de un backend real
 */

import state from './state.js';
import { useAuth } from '../hooks/useAuth.js';

const routes = {
  '': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'MotorMarket | Autos usados con IA' },
  'home': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'MotorMarket | Autos usados con IA' },
  
  'auth/login': { template: 'src/views/auth/login.html', script: 'src/views/auth/login.js', title: 'Login | MotorMarket' },
  'auth/register': { template: 'src/views/auth/register.html', script: 'src/views/auth/register.js', title: 'Registro | MotorMarket' },
  'auth/role': { template: 'src/views/auth/role.html', script: 'src/views/auth/role.js', title: 'Elegir acceso | MotorMarket' },
  
  'vehicles/detail': { template: 'src/views/vehicles/detail.html', script: 'src/views/vehicles/detail.js', title: 'Detalle del auto | MotorMarket' },
  'vehicles/add': { template: 'src/views/vehicles/add.html', script: 'src/views/vehicles/add.js', title: 'Publicar vehiculo | MotorMarket' },
  'vehicles/compare': { template: 'src/views/vehicles/compare.html', script: 'src/views/vehicles/compare.js', title: 'Comparar | MotorMarket' },
  
  'user/buyer/menu': { template: 'src/views/user/buyer/menu-buyer.html', script: 'src/views/user/buyer/menu-buyer.js', title: 'Menu comprador | MotorMarket' },
  'user/buyer/profile': { template: 'src/views/user/buyer/profile-buyer.html', script: 'src/views/user/buyer/profile-buyer.js', title: 'Gestionar perfil comprador | MotorMarket' },
  'user/buyer/favorites': { template: 'src/views/user/buyer/favorites.html', script: 'src/views/user/buyer/favorites.js', title: 'Favoritos | MotorMarket' },
  'user/buyer/investment-advisor': { template: 'src/views/user/buyer/investment-advisor.html', script: 'src/views/user/buyer/investment-advisor.js', title: 'Insights IA | MotorMarket' },
  
  'notifications': { template: 'src/views/notifications/list.html', script: 'src/views/notifications/list.js', title: 'Notificaciones | MotorMarket' },
  'user/saved-searches': { template: 'src/views/user/saved-searches/list.html', script: 'src/views/user/saved-searches/list.js', title: 'Búsquedas guardadas | MotorMarket' },
  'messages/buyer': { template: 'src/views/messages/buyer/list.html', script: 'src/views/messages/buyer/list.js', title: 'Mensajes | MotorMarket' },
  'messages/buyer/chat': { template: 'src/views/messages/buyer/chat.html', script: 'src/views/messages/buyer/chat.js', title: 'Chat | MotorMarket' },
  
  'messages/seller': { template: 'src/views/messages/seller/list.html', script: 'src/views/messages/seller/list.js', title: 'Mensajes | MotorMarket' },
  'messages/seller/chat': { template: 'src/views/messages/seller/chat.html', script: 'src/views/messages/seller/chat.js', title: 'Chat | MotorMarket' },
  
  'user/seller/menu': { template: 'src/views/user/seller/menu-seller.html', script: 'src/views/user/seller/menu-seller.js', title: 'Menu vendedor | MotorMarket' },
  'user/seller/profile': { template: 'src/views/user/seller/profile-seller.html', script: 'src/views/user/seller/profile-seller.js', title: 'Gestionar perfil vendedor | MotorMarket' },
  'user/seller/publications': { template: 'src/views/user/seller/publications.html', script: 'src/views/user/seller/publications.js', title: 'Mis publicaciones | MotorMarket' },
  
  'admin/menu': { template: 'src/views/admin/menu-admin.html', script: 'src/views/admin/menu-admin.js', title: 'Menu administrador | MotorMarket' },
  'admin/alerts': { template: 'src/views/admin/alerts-admin.html', script: 'src/views/admin/alerts-admin.js', title: 'Alertas | MotorMarket' },
  'admin/analytics': { template: 'src/views/admin/analytics-admin.html', script: 'src/views/admin/analytics-admin.js', title: 'Analíticas | MotorMarket' },
  'admin/engine': { template: 'src/views/admin/engine-admin.html', script: 'src/views/admin/engine-admin.js', title: 'Motor | MotorMarket' },
  'admin/users': { template: 'src/views/admin/users-admin.html', script: 'src/views/admin/users-admin.js', title: 'Gestión de Usuarios | MotorMarket' },
  'admin/publications': { template: 'src/views/admin/publications-admin.html', script: 'src/views/admin/publications-admin.js', title: 'Moderación de Avisos | MotorMarket' },
  'dashboard': { template: 'src/views/dashboard/index.html', script: 'src/views/dashboard/index.js', title: 'Dashboard | MotorMarket' },


  'user/seller/sales': { template: 'src/views/user/seller/sales.html', script: 'src/views/user/seller/sales.js', title: 'Ventas | MotorMarket' },
  'user/seller/insights': { template: 'src/views/user/seller/insights.html', script: 'src/views/user/seller/insights.js', title: 'Insights IA | MotorMarket' },

  // Redirects legacy
  'login': { redirect: 'auth/login' },
  'register': { redirect: 'auth/register' },
  'role': { redirect: 'auth/role' },
  'car-detail': { redirect: 'vehicles/detail' },
  'vehicle/add': { redirect: 'vehicles/add' },
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
  if (currentViewName) {
    const stateData = { view: currentViewName, scrollY: window.scrollY };
    history.replaceState(stateData, '');
  }
  window.location.hash = hash;
}

function extractViewName(hash) {
  if (!hash || hash === '') return 'home';
  
  if (hash.startsWith('vehicles/detail')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      state.setParams({ carDetailId: parts[2] });
      return 'vehicles/detail';
    }
    return 'vehicles/detail';
  }

  if (hash.startsWith('messages/buyer/chat')) {
    const parts = hash.split('/');
    if (parts.length >= 4) {
      state.setParams({ chatId: parts[3] });
    }
    return 'messages/buyer/chat';
  }

  if (hash.startsWith('messages/seller/chat')) {
    const parts = hash.split('/');
    if (parts.length >= 4) {
      state.setParams({ chatId: parts[3] });
    }
    return 'messages/seller/chat';
  }
  
  const route = routes[hash];
  if (route?.redirect) return route.redirect;
  
  return routes[hash] ? hash : 'home';
}

async function loadView(viewName) {
  // Global Admin Guard
  if (viewName.startsWith('admin/') && !state.hasAdminAccess()) {
    console.warn(`[ROUTER] Acceso denegado a "${viewName}".`);
    state.showMessage('No tienes permisos de administrador', 'error');
    return;
  }

  const route = routes[viewName];
  if (!route) {
    console.error(`[ROUTER] Vista no encontrada: "${viewName}" (Hash: ${window.location.hash})`);
    navigateTo('home');
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><div class="loading-text">Cargando...</div></div>';
  
  try {
    const response = await fetch(route.template);
    if (!response.ok) throw new Error('Template not found');
    const html = await response.text();
    app.innerHTML = html;

    if (!state.hasAdminAccess()) {
      app.querySelectorAll('[data-navigate="admin/menu"]').forEach(el => el.style.display = 'none');
    }

    window.scrollTo(0, 0);
    document.title = route.title;

    if (currentScriptModule) {
      if (typeof currentScriptModule.destroy === 'function') {
        currentScriptModule.destroy();
      }
      currentScriptModule = null;
    }

    if (route.script) {
      try {
        const scriptPath = '/' + route.script;
        console.log('[ROUTER] Loading script:', scriptPath);
        const module = await import(`${scriptPath}?v=${Date.now()}`);
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

    const hist = history.state;
    if (hist?.view === viewName && typeof hist.scrollY === 'number') {
      requestAnimationFrame(() => window.scrollTo(0, hist.scrollY));
    }
  } catch (error) {
    console.error('Error loading view:', error);
    app.innerHTML = '<div class="error-view"><h1>Error cargando la vista</h1><p>Por favor recarga la pagina.</p></div>';
  }
}

let navigationInitialized = false;

function setupNavigation() {
  if (navigationInitialized) return;
  navigationInitialized = true;
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-navigate]');
    if (el) {
      e.preventDefault();
      const view = el.dataset.navigate?.split('?')[0];
      if (view) navigateTo(view);
    }
  });
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1);
  state.clearParams(); // Clear before extracting new ones
  const viewName = extractViewName(hash);
  loadView(viewName);
}

window.addEventListener('hashchange', handleRouteChange);

window.navigateTo = navigateTo;

export { navigateTo, handleRouteChange };

document.addEventListener('DOMContentLoaded', async () => {
  state.init();

  if (state.isLoggedIn()) {
    try {
      const auth = useAuth();
      await auth.me(); // Wait for session data to be fully loaded
      console.log('[ROUTER] Session refreshed:', state.getRole());
    } catch (err) {
      console.warn('Sesión expirada o inválida:', err.message);
      state.clearSession();
    }
  }

  if (!window.location.hash) {
    window.location.hash = 'home';
  }
  handleRouteChange();
});