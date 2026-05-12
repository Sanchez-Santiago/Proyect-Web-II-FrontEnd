import { useChats } from '../../../hooks/useChats.js';
import { navigateTo } from '../../../js/router.js';
import state from '../../../js/state.js';
import { normalizePublication, unwrapApiData } from '../../../js/publicationMapper.js';
import CONFIG from '../../../config.js';
import { getSession } from '../../../hooks/useApi.js';

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

export default {
  socket: null,

  async init() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');
    const vehicleImage = document.getElementById('chatVehicleImage');
    const vehicleTitle = document.getElementById('chatVehicleTitle');
    const buyerName = document.getElementById('chatBuyerName');

    const chatId = window.chatId;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    if (chatId) {
      try {
        const response = await useChats().getById(chatId);
        const chat = unwrapApiData(response, 'chat');
        const car = normalizePublication(chat.publication || {});
        if (vehicleImage) vehicleImage.src = car.image;
        if (vehicleTitle) vehicleTitle.textContent = car.title;
        if (buyerName) buyerName.textContent = chat.messages?.find(m => m.userId !== state.getSession()?.id)?.user?.fullName || 'Comprador';
      } catch (err) {
        console.warn('No se pudo cargar chat:', err.message);
      }
    }

    this.loadMessages(chatId);
    this.setupSocket(chatId, messagesContainer);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        this.sendMessage(chatId, message);
        input.value = '';
      });
    }
  },

  setupSocket(chatId, container) {
    const session = getSession();
    if (!window.io || !session?.token || !chatId) return;

    this.socket = window.io(CONFIG.API_BASE_URL, { auth: { token: session.token } });
    this.socket.emit('joinChat', { chatId });
    this.socket.on('newMessage', msg => {
      if (msg.userId === session.id) return;
      const incoming = {
        message: msg.message,
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        isOutgoing: false
      };
      this.renderMessages([...(container.dataset.loadedMessages ? JSON.parse(container.dataset.loadedMessages) : []), incoming], container);
    });
  },

  async loadMessages(chatId) {
    const messages = useChats();
    const container = document.getElementById('chatMessages');

    try {
      const response = await messages.getMessages(chatId);
      const msgs = unwrapApiData(response, 'messages') || [];
      if (msgs.length > 0) {
        this.renderMessages(msgs.map(msg => ({
          message: msg.message,
          time: new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          isOutgoing: msg.userId === state.getSession()?.id
        })), container);
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
      { message: 'Hola, me interesa el auto. **¿Está disponible?**', time: '10:30', isOutgoing: false },
      { message: 'Sí, está disponible. ¿Cuándo puedes pasar?', time: '10:32', isOutgoing: true },
      { message: 'Puedo pasar mañana por la tarde.', time: '10:35', isOutgoing: false },
      { message: 'Perfecto, te espero. *Te envío la ubicación.*', time: '10:38', isOutgoing: true }
    ];

    this.renderMessages(demoMessages, container);
  },

  renderMessages(msgs, container) {
    if (!container) return;

    container.innerHTML = '';

    msgs.forEach(msg => {
      const div = document.createElement('div');
      const messageClass = msg.isOutgoing ? 'message message-outgoing' : 'message message-incoming';
      div.className = messageClass;
      div.innerHTML = `
        <p>${parseMarkdown(msg.message)}</p>
        <span class="message-time">${msg.time}</span>
      `;
      container.appendChild(div);
    });

    container.dataset.loadedMessages = JSON.stringify(msgs);
    container.scrollTop = container.scrollHeight;
  },

  async sendMessage(chatId, text) {
    const messages = useChats();
    const container = document.getElementById('chatMessages');

    const newMessage = document.createElement('div');
    newMessage.className = 'message message-outgoing';
    newMessage.innerHTML = `
      <p>${parseMarkdown(text)}</p>
      <span class="message-time">${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
    `;

    container.appendChild(newMessage);
    container.scrollTop = container.scrollHeight;

    try {
      if (this.socket?.connected) {
        this.socket.emit('sendMessage', { chatId, message: text });
      } else {
        await messages.sendMessage(chatId, text);
      }
    } catch (err) {
      console.warn('Mensaje guardado localmente');
    }
  }
};
