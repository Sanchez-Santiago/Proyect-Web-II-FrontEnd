import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { formatTimeAgo } from '../../../utils/formatters.js';

function normalizeChat(chat, userId) {
  const vehicle = chat.publication?.vehicle || {};
  const lastMsg = chat.messages?.[0];
  const buyer = lastMsg?.user;
  
  // Robust image extraction
  const images = vehicle.images || chat.publication?.images || [];
  const vehicleImage = images.map(img => {
    if (typeof img === 'string') return img;
    return img?.imageUrl || img?.url || img?.path || '';
  }).find(Boolean) || 'https://placehold.co/100x100';

  const vehicleTitle = chat.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehiculo';

  return {
    id: chat.id,
    publicationId: chat.publication?.id,
    vehicleTitle,
    vehicleImage,
    userName: buyer?.fullName || 'Comprador',
    lastMessage: lastMsg?.message || '',
    timeAgo: formatTimeAgo(lastMsg?.createdAt),
    unread: 0,
    isNavigate: `messages/seller/chat/${chat.id}`
  };
}

export default {
  async init() {
    const conversationsList = document.getElementById('conversationsList');
    const leadsList = document.getElementById('leadsList');
    const empty = document.getElementById('messagesEmpty');
    const tabs = document.querySelectorAll('.messages-tab');

    if (!conversationsList) return;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    this.setupTabs(tabs, conversationsList, leadsList, empty);

    const chats = useChats();

    try {
      const response = await chats.getAll();
      const rawChats = response.chats || [];
      const userId = state.getSession()?.id;
      const conversations = rawChats.map(chat => normalizeChat(chat, userId));

      if (!conversations || conversations.length === 0) {
        conversationsList.hidden = true;
        leadsList.hidden = true;
        if (empty) {
          empty.hidden = false;
          empty.textContent = 'No tienes conversaciones aun.';
        }
        return;
      }

      this.renderConversations(conversations, conversationsList);
      this.renderLeads(conversations, leadsList);
    } catch (err) {
      console.warn('[CHAT LIST] Error loading conversations:', err.message);
      conversationsList.hidden = true;
      leadsList.hidden = true;
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'No se pudieron cargar las conversaciones. Verifica tu conexion.';
      }
    }
  },

  setupTabs(tabs, conversationsList, leadsList, empty) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        if (tab.dataset.tab === 'conversations') {
          conversationsList.hidden = false;
          leadsList.hidden = true;
        } else {
          conversationsList.hidden = true;
          leadsList.hidden = false;
        }
      });
    });
  },

  renderConversations(convs, container) {
    if (!container) return;

    container.innerHTML = '';
    container.hidden = false;

    const empty = document.getElementById('messagesEmpty');
    if (empty) empty.hidden = true;

    convs.forEach(conv => {
      const item = document.createElement('article');
      item.className = 'conversation-item';
      item.dataset.navigate = conv.isNavigate || `messages/seller/chat/${conv.id}`;

      item.innerHTML = `
        <div class="conversation-avatar">
          <img src="${conv.vehicleImage || 'https://placehold.co/100x100'}" alt="Auto" />
        </div>
        <div class="conversation-content">
          <div class="conversation-header">
            <h3>${conv.vehicleTitle}</h3>
            <span class="conversation-time">${conv.timeAgo}</span>
          </div>
          <p class="conversation-user">${conv.userName}</p>
          <p class="conversation-preview">${conv.lastMessage}</p>
        </div>
        ${conv.unread > 0 ? `<span class="conversation-unread">${conv.unread}</span>` : ''}
      `;

      container.appendChild(item);
    });

    this.setupClickHandlers(container);
  },

  renderLeads(convs, container) {
    if (!container) return;

    container.innerHTML = '';
    container.hidden = false;

    if (!convs || convs.length === 0) {
      container.innerHTML = '<div class="no-results" style="padding:1rem;">Sin leads por el momento.</div>';
      return;
    }

    convs.forEach(conv => {
      const item = document.createElement('article');
      item.className = 'lead-item';
      item.dataset.navigate = conv.isNavigate;

      item.innerHTML = `
        <div class="lead-info">
          <h3>${conv.userName}</h3>
          <p>${conv.vehicleTitle}</p>
          <small>Interesado en tu publicacion</small>
        </div>
        <div class="lead-meta">
          <span class="lead-interest lead-high">Nuevo</span>
          <span class="lead-date">${conv.timeAgo}</span>
        </div>
      `;

      container.appendChild(item);
    });
  },

  setupClickHandlers(container) {
    container.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.navigate;
        if (view) navigateTo(view);
      });
    });
  }
};
