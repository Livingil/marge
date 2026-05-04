import { Router } from "express";
import {
  getUserController,
  mergeController,
  upgradeBaseController
} from "../controllers/game.controller.js";

export const gameRouter = Router();

gameRouter.get("/user", getUserController);
gameRouter.post("/merge", mergeController);
gameRouter.post("/upgrade/base", upgradeBaseController);
