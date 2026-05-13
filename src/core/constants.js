export const ROUTES = {
  HOME: 'home',
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    ROLE: 'auth/role',
  },
  VEHICLES: {
    DETAIL: 'vehicles/detail',
    ADD: 'vehicles/add',
    COMPARE: 'vehicles/compare',
  },
  USER: {
    BUYER: {
      MENU: 'user/buyer/menu',
      PROFILE: 'user/buyer/profile',
      FAVORITES: 'user/buyer/favorites',
      INVESTMENT_ADVISOR: 'user/buyer/investment-advisor',
    },
    SELLER: {
      MENU: 'user/seller/menu',
      PROFILE: 'user/seller/profile',
      PUBLICATIONS: 'user/seller/publications',
      SALES: 'user/seller/sales',
      INSIGHTS: 'user/seller/insights',
    },
    SAVED_SEARCHES: 'user/saved-searches',
  },
  MESSAGES: {
    BUYER: 'messages/buyer',
    BUYER_CHAT: 'messages/buyer/chat',
    SELLER: 'messages/seller',
    SELLER_CHAT: 'messages/seller/chat',
  },
  NOTIFICATIONS: 'notifications',
  ADMIN: {
    MENU: 'admin/menu',
    ALERTS: 'admin/alerts',
    ANALYTICS: 'admin/analytics',
    ENGINE: 'admin/engine',
    USERS: 'admin/users',
    PUBLICATIONS: 'admin/publications',
  },
};

export const STORAGE_KEYS = {
  SESSION: 'motormarket_session',
  COMPARE: 'motormarket_compare',
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  PUBLICATIONS: '/publications',
  VEHICLES: '/vehicles',
  VEHICLE_FEATURES: '/vehicle-features',
  FAVORITES: '/favorites',
  CHATS: '/chats',
  DOCUMENTS: '/documents',
  UPLOAD: '/upload',
  AI_ANALYSIS: '/ai-analysis',
  SAVED_SEARCHES: '/saved-searches',
  REPORTS: '/reports',
  VEHICLE_VIEWS: '/vehicle-views',
  NOTIFICATIONS: '/notifications',
};

export const ENUM_TRANSLATIONS = {
  transmission: {
    AUTOMATIC: 'Automática',
    MANUAL: 'Manual',
    SEMI_AUTOMATIC: 'Semi-Automática',
    CVT: 'CVT',
    OTHER: 'Otro',
  },
  fuel: {
    GASOLINE: 'Nafta',
    DIESEL: 'Diésel',
    ELECTRIC: 'Eléctrico',
    HYBRID: 'Híbrido',
    LPG: 'GNC',
    CNG: 'GNC',
    OTHER: 'Otro',
  },
  condition: {
    ACTIVE: 'Activo',
    PENDING: 'Pendiente',
    SOLD: 'Vendido',
    CANCELLED: 'Cancelado',
    EXPIRED: 'Expirado',
  },
};
