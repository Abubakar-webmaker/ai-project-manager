// apps/server/src/models/Gamification.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBadge {
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface IGamification extends Document {
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  xp: number;
  level: number;
  badges: IBadge[];
  stats: {
    tasksCompleted: number;
    tasksCompletedOnTime: number;
    commentsAdded: number;
    streakDays: number;
    longestStreak: number;
    lastActiveDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const GamificationSchema = new Schema<IGamification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      tasksCompleted: { type: Number, default: 0 },
      tasksCompletedOnTime: { type: Number, default: 0 },
      commentsAdded: { type: Number, default: 0 },
      streakDays: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

GamificationSchema.index({ user: 1, workspace: 1 }, { unique: true });

export const Gamification = mongoose.model<IGamification>(
  "Gamification",
  GamificationSchema
);