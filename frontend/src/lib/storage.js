// Small localStorage helpers. Storage can be unavailable (private mode, blocked
// site data), so every access is wrapped and the app works without it.

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: storage full or unavailable
  }
}
