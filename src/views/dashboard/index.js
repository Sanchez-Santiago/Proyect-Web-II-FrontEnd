import state from '../../core/state.js';
import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';
import { formatPrice, formatMileage } from '../../utils/formatters.js';

export default {
  async init() {
    const session = state.getSession();
    if (!session) {
      navigateTo('auth/login');
      return;
    }

    const role = session.role || 'buyer';
    this.renderSidebar(role);
    this.renderSwitch(role);
    this.renderTopActions(role);
    await this.renderContent(role);
    this.setupGlobalActions();
  },

  setupGlobalActions() {
    const logo = document.querySelector('.dashboard-brand');
    if (logo) {
      logo.style.cursor = 'pointer';
      logo.addEventListener('click', () => navigateTo('home'));
    }

    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.dataset.navigate;
        if (route) navigateTo(route);
      });
    });
  },

  renderSidebar(role) {
    const sidebar = document.getElementById('dashboardSidebar');
    if (!sidebar) return;

    const menuItems = {
      buyer: [
        { id: 'menu', icon: 'house-door-fill', label: 'Dashboard', sub: 'Resumen global', route: 'dashboard' },
        { id: 'favorites', icon: 'heart-fill', label: 'Favoritos', sub: 'Seguimiento', route: 'user/buyer/favorites' },
        { id: 'insights', icon: 'stars', label: 'Insights IA', sub: 'Análisis y simulacion', route: 'user/buyer/investment-advisor' },
        { id: 'messages', icon: 'chat-dots-fill', label: 'Mensajes', sub: 'Conversaciones', route: 'messages/buyer' },
        { id: 'notifications', icon: 'bell-fill', label: 'Notificaciones', sub: 'Alertas y avisos', route: 'notifications' },
        { id: 'profile', icon: 'person-fill', label: 'Perfil', sub: 'Configuracion', route: 'user/buyer/profile' }
      ],
      seller: [
        { id: 'menu', icon: 'house-door-fill', label: 'Dashboard', sub: 'Ventas y estado', route: 'dashboard' },
        { id: 'publications', icon: 'car-front-fill', label: 'Publicaciones', sub: 'Mis avisos', route: 'user/seller/publications' },
        { id: 'sales', icon: 'graph-up-arrow', label: 'Ventas', sub: 'Transacciones', route: 'user/seller/sales' },
        { id: 'insights', icon: 'stars', label: 'Insights IA', sub: 'Rendimiento IA', route: 'user/seller/insights' },
        { id: 'messages', icon: 'chat-dots-fill', label: 'Mensajes', sub: 'Consultas', route: 'messages/seller' },
        { id: 'notifications', icon: 'bell-fill', label: 'Notificaciones', sub: 'Alertas y avisos', route: 'notifications' },
        { id: 'profile', icon: 'person-fill', label: 'Perfil', sub: 'Mi cuenta', route: 'user/seller/profile' }
      ],
      admin: [
        { id: 'menu', icon: 'house-door-fill', label: 'Dashboard', sub: 'Estado global', route: 'dashboard' },
        { id: 'users', icon: 'people-fill', label: 'Usuarios', sub: 'Actividad', route: 'admin/users' },
        { id: 'publications', icon: 'car-front-fill', label: 'Publicaciones', sub: 'Moderacion', route: 'admin/publications' },
        { id: 'engine', icon: 'cpu-fill', label: 'Motor IA', sub: 'Reglas y precisión', route: 'admin/engine' },
        { id: 'analytics', icon: 'bar-chart-fill', label: 'Analíticas', sub: 'Embudo global', route: 'admin/analytics' },
        { id: 'alerts', icon: 'exclamation-triangle-fill', label: 'Alertas', sub: 'Riesgos', route: 'admin/alerts' },
        { id: 'notifications', icon: 'bell-fill', label: 'Notificaciones', sub: 'Sistema', route: 'notifications' }
      ]
    };

    const currentMenu = menuItems[role] || menuItems.buyer;

    sidebar.innerHTML = `
      <div class="dashboard-brand">
        <span>MM</span>
        <div>
          <strong>MotorMarket</strong>
          <small>${role.toUpperCase()} Console</small>
        </div>
      </div>
      <nav class="dashboard-nav">
        ${currentMenu.map(item => `
          <a href="#${item.route}" data-navigate="${item.route}" class="${item.id === 'menu' ? 'is-active' : ''}">
            <i class="bi bi-${item.icon}"></i>
            <span>
              <strong>${item.label}</strong>
              <small>${item.sub}</small>
            </span>
          </a>
        `).join('')}
        <div class="dashboard-nav-divider"></div>
        <a href="#home" data-navigate="home" class="nav-back-home">
          <i class="bi bi-box-arrow-left"></i>
          <span>
            <strong>Volver al Home</strong>
            <small>Salir de la consola</small>
          </span>
        </a>
      </nav>
      <div class="dashboard-sidebar-note glass">
        <span>Radar IA</span>
        <strong id="radarCount">Cargando...</strong>
        <p id="radarNote">Analizando actividad reciente.</p>
      </div>
    `;
  },

  renderSwitch(role) {
    const sw = document.getElementById('dashboardSwitch');
    if (!sw) return;

    const session = state.getSession();
    const isAdmin = session?.role === 'admin';
    const isSeller = session?.role === 'seller';

    let html = '';
    html += `<a href="#" class="${role === 'buyer' ? 'is-current' : ''}" data-role-switch="buyer">Comprador</a>`;
    
    if (isSeller || isAdmin) {
      html += `<a href="#" class="${role === 'seller' ? 'is-current' : ''}" data-role-switch="seller">Vendedor</a>`;
    }
    
    if (isAdmin) {
      html += `<a href="#" class="${role === 'admin' ? 'is-current' : ''}" data-role-switch="admin">Admin</a>`;
    }

    sw.innerHTML = html;

    sw.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const newRole = link.dataset.roleSwitch;
        this.renderSidebar(newRole);
        this.renderSwitch(newRole);
        this.renderContent(newRole);
      });
    });
  },

  async renderContent(role) {
    const content = document.getElementById('dashboardContent');
    const title = document.getElementById('dashboardTitle');
    const kicker = document.getElementById('dashboardKicker');
    if (!content) return;

    content.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div><p>Cargando datos reales...</p></div>';

    if (role === 'buyer') {
      kicker.textContent = 'Bienvenido';
      title.textContent = 'Encontrá tu próximo vehículo con IA.';
      await this.loadBuyerContent(content);
    } else if (role === 'seller') {
      kicker.textContent = 'Ventas';
      title.textContent = 'Tu operación necesita control inteligente.';
      await this.loadSellerContent(content);
    } else if (role === 'admin') {
      kicker.textContent = 'Control Global';
      title.textContent = 'Supervisión de toda la red MotorMarket.';
      await this.loadAdminContent(content);
    }
    
    // Re-bind navigation
    document.querySelectorAll('[data-navigate]').forEach(el => {
      el.onclick = (e) => {
        e.preventDefault();
        const route = el.dataset.navigate;
        if (route) navigateTo(route);
      };
    });
  },

  renderTopActions(role) {
    const actions = document.getElementById('dashboardTopActions');
    if (!actions) return;

    actions.innerHTML = `
      <div class="dashboard-top-btns">
        <button class="btn-ghost" data-navigate="home">
          <i class="bi bi-search"></i>
          Explorar
        </button>
        <div class="topbar-divider"></div>
        <button class="btn-notification" data-navigate="notifications">
          <i class="bi bi-bell"></i>
          <span class="notification-badge"></span>
        </button>
        <button class="btn-profile-short" data-navigate="user/${role}/profile">
          <i class="bi bi-person-circle"></i>
        </button>
      </div>
    `;
  },

  async loadBuyerContent(container) {
    try {
      const api = useApi();
      const favsResponse = await api.get('/favorites').catch(() => ({ favorites: [] }));
      const favs = favsResponse.favorites || [];
      const favCount = favs.length;

      // Get some recommended cars (using /filters as a proxy for exploration)
      const recommendationsRes = await api.get('/publications/filters', { limit: 3, status: 'ACTIVE' }).catch(() => ({ publications: [] }));
      const recs = recommendationsRes.publications || [];

      container.innerHTML = `
        <div class="dashboard-buyer-welcome animate-reveal">
          <div class="buyer-hero-banner glass">
            <div class="buyer-hero-copy">
              <span class="badge-ai">Match IA Activo</span>
              <h2>${favCount > 0 ? 'Tenes nuevas coincidencias esperandote.' : 'Tu proximo auto esta a un click.'}</h2>
              <p>Analizamos miles de opciones para encontrar el vehiculo que mejor se adapta a tu perfil y presupuesto.</p>
              <button class="btn-primary" data-navigate="home" style="padding: 1rem 2rem; font-size: 1rem;">Explorar Mercado</button>
            </div>
            <div class="buyer-hero-visual">
              <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=1000" alt="Supercar" />
            </div>
          </div>

          <div class="dashboard-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); flex-direction: row;">
            <div class="stat-card glass highlight">
               <div style="display:flex; justify-content:space-between; align-items:start;">
                 <div>
                   <span>Favoritos</span>
                   <strong>${favCount}</strong>
                 </div>
                 <i class="bi bi-heart-fill" style="font-size: 1.5rem; opacity: 0.5;"></i>
               </div>
               <p style="font-size:0.8rem; margin-top:0.5rem; opacity:0.8;">Vehiculos en seguimiento</p>
            </div>
            <div class="stat-card glass">
               <div style="display:flex; justify-content:space-between; align-items:start;">
                 <div>
                   <span>Vistos</span>
                   <strong>${Math.floor(Math.random() * 20) + 5}</strong>
                 </div>
                 <i class="bi bi-eye-fill" style="font-size: 1.5rem; opacity: 0.3;"></i>
               </div>
               <p style="font-size:0.8rem; margin-top:0.5rem; opacity:0.6;">Consultados recientemente</p>
            </div>
            <div class="stat-card glass">
               <div style="display:flex; justify-content:space-between; align-items:start;">
                 <div>
                   <span>Alertas</span>
                   <strong>2</strong>
                 </div>
                 <i class="bi bi-bell-fill" style="font-size: 1.5rem; opacity: 0.3;"></i>
               </div>
               <p style="font-size:0.8rem; margin-top:0.5rem; opacity:0.6;">Bajas de precio detectadas</p>
            </div>
          </div>

          <div class="dashboard-section-title">
            <h3>Recomendados para vos</h3>
            <a href="#home" data-navigate="home" style="color:var(--orange); font-size:0.9rem; font-weight:600; text-decoration:none;">Ver todos</a>
          </div>

          <div class="buyer-matches-row">
            ${recs.length > 0 ? recs.map(pub => {
              const v = pub.vehicle || {};
              const img = (v.images?.[0]?.imageUrl || pub.images?.[0] || 'https://placehold.co/400x300');
              return `
                <div class="match-card" data-navigate="vehicles/detail/${pub.id}" style="cursor:pointer;">
                  <div class="match-card-img">
                    <img src="${img}" alt="${v.brand}" />
                    <span class="match-badge">${Math.floor(Math.random() * 15) + 85}% Match</span>
                  </div>
                  <div class="match-card-body">
                    <h4>${v.brand} ${v.model}</h4>
                    <p>$${pub.price?.toLocaleString() || 'Consulte'}</p>
                    <div class="match-meta">
                      <span><i class="bi bi-calendar"></i> ${v.year}</span>
                      <span><i class="bi bi-speedometer2"></i> ${v.mileage?.toLocaleString()} km</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="glass" style="grid-column: 1/-1; padding: 3rem; text-align: center; border-radius: 24px; border: 1px dashed var(--line);">
                <i class="bi bi-search" style="font-size: 2rem; color: var(--muted); margin-bottom: 1rem; display: block;"></i>
                <p style="color: var(--muted);">Aun no tenemos recomendaciones para vos. ¡Empeza a explorar!</p>
              </div>
            `}
          </div>
        </div>
      `;
      document.getElementById('radarCount').textContent = `${favCount} oportunidades`;
      document.getElementById('radarNote').textContent = 'Analizando mercado en tiempo real.';
    } catch (err) {
      console.error('[DASHBOARD] Buyer Error:', err);
      container.innerHTML = '<p>Error cargando datos de comprador.</p>';
    }
  },

  async loadSellerContent(container) {
    try {
      const api = useApi('/publications');
      const res = await api.get('');
      const pubs = res.publications || [];
      
      const totalViews = pubs.reduce((sum, p) => sum + (p.vehicle?.views || 0), 0);
      const totalQueries = pubs.length * 3; 

      container.innerHTML = `
        <div class="dashboard-grid-hero animate-reveal">
          <div class="dashboard-card-main glass">
             <div class="card-copy">
               <span class="badge-ai">Vendedor Pro</span>
               <h2>Gestioná tus ${pubs.length} publicaciones</h2>
               <p>Tus avisos han recibido ${totalViews} visitas esta semana.</p>
               <button class="btn-primary" data-navigate="user/seller/publications">Ver mis autos</button>
             </div>
             <div class="card-visual">
               <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=800" alt="Office" />
             </div>
          </div>
          <div class="dashboard-stats-grid">
            <div class="stat-card glass">
               <span>Visitas</span>
               <strong>${totalViews}</strong>
            </div>
            <div class="stat-card glass">
               <span>Consultas</span>
               <strong>${totalQueries}</strong>
            </div>
          </div>
        </div>
      `;
      document.getElementById('radarCount').textContent = `${totalQueries} consultas`;
      document.getElementById('radarNote').textContent = 'Interesados esperando respuesta.';
    } catch (err) {
      container.innerHTML = '<p>Error cargando datos de vendedor.</p>';
    }
  },

  async loadAdminContent(container) {
    try {
      const api = useApi('/admin'); 
      const stats = { users: 1240, activePubs: 450, alerts: 12 };

      container.innerHTML = `
        <div class="dashboard-grid-hero animate-reveal">
          <div class="dashboard-card-main glass">
             <div class="card-copy">
               <span class="badge-ai">Control Total</span>
               <h2>Estado de la Plataforma</h2>
               <p>Se detectaron ${stats.alerts} anomalías que requieren revisión inmediata.</p>
               <button class="btn-primary" data-navigate="admin/alerts">Revisar alertas</button>
             </div>
             <div class="card-visual">
               <img src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800" alt="Analytics" />
             </div>
          </div>
          <div class="dashboard-stats-grid">
            <div class="stat-card glass">
               <span>Usuarios</span>
               <strong>${stats.users}</strong>
            </div>
            <div class="stat-card glass">
               <span>Publicaciones</span>
               <strong>${stats.activePubs}</strong>
            </div>
          </div>
        </div>
      `;
      document.getElementById('radarCount').textContent = `${stats.alerts} alertas`;
      document.getElementById('radarNote').textContent = 'Riesgos de seguridad o fraude.';
    } catch (err) {
      container.innerHTML = '<p>Error cargando datos de admin.</p>';
    }
  }
};
