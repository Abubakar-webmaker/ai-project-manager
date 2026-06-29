// src/modules/projects/project.controller.ts
import { Response, NextFunction } from "express";
import { projectService } from "./project.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class ProjectController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const project = await projectService.createProject(
        workspaceId,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { project }, "Project created", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId as string;
      const projects = await projectService.getProjects(
        workspaceId,
        req.user._id.toString()
      );
      sendSuccess(res, { projects }, "Projects fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProject(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, { project }, "Project fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(
        req.params.id as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { project }, "Project updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.deleteProject(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Project deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.addMember(
        req.params.id as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { project }, "Member added");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.removeMember(
        req.params.id as string,
        req.user._id.toString(),
        req.params.memberId as string
      );
      sendSuccess(res, null, "Member removed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await projectService.getAnalytics(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, analytics, "Analytics fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const projectController = new ProjectController();