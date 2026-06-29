// apps/server/src/models/RecurringTask.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IRecurringTask extends Document {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  priority: "none" | "low" | "medium" | "high" | "critical";
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "custom";
  cronExpression: string;
  nextRunAt: Date;
  lastRunAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringTaskSchema = new Schema<IRecurringTask>(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    priority: {
      type: String,
      enum: ["none", "low", "medium", "high", "critical"],
      default: "none",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "custom"],
      required: true,
    },
    cronExpression: { type: String, required: true },
    nextRunAt: { type: Date, required: true },
    lastRunAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

RecurringTaskSchema.index({ nextRunAt: 1, isActive: 1 });

export const RecurringTask = mongoose.model<IRecurringTask>(
  "RecurringTask",
  RecurringTaskSchema
);