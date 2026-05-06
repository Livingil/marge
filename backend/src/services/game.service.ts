import { User, UserDocument } from "../models/user.model.js";
import {
  ALCHEMY_ITEMS_BY_ID,
  BASE_SPAWN_ITEM_IDS,
  GOAL_SEQUENCE,
  getRecipeDetailsByKey,
  getRecipeKey,
  LEGACY_LEVEL_TO_ITEM_ID
} from "./alchemy.data.js";
import { getActiveGridSize, GRID_SIZE, MAX_OFFLINE_INCOME_SECONDS } from "./game.constants.js";
import {
  getBaseUpgradeCost,
  getDeleteCostWithProgression,
  getGoalRewardBundle,
  getItemTier,
  getSpawnCost as getDynamicSpawnCost
} from "./game.economy.js";
import { getItemDetails, ITEM_CATALOG } from "./game.catalog.js";
import { calculateIncomeWithBase } from "./income.service.js";
import type {
  CurrentGoalDto,
  DeleteCellInput,
  DiscoveredRecipeDetailsDto,
  GoalRewardDto,
  ItemDetails,
  MergeCellsInput,
  UpdateOnboardingInput,
  UserStateDto
} from "./game.types.js";
import { MergeOutcome, merge } from "./merge.service.js";

const ensureUser = async (): Promise<UserDocument> => {
  const existingUser = await User.findOne();
  if (existingUser) {
    return existingUser;
  }

  return User.create({ lastIncomeClaimAt: new Date() });
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

  if (user.grid.cells.length < GRID_SIZE) {
    const missingCells = GRID_SIZE - user.grid.cells.length;
    user.grid.cells.push(...Array.from({ length: missingCells }, () => ({ itemId: null })));
    changed = true;
  }

  if (user.grid.cells.length > GRID_SIZE) {
    user.grid.cells = user.grid.cells.slice(0, GRID_SIZE);
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const getActiveCells = (user: UserDocument) => {
  return user.grid.cells.slice(0, getActiveGridSize(user.baseLevel));
};

const getOccupiedActiveCellsCount = (user: UserDocument): number => {
  return getActiveCells(user).reduce((count, cell) => {
    return normalizeGridCellItemId(cell) ? count + 1 : count;
  }, 0);
};

const getSpawnCost = (user: UserDocument): number => {
  return getDynamicSpawnCost(user.freeSpawnsUsed, user.baseLevel);
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

  const normalizedFromLegacy = user.discoveredItems
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      if (typeof value === "number") {
        return LEGACY_LEVEL_TO_ITEM_ID[value] ?? "";
      }

      return "";
    })
    .filter((value) => value.length > 0);

  const unique = Array.from(new Set([...normalizedFromLegacy, ...discoveredFromGrid])).sort();
  if (unique.join("|") !== user.discoveredItems.join("|")) {
    user.discoveredItems = unique;
    await user.save();
  }
};

