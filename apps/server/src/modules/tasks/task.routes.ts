// src/modules/tasks/task.routes.ts
import { Router } from "express";
import { taskController } from "./task.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { validate } from "../../middleware/requestValidator.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
  addSubtaskSchema,
  addChecklistSchema,
  addChecklistItemSchema,
} from "./task.validator";

const router = Router({ mergeParams: true });
router.use(authenticate);

// Project tasks
router.post("/", validate(createTaskSchema), taskController.create);
router.get("/", taskController.getAll);

export default router;

// Tasks by ID
export const taskByIdRouter = Router();
taskByIdRouter.use(authenticate);

taskByIdRouter.get("/my", taskController.getMyTasks);
taskByIdRouter.get("/:id", taskController.getOne);
taskByIdRouter.patch("/:id", validate(updateTaskSchema), taskController.update);
taskByIdRouter.patch("/:id/move", validate(moveTaskSchema), taskController.move);
taskByIdRouter.delete("/:id", taskController.delete);

// Subtasks
taskByIdRouter.post("/:id/subtasks", validate(addSubtaskSchema), taskController.addSubtask);
taskByIdRouter.patch("/:id/subtasks/:subtaskId/toggle", taskController.toggleSubtask);

// Checklists
taskByIdRouter.post("/:id/checklists", validate(addChecklistSchema), taskController.addChecklist);
taskByIdRouter.post("/:id/checklists/:checklistId/items", validate(addChecklistItemSchema), taskController.addChecklistItem);
taskByIdRouter.patch("/:id/checklists/:checklistId/items/:itemId/toggle", taskController.toggleChecklistItem);

// Time tracking
taskByIdRouter.post("/:id/time/start", taskController.startTracking);
taskByIdRouter.post("/:id/time/stop", taskController.stopTracking);