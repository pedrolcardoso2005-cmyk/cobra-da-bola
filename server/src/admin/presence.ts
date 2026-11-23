// In-memory "who is around right now" tracker for the admin panel. Every
// authenticated HTTP request and socket connection touches the user's
// last-seen time; open sockets are counted per user. Lives in memory only:
// it resets on a deploy/restart, which is fine for a "right now" number.
const lastSeen = new Map<string, number>();
const openSockets = new Map<string, number>();

export function touchUser(userId: string): void {
  lastSeen.set(userId, Date.now());
}

export function socketOpened(userId: string): void {
  touchUser(userId);
  openSockets.set(userId, (openSockets.get(userId) ?? 0) + 1);
}

export function socketClosed(userId: string): void {
  touchUser(userId);
  const n = (openSockets.get(userId) ?? 1) - 1;
  if (n <= 0) openSockets.delete(userId);
  else openSockets.set(userId, n);
}

/** Users with an open socket or any activity in the last `windowMs`. */
export function onlineUserIds(windowMs = 5 * 60_000): Set<string> {
  const since = Date.now() - windowMs;
  const ids = new Set<string>(openSockets.keys());
  for (const [id, t] of lastSeen) if (t >= since) ids.add(id);
  return ids;
}

export function seenSince(sinceTs: number): Set<string> {
  const ids = new Set<string>();
  for (const [id, t] of lastSeen) if (t >= sinceTs) ids.add(id);
  return ids;
}

/** Test helper. */
export function resetPresence(): void {
  lastSeen.clear();
  openSockets.clear();
}
