// src/modules/uploads/upload.routes.ts
import { Router } from "express";
import { uploadController } from "./upload.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { upload } from "../../middleware/upload.middleware";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Upload task attachment
router.post(
  "/tasks/:taskId/attachments",
  upload.single("file"),
  uploadController.uploadTaskAttachment
);

// Upload multiple files
router.post(
  "/tasks/:taskId/attachments/multiple",
  upload.array("files", 10),
  uploadController.uploadMultipleFiles
);

// Delete task attachment
router.delete(
  "/tasks/:taskId/attachments/:attachmentId",
  uploadController.deleteTaskAttachment
);

// Upload user avatar
router.post(
  "/avatar",
  upload.single("avatar"),
  uploadController.uploadAvatar
);

export default router;
