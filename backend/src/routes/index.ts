import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";
import { gameRouter } from "./game.routes.js";

export const router = Router();

router.get("/health", healthController);
router.use(gameRouter);
