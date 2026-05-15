import { useChats } from '../../../hooks/useChats.js';
import { useSocket } from '../../../hooks/useSocket.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';

let chatId = null;
let socket = null;

function showSkeleton(container) {
  if (!container) return;
  container.innerHTML = Array(5).fill(0).map((_, i) => {
    const side = i % 2 === 0 ? 'message-incoming' : 'message-outgoing';
    const align = i % 2 === 0 ? '' : 'align-items:flex-end;';
    const w = 40 + Math.random() * 35;
    return `<div class="message ${side}" style="${align}"><p class="skeleton" style="width:${w}%;height:48px;border-radius:20px;margin:0;"></p></div>`;
  }).join('');
}

function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  return html;
}

function formatTime(dateString) {
  if (!dateString) return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return new Date(dateString).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(msg, isOutgoing) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
  div.innerHTML = `
    <p>${parseMarkdown(msg.message)}</p>
    <span class="message-time">${formatTime(msg.createdAt)}</span>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

export default {
  async init() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');
    const vehicleImage = document.getElementById('chatVehicleImage');
    const vehicleTitle = document.getElementById('chatVehicleTitle');
    const sellerName = document.getElementById('chatSellerName');

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    showSkeleton(messagesContainer);

    const createForPubId = state.getPersistent('createForPubId');
    state.clearPersistent();

    if (createForPubId) {
      try {
        const chats = useChats();
        const res = await chats.createOrGet(createForPubId);
        const chat = res.chat || res;
        if (chat?.id) {
          chatId = chat.id;
          state.setParams({ chatId });
        }
      } catch (err) {
        console.error('[CHAT] Error creating chat:', err.message);
        if (messagesContainer) messagesContainer.innerHTML = '<div class="no-results" style="padding:2rem;text-align:center;">Error al iniciar el chat.</div>';
        return;
      }
    } else {
      chatId = state.getParam('chatId');
    }

    if (!chatId) {
      navigateTo('messages/buyer');
      return;
    }

    socket = useSocket();
    socket.connect();
    if (chatId) socket.joinChat(chatId);
    socket.on('newMessage', (data) => {
      const userId = state.getSession()?.id;
      if (data.user?.id === userId) return;
      appendMessage(data, false);
    });
    socket.on('messagesRead', () => {});

    await this.loadChatInfo(vehicleImage, vehicleTitle, sellerName);
    await this.loadMessages();

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          form?.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      });
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        this.sendMessage(message);
        input.value = '';
      });
    }
  },

  async loadChatInfo(vehicleImage, vehicleTitle, sellerName) {
    try {
      const chats = useChats();
      const response = await chats.getById(chatId);
      const chat = response.chat;
      const vehicle = chat?.publication?.vehicle || {};
      const seller = chat?.publication?.seller || {};

      if (vehicleImage) vehicleImage.src = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
      if (vehicleTitle) vehicleTitle.textContent = chat?.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehiculo';
      if (sellerName) sellerName.textContent = seller.fullName || 'Vendedor';
    } catch (err) {
      console.warn('[CHAT] Error loading chat info:', err.message);
    }
  },

  async loadMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    try {
      const chats = useChats();
      const response = await chats.getMessages(chatId, 1, 100);
      const msgs = response.messages || [];
      const userId = state.getSession()?.id;

      if (msgs.length > 0) {
        this.renderMessages(msgs, container, userId);
      } else {
        container.innerHTML = '<div class="no-results" style="padding:2rem;text-align:center;">No hay mensajes aun. Envia el primero.</div>';
      }
    } catch (err) {
      console.warn('[CHAT] Error loading messages:', err.message);
      container.innerHTML = '<div class="no-results" style="padding:2rem;text-align:center;">Error al cargar los mensajes.</div>';
    }
  },

  renderMessages(msgs, container, userId) {
    if (!container) return;
    container.innerHTML = '';
    msgs.forEach(msg => {
      const isOutgoing = msg.isOutgoing !== undefined ? msg.isOutgoing : msg.user?.id === userId;
      const div = document.createElement('div');
      div.className = `message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
      div.innerHTML = `
        <p>${parseMarkdown(msg.message)}</p>
        <span class="message-time">${formatTime(msg.createdAt)}</span>
      `;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  },

  async sendMessage(text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const newMessage = document.createElement('div');
    newMessage.className = 'message message-outgoing message-sending';
    newMessage.innerHTML = `
      <p>${parseMarkdown(text)}</p>
      <span class="message-time">${time} <i class="bi bi-clock"></i></span>
    `;
    container.appendChild(newMessage);
    container.scrollTop = container.scrollHeight;

    try {
      const chats = useChats();
      const response = await chats.sendMessage(chatId, text);

      if (response?.data) {
        const timeSpan = newMessage.querySelector('.message-time');
        if (timeSpan) {
          timeSpan.innerHTML = `${formatTime(response.data.createdAt)} <i class="bi bi-check2-all" style="color:#22c55e;"></i>`;
        }
      }
    } catch (err) {
      console.warn('[CHAT] Message send error:', err.message);
    }

    setTimeout(() => {
      newMessage.classList.remove('message-sending');
      const timeSpan = newMessage.querySelector('.message-time');
      if (timeSpan && !timeSpan.querySelector('.bi-check2-all')) {
        timeSpan.innerHTML = `${time} <i class="bi bi-check2" style="color:#6b7280;"></i>`;
      }
    }, 800);
  },

  destroy() {
    if (socket) {
      if (chatId) socket.leaveChat(chatId);
      socket.off('newMessage');
      socket.off('messagesRead');
      socket.disconnect();
      socket = null;
    }
  }
};
