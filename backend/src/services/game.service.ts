import { User, UserDocument } from "../models/user.model.js";
import { BASE_UPGRADE_COST_STEP, GRID_SIZE, SPAWN_ITEM_LEVEL } from "./game.constants.js";
import { calculateIncomeWithBase } from "./income.service.js";
import { merge } from "./merge.service.js";

export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

const ensureUser = async (): Promise<UserDocument> => {
  const existingUser = await User.findOne();

  if (existingUser) {
    return existingUser;
  }

  return User.create({});
};

const assertCellIndex = (index: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= GRID_SIZE) {
    throw new Error(`Cell index must be an integer from 0 to ${GRID_SIZE - 1}`);
  }
};

export const getUserState = async (): Promise<UserDocument> => {
  return ensureUser();
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserDocument> => {
  assertCellIndex(input.cellA);
  assertCellIndex(input.cellB);

  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await ensureUser();
  const firstCell = user.grid.cells[input.cellA];
  const secondCell = user.grid.cells[input.cellB];

  const result = merge(firstCell, secondCell);

  if (!result.merged) {
    return user;
  }

  user.grid.cells[input.cellA].itemLevel = result.cellA.itemLevel;
  user.grid.cells[input.cellB].itemLevel = result.cellB.itemLevel;

  await user.save();
  return user;
};

export const spawnItem = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  const emptyIndex = user.grid.cells.findIndex((cell) => cell.itemLevel === 0);

  if (emptyIndex === -1) {
    throw new Error("No empty cells available");
  }

  user.grid.cells[emptyIndex].itemLevel = SPAWN_ITEM_LEVEL;
  await user.save();
  return user;
};

export const claimIncome = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  const income = calculateIncomeWithBase(user.grid, user.baseLevel);
  user.gold += income;
  await user.save();
  return user;
};

export const upgradeBase = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  const upgradeCost = user.baseLevel * BASE_UPGRADE_COST_STEP;

  if (user.gold < upgradeCost) {
    throw new Error("Not enough gold to upgrade base");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return user;
};
