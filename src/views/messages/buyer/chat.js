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

    chatId = window.chatId;

    state.init();
    if (!state.isLoggedIn() && !isInspector) {
      navigateTo('auth/login');
      return;
    }

    if (chatId) {
      await this.loadChatInfo(vehicleImage, vehicleTitle, sellerName);
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

  async loadChatInfo(vehicleImage, vehicleTitle, sellerName) {
    if (isInspector) return;
    try {
      const chats = useChats();
      const response = await chats.getById(chatId);
      const chat = response.chat;
      const vehicle = chat?.publication?.vehicle || {};
      const seller = chat?.publication?.seller || {};

      if (vehicleImage) vehicleImage.src = vehicle.images?.[0]?.imageUrl || 'https://placehold.co/100x100';
      if (vehicleTitle) vehicleTitle.textContent = chat?.publication?.title || `${vehicle.brand || ''} ${vehicle.model || ''} ${vehicle.year || ''}`.trim() || 'Vehículo';
      if (sellerName) sellerName.textContent = seller.fullName || 'Vendedor';
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
      { message: 'Hola, me interesa el auto. **¿Está disponible para verlo?**', createdAt: new Date().toISOString(), isOutgoing: false },
      { message: 'Sí, está disponible. *¿Cuándo puedes pasar?*', createdAt: new Date().toISOString(), isOutgoing: true },
      { message: 'Puedo pasar mañana por la tarde.', createdAt: new Date().toISOString(), isOutgoing: false },
      { message: 'Perfecto, te espero mañana a las 16hs.', createdAt: new Date().toISOString(), isOutgoing: true }
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

    const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const newMessage = document.createElement('div');
    newMessage.className = 'message message-outgoing message-sending';
    newMessage.innerHTML = `
      <p>${parseMarkdown(text)}</p>
      <span class="message-time">${time} <i class="bi bi-clock"></i></span>
    `;
    container.appendChild(newMessage);
    container.scrollTop = container.scrollHeight;

    setTimeout(() => {
      newMessage.classList.remove('message-sending');
      const timeSpan = newMessage.querySelector('.message-time');
      if (timeSpan) {
        timeSpan.innerHTML = `${time} <i class="bi bi-check2-all" style="color:#22c55e;"></i>`;
      }
    }, 800);

    if (isInspector) {
      setTimeout(() => {
        const replies = [
          '¡Gracias por tu mensaje! ¿Te interesa este auto?',
          'Está disponible. ¿Cuándo quieres verlo?',
          'Podemos coordinar para mañana.',
          'Tengo más fotos si quieres verlas.'
        ];
        appendMessage({
          message: replies[Math.floor(Math.random() * replies.length)],
          createdAt: new Date().toISOString()
        }, false);
      }, 1500);
      return;
    }

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
      console.warn('Mensaje guardado localmente');
    }
  },

  destroy() {}
};