const normalizeDiscoveredRecipes = async (user: UserDocument): Promise<void> => {
  if (!Array.isArray(user.discoveredRecipes)) {
    user.discoveredRecipes = [];
    await user.save();
    return;
  }

  const normalized = Array.from(
    new Set(
      user.discoveredRecipes.filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  ).sort();

  if (normalized.join("|") !== user.discoveredRecipes.join("|")) {
    user.discoveredRecipes = normalized;
    await user.save();
  }
};

const normalizeRewardedGoals = async (user: UserDocument): Promise<void> => {
  if (!Array.isArray(user.rewardedGoals)) {
    user.rewardedGoals = [];
    await user.save();
    return;
  }

  const normalized = Array.from(
    new Set(user.rewardedGoals.filter((value): value is string => typeof value === "string" && value.length > 0))
  ).sort();

  if (normalized.join("|") !== user.rewardedGoals.join("|")) {
    user.rewardedGoals = normalized;
    await user.save();
  }
};

const normalizeOnboardingFlags = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (typeof user.onboardingHintDismissed !== "boolean") {
    user.onboardingHintDismissed = false;
    changed = true;
  }

  if (typeof user.onboardingGuideDismissed !== "boolean") {
    user.onboardingGuideDismissed = false;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const normalizeFreeSpawnsUsed = async (user: UserDocument): Promise<void> => {
  if (typeof user.freeSpawnsUsed === "number" && Number.isFinite(user.freeSpawnsUsed) && user.freeSpawnsUsed >= 0) {
    return;
  }

  user.freeSpawnsUsed = 0;
  await user.save();
};

const normalizeDeleteActionsUsed = async (user: UserDocument): Promise<void> => {
  if (typeof user.deleteActionsUsed === "number" && Number.isFinite(user.deleteActionsUsed) && user.deleteActionsUsed >= 0) {
    return;
  }

  user.deleteActionsUsed = 0;
  await user.save();
};

const normalizeGoalRewardCounters = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (typeof user.goalFreeSpawns !== "number" || !Number.isFinite(user.goalFreeSpawns) || user.goalFreeSpawns < 0) {
    user.goalFreeSpawns = 0;
    changed = true;
  }

  if (typeof user.goalFreeDeletes !== "number" || !Number.isFinite(user.goalFreeDeletes) || user.goalFreeDeletes < 0) {
    user.goalFreeDeletes = 0;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const addDiscoveredRecipe = (user: UserDocument, recipeKey: string): void => {
  if (!recipeKey || user.discoveredRecipes.includes(recipeKey)) {
    return;
  }

  user.discoveredRecipes = [...user.discoveredRecipes, recipeKey].sort();
};

const getDiscoveredRecipeDetails = (recipeKeys: string[]): DiscoveredRecipeDetailsDto[] => {
  return recipeKeys
    .map((key) => {
      const recipe = getRecipeDetailsByKey(key);
      if (!recipe) {
        return null;
      }

      const left = getItemDetails(recipe.leftId);
      const right = getItemDetails(recipe.rightId);
      const result = getItemDetails(recipe.resultId);
      if (!left || !right || !result) {
        return null;
      }

      return { key, left, right, result };
    })
    .filter((recipe): recipe is DiscoveredRecipeDetailsDto => Boolean(recipe));
};

const addDiscovery = (user: UserDocument, itemId: string | null): ItemDetails | null => {
  if (!itemId || user.discoveredItems.includes(itemId)) {
    return null;
  }

  user.discoveredItems = [...user.discoveredItems, itemId].sort();
  return getItemDetails(itemId);
};

type GoalRewardSummary = {
  energy: number;
  freeSpawns: number;
  freeDeletes: number;
};

const emptyGoalRewardSummary = (): GoalRewardSummary => ({
  energy: 0,
  freeSpawns: 0,
  freeDeletes: 0
});

const hasGoalRewardSummary = (summary: GoalRewardSummary): boolean => {
  return summary.energy > 0 || summary.freeSpawns > 0 || summary.freeDeletes > 0;
};

const formatGoalRewardSummary = (summary: GoalRewardSummary): string => {
  const parts: string[] = [];
  if (summary.energy > 0) {
    parts.push(`+${summary.energy} энергии`);
  }
  if (summary.freeSpawns > 0) {
    parts.push(`+${summary.freeSpawns} синтез`);
  }
  if (summary.freeDeletes > 0) {
    parts.push(`+${summary.freeDeletes} утилизация`);
  }

  return parts.join(", ");
};

const buildGoalRewardText = (reward: GoalRewardDto): string => {
  const parts = [`Награда: +${reward.energy} энергии`];
  if (reward.freeSpawns > 0) {
    parts.push(`+${reward.freeSpawns} синтез`);
  }
  if (reward.freeDeletes > 0) {
    parts.push(`+${reward.freeDeletes} утилизация`);
  }

  return parts.join(", ");
};

const applyGoalRewards = (user: UserDocument): GoalRewardSummary => {
  const summary = emptyGoalRewardSummary();

  const goalIndex = GOAL_SEQUENCE.findIndex((goalItemId) => !user.rewardedGoals.includes(goalItemId));
  if (goalIndex === -1) {
    return summary;
  }

  const goalItemId = GOAL_SEQUENCE[goalIndex];
  if (!user.discoveredItems.includes(goalItemId)) {
    return summary;
  }

  const tier = getItemTier(goalItemId);
  const reward = getGoalRewardBundle(goalIndex, tier);
  user.rewardedGoals = [...user.rewardedGoals, goalItemId].sort();
  summary.energy = reward.energy;
  summary.freeSpawns = reward.freeSpawns;
  summary.freeDeletes = reward.freeDeletes;

  user.gold += summary.energy;
  user.goalFreeSpawns += summary.freeSpawns;
  user.goalFreeDeletes += summary.freeDeletes;

  return summary;
};

const getCurrentGoal = (discoveredItems: string[]): CurrentGoalDto => {
  const nextTargetIndex = GOAL_SEQUENCE.findIndex((itemId) => !discoveredItems.includes(itemId));
  const allGoalsCompleted = nextTargetIndex === -1;
  const nextTarget = allGoalsCompleted
    ? GOAL_SEQUENCE[GOAL_SEQUENCE.length - 1]
    : GOAL_SEQUENCE[nextTargetIndex];

  if (allGoalsCompleted) {
    return {
      title: "Все цели сектора выполнены",
      targetItemId: nextTarget,
      rewardText: "Все награды получены",
      reward: { energy: 0, freeSpawns: 0, freeDeletes: 0 }
    };
  }

  const tier = getItemTier(nextTarget);
  const reward = getGoalRewardBundle(nextTargetIndex, tier);
  return {
    title: `Открой ${ALCHEMY_ITEMS_BY_ID[nextTarget].name}`,
    targetItemId: nextTarget,
    rewardText: buildGoalRewardText(reward),
    reward
  };
};

const buildDeleteCosts = (user: UserDocument): Array<number | null> => {
  const activeGridSize = getActiveGridSize(user.baseLevel);
  const occupiedActiveCells = getOccupiedActiveCellsCount(user);

  return user.grid.cells.map((cell, index) => {
    if (index >= activeGridSize) {
      return null;
    }

    const itemId = normalizeGridCellItemId(cell);
    if (!itemId) {
      return null;
    }

    const tier = getItemTier(itemId);
    return getDeleteCostWithProgression(tier, occupiedActiveCells, user.deleteActionsUsed);
  });
};

const buildMergeMessage = (outcome: MergeOutcome, item: ItemDetails | null): string => {
  if (outcome === "failed") {
    return "Эти символы пока не соединяются";
  }

  if (item) {
    return `✨ Открыто: ${item.icon} ${item.name}`;
  }

  return "✨ Открыто";
};

const toUserStateDto = (
  user: UserDocument,
  latestDiscovery: ItemDetails | null,
  lastActionMessage: string | null
): UserStateDto => {
  const now = new Date();

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
    claimableIncome: getClaimableIncomePreview(user, now),
    lastIncomeClaimAt: user.lastIncomeClaimAt,
    spawnCost: getSpawnCost(user),
    baseUpgradeCost: getBaseUpgradeCost(user.baseLevel),
    currentGoal: getCurrentGoal(user.discoveredItems),
    discoveredItems: user.discoveredItems,
    discoveredRecipes: user.discoveredRecipes,
    discoveredRecipeDetails: getDiscoveredRecipeDetails(user.discoveredRecipes),
    itemCatalog: ITEM_CATALOG,
    deleteCosts: buildDeleteCosts(user),
    latestDiscovery,
    lastActionMessage,
    onboardingHintDismissed: user.onboardingHintDismissed,
    onboardingGuideDismissed: user.onboardingGuideDismissed,
    goalFreeSpawns: user.goalFreeSpawns,
    goalFreeDeletes: user.goalFreeDeletes
  };
};

const assertCellIndex = (index: number, maxSize: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= maxSize) {
    throw new Error(`Cell index must be an integer from 0 to ${maxSize - 1}`);
  }
};

const prepareUser = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  await normalizeGridFromLegacy(user);
  await normalizeDiscoveredItems(user);
  await normalizeDiscoveredRecipes(user);
  await normalizeRewardedGoals(user);
  await normalizeOnboardingFlags(user);
  await normalizeFreeSpawnsUsed(user);
  await normalizeDeleteActionsUsed(user);
  await normalizeGoalRewardCounters(user);

  const rewardSummary = applyGoalRewards(user);
  if (hasGoalRewardSummary(rewardSummary)) {
    await user.save();
  }

  return user;
};

