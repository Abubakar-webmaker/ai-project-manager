// src/modules/notifications/notification.routes.ts
import { Router } from "express";
import { notificationController } from "./notification.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();
router.use(authenticate);

router.get("/", notificationController.getAll);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);
router.delete("/read", notificationController.deleteAllRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.delete);

export default router;