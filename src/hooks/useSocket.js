import CONFIG from '../config.js';

const STATUS_SELECTOR = 'socket-status-indicator';

let socket = null;
let listeners = {};
let heartbeatInterval = null;
let reconnectTimer = null;

function getToken() {
  try {
    const raw = localStorage.getItem('motormarket_session');
    const session = raw ? JSON.parse(raw) : null;
    return session?.token || null;
  } catch {
    return null;
  }
}

function updateStatus(status) {
  const el = document.getElementById(STATUS_SELECTOR);
  if (!el) return;
  const dot = el.querySelector('.socket-dot');
  const label = el.querySelector('.socket-label');
  if (dot) {
    dot.className = 'socket-dot';
    if (status === 'connected') dot.classList.add('connected');
    else if (status === 'connecting') dot.classList.add('connecting');
    else dot.classList.add('disconnected');
  }
  if (label) {
    const labels = { connected: 'En l\u00ednea', connecting: 'Conectando...', disconnected: 'Desconectado' };
    label.textContent = labels[status] || 'Desconectado';
  }
}

function ensureStatusElement() {
  if (document.getElementById(STATUS_SELECTOR)) return;
  const target = document.querySelector('.home-header-content') || document.body;
  const el = document.createElement('div');
  el.id = STATUS_SELECTOR;
  el.className = 'socket-status-indicator';
  el.innerHTML = '<span class="socket-dot disconnected"></span><span class="socket-label">Desconectado</span>';
  el.title = 'Estado de conexi\u00f3n en tiempo real';
  target.appendChild(el);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      const start = Date.now();
      socket.emit('ping', () => {
        const latency = Date.now() - start;
        const el = document.getElementById(STATUS_SELECTOR);
        if (el) el.title = `Latencia: ${latency}ms`;
      });
    }
  }, 30000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function useSocket() {
  function connect() {
    if (socket?.connected) return socket;

    const token = getToken();
    if (!token) {
      console.warn('[Socket] No token available, cannot connect');
      return null;
    }

    if (typeof io === 'undefined') {
      console.warn('[Socket] Socket.IO client not loaded. Add the CDN script to index.html');
      return null;
    }

    ensureStatusElement();
    updateStatus('connecting');

    if (socket) {
      socket.removeAllListeners();
      if (!socket.connected) {
        socket.connect();
      }
      return socket;
    }

    socket = io(CONFIG.API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      randomizationFactor: 0.5,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      updateStatus('connected');
      startHeartbeat();
      if (listeners.status) listeners.status.forEach(cb => cb('connected'));
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      updateStatus('disconnected');
      stopHeartbeat();
      if (reason === 'io server disconnect') {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => connect(), 3000);
      }
      if (listeners.status) listeners.status.forEach(cb => cb('disconnected'));
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
      updateStatus('disconnected');
      if (listeners.status) listeners.status.forEach(cb => cb('disconnected'));
    });

    socket.on('reconnect_attempt', () => {
      updateStatus('connecting');
    });

    socket.on('reconnect', (attempt) => {
      console.log('[Socket] Reconnected after', attempt, 'attempts');
      updateStatus('connected');
      startHeartbeat();
      if (listeners.status) listeners.status.forEach(cb => cb('connected'));
    });

    socket.on('newMessage', (data) => {
      if (listeners.newMessage) {
        listeners.newMessage.forEach(cb => cb(data));
      }
    });

    socket.on('messagesRead', (data) => {
      if (listeners.messagesRead) {
        listeners.messagesRead.forEach(cb => cb(data));
      }
    });

    return socket;
  }

  function disconnect() {
    stopHeartbeat();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
    listeners = {};
    updateStatus('disconnected');
  }

  function joinChat(chatId) {
    if (!socket?.connected) return;
    socket.emit('joinChat', { chatId });
  }

  function leaveChat(chatId) {
    if (!socket?.connected) return;
    socket.emit('leaveChat', { chatId });
  }

  function sendMessage(chatId, message) {
    if (!socket?.connected) return false;
    socket.emit('sendMessage', { chatId, message });
    return true;
  }

  function markAsRead(chatId) {
    if (!socket?.connected) return;
    socket.emit('markAsRead', { chatId });
  }

  function on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  }

  function off(event, callback) {
    if (!listeners[event]) return;
    if (callback) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    } else {
      delete listeners[event];
    }
  }

  function isConnected() {
    return socket?.connected || false;
  }

  return {
    connect,
    disconnect,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
    on,
    off,
    isConnected,
  };
}

export default useSocket;
