import { ALCHEMY_ITEM_TIERS } from "./alchemy.data.js";
import {
  BASE_DELETE_COST,
  BASE_SPAWN_COST,
  DELETE_COST_PER_OCCUPIED_CELL,
  DELETE_COST_PER_TIER,
  SPAWN_COST_PER_BASE_LEVEL,
  SPAWN_COST_PER_OCCUPIED_CELL
} from "./game.constants.js";

export const getItemTier = (itemId: string | null): number => {
  if (!itemId) {
    return 1;
  }

  return ALCHEMY_ITEM_TIERS[itemId] ?? 1;
};

export const getSpawnCost = (occupiedCells: number, baseLevel: number): number => {
  if (occupiedCells < 2) {
    return 0;
  }

  return (
    BASE_SPAWN_COST +
    occupiedCells * SPAWN_COST_PER_OCCUPIED_CELL +
    baseLevel * SPAWN_COST_PER_BASE_LEVEL
  );
};

export const getBaseUpgradeCost = (baseLevel: number): number => {
  return Math.floor(100 * Math.pow(baseLevel, 1.25));
};

export const getDeleteCost = (itemTier: number, occupiedCells: number): number => {
  return (
    BASE_DELETE_COST +
    itemTier * DELETE_COST_PER_TIER +
    occupiedCells * DELETE_COST_PER_OCCUPIED_CELL
  );
};

export const getGoalReward = (goalIndex: number, itemTier: number): number => {
  return Math.floor(50 + goalIndex * 25 + itemTier * 40);
};
