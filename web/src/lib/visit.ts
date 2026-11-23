// Anonymous page-view ping for the admin visit counter, plus the Google
// Analytics page_view (the site is a single-page app, so GA only sees the
// first load unless each route change is reported).
import { API_BASE_URL } from "./api";

const KEY = "cobra_visitor";

function visitorId(): string | null {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export function trackPageView(path: string): void {
  const id = visitorId();
  if (id) {
    fetch(`${API_BASE_URL}/api/visita`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: id }),
      keepalive: true,
    }).catch(() => {});
  }
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) gtag("event", "page_view", { page_path: path, page_location: window.location.href });
}
