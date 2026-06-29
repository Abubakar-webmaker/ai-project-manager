// apps/server/src/models/ActivityLog.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  workspace: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  action:
    | "task_created"
    | "task_updated"
    | "task_deleted"
    | "task_completed"
    | "task_assigned"
    | "comment_added"
    | "member_added"
    | "member_removed"
    | "project_created"
    | "project_updated"
    | "status_changed"
    | "priority_changed"
    | "file_uploaded";
  metadata: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    task: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: [
        "task_created",
        "task_updated",
        "task_deleted",
        "task_completed",
        "task_assigned",
        "comment_added",
        "member_added",
        "member_removed",
        "project_created",
        "project_updated",
        "status_changed",
        "priority_changed",
        "file_uploaded",
      ],
      required: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ workspace: 1, createdAt: -1 });
ActivityLogSchema.index({ project: 1 });

export const ActivityLog = mongoose.model<IActivityLog>(
  "ActivityLog",
  ActivityLogSchema
);