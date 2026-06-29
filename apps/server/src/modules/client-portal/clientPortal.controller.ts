// src/modules/client-portal/clientPortal.controller.ts
import { Request, Response, NextFunction } from "express";
import { clientPortalService } from "./clientPortal.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class ClientPortalController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portal = await clientPortalService.createPortal(
        req.params.projectId as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { portal }, "Client portal created", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async access(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await clientPortalService.accessPortal(
        req.params.token as string
      );
      sendSuccess(res, result, "Portal accessed");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getProjectPortals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portals = await clientPortalService.getProjectPortals(
        req.params.projectId as string,
        req.user._id.toString()
      );
      sendSuccess(res, { portals }, "Portals fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async toggle(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const portal = await clientPortalService.togglePortal(
        req.params.portalId as string,
        req.user._id.toString()
      );
      sendSuccess(res, { portal }, "Portal status toggled");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await clientPortalService.deletePortal(
        req.params.portalId as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Portal deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async approveTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await clientPortalService.approveTask(
        req.params.token as string,
        req.params.taskId as string,
        req.body.approved
      );
      sendSuccess(res, { task }, "Task approval updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const clientPortalController = new ClientPortalController();