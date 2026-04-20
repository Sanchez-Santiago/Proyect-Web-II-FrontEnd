import { useMessages } from '../../../hooks/useMessages.js';
import { navigateTo } from '../../../js/router.js';
import state from '../../../js/state.js';
import { getCarById } from '../../../data/cars.js';

let conversations = [];

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 3600000) return Math.floor(diff / 3600000) + 'h';
  if (diff < 86400000) return Math.floor(diff / 86400000) + 'd';
  return Math.floor(diff / 86400000) + 'd';
}

function isInspectorMode() {
  return typeof window.getInspectorData === 'function';
}

function getInspectorConversations() {
  console.log('[INSPECTOR] getInspectorConversations called');
  const inspectorData = window.getInspectorData();
  console.log('[INSPECTOR] inspectorData:', inspectorData);
  const conversationsList = inspectorData.conversations || [];
  console.log('[INSPECTOR] conversations:', conversationsList);
  console.log('[INSPECTOR] Conversation count:', conversationsList.length);
  
  return conversationsList.map(conv => {
    const vehicle = conv.vehicle || getCarById(conv.vehicleId);
    const seller = conv.seller || inspectorData.sellers?.find(s => s.id == conv.sellerId);
    return {
      id: conv.id,
      vehicleId: conv.vehicleId,
      vehicleTitle: vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : `Vehículo ${conv.vehicleId}`,
      vehicleImage: vehicle?.image || 'https://placehold.co/100x100',
      userName: seller?.name || 'Vendedor',
      lastMessage: conv.lastMessage,
      timeAgo: formatTimeAgo(conv.lastMessageTime),
      unread: conv.unread ? 1 : 0,
      isIncoming: true
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
      const messages = useMessages();
      try {
        conversations = await messages.getConversations();
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
        id: 1,
        vehicleId: 1,
        vehicleTitle: 'Toyota Corolla XEi 2021',
        vehicleImage: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=100&q=80',
        userName: 'Juan Pérez',
        lastMessage: 'Hola, me interesa el auto. ¿Está disponible?',
        timeAgo: '2h',
unread: 3,
        isIncoming: true,
        isNavigate: 'messages/buyer/chat/1'
      },
      {
        id: 2,
        vehicleId: 2,
        vehicleTitle: 'Honda Civic 2020',
        vehicleImage: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=100&q=80',
        userName: 'Auto Motors',
        lastMessage: 'Gracias por tu interés, te envío más fotos.',
        timeAgo: '1d',
        unread: 0,
        isIncoming: true,
        isNavigate: `messages/buyer/chat/2`
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
      item.dataset.navigate = conv.isNavigate || `messages/buyer/chat/${conv.vehicleId}`;
      
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