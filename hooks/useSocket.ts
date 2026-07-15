"use client";
import { io, type Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let _socket: AppSocket | null = null;

export const getSocket = (): AppSocket => {
  if (!_socket) {
    _socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "", {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return _socket;
};