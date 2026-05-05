import { User, UserDocument } from "../models/user.model.js";
import {
  ALCHEMY_ITEMS,
  ALCHEMY_ITEMS_BY_ID,
  ALCHEMY_ITEM_TIERS,
  BASE_SPAWN_ITEM_IDS,
  GOAL_SEQUENCE,
  LEGACY_LEVEL_TO_ITEM_ID
} from "./alchemy.data.js";
import {
  BASE_UPGRADE_COST_STEP,
  GRID_SIZE,
  MAX_OFFLINE_INCOME_SECONDS,
  SPAWN_COST
} from "./game.constants.js";
import { calculateIncomeWithBase } from "./income.service.js";
import { MergeOutcome, merge } from "./merge.service.js";

export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

interface ItemDetails {
  id: string;
  icon: string;
  name: string;
  description: string;
  tier: number;
}

interface CurrentGoalDto {
  title: string;
  targetItemId: string;
  rewardText: string;
}

interface UserGridCellDto {
  itemId: string | null;
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
  discoveredItems: string[];
  itemCatalog: ItemDetails[];
  latestDiscovery: ItemDetails | null;
  lastActionMessage: string | null;
}

const ITEM_CATALOG: ItemDetails[] = ALCHEMY_ITEMS.map((item) => ({
  id: item.id,
  icon: item.icon,
  name: item.name,
  description: item.description,
  tier: ALCHEMY_ITEM_TIERS[item.id] ?? 1
}));

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
    return cell.itemId ? count + 1 : count;
  }, 0);

  return itemsCount < 2 ? 0 : SPAWN_COST;
};

const getItemDetails = (itemId: string | null): ItemDetails | null => {
  if (!itemId) {
    return null;
  }

  const item = ALCHEMY_ITEMS_BY_ID[itemId];
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    icon: item.icon,
    name: item.name,
    description: item.description,
    tier: ALCHEMY_ITEM_TIERS[item.id] ?? 1
  };
};

const normalizeGridCellItemId = (cell: { itemId?: string | null; itemLevel?: number }): string | null => {
  if (typeof cell.itemId === "string" && cell.itemId.length > 0) {
    return cell.itemId;
  }

  if (typeof cell.itemLevel === "number") {
    return LEGACY_LEVEL_TO_ITEM_ID[cell.itemLevel] ?? null;
  }

  return null;
};

const normalizeGridFromLegacy = async (user: UserDocument): Promise<void> => {
  let changed = false;

  user.grid.cells = user.grid.cells.map((cell) => {
    const normalizedItemId = normalizeGridCellItemId(cell);
    if (cell.itemId !== normalizedItemId || typeof cell.itemLevel !== "undefined") {
      changed = true;
    }

    return {
      itemId: normalizedItemId,
      itemLevel: undefined
    };
  });

  if (changed) {
    await user.save();
  }
};

const getDiscoveredItemIdsFromGrid = (user: UserDocument): string[] => {
  return Array.from(
    new Set(
      user.grid.cells
        .map((cell) => normalizeGridCellItemId(cell))
        .filter((itemId): itemId is string => Boolean(itemId))
    )
  ).sort();
};

const normalizeDiscoveredItems = async (user: UserDocument): Promise<void> => {
  const discoveredFromGrid = getDiscoveredItemIdsFromGrid(user);
  const isArray = Array.isArray(user.discoveredItems);

  if (!isArray) {
    user.discoveredItems = discoveredFromGrid;
    await user.save();
    return;
  }

  const normalizedFromLegacy = user.discoveredItems.map((value) => {
    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "number") {
      return LEGACY_LEVEL_TO_ITEM_ID[value] ?? "";
    }

    return "";
  }).filter((value) => value.length > 0);

  const withGrid = [...normalizedFromLegacy, ...discoveredFromGrid];
  const unique = Array.from(new Set(withGrid)).sort();

  if (unique.join("|") !== user.discoveredItems.join("|")) {
    user.discoveredItems = unique;
    await user.save();
  }
};

const addDiscovery = (user: UserDocument, itemId: string | null): ItemDetails | null => {
  if (!itemId || user.discoveredItems.includes(itemId)) {
    return null;
  }

  user.discoveredItems = [...user.discoveredItems, itemId].sort();
  return getItemDetails(itemId);
};

