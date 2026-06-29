// src/modules/comments/comment.controller.ts
import { Response, NextFunction } from "express";
import { commentService } from "./comment.service";
import { sendSuccess, sendError } from "../../shared/utils/response.util";
import { AuthRequest } from "../../middleware/authenticate.middleware";

export class CommentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.createComment(
        req.params.taskId as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { comment }, "Comment added", 201);
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getTaskComments(
        req.params.taskId as string,
        req.user._id.toString()
      );
      sendSuccess(res, { comments }, "Comments fetched");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.updateComment(
        req.params.id as string,
        req.user._id.toString(),
        req.body
      );
      sendSuccess(res, { comment }, "Comment updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(
        req.params.id as string,
        req.user._id.toString()
      );
      sendSuccess(res, null, "Comment deleted");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }

  async addReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.addReaction(
        req.params.id as string,
        req.user._id.toString(),
        req.body.emoji
      );
      sendSuccess(res, { comment }, "Reaction updated");
    } catch (error: any) {
      if (error.statusCode) return sendError(res, error.message, error.statusCode);
      next(error);
    }
  }
}

export const commentController = new CommentController();