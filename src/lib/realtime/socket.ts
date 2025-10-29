"use client";

import { io, Socket } from "socket.io-client";
import { getAccessToken } from "@/lib/api/client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = getAccessToken();
  // backend CORS for WS should allow your frontend origin
  const url = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  socket = io(url, {
    transports: ["websocket"],
    autoConnect: true,
    withCredentials: true,
    auth: { token },
  });

  // if token changes later (user logs in after page load), update auth and reconnect:
  socket.on("connect_error", (err) => {
    // eslint-disable-next-line no-console
    console.warn("socket connect_error:", err.message);
  });

  return socket;
}

export function updateSocketAuthToken(token: string | null) {
  if (!socket) return;
  (socket as any).auth = { token: token || undefined };
  if (socket.connected) return;
  socket.connect();
}