const randomBaseItem = (): string => {
  const randomIndex = Math.floor(Math.random() * BASE_SPAWN_ITEM_IDS.length);
  return BASE_SPAWN_ITEM_IDS[randomIndex];
};

const GUARANTEED_SPARK_WINDOW = 8;
const GUARANTEED_SPARK_COUNT = 2;
const GUARANTEED_SPARK_ITEM_ID = "spark";

const countSpawnedSparkInGuaranteedWindow = (user: UserDocument): number => {
  return user.grid.cells
    .slice(0, getActiveGridSize(user.baseLevel))
    .filter((cell) => normalizeGridCellItemId(cell) === GUARANTEED_SPARK_ITEM_ID)
    .length;
};

// Early onboarding safety net: ensures the player can craft battery during the
// initial free spawn window without changing normal spawn randomness afterwards.
const getGuaranteedSpawnItemId = (user: UserDocument): string | null => {
  if (user.freeSpawnsUsed >= GUARANTEED_SPARK_WINDOW) {
    return null;
  }

  if (user.discoveredItems.includes("battery")) {
    return null;
  }

  const sparkOnBoard = countSpawnedSparkInGuaranteedWindow(user);
  const remainingGuaranteedSpawns = GUARANTEED_SPARK_WINDOW - user.freeSpawnsUsed;
  const missingSpark = GUARANTEED_SPARK_COUNT - sparkOnBoard;

  if (missingSpark <= 0) {
    return null;
  }

  if (remainingGuaranteedSpawns <= missingSpark) {
    return GUARANTEED_SPARK_ITEM_ID;
  }

  return null;
};

