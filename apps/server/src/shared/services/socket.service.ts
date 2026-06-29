// src/shared/services/socket.service.ts
import { getIO } from "../../config/socket.config";
import { SOCKET_EVENTS } from "../constants/events.constants";
import { sendNotificationToUser } from "../../socket/handlers/notification.handler";

export class SocketService {
  // Emit to project room
  emitToProject(projectId: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(`project:${projectId}`).emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }

  // Emit to workspace room
  emitToWorkspace(workspaceId: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(`workspace:${workspaceId}`).emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }

  // Emit to task room
  emitToTask(taskId: string, event: string, data: any): void {
    try {
      const io = getIO();
      io.to(`task:${taskId}`).emit(event, data);
    } catch (error) {
      console.error("Socket emit error:", error);
    }
  }

  // Send notification to user
  sendNotification(userId: string, notification: any): void {
    try {
      const io = getIO();
      sendNotificationToUser(io, userId, notification);
    } catch (error) {
      console.error("Notification socket error:", error);
    }
  }

  // Emit task created
  taskCreated(projectId: string, task: any): void {
    this.emitToProject(projectId, SOCKET_EVENTS.TASK_CREATED, { task });
  }

  // Emit task updated
  taskUpdated(projectId: string, taskId: string, task: any): void {
    this.emitToProject(projectId, SOCKET_EVENTS.TASK_UPDATED, { task });
    this.emitToTask(taskId, SOCKET_EVENTS.TASK_UPDATED, { task });
  }

  // Emit task moved
  taskMoved(projectId: string, taskId: string, newStatus: string, position: number): void {
    this.emitToProject(projectId, SOCKET_EVENTS.TASK_MOVED, {
      taskId,
      newStatus,
      position,
    });
  }

  // Emit task deleted
  taskDeleted(projectId: string, taskId: string): void {
    this.emitToProject(projectId, SOCKET_EVENTS.TASK_DELETED, { taskId });
  }

  // Emit comment added
  commentAdded(taskId: string, comment: any): void {
    this.emitToTask(taskId, SOCKET_EVENTS.COMMENT_ADDED, { comment });
  }

  // Emit project health updated
  projectHealthUpdated(projectId: string, healthScore: number): void {
    this.emitToProject(projectId, SOCKET_EVENTS.PROJECT_HEALTH_UPDATED, {
      projectId,
      healthScore,
    });
  }
}

export const socketService = new SocketService();