import { useMessages } from '../../../hooks/useMessages.js';
import { navigateTo } from '../../../js/router.js';
import state from '../../../js/state.js';
import { getCarById } from '../../../data/cars.js';

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

export default {
  async init() {
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');
    const vehicleImage = document.getElementById('chatVehicleImage');
    const vehicleTitle = document.getElementById('chatVehicleTitle');
    const sellerName = document.getElementById('chatSellerName');

    const vehicleId = window.chatVehicleId || 1;

    state.init();
    if (!state.isLoggedIn() && !isInspector) {
      navigateTo('auth/login');
      return;
    }

    if (vehicleId) {
      const car = getCarById(vehicleId);
      if (car) {
        if (vehicleImage) vehicleImage.src = car.image;
        if (vehicleTitle) vehicleTitle.textContent = `${car.brand} ${car.model} ${car.year}`;
        if (sellerName) sellerName.textContent = car.seller?.name || 'Vendedor';
      }
    }

    this.loadMessages(vehicleId);

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

        this.sendMessage(vehicleId, message, messagesContainer);
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
      { message: 'Hola, me interesa el auto. **¿Está disponible para verlo?**', time: '10:30', isOutgoing: false },
      { message: 'Sí, está disponible. *¿Cuándo puedes pasar?*', time: '10:32', isOutgoing: true },
      { message: 'Puedo pasar mañana por la tarde.', time: '10:35', isOutgoing: false },
      { message: 'Perfecto, te espero mañana a las 16hs.', time: '10:38', isOutgoing: true }
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

  async sendMessage(vehicleId, text, container) {
    if (!container) container = document.getElementById('chatMessages');
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
        const replyMessage = document.createElement('div');
        replyMessage.className = 'message message-incoming';
        const replies = [
          '¡Gracias por tu mensaje! ¿Te interesa este auto?',
          'Está disponible. ¿Cuándo quieres verlo?',
          'Podemos coordinar para mañana.',
          'Tengo más fotos si quieres verlas.'
        ];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const replyTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        replyMessage.innerHTML = `
          <p>${parseMarkdown(replyText)}</p>
          <span class="message-time">${replyTime}</span>
        `;
        container.appendChild(replyMessage);
        container.scrollTop = container.scrollHeight;
      }, 1500);
      return;
    }

    try {
      const messages = useMessages();
      await messages.send({ vehicleId, message: text });
    } catch (err) {
      console.warn('Mensaje guardado localmente');
    }
  }
};