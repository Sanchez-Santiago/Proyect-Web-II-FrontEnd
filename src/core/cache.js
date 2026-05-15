const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet(key, data, ttl = 30000) {
  store.set(key, { data, expiresAt: Date.now() + ttl });
}

export function cacheDelete(key) {
  store.delete(key);
}

export function cacheClear() {
  store.clear();
}

export function cacheKeys(pattern) {
  if (!pattern) return Array.from(store.keys());
  const regex = new RegExp(pattern);
  return Array.from(store.keys()).filter(k => regex.test(k));
}
