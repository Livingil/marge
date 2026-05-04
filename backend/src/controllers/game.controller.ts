import { Request, Response } from "express";
import { getUserState, mergeCells, upgradeBase } from "../services/game.service.js";

export const getUserController = async (_req: Request, res: Response): Promise<void> => {
  const user = await getUserState();
  res.status(200).json(user);
};

export const mergeController = async (req: Request, res: Response): Promise<void> => {
  const { cellA, cellB } = req.body as { cellA: number; cellB: number };
  const user = await mergeCells({ cellA, cellB });
  res.status(200).json(user);
};

export const upgradeBaseController = async (_req: Request, res: Response): Promise<void> => {
  const user = await upgradeBase();
  res.status(200).json(user);
};
