// src/app.ts — FINAL COMPLETE VERSION
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { globalRateLimiter } from "./middleware/rateLimiter.middleware";
import { errorHandler, notFound } from "./middleware/errorHandler.middleware";
import { env } from "./config/env.config";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import workspaceRoutes from "./modules/workspaces/workspace.routes";
import projectRoutes, { projectByIdRouter } from "./modules/projects/project.routes";
import taskRoutes, { taskByIdRouter } from "./modules/tasks/task.routes";
import commentRoutes, { commentByIdRouter } from "./modules/comments/comment.routes";
import notificationRoutes from "./modules/notifications/notification.routes";
import aiRoutes from "./modules/ai/ai.routes";
import uploadRoutes from "./modules/uploads/upload.routes";
import gamificationRoutes from "./modules/gamification/gamification.routes";
import clientPortalRoutes from "./modules/client-portal/clientPortal.routes";
import analyticsRoutes from "./modules/analytics/analytics.routes";
import recurringTaskRoutes from "./modules/recurring-tasks/recurringTask.routes";

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Rate limiting
app.use(globalRateLimiter);

// Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === "development") app.use(morgan("dev"));

// Health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "AI Project Manager API 🚀",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/v1/projects", projectByIdRouter);
app.use("/api/v1/projects/:projectId/tasks", taskRoutes);
app.use("/api/v1/tasks", taskByIdRouter);
app.use("/api/v1/tasks/:taskId/comments", commentRoutes);
app.use("/api/v1/comments", commentByIdRouter);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/workspaces/:workspaceId/gamification", gamificationRoutes);
app.use("/api/v1/client-portal", clientPortalRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/projects/:projectId/recurring-tasks", recurringTaskRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;