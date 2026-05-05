import { User, UserDocument } from "../models/user.model.js";
import {
  BASE_UPGRADE_COST_STEP,
  GRID_SIZE,
  MAX_OFFLINE_INCOME_SECONDS,
  SPAWN_COST,
  SPAWN_ITEM_LEVEL
} from "./game.constants.js";
import { calculateIncomeWithBase } from "./income.service.js";
import { MergeOutcome, merge } from "./merge.service.js";

export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

interface ItemDetails {
  level: number;
  name: string;
  description: string;
  icon: string;
}

interface CurrentGoalDto {
  title: string;
  targetLevel: number;
  rewardText: string;
}

interface UserGridCellDto {
  itemLevel: number;
  item: ItemDetails | null;
}

interface UserGridDto {
  cells: UserGridCellDto[];
}

export interface UserStateDto {
  _id: string;
  gold: number;
  baseLevel: number;
  grid: UserGridDto;
  incomePerMinute: number;
  lastIncomeClaimAt: Date;
  spawnCost: number;
  baseUpgradeCost: number;
  currentGoal: CurrentGoalDto;
  discoveredItems: number[];
  itemCatalog: ItemDetails[];
  latestDiscovery: ItemDetails | null;
  lastActionMessage: string | null;
}

const ENERGY_ITEMS: Record<number, ItemDetails> = {
  1: {
    level: 1,
    name: "Искра",
    description: "Малый источник нестабильной энергии",
    icon: "⚡"
  },
  2: {
    level: 2,
    name: "Батарея",
    description: "Стабильный переносной накопитель энергии",
    icon: "🔋"
  },
  3: {
    level: 3,
    name: "Энергоячейка",
    description: "Усиленная ячейка для длительной работы",
    icon: "💠"
  },
  4: {
    level: 4,
    name: "Конденсатор",
    description: "Высокоемкий модуль быстрого выброса",
    icon: "🧲"
  },
  5: {
    level: 5,
    name: "Реактор",
    description: "Ядро генерации чистой энергии",
    icon: "☢️"
  }
};

const CURRENT_GOAL: CurrentGoalDto = {
  title: "☢️ Открой Реактор",
  targetLevel: 5,
  rewardText: "🧪 Новая цепочка: Наука"
};

const ITEM_CATALOG: ItemDetails[] = Object.values(ENERGY_ITEMS).sort((a, b) => a.level - b.level);

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

const getItemDetails = (itemLevel: number): ItemDetails | null => {
  if (itemLevel <= 0) {
    return null;
  }

  return ENERGY_ITEMS[itemLevel] ?? null;
};

const getDiscoveredLevelsFromGrid = (user: UserDocument): number[] => {
  return Array.from(
    new Set(user.grid.cells.map((cell) => cell.itemLevel).filter((level) => level > 0))
  ).sort((a, b) => a - b);
};

const normalizeDiscoveredItems = async (user: UserDocument): Promise<void> => {
  const discoveredFromGrid = getDiscoveredLevelsFromGrid(user);
  const isArray = Array.isArray(user.discoveredItems);

  if (!isArray) {
    user.discoveredItems = discoveredFromGrid;
    await user.save();
    return;
  }

  if (user.discoveredItems.length === 0 && discoveredFromGrid.length > 0) {
    user.discoveredItems = discoveredFromGrid;
    await user.save();
    return;
  }

  user.discoveredItems = Array.from(new Set(user.discoveredItems)).sort((a, b) => a - b);
};

const addDiscovery = (user: UserDocument, level: number): ItemDetails | null => {
  if (level <= 0 || user.discoveredItems.includes(level)) {
    return null;
  }

  user.discoveredItems = [...user.discoveredItems, level].sort((a, b) => a - b);
  return getItemDetails(level);
};

const buildMergeMessage = (outcome: MergeOutcome, item: ItemDetails | null): string => {
  if (outcome === "failed") {
    return "Эти символы нельзя соединить";
  }

  if (outcome === "bonus") {
    return "🌟 Удачное соединение! Символ усилен";
  }

  if (outcome === "downgrade") {
    return "⚠️ Нестабильное соединение! Символ ослаб";
  }

  if (item) {
    return `✨ Создано: ${item.icon} ${item.name}`;
  }

  return "✨ Создан новый символ";
};

const toUserStateDto = (
  user: UserDocument,
  latestDiscovery: ItemDetails | null,
  lastActionMessage: string | null
): UserStateDto => {
  return {
    _id: user.id,
    gold: user.gold,
    baseLevel: user.baseLevel,
    grid: {
      cells: user.grid.cells.map((cell) => ({
        itemLevel: cell.itemLevel,
        item: getItemDetails(cell.itemLevel)
      }))
    },
    incomePerMinute: calculateIncomeWithBase(user.grid, user.baseLevel),
    lastIncomeClaimAt: user.lastIncomeClaimAt,
    spawnCost: getSpawnCost(user),
    baseUpgradeCost: getBaseUpgradeCost(user.baseLevel),
    currentGoal: CURRENT_GOAL,
    discoveredItems: user.discoveredItems,
    itemCatalog: ITEM_CATALOG,
    latestDiscovery,
    lastActionMessage
  };
};

const assertCellIndex = (index: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= GRID_SIZE) {
    throw new Error(`Cell index must be an integer from 0 to ${GRID_SIZE - 1}`);
  }
};

export const getUserState = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  await normalizeDiscoveredItems(user);
  return toUserStateDto(user, null, null);
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserStateDto> => {
  assertCellIndex(input.cellA);
  assertCellIndex(input.cellB);

  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await ensureUser();
  await normalizeDiscoveredItems(user);

  const firstCell = user.grid.cells[input.cellA];
  const secondCell = user.grid.cells[input.cellB];

  const result = merge(firstCell, secondCell);

  if (!result.merged) {
    return toUserStateDto(user, null, buildMergeMessage("failed", null));
  }

  user.grid.cells[input.cellA].itemLevel = result.cellA.itemLevel;
  user.grid.cells[input.cellB].itemLevel = result.cellB.itemLevel;

  const mergedItem = getItemDetails(result.cellA.itemLevel);
  const latestDiscovery = addDiscovery(user, result.cellA.itemLevel);
  await user.save();

  return toUserStateDto(user, latestDiscovery, buildMergeMessage(result.outcome, mergedItem));
};

export const spawnItem = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  await normalizeDiscoveredItems(user);

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

  const latestDiscovery = addDiscovery(user, SPAWN_ITEM_LEVEL);
  await user.save();

  return toUserStateDto(user, latestDiscovery, "✨ Создан новый символ");
};

export const claimIncome = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  await normalizeDiscoveredItems(user);

  const now = new Date();
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));

  const incomePerSecond = calculateIncomeWithBase(user.grid, user.baseLevel) / 60;
  const earnedGold = Math.floor(incomePerSecond * elapsedSeconds);

  if (earnedGold <= 0) {
    return toUserStateDto(user, null, "💰 Энергия собрана");
  }

  user.gold += earnedGold;
  user.lastIncomeClaimAt = now;
  await user.save();

  return toUserStateDto(user, null, "💰 Энергия собрана");
};

export const upgradeBase = async (): Promise<UserStateDto> => {
  const user = await ensureUser();
  await normalizeDiscoveredItems(user);

  const upgradeCost = getBaseUpgradeCost(user.baseLevel);

  if (user.gold < upgradeCost) {
    throw new Error("Not enough gold to upgrade base");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return toUserStateDto(user, null, "🏛️ Лаборатория улучшена");
};
