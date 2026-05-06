import { ALCHEMY_ITEM_TIERS } from "./alchemy.data.js";
import {
  BASE_DELETE_COST,
  BASE_SPAWN_COST,
  DELETE_COST_PER_OCCUPIED_CELL,
  DELETE_COST_PER_TIER,
  SPAWN_COST_PER_BASE_LEVEL
} from "./game.constants.js";

export const getItemTier = (itemId: string | null): number => {
  if (!itemId) {
    return 1;
  }

  return ALCHEMY_ITEM_TIERS[itemId] ?? 1;
};

export const getSpawnCost = (spawnsUsed: number, baseLevel: number): number => {
  const FREE_SPAWNS_COUNT = 5;
  const SPAWN_COST_PER_USED_SPAWN = 2;

  if (spawnsUsed < FREE_SPAWNS_COUNT) {
    return 0;
  }

  const paidSpawnsUsed = spawnsUsed - FREE_SPAWNS_COUNT;
  return (
    BASE_SPAWN_COST +
    paidSpawnsUsed * SPAWN_COST_PER_USED_SPAWN +
    baseLevel * SPAWN_COST_PER_BASE_LEVEL
  );
};

export const getBaseUpgradeCost = (baseLevel: number): number => {
  return Math.floor(100 * Math.pow(baseLevel, 1.25));
};

export const getDeleteCost = (itemTier: number, occupiedCells: number): number => {
  const REDUCED_BASE_DELETE_COST = Math.floor(BASE_DELETE_COST * 0.4);
  const REDUCED_DELETE_COST_PER_TIER = Math.floor(DELETE_COST_PER_TIER * 0.4);
  const REDUCED_DELETE_COST_PER_OCCUPIED_CELL = Math.max(1, Math.floor(DELETE_COST_PER_OCCUPIED_CELL * 0.5));

  return (
    REDUCED_BASE_DELETE_COST +
    itemTier * REDUCED_DELETE_COST_PER_TIER +
    occupiedCells * REDUCED_DELETE_COST_PER_OCCUPIED_CELL
  );
};

export const getDeleteCostWithProgression = (
  itemTier: number,
  occupiedCells: number,
  deleteActionsUsed: number
): number => {
  const DELETE_COST_PER_USED_ACTION = 2;
  return getDeleteCost(itemTier, occupiedCells) + deleteActionsUsed * DELETE_COST_PER_USED_ACTION;
};

export const getGoalReward = (goalIndex: number, itemTier: number): number => {
  return Math.floor(50 + goalIndex * 25 + itemTier * 40);
};
