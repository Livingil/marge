import { User, UserDocument } from "../models/user.model.js";
import {
  BASE_UPGRADE_COST_STEP,
  GRID_SIZE,
  MAX_OFFLINE_INCOME_SECONDS,
  SPAWN_COST,
  SPAWN_ITEM_LEVEL
} from "./game.constants.js";
import { calculateIncomeWithBase } from "./income.service.js";
import { merge } from "./merge.service.js";

export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

export interface UserStateDto {
  _id: string;
  gold: number;
  baseLevel: number;
  grid: UserDocument["grid"];
  incomePerMinute: number;
  lastIncomeClaimAt: Date;
  spawnCost: number;
  baseUpgradeCost: number;
}

const ensureUser = async (): Promise<UserDocument> => {
  const existingUser = await User.findOne();

  if (existingUser) {
    return existingUser;
  }

  return User.create({ lastIncomeClaimAt: new Date() });
};

const getBaseUpgradeCost = (baseLevel: number): number => {
  return baseLevel * BASE_UPGRADE_COST_STEP;
};

const getSpawnCost = (user: UserDocument): number => {
  const itemsCount = user.grid.cells.reduce((count, cell) => {
    return cell.itemLevel > 0 ? count + 1 : count;
  }, 0);

  return itemsCount < 2 ? 0 : SPAWN_COST;
};

const toUserStateDto = (user: UserDocument): UserStateDto => {
  return {
    _id: user.id,
    gold: user.gold,
    baseLevel: user.baseLevel,
    grid: user.grid,
    incomePerMinute: calculateIncomeWithBase(user.grid, user.baseLevel),
    lastIncomeClaimAt: user.lastIncomeClaimAt,
    spawnCost: getSpawnCost(user),
    baseUpgradeCost: getBaseUpgradeCost(user.baseLevel)
  };
};

const assertCellIndex = (index: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= GRID_SIZE) {
    throw new Error(`Cell index must be an integer from 0 to ${GRID_SIZE - 1}`);
  }
};

export const getUserState = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  return toUserStateDto(user);
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserStateDto> => {
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
    return toUserStateDto(user);
  }

  user.grid.cells[input.cellA].itemLevel = result.cellA.itemLevel;
  user.grid.cells[input.cellB].itemLevel = result.cellB.itemLevel;

  await user.save();
  return toUserStateDto(user);
};

export const spawnItem = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  const emptyIndex = user.grid.cells.findIndex((cell) => cell.itemLevel === 0);

  if (emptyIndex === -1) {
    throw new Error("No empty cells available");
  }

  const spawnCost = getSpawnCost(user);

  if (user.gold < spawnCost) {
    throw new Error("Not enough gold to spawn item");
  }

  user.gold -= spawnCost;
  user.grid.cells[emptyIndex].itemLevel = SPAWN_ITEM_LEVEL;

  await user.save();
  return toUserStateDto(user);
};

export const claimIncome = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  const now = new Date();
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));

  const incomePerSecond = calculateIncomeWithBase(user.grid, user.baseLevel) / 60;
  const earnedGold = Math.floor(incomePerSecond * elapsedSeconds);

  if (earnedGold <= 0) {
    return toUserStateDto(user);
  }

  user.gold += earnedGold;
  user.lastIncomeClaimAt = now;
  await user.save();

  return toUserStateDto(user);
};

export const upgradeBase = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  const upgradeCost = getBaseUpgradeCost(user.baseLevel);

  if (user.gold < upgradeCost) {
    throw new Error("Not enough gold to upgrade base");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return toUserStateDto(user);
};
