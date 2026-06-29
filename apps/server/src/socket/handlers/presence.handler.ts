// src/socket/handlers/presence.handler.ts
import { Server as SocketServer } from "socket.io";
import { AuthSocket } from "../socket.manager";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants";

export const presenceHandler = (io: SocketServer, socket: AuthSocket): void => {
  // Join workspace room
  socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, (workspaceId: string) => {
    socket.join(`workspace:${workspaceId}`);
    console.log(`${socket.user?.name} joined workspace:${workspaceId}`);

    // Notify others in workspace
    socket.to(`workspace:${workspaceId}`).emit(SOCKET_EVENTS.MEMBER_JOINED, {
      userId: socket.user?._id,
      name: socket.user?.name,
      avatar: socket.user?.avatar,
    });
  });

  // Leave workspace room
  socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (workspaceId: string) => {
    socket.leave(`workspace:${workspaceId}`);

    socket.to(`workspace:${workspaceId}`).emit(SOCKET_EVENTS.MEMBER_LEFT, {
      userId: socket.user?._id,
    });
  });

  // Join project room
  socket.on(SOCKET_EVENTS.JOIN_PROJECT, (projectId: string) => {
    socket.join(`project:${projectId}`);
    console.log(`${socket.user?.name} joined project:${projectId}`);
  });

  // Leave project room
  socket.on(SOCKET_EVENTS.LEAVE_PROJECT, (projectId: string) => {
    socket.leave(`project:${projectId}`);
  });

  // Join task room (for real-time comments)
  socket.on(SOCKET_EVENTS.JOIN_TASK, (taskId: string) => {
    socket.join(`task:${taskId}`);
  });

  // Leave task room
  socket.on(SOCKET_EVENTS.LEAVE_TASK, (taskId: string) => {
    socket.leave(`task:${taskId}`);
  });

  // Typing indicators
  socket.on(SOCKET_EVENTS.USER_TYPING, ({ taskId }: { taskId: string }) => {
    socket.to(`task:${taskId}`).emit(SOCKET_EVENTS.USER_TYPING, {
      userId: socket.user?._id,
      name: socket.user?.name,
    });
  });

  socket.on(SOCKET_EVENTS.USER_STOP_TYPING, ({ taskId }: { taskId: string }) => {
    socket.to(`task:${taskId}`).emit(SOCKET_EVENTS.USER_STOP_TYPING, {
      userId: socket.user?._id,
    });
  });
};