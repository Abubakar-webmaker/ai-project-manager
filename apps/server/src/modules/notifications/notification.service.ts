// src/modules/notifications/notification.service.ts
import { Notification } from "../../models/Notification.model";

export class NotificationService {
  // Get all notifications
  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ recipient: userId })
        .populate("sender", "name avatar")
        .populate("relatedTask", "title")
        .populate("relatedProject", "name color icon")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: userId }),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Mark as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw { statusCode: 404, message: "Notification not found" };
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  // Mark all as read
  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return { message: "All notifications marked as read" };
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      throw { statusCode: 404, message: "Notification not found" };
    }

    await Notification.findByIdAndDelete(notificationId);
  }

  // Delete all read notifications
  async deleteAllRead(userId: string) {
    await Notification.deleteMany({ recipient: userId, isRead: true });
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    return { count };
  }
}

export const notificationService = new NotificationService();