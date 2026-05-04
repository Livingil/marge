import { IGrid } from "../models/grid.model.js";
import { BASE_INCOME_STEP, INCOME_PER_LEVEL } from "./game.constants.js";

export const calculateIncome = (grid: IGrid): number => {
  return grid.cells.reduce((total, cell) => total + cell.itemLevel * INCOME_PER_LEVEL, 0);
};

export const calculateIncomeMultiplier = (baseLevel: number): number => {
  return 1 + baseLevel * BASE_INCOME_STEP;
};

export const calculateIncomeWithBase = (grid: IGrid, baseLevel: number): number => {
  const baseIncome = calculateIncome(grid);
  const multiplier = calculateIncomeMultiplier(baseLevel);
  return Math.floor(baseIncome * multiplier);
};
