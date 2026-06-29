// src/modules/ai/ai.controller.ts
import { Response, NextFunction } from "express";
import { aiService } from "./ai.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import { getParam } from "../../shared/utils/params.util";

export class AIController {
  async generateTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateTasks(req.user._id.toString(), req.body);
      sendSuccess(res, result, "Tasks generated successfully");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async planSprint(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.planSprint(req.user._id.toString(), req.body);
      sendSuccess(res, result, "Sprint planned successfully");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async suggestPriorities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.suggestPriorities(
        req.user._id.toString(),
        getParam(req.params.projectId),
        req.body.taskIds
      );
      sendSuccess(res, result, "Priorities suggested");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async generateProgressReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateProgressReport(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Progress report generated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async generateStandup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateStandup(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Standup generated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async analyzeRisks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.analyzeRisks(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Risks analyzed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async estimateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.estimateTask(req.user._id.toString(), req.body);
      sendSuccess(res, result, "Task estimated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async reviewCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.reviewCode(req.user._id.toString(), req.body);
      sendSuccess(res, result, "Code reviewed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async processMeetingMinutes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.processMeetingMinutes(
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, result, "Meeting minutes processed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async analyzeMood(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.analyzeMood(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Mood analyzed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async predictDeadline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.predictDeadline(
        req.user._id.toString(),
        getParam(req.params.taskId)
      );
      sendSuccess(res, result, "Deadline predicted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async detectConflicts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.detectConflicts(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Conflicts detected");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async generateClientReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.generateClientReport(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Client report generated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async allocateResources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.allocateResources(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Resources allocated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async detectScopeCreep(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.detectScopeCreep(
        req.user._id.toString(),
        getParam(req.params.projectId)
      );
      sendSuccess(res, result, "Scope creep analyzed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const aiController = new AIController();