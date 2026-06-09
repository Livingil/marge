import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";
import { rootController } from "../controllers/root.controller.js";
import { authRouter } from "./auth.routes.js";
import { gameRouter } from "./game.routes.js";

export const router = Router();

router.get("/", rootController);
router.get("/health", healthController);
router.use("/auth", authRouter);
router.use(gameRouter);
