/**
 * Inspector Data - Simula la base de datos para el modo inspector
 * Contiene: usuarios, vendedores, vehículos, conversaciones, mensajes, notificaciones
 */

import { CARS_DATA } from './cars.js';

const SELLERS = [
  {
    id: 1,
    name: 'Juan Pérez',
    type: 'particular',
    phone: '+54 9 351 123 4567',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
    verified: true,
    rating: 4.8,
    totalSales: 15,
    since: '2022-03-15'
  },
  {
    id: 2,
    name: 'Auto Motors',
    type: 'agencia',
    phone: '+54 9 351 987 6543',
    avatar: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=100&q=80',
    verified: true,
    rating: 4.9,
    totalSales: 127,
    since: '2020-01-10'
  },
  {
    id: 3,
    name: 'Autos Córdoba',
    type: 'agencia',
    phone: '+54 9 351 555 6666',
    avatar: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=100&q=80',
    verified: true,
    rating: 4.7,
    totalSales: 89,
    since: '2021-06-20'
  },
  {
    id: 4,
    name: 'Diego Gómez',
    type: 'particular',
    phone: '+54 9 351 789 0123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    verified: true,
    rating: 4.5,
    totalSales: 8,
    since: '2023-02-01'
  },
  {
    id: 5,
    name: 'María López',
    type: 'particular',
    phone: '+54 9 351 234 5678',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    verified: true,
    rating: 5.0,
    totalSales: 3,
    since: '2023-08-15'
  },
  {
    id: 6,
    name: 'Carlos Rodríguez',
    type: 'particular',
    phone: '+54 9 351 345 6789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    verified: false,
    rating: 4.2,
    totalSales: 5,
    since: '2022-11-01'
  }
];

const NAME_TO_SELLER_ID = {
  'Juan Pérez': 1,
  'Auto Motors': 2,
  'Autos Córdoba': 3,
  'Diego Gómez': 4,
  'María López': 5,
  'Carlos Rodríguez': 6
};

function getSellerIdByName(name) {
  return NAME_TO_SELLER_ID[name] || 1;
}

const VEHICLES = CARS_DATA.map(car => ({
  ...car,
  sellerId: getSellerIdByName(car.seller?.name),
  status: 'active',
  views: Math.floor(Math.random() * 500) + 50,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-03-01T15:30:00Z'
}));

