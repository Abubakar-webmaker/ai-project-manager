// src/socket/socket.manager.ts
import { Server as SocketServer, Socket } from "socket.io";
import { verifyAccessToken } from "../shared/utils/token.util";
import { User } from "../models/User.model";
import { taskHandler } from "./handlers/task.handler";
import { chatHandler } from "./handlers/chat.handler";
import { notificationHandler } from "./handlers/notification.handler";
import { presenceHandler } from "./handlers/presence.handler";
import { SOCKET_EVENTS } from "../shared/constants/events.constants";

export interface AuthSocket extends Socket {
  user?: any;
}

export const initializeSocketManager = (io: SocketServer): void => {
  // Auth middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyAccessToken(token) as { userId: string };
      const user = await User.findById(decoded.userId).select(
        "name email avatar isOnline"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on(SOCKET_EVENTS.CONNECTION, async (socket: AuthSocket) => {
    console.log(`✅ Socket connected: ${socket.user?.name} (${socket.id})`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user?._id, {
      isOnline: true,
      lastSeen: new Date(),
    });

    // Broadcast online status to workspace rooms
    socket.broadcast.emit(SOCKET_EVENTS.USER_ONLINE, {
      userId: socket.user?._id,
      name: socket.user?.name,
      avatar: socket.user?.avatar,
    });

    // Initialize handlers
    presenceHandler(io, socket);
    taskHandler(io, socket);
    chatHandler(io, socket);
    notificationHandler(io, socket);

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
      console.log(`❌ Socket disconnected: ${socket.user?.name}`);

      await User.findByIdAndUpdate(socket.user?._id, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId: socket.user?._id,
        lastSeen: new Date(),
      });
    });
  });
};