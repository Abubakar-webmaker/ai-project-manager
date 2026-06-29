// src/socket/handlers/chat.handler.ts
import { Server as SocketServer } from "socket.io";
import { AuthSocket } from "../socket.manager";
import { Message } from "../../models/Message.model";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants";

export const chatHandler = (io: SocketServer, socket: AuthSocket): void => {
  // Send chat message
  socket.on(
    SOCKET_EVENTS.CHAT_MESSAGE,
    async ({
      projectId,
      content,
    }: {
      projectId: string;
      content: string;
    }) => {
      try {
        if (!content?.trim()) return;

        // Save message to DB
        const message = await Message.create({
          project: projectId,
          sender: socket.user?._id,
          content: content.trim(),
          type: "text",
        });

        const populated = await Message.findById(message._id).populate(
          "sender",
          "name email avatar"
        );

        // Emit to all in project room
        io.to(`project:${projectId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE, {
          message: populated,
        });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: "Failed to send message" });
      }
    }
  );

  // Chat typing
  socket.on(
    SOCKET_EVENTS.CHAT_TYPING,
    ({ projectId }: { projectId: string }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.CHAT_TYPING, {
        userId: socket.user?._id,
        name: socket.user?.name,
      });
    }
  );

  // Chat stop typing
  socket.on(
    SOCKET_EVENTS.CHAT_STOP_TYPING,
    ({ projectId }: { projectId: string }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.CHAT_STOP_TYPING, {
        userId: socket.user?._id,
      });
    }
  );
};