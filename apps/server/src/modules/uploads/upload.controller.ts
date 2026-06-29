// src/modules/uploads/upload.controller.ts
import { Response, NextFunction } from "express";
import { uploadService } from "./upload.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class UploadController {
  async uploadTaskAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return sendError(res, "No file provided", 400);
      const result = await uploadService.uploadTaskAttachment(
        req.params.taskId as string,
        req.user._id.toString(),
        req.file
      );
      sendSuccess(res, result, "File uploaded", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async uploadMultipleFiles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.files?.length) return sendError(res, "No files provided", 400);
      const result = await uploadService.uploadMultipleFiles(
        req.params.taskId as string,
        req.user._id.toString(),
        req.files as Express.Multer.File[]
      );
      sendSuccess(res, result, "Files uploaded", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async deleteTaskAttachment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await uploadService.deleteTaskAttachment(
        req.params.taskId as string,
        req.params.attachmentId as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Attachment deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async uploadAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return sendError(res, "No file provided", 400);
      const result = await uploadService.uploadAvatar(
        req.user._id.toString(),
        req.file
      );
      sendSuccess(res, result, "Avatar updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const uploadController = new UploadController();