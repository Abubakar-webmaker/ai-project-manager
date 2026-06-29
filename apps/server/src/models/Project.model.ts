// apps/server/src/models/Project.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: "manager" | "member" | "viewer";
  joinedAt: Date;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  icon: string;
  color: string;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  status: "active" | "on_hold" | "completed" | "archived";
  visibility: "public" | "private";
  startDate?: Date;
  endDate?: Date;
  healthScore: number;
  tags: string[];
  taskDNA: {
    avgCompletionTime: number;
    completedTasks: number;
    totalEstimatedTime: number;
  };
  settings: {
    enableTimeTracking: boolean;
    enableGamification: boolean;
    enableClientPortal: boolean;
    sprintDuration: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "📋" },
    color: { type: String, default: "#6366f1" },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["manager", "member", "viewer"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    status: {
      type: String,
      enum: ["active", "on_hold", "completed", "archived"],
      default: "active",
    },
    visibility: { type: String, enum: ["public", "private"], default: "private" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    tags: [{ type: String }],
    taskDNA: {
      avgCompletionTime: { type: Number, default: 0 },
      completedTasks: { type: Number, default: 0 },
      totalEstimatedTime: { type: Number, default: 0 },
    },
    settings: {
      enableTimeTracking: { type: Boolean, default: true },
      enableGamification: { type: Boolean, default: true },
      enableClientPortal: { type: Boolean, default: false },
      sprintDuration: { type: Number, default: 14 },
    },
  },
  { timestamps: true }
);

ProjectSchema.index({ workspace: 1 });
ProjectSchema.index({ owner: 1 });

export const Project = mongoose.model<IProject>("Project", ProjectSchema);