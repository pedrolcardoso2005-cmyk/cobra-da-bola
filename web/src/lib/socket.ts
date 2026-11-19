import { io, type Socket } from "socket.io-client";
import { SOCKET_PATH, type ClientToServerEvents, type ServerToClientEvents } from "@cobra/shared";
import { API_BASE_URL } from "./api";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (socket) return socket;
  const token = sessionStorage.getItem("cobra_token");
  // An empty API_BASE_URL means "same origin" (production); socket.io-client
  // needs that passed as undefined, not "", to connect to the current host.
  socket = io(API_BASE_URL || undefined, {
    path: SOCKET_PATH,
    auth: { token },
    autoConnect: true,
  }) as unknown as AppSocket;
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
