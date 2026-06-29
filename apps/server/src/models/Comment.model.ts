// apps/server/src/models/Comment.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IComment extends Document {
  content: string;
  task: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  mentions: mongoose.Types.ObjectId[];
  attachments: {
    filename: string;
    url: string;
    fileType: string;
  }[];
  reactions: {
    emoji: string;
    users: mongoose.Types.ObjectId[];
  }[];
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    attachments: [
      {
        filename: String,
        url: String,
        fileType: String,
      },
    ],
    reactions: [
      {
        emoji: String,
        users: [{ type: Schema.Types.ObjectId, ref: "User" }],
      },
    ],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ task: 1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);