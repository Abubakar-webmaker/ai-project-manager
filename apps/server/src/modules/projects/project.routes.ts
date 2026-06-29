// src/modules/projects/project.routes.ts
import { Router } from "express";
import { projectController } from "./project.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { validate } from "../../middleware/requestValidator.middleware";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "./project.validator";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/", validate(createProjectSchema), projectController.create);
router.get("/", projectController.getAll);

export default router;

// Separate router for /projects/:id routes
export const projectByIdRouter = Router();
projectByIdRouter.use(authenticate);

projectByIdRouter.get("/:id", projectController.getOne);
projectByIdRouter.patch("/:id", validate(updateProjectSchema), projectController.update);
projectByIdRouter.delete("/:id", projectController.delete);
projectByIdRouter.get("/:id/analytics", projectController.getAnalytics);
projectByIdRouter.post("/:id/members", validate(addMemberSchema), projectController.addMember);
projectByIdRouter.delete("/:id/members/:memberId", projectController.removeMember);