const settlePendingIncome = (user: UserDocument, now: Date): number => {
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));
  const incomePerSecond = calculateIncomeWithBase(user.grid, user.baseLevel) / 60;
  const earnedGold = Math.floor(incomePerSecond * elapsedSeconds);

  if (earnedGold > 0) {
    user.gold += earnedGold;
  }

  user.lastIncomeClaimAt = now;
  return earnedGold;
};

const getClaimableIncomePreview = (user: UserDocument, now: Date): number => {
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));
  const incomePerSecond = calculateIncomeWithBase(user.grid, user.baseLevel) / 60;
  return Math.floor(incomePerSecond * elapsedSeconds);
};

export const getUserState = async (): Promise<UserStateDto> => {
  const user = await prepareUser();
  return toUserStateDto(user, null, null);
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserStateDto> => {
  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await prepareUser();
  settlePendingIncome(user, new Date());
  const activeGridSize = getActiveGridSize(user.baseLevel);
  assertCellIndex(input.cellA, activeGridSize);
  assertCellIndex(input.cellB, activeGridSize);

  const firstCell = user.grid.cells[input.cellA];
  const secondCell = user.grid.cells[input.cellB];
  const firstItemId = normalizeGridCellItemId(firstCell);
  const secondItemId = normalizeGridCellItemId(secondCell);

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
  const rewardSummary = applyGoalRewards(user);

  if (firstItemId && secondItemId) {
    addDiscoveredRecipe(user, getRecipeKey(firstItemId, secondItemId));
  }

  await user.save();

  if (hasGoalRewardSummary(rewardSummary)) {
    return toUserStateDto(user, latestDiscovery, `🎯 Цель выполнена: ${formatGoalRewardSummary(rewardSummary)}`);
  }

  return toUserStateDto(user, latestDiscovery, buildMergeMessage(result.outcome, mergedItem));
};

export const spawnItem = async (): Promise<UserStateDto> => {
  const user = await prepareUser();
  settlePendingIncome(user, new Date());
  const activeGridSize = getActiveGridSize(user.baseLevel);
  const emptyIndex = user.grid.cells
    .slice(0, activeGridSize)
    .findIndex((cell) => !normalizeGridCellItemId(cell));

  if (emptyIndex === -1) {
    throw new Error("Нет свободных клеток");
  }

  const spawnCost = getSpawnCost(user);
  if (user.goalFreeSpawns <= 0 && user.gold < spawnCost) {
    throw new Error("Недостаточно энергии");
  }

  if (user.goalFreeSpawns > 0) {
    user.goalFreeSpawns -= 1;
  } else {
    user.gold -= spawnCost;
  }

  const guaranteedItemId = getGuaranteedSpawnItemId(user);

  user.freeSpawnsUsed += 1;
  const spawnedItemId = guaranteedItemId ?? randomBaseItem();
  user.grid.cells[emptyIndex].itemId = spawnedItemId;
  user.grid.cells[emptyIndex].itemLevel = undefined;

  const latestDiscovery = addDiscovery(user, spawnedItemId);
  const rewardSummary = applyGoalRewards(user);
  await user.save();

  if (hasGoalRewardSummary(rewardSummary)) {
    return toUserStateDto(user, latestDiscovery, `🎯 Цель выполнена: ${formatGoalRewardSummary(rewardSummary)}`);
  }

  return toUserStateDto(user, latestDiscovery, "✨ Синтезирован новый символ");
};

export const deleteCell = async (input: DeleteCellInput): Promise<UserStateDto> => {
  const user = await prepareUser();
  settlePendingIncome(user, new Date());
  const activeGridSize = getActiveGridSize(user.baseLevel);
  assertCellIndex(input.cellIndex, activeGridSize);

  const cell = user.grid.cells[input.cellIndex];
  const itemId = normalizeGridCellItemId(cell);
  if (!itemId) {
    throw new Error("Клетка уже пуста");
  }

  const occupiedCells = getOccupiedActiveCellsCount(user);
  const itemTier = getItemTier(itemId);
  const deleteCost = getDeleteCostWithProgression(itemTier, occupiedCells, user.deleteActionsUsed);

  if (user.goalFreeDeletes <= 0 && user.gold < deleteCost) {
    throw new Error("Недостаточно энергии для утилизации");
  }

  if (user.goalFreeDeletes > 0) {
    user.goalFreeDeletes -= 1;
  } else {
    user.gold -= deleteCost;
  }
  user.grid.cells[input.cellIndex].itemId = null;
  user.grid.cells[input.cellIndex].itemLevel = undefined;
  user.deleteActionsUsed += 1;
  await user.save();

  return toUserStateDto(user, null, "♻️ Образец утилизирован");
};

export const claimIncome = async (): Promise<UserStateDto> => {
  const user = await prepareUser();
  const earnedGold = settlePendingIncome(user, new Date());

  await user.save();
  return toUserStateDto(user, null, `💰 Поток собран: +${earnedGold} энергии`);
};

export const upgradeBase = async (): Promise<UserStateDto> => {
  const user = await prepareUser();
  settlePendingIncome(user, new Date());
  const upgradeCost = getBaseUpgradeCost(user.baseLevel);

  if (user.gold < upgradeCost) {
    throw new Error("Недостаточно энергии");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return toUserStateDto(user, null, "🏛️ Лаборатория усилена");
};

export const updateOnboardingState = async (input: UpdateOnboardingInput): Promise<UserStateDto> => {
  const user = await prepareUser();

  if (typeof input.hintDismissed === "boolean") {
    user.onboardingHintDismissed = input.hintDismissed;
  }

  if (typeof input.guideDismissed === "boolean") {
    user.onboardingGuideDismissed = input.guideDismissed;
  }

  await user.save();
  return toUserStateDto(user, null, null);
};

