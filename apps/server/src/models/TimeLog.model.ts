// apps/server/src/models/TimeLog.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITimeLog extends Document {
  task: mongoose.Types.ObjectId;
  project: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description?: string;
  isManual: boolean;
  createdAt: Date;
}

const TimeLogSchema = new Schema<ITimeLog>(
  {
    task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 },
    description: { type: String, default: "" },
    isManual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TimeLogSchema.index({ task: 1, user: 1 });
TimeLogSchema.index({ project: 1 });

export const TimeLog = mongoose.model<ITimeLog>("TimeLog", TimeLogSchema);