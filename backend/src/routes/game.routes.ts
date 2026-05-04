import { Router } from "express";
import {
  claimIncomeController,
  getUserController,
  mergeController,
  spawnController,
  upgradeBaseController
} from "../controllers/game.controller.js";

export const gameRouter = Router();

gameRouter.get("/user", getUserController);
gameRouter.post("/merge", mergeController);
gameRouter.post("/spawn", spawnController);
gameRouter.post("/income/claim", claimIncomeController);
gameRouter.post("/upgrade/base", upgradeBaseController);
