import { ALCHEMY_ITEM_TIERS } from "./alchemy.data.js";
import {
  BASE_DELETE_COST,
  BASE_SPAWN_COST,
  DELETE_COST_PER_USED_ACTION,
  DELETE_COST_PER_OCCUPIED_CELL,
  DELETE_COST_PER_TIER,
  FREE_SPAWNS_COUNT,
  SPAWN_COST_PER_USED_SPAWN,
  SPAWN_COST_PER_BASE_LEVEL
} from "./game.constants.js";

export const getItemTier = (itemId: string | null): number => {
  if (!itemId) {
    return 1;
  }

  return ALCHEMY_ITEM_TIERS[itemId] ?? 1;
};

export const getSpawnCost = (spawnsUsed: number, baseLevel: number): number => {
  // Clicker-style progression: each spawn after free starts increases future spawn cost.
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
  return (
    BASE_DELETE_COST +
    itemTier * DELETE_COST_PER_TIER +
    occupiedCells * DELETE_COST_PER_OCCUPIED_CELL
  );
};

export const getDeleteCostWithProgression = (
  itemTier: number,
  occupiedCells: number,
  deleteActionsUsed: number
): number => {
  // Deletion also scales by usage count to prevent free board cleanup loops.
  return getDeleteCost(itemTier, occupiedCells) + deleteActionsUsed * DELETE_COST_PER_USED_ACTION;
};

export const getGoalReward = (goalIndex: number, itemTier: number): number => {
  return Math.floor(50 + goalIndex * 25 + itemTier * 40);
};
