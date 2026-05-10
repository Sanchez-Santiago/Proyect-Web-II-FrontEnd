import { useMessages } from '../../../hooks/useMessages.js';
import { navigateTo } from '../../../js/router.js';
import state from '../../../js/state.js';
import { getCarById } from '../../../data/cars.js';

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
  async init() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');
    const vehicleImage = document.getElementById('chatVehicleImage');
    const vehicleTitle = document.getElementById('chatVehicleTitle');
    const buyerName = document.getElementById('chatBuyerName');

    const vehicleId = window.chatVehicleId;

    if (!state.isLoggedIn()) {
      navigateTo('auth/login');
      return;
    }

    if (vehicleId) {
      const car = getCarById(vehicleId);
      if (car) {
        if (vehicleImage) vehicleImage.src = car.image;
        if (vehicleTitle) vehicleTitle.textContent = `${car.brand} ${car.model} ${car.year}`;
        if (buyerName) buyerName.textContent = car.seller.name;
      }
    }

    this.loadMessages(vehicleId);

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;

        this.sendMessage(vehicleId, message);
        input.value = '';
      });
    }
  },

  async loadMessages(vehicleId) {
    const messages = useMessages();
    const container = document.getElementById('chatMessages');

    try {
      const msgs = await messages.getByVehicle(vehicleId);
      if (msgs && msgs.length > 0) {
        this.renderMessages(msgs, container);
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

    container.scrollTop = container.scrollHeight;
  },

  async sendMessage(vehicleId, text) {
    const messages = useMessages();
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
      await messages.send({
        vehicleId,
        message: text
      });
    } catch (err) {
      console.warn('Mensaje guardado localmente');
    }
  }
};