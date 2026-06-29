// apps/server/src/models/Workspace.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWorkspaceMember {
  user: mongoose.Types.ObjectId;
  role: "owner" | "admin" | "member";
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  color: string;
  owner: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  isPersonal: boolean;
  plan: "free" | "pro" | "enterprise";
  settings: {
    allowGuestAccess: boolean;
    defaultProjectVisibility: "public" | "private";
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  joinedAt: { type: Date, default: Date.now },
});

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    logo: { type: String, default: null },
    color: { type: String, default: "#6366f1" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [WorkspaceMemberSchema],
    isPersonal: { type: Boolean, default: false },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    settings: {
      allowGuestAccess: { type: Boolean, default: false },
      defaultProjectVisibility: {
        type: String,
        enum: ["public", "private"],
        default: "private",
      },
    },
  },
  { timestamps: true }
);

WorkspaceSchema.index({ slug: 1 });
WorkspaceSchema.index({ owner: 1 });

export const Workspace = mongoose.model<IWorkspace>("Workspace", WorkspaceSchema);