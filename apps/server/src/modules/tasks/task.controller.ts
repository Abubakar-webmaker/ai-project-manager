// src/modules/tasks/task.controller.ts
import { Response, NextFunction } from "express";
import { taskService } from "./task.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class TaskController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(
        req.params.projectId as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { task }, "Task created", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getProjectTasks(
        req.params.projectId as string,
        req.user._id.toString(),
        req.query
      );
      sendSuccess(res, result, "Tasks fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getMyTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await taskService.getMyTasks(req.user._id.toString());
      sendSuccess(res, result, "My tasks fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTask(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Task fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(
        req.params.id as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { task }, "Task updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async move(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.moveTask(
        req.params.id as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { task }, "Task moved");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await taskService.deleteTask(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Task deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async addSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.addSubtask(
        req.params.id as string,
        req.user._id.toString(),
        req.body.title
      );
      sendSuccess(res, { task }, "Subtask added", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async toggleSubtask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.toggleSubtask(
        req.params.id as string,
        req.params.subtaskId as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Subtask toggled");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async addChecklist(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.addChecklist(
        req.params.id as string,
        req.user._id.toString(),
        req.body.title
      );
      sendSuccess(res, { task }, "Checklist added", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async addChecklistItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.addChecklistItem(
        req.params.id as string,
        req.params.checklistId as string,
        req.user._id.toString(),
        req.body.text
      );
      sendSuccess(res, { task }, "Item added", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async toggleChecklistItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.toggleChecklistItem(
        req.params.id as string,
        req.params.checklistId as string,
        req.params.itemId as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Item toggled");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async startTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.startTimeTracking(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Time tracking started");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async stopTracking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.stopTimeTracking(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, { task }, "Time tracking stopped");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const taskController = new TaskController();