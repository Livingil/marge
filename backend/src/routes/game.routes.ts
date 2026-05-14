import { Router } from "express";
import {
  completePurchaseSessionController,
  completeAdBoostSessionController,
  claimDailyRewardController,
  claimIncomeController,
  deleteCellController,
  getUserController,
  mergeController,
  registerCharacterController,
  startPurchaseSessionController,
  spawnController,
  startAdBoostSessionController,
  updateCharacterProfileController,
  updateOnboardingController,
  upgradeBaseController
} from "../controllers/game.controller.js";

export const gameRouter = Router();

gameRouter.get("/user", getUserController);
gameRouter.post("/merge", mergeController);
gameRouter.post("/spawn", spawnController);
gameRouter.post("/income/claim", claimIncomeController);
gameRouter.post("/daily-reward/claim", claimDailyRewardController);
gameRouter.post("/ad-boosts/session", startAdBoostSessionController);
gameRouter.post("/ad-boosts/session/complete", completeAdBoostSessionController);
gameRouter.post("/purchases/session", startPurchaseSessionController);
gameRouter.post("/purchases/session/complete", completePurchaseSessionController);
gameRouter.post("/upgrade/base", upgradeBaseController);
gameRouter.post("/cell/delete", deleteCellController);
gameRouter.patch("/user/onboarding", updateOnboardingController);
gameRouter.post("/character/register", registerCharacterController);
gameRouter.patch("/character/profile", updateCharacterProfileController);
