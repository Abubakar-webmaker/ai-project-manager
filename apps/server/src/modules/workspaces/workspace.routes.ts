// src/modules/workspaces/workspace.routes.ts
import { Router } from "express";
import { workspaceController } from "./workspace.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { validate } from "../../middleware/requestValidator.middleware";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "./workspace.validator";

const router = Router();

// All routes protected
router.use(authenticate);

router.post("/", validate(createWorkspaceSchema), workspaceController.create);
router.get("/", workspaceController.getAll);
router.get("/:id", workspaceController.getOne);
router.patch("/:id", validate(updateWorkspaceSchema), workspaceController.update);
router.delete("/:id", workspaceController.delete);
router.delete("/:id/leave", workspaceController.leave);
router.get("/:id/members", workspaceController.getMembers);
router.post("/:id/members", validate(inviteMemberSchema), workspaceController.inviteMember);
router.delete("/:id/members/:memberId", workspaceController.removeMember);
router.patch("/:id/members/:memberId/role", validate(updateMemberRoleSchema), workspaceController.updateMemberRole);
router.get("/:id/activity", workspaceController.getActivity);

export default router;