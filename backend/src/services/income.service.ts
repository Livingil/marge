import { IGrid } from "../models/grid.model.js";
import { IUser, UserDocument } from "../models/user.model.js";

const INCOME_PER_LEVEL = 10;
const BASE_INCOME_STEP = 0.2;

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

export const applyIncome = (user: IUser): IUser => {
  const income = calculateIncomeWithBase(user.grid, user.baseLevel);

  return {
    ...user,
    gold: user.gold + income
  };
};

export const applyIncomeToUserDocument = async (
  user: UserDocument
): Promise<UserDocument> => {
  const income = calculateIncomeWithBase(user.grid, user.baseLevel);
  user.gold += income;
  await user.save();
  return user;
};

export const upgradeBase = (user: IUser): IUser => {
  const nextBaseLevel = user.baseLevel + 1;
  const income = calculateIncomeWithBase(user.grid, nextBaseLevel);

  return {
    ...user,
    baseLevel: nextBaseLevel,
    gold: user.gold + income
  };
};

export const upgradeBaseForUserDocument = async (
  user: UserDocument
): Promise<UserDocument> => {
  user.baseLevel += 1;
  const income = calculateIncomeWithBase(user.grid, user.baseLevel);
  user.gold += income;
  await user.save();
  return user;
};
