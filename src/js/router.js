import state from './state.js';

const routes = {
  '': { template: 'src/views/home.html', script: 'src/views/home.js', title: 'DriveRoom | Autos usados con IA' },
  'home': { template: 'src/views/home.html', script: 'src/views/home.js', title: 'DriveRoom | Autos usados con IA' },
  'car-detail': { template: 'src/views/car-detail.html', script: 'src/views/car-detail.js', title: 'Detalle del auto | DriveRoom' },
  'login': { template: 'src/views/login.html', script: 'src/views/login.js', title: 'Login | DriveRoom' },
  'role': { template: 'src/views/role.html', script: 'src/views/role.js', title: 'Elegir acceso | DriveRoom' },
  'menu-buyer': { template: 'src/views/menu-buyer.html', script: 'src/views/menu-buyer.js', title: 'Menu comprador | DriveRoom' },
  'menu-seller': { template: 'src/views/menu-seller.html', script: 'src/views/menu-seller.js', title: 'Menu vendedor | DriveRoom' },
  'menu-admin': { template: 'src/views/menu-admin.html', script: 'src/views/menu-admin.js', title: 'Menu administrador | DriveRoom' },
  'profile-buyer': { template: 'src/views/profile-buyer.html', script: 'src/views/profile-buyer.js', title: 'Gestionar perfil comprador | DriveRoom' },
  'profile-seller': { template: 'src/views/profile-seller.html', script: 'src/views/profile-seller.js', title: 'Gestionar perfil vendedor | DriveRoom' }
};

let currentScriptModule = null;
let currentViewName = null;

function navigateTo(hash) {
  window.location.hash = hash;
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
        const module = await import(`../${route.script}`);
        if (module.default && typeof module.default.init === 'function') {
          currentScriptModule = module.default;
          currentScriptModule.init();
        }
      } catch (e) {
        console.warn(`No se pudo cargar script para ${viewName}:`, e.message);
      }
    }

    currentViewName = viewName;
    state.setView(viewName);
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
  loadView(routes[viewName] ? viewName : 'home');
}

window.addEventListener('hashchange', handleRouteChange);

window.navigateTo = navigateTo;

export { navigateTo, handleRouteChange };
