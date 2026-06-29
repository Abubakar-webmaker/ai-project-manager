// src/modules/analytics/analytics.routes.ts
import { Router } from "express";
import { analyticsController } from "./analytics.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();
router.use(authenticate);

router.get("/workspaces/:workspaceId", analyticsController.getWorkspaceAnalytics);
router.get("/projects/:projectId", analyticsController.getProjectAnalytics);
router.get("/me", analyticsController.getPersonalAnalytics);

export default router;