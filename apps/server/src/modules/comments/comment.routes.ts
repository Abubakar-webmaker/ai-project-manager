// src/modules/comments/comment.routes.ts
import { Router } from "express";
import { commentController } from "./comment.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { validate } from "../../middleware/requestValidator.middleware";
import {
  createCommentSchema,
  updateCommentSchema,
  addReactionSchema,
} from "./comment.validator";

// Task comments router (mergeParams for taskId)
const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", validate(createCommentSchema), commentController.create);
router.get("/", commentController.getAll);

export default router;

// Comments by ID router
export const commentByIdRouter = Router();
commentByIdRouter.use(authenticate);

commentByIdRouter.patch("/:id", validate(updateCommentSchema), commentController.update);
commentByIdRouter.delete("/:id", commentController.delete);
commentByIdRouter.post("/:id/reactions", validate(addReactionSchema), commentController.addReaction);