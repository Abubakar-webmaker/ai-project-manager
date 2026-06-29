// apps/server/src/models/Task.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ISubtask {
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IChecklist {
  title: string;
  items: {
    text: string;
    isChecked: boolean;
  }[];
}

export interface IAttachment {
  filename: string;
  url: string;
  fileType: string;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignees: mongoose.Types.ObjectId[];
  status: "todo" | "in_progress" | "in_review" | "done" | "blocked";
  priority: "none" | "low" | "medium" | "high" | "critical";
  labels: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  position: number;
  parentTask?: mongoose.Types.ObjectId;
  subtasks: ISubtask[];
  checklists: IChecklist[];
  attachments: IAttachment[];
  isRecurring: boolean;
  recurringTaskId?: mongoose.Types.ObjectId;
  aiGenerated: boolean;
  aiMetadata?: {
    generatedBy: string;
    prompt: string;
    confidence: number;
  };
  taskDNA?: {
    similarTasksAvgTime: number;
    predictedCompletionTime: number;
  };
  timeTracking: {
    isTracking: boolean;
    trackedSeconds: number;
    lastStarted?: Date;
  };
  completedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done", "blocked"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["none", "low", "medium", "high", "critical"],
      default: "none",
    },
    labels: [{ type: String }],
    dueDate: { type: Date, default: null },
    startDate: { type: Date, default: null },
    estimatedHours: { type: Number, default: null },
    actualHours: { type: Number, default: null },
    position: { type: Number, required: true },
    parentTask: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date, default: null },
      },
    ],
    checklists: [
      {
        title: { type: String, required: true },
        items: [
          {
            text: { type: String, required: true },
            isChecked: { type: Boolean, default: false },
          },
        ],
      },
    ],
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String, required: true },
        fileSize: { type: Number, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isRecurring: { type: Boolean, default: false },
    recurringTaskId: {
      type: Schema.Types.ObjectId,
      ref: "RecurringTask",
      default: null,
    },
    aiGenerated: { type: Boolean, default: false },
    aiMetadata: {
      generatedBy: { type: String },
      prompt: { type: String },
      confidence: { type: Number },
    },
    taskDNA: {
      similarTasksAvgTime: { type: Number, default: 0 },
      predictedCompletionTime: { type: Number, default: 0 },
    },
    timeTracking: {
      isTracking: { type: Boolean, default: false },
      trackedSeconds: { type: Number, default: 0 },
      lastStarted: { type: Date, default: null },
    },
    completedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

TaskSchema.index({ project: 1, status: 1 });
TaskSchema.index({ assignees: 1 });
TaskSchema.index({ dueDate: 1 });

export const Task = mongoose.model<ITask>("Task", TaskSchema);