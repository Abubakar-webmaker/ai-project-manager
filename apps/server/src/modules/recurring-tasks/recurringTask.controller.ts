// src/modules/recurring-tasks/recurringTask.controller.ts
import { Response, NextFunction } from "express";
import { recurringTaskService } from "./recurringTask.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class RecurringTaskController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await recurringTaskService.create(
        req.params.projectId as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { task }, "Recurring task created", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await recurringTaskService.getProjectRecurringTasks(
        req.params.projectId as string
      );
      sendSuccess(res, { tasks }, "Recurring tasks fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await recurringTaskService.toggle(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Recurring task toggled");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await recurringTaskService.delete(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Recurring task deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const recurringTaskController = new RecurringTaskController();