import { Request, Response } from "express";
import {
  claimIncome,
  deleteCell,
  getUserState,
  mergeCells,
  spawnItem,
  updateOnboardingState,
  upgradeBase
} from "../services/game.service.js";

export const getUserController = async (_req: Request, res: Response): Promise<void> => {
  const user = await getUserState();
  res.status(200).json(user);
};

export const mergeController = async (req: Request, res: Response): Promise<void> => {
  const { cellA, cellB } = req.body as { cellA: number; cellB: number };
  const user = await mergeCells({ cellA, cellB });
  res.status(200).json(user);
};

export const spawnController = async (_req: Request, res: Response): Promise<void> => {
  const user = await spawnItem();
  res.status(200).json(user);
};

export const claimIncomeController = async (_req: Request, res: Response): Promise<void> => {
  const user = await claimIncome();
  res.status(200).json(user);
};

export const upgradeBaseController = async (_req: Request, res: Response): Promise<void> => {
  const user = await upgradeBase();
  res.status(200).json(user);
};

export const deleteCellController = async (req: Request, res: Response): Promise<void> => {
  const { cellIndex } = req.body as { cellIndex: number };
  const user = await deleteCell({ cellIndex });
  res.status(200).json(user);
};

export const updateOnboardingController = async (req: Request, res: Response): Promise<void> => {
  const { hintDismissed, guideDismissed } = req.body as {
    hintDismissed?: boolean;
    guideDismissed?: boolean;
  };
  const user = await updateOnboardingState({ hintDismissed, guideDismissed });
  res.status(200).json(user);
};
