// src/modules/gamification/gamification.routes.ts
import { Router } from "express";
import { gamificationController } from "./gamification.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router({ mergeParams: true });
router.use(authenticate);

router.get("/me", gamificationController.getMyGamification);
router.get("/leaderboard", gamificationController.getLeaderboard);
router.get("/badges", gamificationController.getAvailableBadges);

export default router;