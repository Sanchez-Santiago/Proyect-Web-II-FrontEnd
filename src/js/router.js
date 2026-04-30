/**
 * Router - Sistema de navegación SPA (Single Page Application)
 * Maneja las rutas, carga de vistas y transición entre páginas sin recargar
 * 
 * Modo Inspector: Permite simular una base de datos completa para testing
 * sin necesidad de un backend real
 */

import state from './state.js';
import { getInspectorData, findOrCreateConversation } from '../data/inspector-data.js';

const INSPECTOR_MODE = true;
const INSPECTOR_KEY = 'motormarket_inspector_session';

console.log('[INSPECTOR] Mode:', INSPECTOR_MODE);

/**
 * Inicializa la sesión del modo inspector
 * Recupera el rol guardado en localStorage o usa 'buyer' por defecto
 */
function initInspectorSession() {
  console.log('[INSPECTOR] initInspectorSession called');
  const saved = localStorage.getItem(INSPECTOR_KEY);
  const data = getInspectorData();
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      data.session.role = parsed.role || 'buyer';
      console.log('[INSPECTOR] Restored role from localStorage:', data.session.role);
    } catch (e) {
      console.warn('[INSPECTOR] Error parsing saved role:', e);
    }
  }
  localStorage.setItem('motormarket_session', JSON.stringify(data.session));
  console.log('[INSPECTOR] Session saved to localStorage:', data.session);
}

function toggleInspectorRole() {
  const data = getInspectorData();
  const newRole = data.session.role === 'buyer' ? 'seller' : 'buyer';
  data.session.role = newRole;
  data.session.roles = [newRole];
  localStorage.setItem(INSPECTOR_KEY, JSON.stringify({ role: newRole }));
  localStorage.setItem('motormarket_session', JSON.stringify(data.session));
  window.location.reload();
}

window.getInspectorData = getInspectorData;
window.toggleInspectorRole = toggleInspectorRole;
window.findOrCreateConversation = findOrCreateConversation;

const routes = {
  '': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'MotorMarket | Autos usados con IA' },
  'home': { template: 'src/views/home/index.html', script: 'src/views/home/index.js', title: 'MotorMarket | Autos usados con IA' },
  
  'auth/login': { template: 'src/views/auth/login.html', script: 'src/views/auth/login.js', title: 'Login | MotorMarket' },
  'auth/register': { template: 'src/views/auth/register.html', script: 'src/views/auth/register.js', title: 'Registro | MotorMarket' },
  'auth/role': { template: 'src/views/auth/role.html', script: 'src/views/auth/role.js', title: 'Elegir acceso | MotorMarket' },
  
  'vehicles/detail': { template: 'src/views/vehicles/detail.html', script: 'src/views/vehicles/detail.js', title: 'Detalle del auto | MotorMarket' },
  'vehicles/add': { template: 'src/views/vehicles/add.html', script: 'src/views/vehicles/add.js', title: 'Publicar vehiculo | MotorMarket' },
  
  'user/buyer/menu': { template: 'src/views/user/buyer/menu-buyer.html', script: 'src/views/user/buyer/menu-buyer.js', title: 'Menu comprador | MotorMarket' },
  'user/buyer/profile': { template: 'src/views/user/buyer/profile-buyer.html', script: 'src/views/user/buyer/profile-buyer.js', title: 'Gestionar perfil comprador | MotorMarket' },
  'user/buyer/favorites': { template: 'src/views/user/buyer/favorites.html', script: 'src/views/user/buyer/favorites.js', title: 'Favoritos | MotorMarket' },
  'user/buyer/investment-advisor': { template: 'src/views/user/buyer/investment-advisor.html', script: 'src/views/user/buyer/investment-advisor.js', title: 'Insights IA | MotorMarket' },
  
  'messages/buyer': { template: 'src/views/messages/buyer/list.html', script: 'src/views/messages/buyer/list.js', title: 'Mensajes | MotorMarket' },
  'messages/buyer/chat': { template: 'src/views/messages/buyer/chat.html', script: 'src/views/messages/buyer/chat.js', title: 'Chat | MotorMarket' },
  
  'messages/seller': { template: 'src/views/messages/seller/list.html', script: 'src/views/messages/seller/list.js', title: 'Mensajes | MotorMarket' },
  'messages/seller/chat': { template: 'src/views/messages/seller/chat.html', script: 'src/views/messages/seller/chat.js', title: 'Chat | MotorMarket' },
  
  'user/seller/menu': { template: 'src/views/user/seller/menu-seller.html', script: 'src/views/user/seller/menu-seller.js', title: 'Menu vendedor | MotorMarket' },
  'user/seller/profile': { template: 'src/views/user/seller/profile-seller.html', script: 'src/views/user/seller/profile-seller.js', title: 'Gestionar perfil vendedor | MotorMarket' },
  'user/seller/publications': { template: 'src/views/user/seller/publications.html', script: 'src/views/user/seller/publications.js', title: 'Mis publicaciones | MotorMarket' },
  
  'admin/menu': { template: 'src/views/admin/menu-admin.html', script: 'src/views/admin/menu-admin.js', title: 'Menu administrador | MotorMarket' },
  'admin/alerts': { template: 'src/views/admin/alerts-admin.html', script: null, title: 'Alertas | MotorMarket' },
  'admin/analytics': { template: 'src/views/admin/analytics-admin.html', script: null, title: 'Analityicas | MotorMarket' },
  'admin/engine': { template: 'src/views/admin/engine-admin.html', script: null, title: 'Motor | MotorMarket' },


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
  window.location.hash = hash;
}

function extractViewName(hash) {
  if (!hash || hash === '') return 'home';
  
  if (hash.startsWith('vehicles/detail')) {
    const parts = hash.split('/');
    if (parts.length >= 3) {
      window.carDetailId = parts[2];
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
    window.scrollTo(0, 0);
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