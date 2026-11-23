// Login token storage. Uses localStorage so the user stays logged in after
// closing the tab or the browser (sessionStorage was wiped on every tab
// close). Wrapped in try/catch: storage can throw in private mode or
// restricted contexts, and then we just fall back to "not logged in".
const KEY = "cobra_token";

export function getToken(): string | null {
  try {
    const t = localStorage.getItem(KEY);
    if (t) return t;
    // One-time migration from the old sessionStorage location.
    const old = sessionStorage.getItem(KEY);
    if (old) {
      localStorage.setItem(KEY, old);
      sessionStorage.removeItem(KEY);
    }
    return old;
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
