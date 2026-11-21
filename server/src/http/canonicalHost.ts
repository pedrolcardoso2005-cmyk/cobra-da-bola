// Canonical-host redirect for SEO: when PUBLIC_URL is set (e.g.
// https://www.cobradabola.com.br), page requests that arrive on any other
// host (the *.up.railway.app address, the bare domain) get a 301 to the same
// path on the official domain, so Google only ever indexes one site.
//
// Off by default: with PUBLIC_URL unset nothing is redirected. That matters
// because the custom domain only works after its DNS records exist --
// turning this on earlier would send every visitor to a dead address.
// API, socket and health requests are never redirected.
import type { NextFunction, Request, Response } from "express";
import { SOCKET_PATH } from "@cobra/shared";

/** Returns the absolute URL to redirect to, or null to serve the request as is. */
export function canonicalRedirectTarget(
  publicUrl: string | undefined,
  method: string,
  host: string | undefined,
  originalUrl: string,
): string | null {
  if (!publicUrl || !host) return null;
  if (method !== "GET" && method !== "HEAD") return null;
  if (originalUrl.startsWith("/api") || originalUrl.startsWith(SOCKET_PATH)) return null;

  let canonical: URL;
  try {
    canonical = new URL(publicUrl);
  } catch {
    return null;
  }
  if (host.toLowerCase() === canonical.host.toLowerCase()) return null;
  return `${canonical.origin}${originalUrl}`;
}

export function canonicalHostMiddleware(req: Request, res: Response, next: NextFunction): void {
  const target = canonicalRedirectTarget(process.env.PUBLIC_URL, req.method, req.headers.host, req.originalUrl);
  if (target) {
    res.redirect(301, target);
    return;
  }
  next();
}
