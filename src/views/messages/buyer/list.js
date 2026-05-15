import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';
import { formatTimeAgo } from '../../../utils/formatters.js';

let conversations = [];

function normalizeChat(chat, userId) {
  const vehicle = chat.publication?.vehicle || {};
  const seller = chat.publication?.seller || {};
  const lastMsg = chat.messages?.[0];
  
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
    userName: seller.fullName || 'Vendedor',
    lastMessage: lastMsg?.message || '',
    timeAgo: formatTimeAgo(lastMsg?.createdAt),
    unread: 0,
    isIncoming: lastMsg?.userId !== userId,
    isNavigate: `messages/buyer/chat/${chat.id}`
  };
}

export default {
  async init() {
    const list = document.getElementById('conversationsList');
    const empty = document.getElementById('messagesEmpty');

    if (!list) return;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    list.innerHTML = Array(4).fill(0).map(() => `
      <article class="conversation-item" style="pointer-events:none;">
        <div class="conversation-avatar">
          <div class="skeleton" style="width:70px;height:70px;border-radius:18px;"></div>
        </div>
        <div class="conversation-content">
          <div class="skeleton" style="height:20px;width:50%;margin-bottom:0.5rem;"></div>
          <div class="skeleton" style="height:14px;width:70%;margin-bottom:0.4rem;"></div>
          <div class="skeleton" style="height:14px;width:40%;"></div>
        </div>
      </article>
    `).join('');

    const chats = useChats();
    try {
      const response = await chats.getAll();
      const rawChats = response.chats || [];
      const userId = state.getSession()?.id;
      conversations = rawChats.map(chat => normalizeChat(chat, userId));
    } catch (err) {
      console.warn('[CHAT LIST] Error loading conversations:', err.message);
      list.hidden = true;
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'No se pudieron cargar las conversaciones. Verifica tu conexion.';
      }
      return;
    }

    if (!conversations || conversations.length === 0) {
      list.hidden = true;
      if (empty) {
        empty.hidden = false;
        empty.textContent = 'No tienes conversaciones aun.';
      }
      return;
    }

    this.renderConversations(conversations);
  },

  renderConversations(convs) {
    const list = document.getElementById('conversationsList');
    if (!list) return;

    list.innerHTML = '';
    list.hidden = false;

    const empty = document.getElementById('messagesEmpty');
    if (empty) empty.hidden = true;

    convs.forEach(conv => {
      const item = document.createElement('article');
      item.className = 'conversation-item';
      item.dataset.navigate = conv.isNavigate || `messages/buyer/chat/${conv.id}`;

      item.innerHTML = `
        <div class="conversation-avatar">
          <img src="${conv.vehicleImage || 'https://placehold.co/100x100'}" alt="Auto" />
        </div>
        <div class="conversation-content">
          <div class="conversation-header">
            <h3>${conv.vehicleTitle || 'Vehiculo'}</h3>
            <span class="conversation-time">${conv.timeAgo || ''}</span>
          </div>
          <p class="conversation-user">${conv.userName}</p>
          <p class="conversation-preview">${conv.lastMessage}</p>
        </div>
        ${conv.unread > 0 ? `<span class="conversation-unread">${conv.unread}</span>` : ''}
      `;

      list.appendChild(item);
    });

    this.setupClickHandlers();
  },

  setupClickHandlers() {
    document.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.navigate;
        if (view) navigateTo(view);
      });
    });
  }
};
