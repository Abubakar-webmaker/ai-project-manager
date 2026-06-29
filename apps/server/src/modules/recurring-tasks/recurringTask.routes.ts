// src/modules/recurring-tasks/recurringTask.routes.ts
import { Router } from "express";
import { recurringTaskController } from "./recurringTask.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.post("/", recurringTaskController.create);
router.get("/", recurringTaskController.getAll);
router.patch("/:id/toggle", recurringTaskController.toggle);
router.delete("/:id", recurringTaskController.delete);

export default router;