// Anonymous page-view ping for the admin visit counter. Google Analytics
// counts route changes by itself ("metrica otimizada" -> mudancas no
// historico do navegador), so nothing is sent to GA from here.
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

export function trackPageView(_path: string): void {
  const id = visitorId();
  if (id) {
    fetch(`${API_BASE_URL}/api/visita`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: id }),
      keepalive: true,
    }).catch(() => {});
  }
}