const CONVERSATIONS = [
  {
    id: 1,
    vehicleId: 1,
    sellerId: 1,
    buyerId: 1,
    vehicle: { brand: 'Toyota', model: 'Corolla XEi', year: 2021, price: '$14.500.000', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=200&q=80' },
    seller: { name: 'Juan Pérez', type: 'particular', verified: true, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' },
    lastMessage: 'Me interesa el auto, está disponible?',
    lastMessageTime: Date.now() - 7200000,
    unread: true,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Hola, me interesa el Toyota Corolla. Está disponible?',
        timestamp: Date.now() - 86400000
      },
      {
        id: 2,
        senderId: 2,
        senderName: 'Juan Pérez',
        text: 'Hola! Sí, está disponible. Querés verlo?',
        timestamp: Date.now() - 82800000
      },
      {
        id: 3,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Me interesa el auto, está disponible?',
        timestamp: Date.now() - 7200000
      }
    ]
  },
  {
    id: 2,
    vehicleId: 3,
    sellerId: 3,
    buyerId: 1,
    vehicle: { brand: 'Volkswagen', model: 'Polo', year: 2021, price: '$11.900.000', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=200&q=80' },
    seller: { name: 'Autos Córdoba', type: 'agencia', verified: true, avatar: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=100&q=80' },
    lastMessage: 'Te envío más fotos del auto',
    lastMessageTime: Date.now() - 86400000,
    unread: true,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Buenas, tengo interés en el Volkswagen Polo',
        timestamp: Date.now() - 172800000
      },
      {
        id: 2,
        senderId: 3,
        senderName: 'Autos Córdoba',
        text: 'Te envío más fotos del auto',
        timestamp: Date.now() - 86400000
      }
    ]
  },
  {
    id: 3,
    vehicleId: 5,
    sellerId: 5,
    buyerId: 1,
    vehicle: { brand: 'Peugeot', model: '208', year: 2022, price: '$16.300.000', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80' },
    seller: { name: 'María López', type: 'particular', verified: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80' },
    lastMessage: 'El precio es negociable?',
    lastMessageTime: Date.now() - 172800000,
    unread: false,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'El precio es negociable?',
        timestamp: Date.now() - 172800000
      },
      {
        id: 2,
        senderId: 5,
        senderName: 'María López',
        text: 'Hola! Sí, podemos negociar. Cuál es tu oferta?',
        timestamp: Date.now() - 169200000
      }
    ]
  },
  {
    id: 4,
    vehicleId: 2,
    sellerId: 2,
    buyerId: 1,
    vehicle: { brand: 'Honda', model: 'Civic', year: 2020, price: '$12.500.000', image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=200&q=80' },
    seller: { name: 'Auto Motors', type: 'agencia', verified: true, avatar: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=100&q=80' },
    lastMessage: 'Cuándo lo puedo ir a ver?',
    lastMessageTime: Date.now() - 259200000,
    unread: false,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Tengo interés en el Civic. Cuándo lo puedo ir a ver?',
        timestamp: Date.now() - 259200000
      },
      {
        id: 2,
        senderId: 2,
        senderName: 'Auto Motors',
        text: 'Estamos abiertos de 9 a 18hs. Podés venir cuando quieras!',
        timestamp: Date.now() - 255600000
      },
      {
        id: 3,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Perfecto, paso mañana a la tarde',
        timestamp: Date.now() - 252000000
      }
    ]
  },
  {
    id: 5,
    vehicleId: 4,
    sellerId: 4,
    buyerId: 1,
    vehicle: { brand: 'Volkswagen', model: 'Amarok', year: 2020, price: '$24.900.000', image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=200&q=80' },
    seller: { name: 'Diego Gómez', type: 'particular', verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    lastMessage: 'Aceptamos permuta',
    lastMessageTime: Date.now() - 432000000,
    unread: false,
    messages: [
      {
        id: 1,
        senderId: 1,
        senderName: 'Usuario Inspector',
        text: 'Buenas, me interesa la Amarok. Tiene 4x4?',
        timestamp: Date.now() - 432000000
      },
      {
        id: 2,
        senderId: 4,
        senderName: 'Diego Gómez',
        text: 'Sí, es 4x4 completa. Aceptamos permuta',
        timestamp: Date.now() - 428400000
      }
    ]
  }
];

const NOTIFICATIONS = [
  {
    id: 1,
    type: 'favorite',
    vehicleId: 1,
    message: 'Toyota Corolla guardado en favoritos',
    timestamp: Date.now() - 3600000,
    read: false
  },
  {
    id: 2,
    type: 'message',
    conversationId: 1,
    vehicleId: 1,
    sellerId: 1,
    message: 'Juan Pérez te contactó sobre Corolla',
    timestamp: Date.now() - 7200000,
    read: false
  },
  {
    id: 3,
    type: 'lead',
    vehicleId: 2,
    sellerId: 2,
    message: 'Nuevo interesado en Honda Civic',
    timestamp: Date.now() - 14400000,
    read: false
  },
  {
    id: 4,
    type: 'message',
    conversationId: 2,
    vehicleId: 3,
    sellerId: 3,
    message: 'Autos Córdoba te envió fotos del Volkswagen Polo',
    timestamp: Date.now() - 86400000,
    read: true
  },
  {
    id: 5,
    type: 'favorite',
    vehicleId: 5,
    message: 'Peugeot 208 guardado en favoritos',
    timestamp: Date.now() - 259200000,
    read: true
  }
];

const FAVORITES = [1, 3, 5];

export const INSPECTOR_DATA = {
  session: {
    id: 1,
    name: 'Usuario Inspector',
    email: 'inspector@motormarket.com',
    role: 'buyer',
    roles: ['buyer'],
    avatar: null,
    phone: '+5491155555555',
    createdAt: '2024-01-01T00:00:00Z'
  },
  sellers: SELLERS,
  vehicles: VEHICLES,
  conversations: CONVERSATIONS,
  notifications: NOTIFICATIONS,
  favorites: FAVORITES,
  users: [
    { id: 1, name: 'Usuario Inspector', email: 'inspector@motormarket.com', role: 'buyer', phone: '+5491155555555' },
    { id: 2, name: 'Juan Pérez', email: 'juan@perez.com', role: 'seller', phone: '+54 9 351 123 4567' },
    { id: 3, name: 'Auto Motors', email: 'ventas@automotors.com', role: 'seller', phone: '+54 9 351 987 6543' },
    { id: 4, name: 'Autos Córdoba', email: 'info@autoscordoba.com', role: 'seller', phone: '+54 9 351 555 6666' },
    { id: 5, name: 'María López', email: 'maria@lopez.com', role: 'seller', phone: '+54 9 351 234 5678' },
    { id: 6, name: 'Carlos Rodríguez', email: 'carlos@rodriguez.com', role: 'seller', phone: '+54 9 351 345 6789' }
  ]
};

export function getInspectorData() {
  return INSPECTOR_DATA;
}

export function getSellerById(id) {
  return SELLERS.find(s => s.id == id);
}

export function getConversationById(id) {
  return CONVERSATIONS.find(c => c.id == id);
}

export function getConversationByVehicleAndBuyer(vehicleId, buyerId) {
  return CONVERSATIONS.find(c => c.vehicleId == vehicleId && c.buyerId == buyerId);
}

export function getConversationsByBuyer(buyerId) {
  return CONVERSATIONS.filter(c => c.buyerId == buyerId);
}

export function getConversationsBySeller(sellerId) {
  return CONVERSATIONS.filter(c => c.sellerId == sellerId);
}

export function getNotificationsByUser(userId) {
  return NOTIFICATIONS;
}

export function getFavoritesByUser(userId) {
  return FAVORITES;
}

export function addMessageToConversation(conversationId, message) {
  const conversation = CONVERSATIONS.find(c => c.id == conversationId);
  if (conversation) {
    const newMessage = {
      id: conversation.messages.length + 1,
      ...message,
      timestamp: Date.now()
    };
    conversation.messages.push(newMessage);
    conversation.lastMessage = message.text;
    conversation.lastMessageTime = Date.now();
    return newMessage;
  }
  return null;
}

export function markConversationAsRead(conversationId) {
  const conversation = CONVERSATIONS.find(c => c.id == conversationId);
  if (conversation) {
    conversation.unread = false;
  }
}

export function markNotificationAsRead(notificationId) {
  const notification = NOTIFICATIONS.find(n => n.id == notificationId);
  if (notification) {
    notification.read = true;
  }
}

export function toggleFavorite(userId, vehicleId) {
  const index = FAVORITES.indexOf(vehicleId);
  if (index > -1) {
    FAVORITES.splice(index, 1);
    return false;
  } else {
    FAVORITES.push(vehicleId);
    return true;
  }
}

export function findOrCreateConversation(vehicleId, sellerId, buyerId) {
  let conversation = CONVERSATIONS.find(c => c.vehicleId == vehicleId && c.buyerId == buyerId);
  if (!conversation) {
    const vehicle = VEHICLES.find(v => v.id == vehicleId);
    conversation = {
      id: CONVERSATIONS.length + 1,
      vehicleId,
      sellerId,
      buyerId,
      lastMessage: '',
      lastMessageTime: Date.now(),
      unread: false,
      messages: []
    };
    CONVERSATIONS.push(conversation);
  }
  return conversation;
}

export default INSPECTOR_DATA;