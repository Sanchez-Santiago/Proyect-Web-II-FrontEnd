import { navigateTo } from '../../js/router.js';
import state from '../../js/state.js';
import { usePublications } from '../../hooks/usePublications.js';
import { useNotifications } from '../../hooks/useNotifications.js';
import { getPublicationArray, normalizePublication } from '../../js/publicationMapper.js';

function renderCard(publication) {
  const car = normalizePublication(publication);
  return `
    <article class="admin-space-card" data-publication-id="${car.id}">
      <img src="${car.image}" alt="${car.title}" />
      <span class="admin-space-badge">${car.condition}</span>
      <h3>${car.title}</h3>
      <p>${car.priceFormatted} - ${car.year} - ${car.location}</p>
    </article>
  `;
}

function renderRow(publication) {
  const car = normalizePublication(publication);
  return `
    <tr data-publication-id="${car.id}">
      <td>${car.brand}</td>
      <td>${car.model}</td>
      <td>${car.year}</td>
      <td>${car.priceFormatted}</td>
      <td>${car.condition}</td>
    </tr>
  `;
}

function setupNavigation() {
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.getAttribute('data-navigate'));
    });
  });
}

function openNotifications(notifications) {
  document.getElementById('notifications-panel')?.remove();
  const panel = document.createElement('div');
  panel.id = 'notifications-panel';
  panel.className = 'notification-panel';
  panel.innerHTML = `
    <div class="notification-header">
      <h4>Notificaciones</h4>
      <button type="button" class="notification-close" data-close-notifications><i class="bi bi-x-lg"></i></button>
    </div>
    <div class="notification-list">
      ${notifications.length ? notifications.map(n => `
        <div class="notification-item" data-notification-id="${n.id}">
          <div class="notification-icon"><i class="bi bi-bell-fill"></i></div>
          <div class="notification-content">
            <div class="notification-title">${n.title || n.type || 'Notificacion'}</div>
            <div class="notification-message">${n.message || ''}</div>
            <div class="notification-time">${n.createdAt ? new Date(n.createdAt).toLocaleString('es-AR') : ''}</div>
          </div>
        </div>
      `).join('') : '<div class="notification-empty">Sin notificaciones</div>'}
    </div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('[data-close-notifications]')?.addEventListener('click', () => panel.remove());
}

export default {
  async init() {
    setupNavigation();
    await this.renderAuth();
    await this.renderPublications();
  },

  async renderAuth() {
    const authContainer = document.querySelector('.home-auth');
    if (!authContainer) return;

    if (!state.isLoggedIn()) {
      authContainer.innerHTML = `
        <button type="button" class="home-auth-btn" data-navigate="auth/login">Iniciar sesion</button>
        <button type="button" class="home-auth-btn-primary" data-navigate="auth/register">Crear cuenta</button>
      `;
      setupNavigation();
      return;
    }

    let notifications = [];
    try {
      const response = await useNotifications().getAll({ isRead: false });
      notifications = response?.data?.notifications || response?.notifications || [];
    } catch {
      notifications = [];
    }

    const session = state.getSession();
    authContainer.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;">
        <button type="button" class="home-auth-btn" data-notifications>
          <i class="bi bi-bell"></i> ${notifications.length}
        </button>
        <button type="button" class="home-auth-btn" data-navigate="user/buyer/favorites">
          <i class="bi bi-heart"></i>
        </button>
        <span style="color:#f97316;font-size:12px;font-weight:600;">${session?.name || session?.fullName || session?.email}</span>
        <button type="button" class="home-auth-btn-primary" data-navigate="user/buyer/menu">Mi cuenta</button>
      </div>
    `;
    authContainer.querySelector('[data-notifications]')?.addEventListener('click', () => openNotifications(notifications));
    setupNavigation();
  },

  async renderPublications() {
    const cardGrid = document.querySelector('.admin-space-grid-2');
    const tbody = document.querySelector('.admin-space-table tbody');
    if (cardGrid) cardGrid.innerHTML = '<article class="admin-space-card">Cargando publicaciones...</article>';
    if (tbody) tbody.innerHTML = '<tr><td colspan="5">Cargando publicaciones...</td></tr>';

    try {
      const response = await usePublications().getAll({ status: 'ACTIVE' });
      const publications = getPublicationArray(response);
      const visible = publications.slice(0, 6);

      if (cardGrid) {
        cardGrid.innerHTML = visible.slice(0, 2).map(renderCard).join('') || '<article class="admin-space-card">No hay publicaciones activas.</article>';
      }
      if (tbody) {
        tbody.innerHTML = visible.map(renderRow).join('') || '<tr><td colspan="5">No hay publicaciones activas.</td></tr>';
      }

      document.querySelectorAll('[data-publication-id]').forEach(el => {
        el.addEventListener('click', () => navigateTo(`vehicles/detail/${el.dataset.publicationId}`));
      });
    } catch (err) {
      if (cardGrid) cardGrid.innerHTML = `<article class="admin-space-card">No se pudieron cargar publicaciones: ${err.message}</article>`;
      if (tbody) tbody.innerHTML = `<tr><td colspan="5">No se pudieron cargar publicaciones: ${err.message}</td></tr>`;
    }
  }
};
