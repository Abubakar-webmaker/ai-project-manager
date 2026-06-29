// src/modules/notifications/notification.controller.ts
import { Response, NextFunction } from "express";
import { notificationService } from "./notification.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import { getParam } from "../../shared/utils/params.util";

export class NotificationController {
  // GET /api/v1/notifications
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await notificationService.getNotifications(
        req.user._id.toString(),
        page,
        limit
      );
      sendSuccess(res, result, "Notifications fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // GET /api/v1/notifications/unread-count
  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(
        req.user._id.toString()
      );
      sendSuccess(res, result, "Unread count fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // PATCH /api/v1/notifications/:id/read
  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, { notification }, "Marked as read");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // PATCH /api/v1/notifications/read-all
  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.markAllAsRead(
        req.user._id.toString()
      );
      sendSuccess(res, result, "All marked as read");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // DELETE /api/v1/notifications/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteNotification(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, null, "Notification deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // DELETE /api/v1/notifications/read
  async deleteAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.deleteAllRead(req.user._id.toString());
      sendSuccess(res, null, "Read notifications cleared");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const notificationController = new NotificationController();