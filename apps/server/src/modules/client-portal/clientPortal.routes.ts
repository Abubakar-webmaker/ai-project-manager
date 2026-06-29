// src/modules/client-portal/clientPortal.routes.ts
import { Router } from "express";
import { clientPortalController } from "./clientPortal.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

// Public routes (client access)
router.get("/access/:token", clientPortalController.access);
router.patch("/access/:token/tasks/:taskId/approve", clientPortalController.approveTask);

// Protected routes
router.use(authenticate);
router.post("/projects/:projectId", clientPortalController.create);
router.get("/projects/:projectId", clientPortalController.getProjectPortals);
router.patch("/:portalId/toggle", clientPortalController.toggle);
router.delete("/:portalId", clientPortalController.delete);

export default router;