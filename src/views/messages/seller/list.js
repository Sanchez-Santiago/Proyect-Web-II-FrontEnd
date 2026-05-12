import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Date.now() - new Date(dateString).getTime();
  if (diff < 3600000) return Math.floor(diff / 3600000) + 'h';
  if (diff < 86400000) return Math.floor(diff / 86400000) + 'd';
  return Math.floor(diff / 86400000) + 'd';
}

function normalizeChat(chat, userId) {
  const vehicle = chat.publication?.vehicle || {};
  const lastMsg = chat.messages?.[0];
  const buyer = lastMsg?.user;
  const vehicleImage = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
  const vehicleTitle = chat.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';

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

function isInspectorMode() {
  return typeof window.getInspectorData === 'function';
}

function getInspectorConversations() {
  const inspectorData = window.getInspectorData();
  const list = inspectorData.conversations || [];

  return list.map(conv => {
    const vehicle = conv.vehicle || {};
    return {
      id: conv.id,
      vehicleId: conv.vehicleId,
      vehicleTitle: `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || `Vehículo ${conv.vehicleId}`,
      vehicleImage: vehicle?.image || 'https://placehold.co/100x100',
      userName: conv.seller?.name || 'Vendedor',
      lastMessage: conv.lastMessage,
      timeAgo: formatTimeAgo(conv.lastMessageTime),
      unread: conv.unread ? 1 : 0,
      isNavigate: conv.id ? `messages/seller/chat/${conv.id}` : '#'
    };
  });
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

    if (isInspectorMode()) {
      const conversations = getInspectorConversations();
      this.renderConversations(conversations, conversationsList);
      this.renderLeads(conversations, leadsList);
      return;
    }

    const chats = useChats();

    try {
      const response = await chats.getAll();
      const rawChats = response.chats || [];
      const userId = state.getSession()?.id;
      const conversations = rawChats.map(chat => normalizeChat(chat, userId));

      if (!conversations || conversations.length === 0) {
        conversationsList.hidden = true;
        leadsList.hidden = true;
        if (empty) empty.hidden = false;
        return;
      }

      this.renderConversations(conversations, conversationsList);
      this.renderLeads(conversations, leadsList);
    } catch (err) {
      console.log('Mostrando datos demo:', err.message);
      const demoData = this.getDemoData();
      this.renderConversations(demoData.conversations, conversationsList);
      this.renderLeads(demoData.leads, leadsList);
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

  getDemoData() {
    return {
      conversations: [
        { id: 'demo-1', vehicleTitle: 'Toyota Corolla XEi', userName: 'Juan Pérez', lastMessage: 'Me interesa el auto', timeAgo: '2h', unread: 2, isNavigate: 'messages/seller/chat/demo-1' },
        { id: 'demo-2', vehicleTitle: 'Honda Civic', userName: 'María González', lastMessage: '¿Tiene service al día?', timeAgo: '5h', unread: 1, isNavigate: 'messages/seller/chat/demo-2' }
      ],
      leads: [
        { id: 1, vehicleTitle: 'Toyota Corolla XEi', userName: 'Carlos López', phone: '+54 9 351 111 2222', interest: 'Alto', source: 'Web', date: '2024-01-15' },
        { id: 2, vehicleTitle: 'Toyota Corolla XEi', userName: 'Ana Martínez', phone: '+54 9 351 333 4444', interest: 'Medio', source: 'Chat', date: '2024-01-14' },
        { id: 3, vehicleTitle: 'Honda Civic', userName: 'Pedro Sánchez', phone: '+54 9 351 555 6666', interest: 'Alto', source: 'Web', date: '2024-01-13' }
      ]
    };
  },

  renderConversations(convs, container) {
    if (!container) return;

    container.innerHTML = '';
    container.hidden = false;

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

  renderLeads(leads, container) {
    if (!container) return;

    container.innerHTML = '';
    container.hidden = false;

    const interestClass = {
      'Alto': 'lead-high',
      'Medio': 'lead-medium',
      'Bajo': 'lead-low'
    };

    leads.forEach(lead => {
      const item = document.createElement('article');
      item.className = 'lead-item';

      item.innerHTML = `
        <div class="lead-info">
          <h3>${lead.userName}</h3>
          <p>${lead.vehicleTitle}</p>
          <small>${lead.phone} • ${lead.source}</small>
        </div>
        <div class="lead-meta">
          <span class="lead-interest ${interestClass[lead.interest] || ''}">${lead.interest}</span>
          <span class="lead-date">${lead.date}</span>
        </div>
        <button type="button" class="lead-contact-btn" data-phone="${lead.phone}">
          <i class="bi bi-whatsapp"></i> Contactar
        </button>
      `;

      container.appendChild(item);
    });

    this.setupLeadsHandlers(container);
  },

  setupClickHandlers(container) {
    container.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.navigate;
        if (view) navigateTo(view);
      });
    });
  },

  setupLeadsHandlers(container) {
    container.querySelectorAll('.lead-contact-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const phone = btn.dataset.phone;
        if (phone) {
          window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
        }
      });
    });
  }
};
