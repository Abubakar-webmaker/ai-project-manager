// src/modules/workspaces/workspace.controller.ts
import { Response, NextFunction } from "express";
import { workspaceService } from "./workspace.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";
import { getParam } from "../../shared/utils/params.util";

export class WorkspaceController {
  // POST /api/v1/workspaces
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.createWorkspace(
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { workspace }, "Workspace created", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // GET /api/v1/workspaces
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspaces = await workspaceService.getMyWorkspaces(
        req.user._id.toString()
      );
      sendSuccess(res, { workspaces }, "Workspaces fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // GET /api/v1/workspaces/:id
  async getOne(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getWorkspace(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, { workspace }, "Workspace fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // PATCH /api/v1/workspaces/:id
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.updateWorkspace(
        getParam(req.params.id),
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { workspace }, "Workspace updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // DELETE /api/v1/workspaces/:id
  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspaceService.deleteWorkspace(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, null, "Workspace deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // POST /api/v1/workspaces/:id/members
  async inviteMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.inviteMember(
        getParam(req.params.id),
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { workspace }, "Member invited successfully");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // DELETE /api/v1/workspaces/:id/members/:memberId
  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspaceService.removeMember(
        getParam(req.params.id),
        req.user._id.toString(),
        getParam(req.params.memberId)
      );
      sendSuccess(res, null, "Member removed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // PATCH /api/v1/workspaces/:id/members/:memberId/role
  async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.updateMemberRole(
        getParam(req.params.id),
        req.user._id.toString(),
        getParam(req.params.memberId),
        req.body.role
      );
      sendSuccess(res, { workspace }, "Member role updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // DELETE /api/v1/workspaces/:id/leave
  async leave(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await workspaceService.leaveWorkspace(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, null, "Left workspace successfully");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // GET /api/v1/workspaces/:id/members
  async getMembers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const members = await workspaceService.getMembers(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, { members }, "Members fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  // GET /api/v1/workspaces/:id/activity
  async getActivity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const activity = await workspaceService.getActivity(
        getParam(req.params.id),
        req.user._id.toString()
      );
      sendSuccess(res, { activity }, "Activity fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();