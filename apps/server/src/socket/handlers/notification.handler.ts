// src/socket/handlers/notification.handler.ts
import { Server as SocketServer } from "socket.io";
import { AuthSocket } from "../socket.manager";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants";

// Store userId -> socketId mapping
const userSocketMap = new Map<string, string>();

export const notificationHandler = (
  io: SocketServer,
  socket: AuthSocket
): void => {
  // Register user socket
  const userId = socket.user?._id.toString();
  if (userId) {
    userSocketMap.set(userId, socket.id);
  }

  // Mark notification as read
  socket.on(
    SOCKET_EVENTS.NOTIFICATION_READ,
    ({ notificationId }: { notificationId: string }) => {
      socket.emit(SOCKET_EVENTS.NOTIFICATION_READ, { notificationId });
    }
  );

  // Cleanup on disconnect
  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    if (userId) {
      userSocketMap.delete(userId);
    }
  });
};

// Helper: send notification to specific user
export const sendNotificationToUser = (
  io: SocketServer,
  userId: string,
  notification: any
): void => {
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    io.to(socketId).emit(SOCKET_EVENTS.NOTIFICATION_NEW, { notification });
  }
};