const getCurrentGoal = (discoveredItems: string[]): CurrentGoalDto => {
  const nextTarget = GOAL_SEQUENCE.find((itemId) => !discoveredItems.includes(itemId)) ?? GOAL_SEQUENCE[GOAL_SEQUENCE.length - 1];

  return {
    title: `Открой ${ALCHEMY_ITEMS_BY_ID[nextTarget].name}`,
    targetItemId: nextTarget,
    rewardText: "Новая цепочка: 🧪 Наука"
  };
};

const buildMergeMessage = (outcome: MergeOutcome, item: ItemDetails | null): string => {
  if (outcome === "failed") {
    return "Эти символы пока не соединяются";
  }

  if (outcome === "bonus") {
    if (item) {
      return `✨ Открыто/Создано: ${item.icon} ${item.name}`;
    }
    return "✨ Открыто/Создано";
  }

  if (outcome === "downgrade") {
    if (item) {
      return `✨ Открыто/Создано: ${item.icon} ${item.name}`;
    }
    return "✨ Открыто/Создано";
  }

  if (item) {
    return `✨ Открыто/Создано: ${item.icon} ${item.name}`;
  }

  return "✨ Открыто/Создано";
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
        itemId: normalizeGridCellItemId(cell),
        item: getItemDetails(normalizeGridCellItemId(cell))
      }))
    },
    incomePerMinute: calculateIncomeWithBase(user.grid, user.baseLevel),
    lastIncomeClaimAt: user.lastIncomeClaimAt,
    spawnCost: getSpawnCost(user),
    baseUpgradeCost: getBaseUpgradeCost(user.baseLevel),
    currentGoal: getCurrentGoal(user.discoveredItems),
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

const prepareUser = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  await normalizeGridFromLegacy(user);
  await normalizeDiscoveredItems(user);
  return user;
};

const randomBaseItem = (): string => {
  const randomIndex = Math.floor(Math.random() * BASE_SPAWN_ITEM_IDS.length);
  return BASE_SPAWN_ITEM_IDS[randomIndex];
};

export const getUserState = async (): Promise<UserStateDto> => {
  const user = await prepareUser();
  return toUserStateDto(user, null, null);
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserStateDto> => {
  assertCellIndex(input.cellA);
  assertCellIndex(input.cellB);

  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await prepareUser();

  const firstCell = user.grid.cells[input.cellA];
  const secondCell = user.grid.cells[input.cellB];

  const result = merge(firstCell, secondCell);

  if (!result.merged) {
    return toUserStateDto(user, null, buildMergeMessage("failed", null));
  }

  user.grid.cells[input.cellA].itemId = result.cellA.itemId;
  user.grid.cells[input.cellA].itemLevel = undefined;
  user.grid.cells[input.cellB].itemId = null;
  user.grid.cells[input.cellB].itemLevel = undefined;

  const mergedItem = getItemDetails(result.cellA.itemId ?? null);
  const latestDiscovery = addDiscovery(user, result.cellA.itemId ?? null);
  await user.save();

  return toUserStateDto(user, latestDiscovery, buildMergeMessage(result.outcome, mergedItem));
};

export const spawnItem = async (): Promise<UserStateDto> => {
  const user = await prepareUser();

  const emptyIndex = user.grid.cells.findIndex((cell) => !normalizeGridCellItemId(cell));

  if (emptyIndex === -1) {
    throw new Error("No empty cells available");
  }

  const spawnCost = getSpawnCost(user);

  if (user.gold < spawnCost) {
    throw new Error("Not enough gold to spawn item");
  }

  user.gold -= spawnCost;
  const spawnedItemId = randomBaseItem();
  user.grid.cells[emptyIndex].itemId = spawnedItemId;
  user.grid.cells[emptyIndex].itemLevel = undefined;

  const latestDiscovery = addDiscovery(user, spawnedItemId);
  await user.save();

  return toUserStateDto(user, latestDiscovery, "✨ Создан новый символ");
};

export const claimIncome = async (): Promise<UserStateDto> => {
  const user = await prepareUser();

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
  const user = await prepareUser();

  const upgradeCost = getBaseUpgradeCost(user.baseLevel);

  if (user.gold < upgradeCost) {
    throw new Error("Not enough gold to upgrade base");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return toUserStateDto(user, null, "🏛️ Лаборатория улучшена");
};
