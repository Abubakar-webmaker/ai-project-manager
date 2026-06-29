// src/socket/handlers/task.handler.ts
import { Server as SocketServer } from "socket.io";
import { AuthSocket } from "../socket.manager";
import { SOCKET_EVENTS } from "../../shared/constants/events.constants";

export const taskHandler = (io: SocketServer, socket: AuthSocket): void => {
  // When task is created — emit to project room
  socket.on(
    SOCKET_EVENTS.TASK_CREATED,
    ({ projectId, task }: { projectId: string; task: any }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.TASK_CREATED, {
        task,
        createdBy: {
          _id: socket.user?._id,
          name: socket.user?.name,
          avatar: socket.user?.avatar,
        },
      });
    }
  );

  // When task is updated
  socket.on(
    SOCKET_EVENTS.TASK_UPDATED,
    ({ projectId, task }: { projectId: string; task: any }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.TASK_UPDATED, {
        task,
        updatedBy: {
          _id: socket.user?._id,
          name: socket.user?.name,
        },
      });

      // Also emit to task room
      socket.to(`task:${task._id}`).emit(SOCKET_EVENTS.TASK_UPDATED, { task });
    }
  );

  // When task is moved (Kanban drag & drop)
  socket.on(
    SOCKET_EVENTS.TASK_MOVED,
    ({
      projectId,
      taskId,
      newStatus,
      position,
    }: {
      projectId: string;
      taskId: string;
      newStatus: string;
      position: number;
    }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.TASK_MOVED, {
        taskId,
        newStatus,
        position,
        movedBy: {
          _id: socket.user?._id,
          name: socket.user?.name,
        },
      });
    }
  );

  // When task is deleted
  socket.on(
    SOCKET_EVENTS.TASK_DELETED,
    ({ projectId, taskId }: { projectId: string; taskId: string }) => {
      socket.to(`project:${projectId}`).emit(SOCKET_EVENTS.TASK_DELETED, {
        taskId,
        deletedBy: {
          _id: socket.user?._id,
          name: socket.user?.name,
        },
      });
    }
  );
};