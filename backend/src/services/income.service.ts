import { IGrid } from "../models/grid.model.js";
import { LEGACY_LEVEL_TO_ITEM_ID } from "./alchemy.data.js";
import { getItemTier } from "./game.economy.js";
import { BASE_INCOME_STEP, getActiveGridSize } from "./game.constants.js";

export const getItemIncomeValue = (tier: number): number => {
  switch (tier) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 4;
    case 4:
      return 7;
    case 5:
      return 11;
    default:
      return 1;
  }
};

const normalizeItemId = (cell: { itemId?: string | null; itemLevel?: number }): string | null => {
  if (typeof cell.itemId === "string" && cell.itemId.length > 0) {
    return cell.itemId;
  }

  if (typeof cell.itemLevel === "number") {
    return LEGACY_LEVEL_TO_ITEM_ID[cell.itemLevel] ?? null;
  }

  return null;
};

export const calculateIncome = (grid: IGrid, baseLevel: number): number => {
  const activeGridSize = getActiveGridSize(baseLevel);

  return grid.cells.slice(0, activeGridSize).reduce((total, cell) => {
    const itemId = normalizeItemId(cell);
    if (!itemId) {
      return total;
    }

    const tier = getItemTier(itemId);
    return total + getItemIncomeValue(tier);
  }, 0);
};

export const calculateIncomeMultiplier = (baseLevel: number): number => {
  return 1 + baseLevel * BASE_INCOME_STEP;
};

export const calculateIncomeWithBase = (grid: IGrid, baseLevel: number): number => {
  const baseIncome = calculateIncome(grid, baseLevel);
  const multiplier = calculateIncomeMultiplier(baseLevel);
  return Math.floor(baseIncome * multiplier);
};
