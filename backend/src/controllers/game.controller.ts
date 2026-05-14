import { Request, Response } from "express";
import {
  completePurchaseSessionGrant,
  completeAdBoostSessionGrant,
  claimDailyReward,
  claimIncome,
  deleteCell,
  getUserState,
  mergeCells,
  registerCharacter,
  spawnItem,
  startPurchaseSessionIntent,
  startAdBoostSession,
  updateCharacterProfile,
  updateOnboardingState,
  upgradeBase
} from "../services/game.service.js";
import { getPlayerIdHeaderName, resolvePlayerId } from "../services/player.service.js";

const getPlayerId = (req: Request): string => resolvePlayerId(req.headers[getPlayerIdHeaderName()]);

export const getUserController = async (req: Request, res: Response): Promise<void> => {
  const user = await getUserState(getPlayerId(req));
  res.status(200).json(user);
};

export const mergeController = async (req: Request, res: Response): Promise<void> => {
  const { cellA, cellB } = req.body as { cellA: number; cellB: number };
  const user = await mergeCells(getPlayerId(req), { cellA, cellB });
  res.status(200).json(user);
};

export const spawnController = async (req: Request, res: Response): Promise<void> => {
  const user = await spawnItem(getPlayerId(req));
  res.status(200).json(user);
};

export const claimIncomeController = async (req: Request, res: Response): Promise<void> => {
  const user = await claimIncome(getPlayerId(req));
  res.status(200).json(user);
};

export const claimDailyRewardController = async (req: Request, res: Response): Promise<void> => {
  const user = await claimDailyReward(getPlayerId(req));
  res.status(200).json(user);
};

export const startAdBoostSessionController = async (req: Request, res: Response): Promise<void> => {
  const { boostType, provider, placement } = req.body as {
    boostType: "rewarded_free_spawn" | "rewarded_free_delete" | "rewarded_flow_boost" | "rewarded_double_offline_income";
    provider?: "mock" | "vkads" | "rustore";
    placement?: string;
  };
  const session = await startAdBoostSession(getPlayerId(req), { boostType, provider, placement });
  res.status(201).json(session);
};

export const completeAdBoostSessionController = async (req: Request, res: Response): Promise<void> => {
  const { boostType, sessionId } = req.body as {
    boostType: "rewarded_free_spawn" | "rewarded_free_delete" | "rewarded_flow_boost" | "rewarded_double_offline_income";
    sessionId: string;
  };
  const user = await completeAdBoostSessionGrant(getPlayerId(req), { boostType, sessionId });
  res.status(200).json(user);
};

export const startPurchaseSessionController = async (req: Request, res: Response): Promise<void> => {
  const { productId, provider } = req.body as {
    productId: "starter_pack" | "energy_pack_small" | "premium_no_ads";
    provider?: "mock" | "rustore";
  };
  const session = await startPurchaseSessionIntent(getPlayerId(req), { productId, provider });
  res.status(201).json(session);
};

export const completePurchaseSessionController = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, transactionId } = req.body as {
    sessionId: string;
    transactionId: string;
  };
  const user = await completePurchaseSessionGrant(getPlayerId(req), { sessionId, transactionId });
  res.status(200).json(user);
};

export const upgradeBaseController = async (req: Request, res: Response): Promise<void> => {
  const user = await upgradeBase(getPlayerId(req));
  res.status(200).json(user);
};

export const deleteCellController = async (req: Request, res: Response): Promise<void> => {
  const { cellIndex } = req.body as { cellIndex: number };
  const user = await deleteCell(getPlayerId(req), { cellIndex });
  res.status(200).json(user);
};

export const updateOnboardingController = async (req: Request, res: Response): Promise<void> => {
  const { hintDismissed, guideDismissed } = req.body as {
    hintDismissed?: boolean;
    guideDismissed?: boolean;
  };
  const user = await updateOnboardingState(getPlayerId(req), { hintDismissed, guideDismissed });
  res.status(200).json(user);
};

export const registerCharacterController = async (req: Request, res: Response): Promise<void> => {
  const { name, codename, archetype, avatarSeed } = req.body as {
    name: string;
    codename?: string;
    archetype: "alchemist" | "engineer" | "scout" | "keeper";
    avatarSeed?: string;
  };

  const user = await registerCharacter(getPlayerId(req), { name, codename, archetype, avatarSeed });
  res.status(200).json(user);
};

export const updateCharacterProfileController = async (req: Request, res: Response): Promise<void> => {
  const { name, codename, archetype, avatarSeed } = req.body as {
    name?: string;
    codename?: string;
    archetype?: "alchemist" | "engineer" | "scout" | "keeper";
    avatarSeed?: string;
  };

  const user = await updateCharacterProfile(getPlayerId(req), { name, codename, archetype, avatarSeed });
  res.status(200).json(user);
};
