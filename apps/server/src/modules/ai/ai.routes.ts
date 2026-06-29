// src/modules/ai/ai.routes.ts
import { Router } from "express";
import { aiController } from "./ai.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { aiRateLimiter } from "../../middleware/rateLimiter.middleware";

const router = Router();
router.use(authenticate);
router.use(aiRateLimiter);

// Task Generation
router.post("/generate-tasks", aiController.generateTasks);

// Sprint Planning
router.post("/sprint-plan", aiController.planSprint);

// Priority Suggestions
router.post("/projects/:projectId/suggest-priorities", aiController.suggestPriorities);

// Progress Report
router.get("/projects/:projectId/progress-report", aiController.generateProgressReport);

// Standup Generator
router.get("/projects/:projectId/standup", aiController.generateStandup);

// Risk Analyzer
router.get("/projects/:projectId/risks", aiController.analyzeRisks);

// Task Estimator
router.post("/estimate-task", aiController.estimateTask);

// Code Reviewer
router.post("/review-code", aiController.reviewCode);

// Meeting Minutes
router.post("/meeting-minutes", aiController.processMeetingMinutes);

// Mood Analyzer
router.get("/projects/:projectId/mood", aiController.analyzeMood);

// Deadline Predictor
router.get("/tasks/:taskId/predict-deadline", aiController.predictDeadline);

// Conflict Detector
router.get("/projects/:projectId/conflicts", aiController.detectConflicts);

// Client Report
router.get("/projects/:projectId/client-report", aiController.generateClientReport);

// Resource Allocator
router.get("/projects/:projectId/allocate-resources", aiController.allocateResources);

// Scope Creep Detector
router.get("/projects/:projectId/scope-creep", aiController.detectScopeCreep);

export default router;