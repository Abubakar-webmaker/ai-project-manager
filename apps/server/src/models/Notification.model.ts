// apps/server/src/models/Notification.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type:
    | "task_assigned"
    | "task_completed"
    | "comment_added"
    | "mention"
    | "deadline_reminder"
    | "project_invited"
    | "workspace_invited"
    | "ai_report_ready"
    | "gamification_achievement";
  title: string;
  message: string;
  link?: string;
  relatedTask?: mongoose.Types.ObjectId;
  relatedProject?: mongoose.Types.ObjectId;
  relatedWorkspace?: mongoose.Types.ObjectId;
  isRead: boolean;
  readAt?: Date;
  channels: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_completed",
        "comment_added",
        "mention",
        "deadline_reminder",
        "project_invited",
        "workspace_invited",
        "ai_report_ready",
        "gamification_achievement",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    relatedTask: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    relatedProject: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    relatedWorkspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);