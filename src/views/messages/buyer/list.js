import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';

let conversations = [];

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h';
  return Math.floor(diff / 86400000) + 'd';
}

function normalizeChat(chat, userId) {
  const vehicle = chat.publication?.vehicle || {};
  const seller = chat.publication?.seller || {};
  const lastMsg = chat.messages?.[0];
  const vehicleImage = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
  const vehicleTitle = chat.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';

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

function isInspectorMode() {
  return typeof window.getInspectorData === 'function';
}

function getInspectorConversations() {
  const inspectorData = window.getInspectorData();
  const conversationsList = inspectorData.conversations || [];

  return conversationsList.map(conv => {
    const vehicle = conv.vehicle || {};
    const seller = conv.seller || {};
    return {
      id: conv.id,
      vehicleId: conv.vehicleId,
      vehicleTitle: `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || `Vehículo ${conv.vehicleId}`,
      vehicleImage: vehicle?.image || 'https://placehold.co/100x100',
      userName: seller.name || 'Vendedor',
      lastMessage: conv.lastMessage,
      timeAgo: formatTimeAgo(conv.lastMessageTime),
      unread: conv.unread ? 1 : 0,
      isIncoming: true,
      isNavigate: conv.id ? `messages/buyer/chat/${conv.id}` : '#'
    };
  });
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

    if (isInspectorMode()) {
      conversations = getInspectorConversations();
    } else {
      const chats = useChats();
      try {
        const response = await chats.getAll();
        const rawChats = response.chats || [];
        const userId = state.getSession()?.id;
        conversations = rawChats.map(chat => normalizeChat(chat, userId));
      } catch (err) {
        console.log('Mostrando conversaciones demo:', err.message);
        conversations = this.getDemoConversations();
      }
    }

    if (!conversations || conversations.length === 0) {
      list.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    this.renderConversations(conversations);
  },

  getDemoConversations() {
    return [
      {
        id: 'demo-1',
        vehicleTitle: 'Toyota Corolla XEi 2021',
        vehicleImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=100&q=80',
        userName: 'Juan Pérez',
        lastMessage: 'Hola, me interesa el auto. ¿Está disponible?',
        timeAgo: '2h',
        unread: 3,
        isIncoming: true,
        isNavigate: 'messages/buyer/chat/demo-1'
      },
      {
        id: 'demo-2',
        vehicleTitle: 'Honda Civic 2020',
        vehicleImage: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=100&q=80',
        userName: 'Auto Motors',
        lastMessage: 'Gracias por tu interés, te envío más fotos.',
        timeAgo: '1d',
        unread: 0,
        isIncoming: true,
        isNavigate: 'messages/buyer/chat/demo-2'
      }
    ];
  },

  renderConversations(convs) {
    const list = document.getElementById('conversationsList');
    if (!list) return;

    list.innerHTML = '';
    list.hidden = false;

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
            <h3>${conv.vehicleTitle || 'Vehículo'}</h3>
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
