import { navigateTo } from '../../core/router.js';
import state from '../../core/state.js';

export default {
  init() {
    const grid = document.getElementById('roleAccessGrid');
    const welcome = document.getElementById('roleAccessWelcome');

    if (!grid) {
      return;
    }

    function renderWelcome(sessionUser) {
      if (!welcome || !sessionUser || !sessionUser.email) return;
      const accessLabel = state.hasAdminAccess() ? 'Administrador habilitado' : 'Acceso estandar';
      welcome.hidden = false;
      welcome.textContent = sessionUser.email + ' • ' + accessLabel;
    }

    function createAdminCard() {
      const card = document.createElement('article');
      card.className = 'role-card role-card-admin';
      card.innerHTML = `
        <div class="role-card-header">
          <div class="role-card-icon"><i class="bi bi-shield-lock-fill"></i></div>
          <span class="role-card-badge">Administrador</span>
        </div>
        <h2>Acceder como administrador</h2>
        <p>Disponible solo para cuentas con permisos de gestion. Desde aqui podes supervisar usuarios, publicaciones y configuraciones generales.</p>
        <ul>
          <li><i class="bi bi-check-circle-fill"></i> Gestion centralizada de usuarios, publicaciones y estados.</li>
          <li><i class="bi bi-check-circle-fill"></i> Control de validaciones, flujos y moderacion de la plataforma.</li>
          <li><i class="bi bi-check-circle-fill"></i> Acceso a herramientas internas para soporte y seguimiento.</li>
          <li><i class="bi bi-check-circle-fill"></i> Vista operativa para tomar decisiones sobre el sistema.</li>
        </ul>
        <button type="button" class="role-card-action" data-navigate="admin/menu">Continuar como administrador</button>`;
      grid.appendChild(card);
    }

    function setupNavigation() {
      document.querySelectorAll('[data-navigate]').forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const view = button.getAttribute('data-navigate');
          navigateTo(view);
        });
      });
    }

    const sessionUser = state.getSession();
    renderWelcome(sessionUser);

    if (state.hasAdminAccess()) {
      createAdminCard();
    }

    setupNavigation();
  }
};
