// src/modules/analytics/analytics.controller.ts
import { Response, NextFunction } from "express";
import { analyticsService } from "./analytics.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class AnalyticsController {
  async getWorkspaceAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getWorkspaceAnalytics(
        req.params.workspaceId as string,
        req.user._id.toString()
      );
      sendSuccess(res, result, "Workspace analytics fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getProjectAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const result = await analyticsService.getProjectAnalytics(
        req.params.projectId as string,
        req.user._id.toString(),
        days
      );
      sendSuccess(res, result, "Project analytics fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getPersonalAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await analyticsService.getPersonalAnalytics(
        req.user._id.toString()
      );
      sendSuccess(res, result, "Personal analytics fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();