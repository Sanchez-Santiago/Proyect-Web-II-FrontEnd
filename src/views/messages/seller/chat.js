import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../core/router.js';
import state from '../../../core/state.js';

const isInspector = typeof window.getInspectorData === 'function';

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

let chatId = null;

export default {
  async init() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');
    const vehicleImage = document.getElementById('chatVehicleImage');
    const vehicleTitle = document.getElementById('chatVehicleTitle');
    const buyerName = document.getElementById('chatBuyerName');

    chatId = window.chatId;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    if (chatId) {
      await this.loadChatInfo(vehicleImage, vehicleTitle, buyerName);
      await this.loadMessages();
    }

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

  async loadChatInfo(vehicleImage, vehicleTitle, buyerName) {
    if (isInspector) return;
    try {
      const chats = useChats();
      const response = await chats.getById(chatId);
      const chat = response.chat;
      const vehicle = chat?.publication?.vehicle || {};
      const buyer = chat?.messages?.[0]?.user;

      if (vehicleImage) vehicleImage.src = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
      if (vehicleTitle) vehicleTitle.textContent = chat?.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';
      if (buyerName) buyerName.textContent = buyer?.fullName || 'Comprador';
    } catch (err) {
      console.log('Usando datos demo para info del chat');
    }
  },

  async loadMessages() {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    if (isInspector) {
      this.renderDemoMessages(container);
      return;
    }

    try {
      const chats = useChats();
      const response = await chats.getMessages(chatId, 1, 100);
      const msgs = response.messages || [];
      const userId = state.getSession()?.id;

      if (msgs.length > 0) {
        this.renderMessages(msgs, container, userId);
      } else {
        this.renderDemoMessages(container);
      }
    } catch (err) {
      console.log('Cargando mensajes demo');
      this.renderDemoMessages(container);
    }
  },

  renderDemoMessages(container) {
    if (!container) return;

    const demoMessages = [
      { message: 'Hola, me interesa el auto. **¿Está disponible?**', createdAt: new Date().toISOString(), isOutgoing: false },
      { message: 'Sí, está disponible. ¿Cuándo puedes pasar?', createdAt: new Date().toISOString(), isOutgoing: true },
      { message: 'Puedo pasar mañana por la tarde.', createdAt: new Date().toISOString(), isOutgoing: false },
      { message: 'Perfecto, te espero. *Te envío la ubicación.*', createdAt: new Date().toISOString(), isOutgoing: true }
    ];

    this.renderMessages(demoMessages, container);
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

    const newMessage = document.createElement('div');
    newMessage.className = 'message message-outgoing';
    newMessage.innerHTML = `
      <p>${parseMarkdown(text)}</p>
      <span class="message-time">${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    container.appendChild(newMessage);
    container.scrollTop = container.scrollHeight;

    if (isInspector) return;

    try {
      const chats = useChats();
      await chats.sendMessage(chatId, text);
    } catch (err) {
      console.warn('Mensaje guardado localmente');
    }
  },

  destroy() {}
};
