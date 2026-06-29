// src/modules/comments/comment.service.ts
import { Comment } from "../../models/Comment.model";
import { Task } from "../../models/Task.model";
import { Notification } from "../../models/Notification.model";
import { ActivityLog } from "../../models/ActivityLog.model";
import { Gamification } from "../../models/Gamification.model";
import { Project } from "../../models/Project.model";
import { socketService } from "../../shared/services/socket.service";
import { CreateCommentDTO, UpdateCommentDTO } from "./comment.types";

export class CommentService {
  // Create comment
  async createComment(taskId: string, userId: string, data: CreateCommentDTO) {
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const comment = await Comment.create({
      content: data.content,
      task: taskId,
      author: userId,
      mentions: data.mentions || [],
    });

    // Notify mentioned users
    if (data.mentions?.length) {
      const notifications = data.mentions
        .filter((id) => id !== userId)
        .map((mentionedId) => ({
          recipient: mentionedId,
          sender: userId,
          type: "mention",
          title: "You were mentioned",
          message: `You were mentioned in a comment on "${task.title}"`,
          relatedTask: taskId,
          relatedProject: task.project,
        }));

      if (notifications.length > 0) {
        const created = await Notification.insertMany(notifications);
        // Send socket notifications
        for (const notif of created) {
          socketService.sendNotification((notif as any).recipient.toString(), notif);
        }
      }
    }

    // Notify task assignees
    const assigneeNotifications = task.assignees
      .filter((id: any) => id.toString() !== userId)
      .filter((id: any) => !data.mentions?.includes(id.toString()))
      .map((assigneeId: any) => ({
        recipient: assigneeId,
        sender: userId,
        type: "comment_added",
        title: "New Comment",
        message: `New comment on "${task.title}"`,
        relatedTask: taskId,
        relatedProject: task.project,
      }));

    if (assigneeNotifications.length > 0) {
      const created = await Notification.insertMany(assigneeNotifications);
      for (const notif of created) {
        socketService.sendNotification((notif as any).recipient.toString(), notif);
      }
    }

    // Award XP
    const project = await Project.findById(task.project);
    if (project) {
      await Gamification.findOneAndUpdate(
        { user: userId, workspace: project.workspace },
        { $inc: { xp: 5, "stats.commentsAdded": 1 } }
      );
    }

    // Log activity
    await ActivityLog.create({
      workspace: (task.project as any).workspace || task.workspace,
      project: task.project,
      task: taskId,
      actor: userId,
      action: "comment_added",
      metadata: { taskTitle: task.title },
    });

    const populated = await Comment.findById(comment._id)
      .populate("author", "name email avatar")
      .populate("mentions", "name email avatar");

    // Socket emit
    socketService.commentAdded(taskId, populated);

    return populated;
  }

  // Get task comments
  async getTaskComments(taskId: string, userId: string) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const comments = await Comment.find({ task: taskId })
      .populate("author", "name email avatar")
      .populate("mentions", "name email avatar")
      .sort({ createdAt: 1 });

    return comments;
  }

  // Update comment
  async updateComment(commentId: string, userId: string, data: UpdateCommentDTO) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw { statusCode: 404, message: "Comment not found" };
    }

    if (comment.author.toString() !== userId) {
      throw { statusCode: 403, message: "You can only edit your own comments" };
    }

    comment.content = data.content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    return await Comment.findById(commentId)
      .populate("author", "name email avatar")
      .populate("mentions", "name email avatar");
  }

  // Delete comment
  async deleteComment(commentId: string, userId: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw { statusCode: 404, message: "Comment not found" };
    }

    if (comment.author.toString() !== userId) {
      throw { statusCode: 403, message: "You can only delete your own comments" };
    }

    await Comment.findByIdAndDelete(commentId);
  }

  // Add reaction
  async addReaction(commentId: string, userId: string, emoji: string) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw { statusCode: 404, message: "Comment not found" };
    }

    const existingReaction = comment.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      const userIndex = existingReaction.users.map((u) => u.toString()).indexOf(userId);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(userId as any);
      }
    } else {
      comment.reactions.push({ emoji, users: [userId as any] });
    }

    await comment.save();

    return await Comment.findById(commentId)
      .populate("author", "name email avatar")
      .populate("reactions.users", "name avatar");
  }
}

export const commentService = new CommentService();