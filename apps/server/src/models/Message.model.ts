// apps/server/src/models/Message.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  project: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "file" | "system";
  attachment?: {
    filename: string;
    url: string;
    fileType: string;
  };
  readBy: {
    user: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "file", "system"], default: "text" },
    attachment: {
      filename: String,
      url: String,
      fileType: String,
    },
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

MessageSchema.index({ project: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>("Message", MessageSchema);