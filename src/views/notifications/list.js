import { navigateTo } from '../../core/router.js';
import { useApi } from '../../hooks/useApi.js';

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString('es-AR');
}

const typeIcons = {
  message: 'bi-chat-dots',
  favorite: 'bi-heart',
  price_change: 'bi-cash-stack',
  status_change: 'bi-arrow-left-right',
  report: 'bi-flag',
  system: 'bi-bell',
  admin: 'bi-shield'
};

function getIcon(type) {
  return typeIcons[type] || 'bi-bell';
}

function showSkeleton(list) {
  if (!list) return;
  list.style.display = '';
  list.innerHTML = Array(5).fill(0).map(() => `
    <article class="notif-card skeleton-card" style="pointer-events:none;">
      <div class="notif-icon">
        <div class="skeleton" style="width:40px;height:40px;border-radius:50%;"></div>
      </div>
      <div class="notif-body">
        <div class="skeleton" style="height:18px;width:50%;margin-bottom:0.5rem;"></div>
        <div class="skeleton" style="height:14px;width:80%;margin-bottom:0.3rem;"></div>
        <div class="skeleton" style="height:14px;width:30%;"></div>
      </div>
    </article>
  `).join('');
}

export default {
  async init() {
    const api = useApi('/notifications');

    const empty = document.getElementById('notifEmpty');
    const list = document.getElementById('notifList');

    showSkeleton(list);

    try {
      const response = await api.get('');
      const notifications = response?.notifications || [];

      if (notifications.length === 0) {
        if (empty) empty.style.display = '';
        if (list) list.style.display = 'none';
        this.setupNavigation();
        return;
      }

      if (empty) empty.style.display = 'none';
      if (list) list.style.display = '';

      list.innerHTML = notifications.map(n => `
        <article class="notif-card ${n.isRead ? '' : 'is-unread'}" data-id="${n.id}">
          <div class="notif-icon">
            <i class="bi ${getIcon(n.type)}"></i>
          </div>
          <div class="notif-body">
            <div class="notif-header-row">
              <strong>${n.title || 'Notificación'}</strong>
              <span class="notif-time">${timeAgo(n.createdAt)}</span>
            </div>
            <p>${n.message || ''}</p>
          </div>
          <div class="notif-actions">
            ${n.isRead ? '' : '<button type="button" class="notif-read-btn" data-action="read" data-id="' + n.id + '" title="Marcar leída"><i class="bi bi-check"></i></button>'}
            <button type="button" class="notif-delete-btn" data-action="delete" data-id="${n.id}" title="Eliminar"><i class="bi bi-x"></i></button>
          </div>
        </article>
      `).join('');

      this.setupItemActions(api, list);
    } catch (err) {
      console.error('Error loading notifications:', err);
      if (empty) empty.innerHTML = '<i class="bi bi-exclamation-triangle"></i><h2>Error</h2><p>No se pudieron cargar las notificaciones.</p>';
      if (empty) empty.style.display = '';
    }

    document.getElementById('notifMarkAllBtn')?.addEventListener('click', async () => {
      try {
        await api.post('/read-all');
        this.init();
      } catch (err) {
        console.error('Error marking all as read:', err);
      }
    });

    this.setupNavigation();
  },

  setupItemActions(api, list) {
    list.querySelectorAll('[data-action="read"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          await api.post(`/${id}/read`);
          const card = list.querySelector(`.notif-card[data-id="${id}"]`);
          if (card) {
            card.classList.remove('is-unread');
            btn.remove();
          }
        } catch (err) {
          console.error('Error marking notification as read:', err);
        }
      });
    });

    list.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          await api.del(`/${id}`);
          const card = list.querySelector(`.notif-card[data-id="${id}"]`);
          if (card) card.remove();
          if (list.children.length === 0) this.init();
        } catch (err) {
          console.error('Error deleting notification:', err);
        }
      });
    });
  },

  setupNavigation() {
    document.querySelectorAll('[data-navigate]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-navigate');
        navigateTo(view);
      });
    });
  }
};
