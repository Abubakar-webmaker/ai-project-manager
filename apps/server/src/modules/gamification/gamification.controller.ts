// src/modules/gamification/gamification.controller.ts
import { Response, NextFunction } from "express";
import { gamificationService } from "./gamification.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class GamificationController {
  async getMyGamification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await gamificationService.getUserGamification(
        req.user._id.toString(),
        req.params.workspaceId as string
      );
      sendSuccess(res, result, "Gamification data fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getLeaderboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaderboard = await gamificationService.getLeaderboard(
        req.params.workspaceId as string
      );
      sendSuccess(res, { leaderboard }, "Leaderboard fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAvailableBadges(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const badges = await gamificationService.getAvailableBadges();
      sendSuccess(res, { badges }, "Badges fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const gamificationController = new GamificationController();