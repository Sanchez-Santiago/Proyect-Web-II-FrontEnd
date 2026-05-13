const STORAGE_KEY = 'motormarket_session';

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(sessionData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function getSession() {
  return readSession();
}

function isLoggedIn() {
  const session = readSession();
  return session !== null && !!session.token;
}

function hasAdminAccess() {
  const session = readSession();
  console.log('[SESSION] Checking admin access:', { 
    isLoggedIn: !!session, 
    role: session?.role, 
    isAdmin: session?.isAdmin 
  });
  
  if (!session) return false;
  
  const role = (session.role || '').toLowerCase();
  if (session.isAdmin === true || role === 'admin') return true;
  
  if (Array.isArray(session.roles)) {
    return session.roles.some(r => (r || '').toLowerCase() === 'admin');
  }
  return false;
}

function getRole() {
  const session = readSession();
  return session ? session.role : null;
}

export { readSession, saveSession, clearSession, getSession, isLoggedIn, hasAdminAccess, getRole };
