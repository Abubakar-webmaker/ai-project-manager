// src/config/socket.config.ts
import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { env } from "./env.config";

let io: SocketServer;

export const initializeSocket = (httpServer: HTTPServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};