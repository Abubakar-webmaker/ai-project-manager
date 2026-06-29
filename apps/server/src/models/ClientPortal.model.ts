// apps/server/src/models/ClientPortal.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IClientPortal extends Document {
  project: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  clientName: string;
  clientEmail: string;
  accessToken: string;
  isActive: boolean;
  permissions: {
    canViewTasks: boolean;
    canComment: boolean;
    canApprove: boolean;
    canViewAnalytics: boolean;
  };
  lastAccessed?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClientPortalSchema = new Schema<IClientPortal>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    accessToken: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    permissions: {
      canViewTasks: { type: Boolean, default: true },
      canComment: { type: Boolean, default: false },
      canApprove: { type: Boolean, default: false },
      canViewAnalytics: { type: Boolean, default: false },
    },
    lastAccessed: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

ClientPortalSchema.index({ accessToken: 1 });
ClientPortalSchema.index({ project: 1 });

export const ClientPortal = mongoose.model<IClientPortal>(
  "ClientPortal",
  ClientPortalSchema
);