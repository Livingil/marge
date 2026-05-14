import { IUser, User, UserDocument } from "../models/user.model.js";
import {
  BASE_SPAWN_ITEM_IDS,
  getRecipeDetailsByKey,
  getRecipeKey,
  LEGACY_LEVEL_TO_ITEM_ID
} from "./alchemy.data.js";
import { getActiveGridSize, GRID_SIZE, MAX_OFFLINE_INCOME_SECONDS } from "./game.constants.js";
import {
  getBaseUpgradeCost,
  getDeleteCostWithProgression,
  getItemTier,
  getSpawnCost as getDynamicSpawnCost
} from "./game.economy.js";
import { getItemDetails, ITEM_CATALOG } from "./game.catalog.js";
import {
  applyGoalRewardsAndBuildMessage,
  getCurrentGoal
} from "./goalProgression.js";
import {
  getEarlySparkPitySpawnItemId,
  getGuaranteedSpawnItemId
} from "./spawnProgression.js";
import {
  activateFlowBoost,
  buildAdBoostOptions,
  createDefaultActiveBoosts,
  createEmptyAdBoostClaims,
  getAdBoostUsage,
  getEffectiveFlowMultiplier,
  resetAdBoostClaimsIfNeeded,
  setAdBoostUsage,
  settleActiveFlowBoost
} from "./adBoosts.js";
import {
  buildWeeklyRewards,
  canClaimDailyReward,
  getDailyRewardByDay,
  getDayInCycle,
  getNextDailyClaimAt,
  isYesterdayUtc,
  toDateKeyUtc
} from "./dailyRewards.js";
import { calculateIncomeWithBase } from "./income.service.js";
import type {
  CharacterArchetype,
  CompletePurchaseSessionInput,
  CompleteAdBoostSessionInput,
  DeleteCellInput,
  DiscoveredRecipeDetailsDto,
  ItemDetails,
  MergeCellsInput,
  PurchaseSessionDto,
  RegisterCharacterInput,
  RewardedAdSessionDto,
  StartPurchaseSessionInput,
  StartAdBoostSessionInput,
  UpdateCharacterProfileInput,
  UpdateOnboardingInput,
  UserStateDto
} from "./game.types.js";
import { MergeOutcome, merge } from "./merge.service.js";
import {
  assertRewardedAdBoostSupported,
  assertRewardedAdLimitAvailable,
  completeRewardedAdSession,
  createRewardedAdSession,
  expireRewardedAdSessions,
  markRewardedAdSessionGranted,
  REWARDED_AD_DEFAULT_PLACEMENT,
  REWARDED_AD_SUPPORTED_PROVIDERS,
  trimRewardedAdSessions
} from "./rewardedAds.js";
import { verifyRewardedAdCompletion } from "./rewardedAdVerification.js";
import {
  assertPurchaseAllowed,
  assertPurchaseProviderSupported,
  completePurchaseSession,
  createPurchaseSession,
  expirePurchaseSessions,
  getPurchaseOffer,
  grantPurchaseSession,
  hasProcessedTransaction,
  PURCHASE_DEFAULT_PROVIDER,
  PURCHASE_OFFERS,
  PURCHASE_SUPPORTED_PROVIDERS,
  trimPurchaseHistory,
  trimPurchaseSessions
} from "./purchases.js";
import { verifyPurchaseCompletion } from "./purchaseVerification.js";

const ensureUser = async (playerId: string): Promise<UserDocument> => {
  const existingUser = await User.findOne({ playerId });
  if (existingUser) {
    return existingUser;
  }

  return User.create({ playerId, lastIncomeClaimAt: new Date() });
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

const normalizeAccountFields = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (!user.account || typeof user.account !== "object") {
    user.account = {
      provider: null,
      providerUserId: null,
      linkedAt: null,
      displayName: null
    };
    changed = true;
  }

  const provider =
    user.account.provider === "vkid" || user.account.provider === "telegram" || user.account.provider === "email"
      ? user.account.provider
      : null;

  if (user.account.provider !== provider) {
    user.account.provider = provider;
    changed = true;
  }

  if (user.account.providerUserId !== null && typeof user.account.providerUserId !== "string") {
    user.account.providerUserId = null;
    changed = true;
  }

  if (user.account.displayName !== null && typeof user.account.displayName !== "string") {
    user.account.displayName = null;
    changed = true;
  }

  if (user.account.linkedAt !== null && !(user.account.linkedAt instanceof Date)) {
    user.account.linkedAt = null;
    changed = true;
  }

  const hasIncompleteLinkedAccount =
    (user.account.provider && !user.account.providerUserId) ||
    (!user.account.provider && user.account.providerUserId);

  if (hasIncompleteLinkedAccount) {
    user.account.provider = null;
    user.account.providerUserId = null;
    user.account.linkedAt = null;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const CHARACTER_NAME_MIN_LENGTH = 2;
const CHARACTER_NAME_MAX_LENGTH = 24;
const CHARACTER_CODENAME_MAX_LENGTH = 24;
const CHARACTER_AVATAR_SEED_MAX_LENGTH = 64;
const CHARACTER_NAME_PATTERN = /^[\p{L}\p{N}_ -]+$/u;
const CHARACTER_ARCHETYPES: CharacterArchetype[] = ["alchemist", "engineer", "scout", "keeper"];

const normalizeCharacterName = (value: string): string => value.trim().replace(/\s+/g, " ");

const assertCharacterName = (value: string, fieldLabel: "name" | "codename"): string => {
  const normalized = normalizeCharacterName(value);
  const maxLength = fieldLabel === "name" ? CHARACTER_NAME_MAX_LENGTH : CHARACTER_CODENAME_MAX_LENGTH;

  if (normalized.length < CHARACTER_NAME_MIN_LENGTH) {
    throw new Error(`${fieldLabel} is too short`);
  }

  if (normalized.length > maxLength) {
    throw new Error(`${fieldLabel} is too long`);
  }

  if (!CHARACTER_NAME_PATTERN.test(normalized)) {
    throw new Error(`${fieldLabel} contains unsupported characters`);
  }

  return normalized;
};

const assertArchetype = (value: string): CharacterArchetype => {
  if (CHARACTER_ARCHETYPES.includes(value as CharacterArchetype)) {
    return value as CharacterArchetype;
  }

  throw new Error("Unsupported character archetype");
};

const normalizeCharacterFields = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (!user.character || typeof user.character !== "object") {
    user.character = {
      isRegistered: false,
      name: null,
      codename: null,
      archetype: null,
      avatarSeed: null,
      registeredAt: null,
      updatedAt: null
    };
    changed = true;
  }

  if (typeof user.character.isRegistered !== "boolean") {
    user.character.isRegistered = false;
    changed = true;
  }

  if (user.character.name !== null && typeof user.character.name !== "string") {
    user.character.name = null;
    changed = true;
  }

  if (user.character.codename !== null && typeof user.character.codename !== "string") {
    user.character.codename = null;
    changed = true;
  }

  if (user.character.archetype !== null && !CHARACTER_ARCHETYPES.includes(user.character.archetype)) {
    user.character.archetype = null;
    changed = true;
  }

  if (user.character.avatarSeed !== null && typeof user.character.avatarSeed !== "string") {
    user.character.avatarSeed = null;
    changed = true;
  }

  if (user.character.registeredAt !== null && !(user.character.registeredAt instanceof Date)) {
    user.character.registeredAt = null;
    changed = true;
  }

  if (user.character.updatedAt !== null && !(user.character.updatedAt instanceof Date)) {
    user.character.updatedAt = null;
    changed = true;
  }

  if (user.character.isRegistered && (!user.character.name || !user.character.archetype)) {
    user.character.isRegistered = false;
    user.character.registeredAt = null;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const normalizeDailyRewardFields = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (user.lastDailyRewardClaimAt !== null && !(user.lastDailyRewardClaimAt instanceof Date)) {
    user.lastDailyRewardClaimAt = null;
    changed = true;
  }

  if (typeof user.dailyStreak !== "number" || !Number.isFinite(user.dailyStreak) || user.dailyStreak < 0) {
    user.dailyStreak = 0;
    changed = true;
  }

  if (typeof user.bestDailyStreak !== "number" || !Number.isFinite(user.bestDailyStreak) || user.bestDailyStreak < 0) {
    user.bestDailyStreak = 0;
    changed = true;
  }

  if (typeof user.totalDailyClaims !== "number" || !Number.isFinite(user.totalDailyClaims) || user.totalDailyClaims < 0) {
    user.totalDailyClaims = 0;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const normalizeAdBoostFields = async (user: UserDocument): Promise<void> => {
  let changed = false;

  if (!user.adBoostClaims || typeof user.adBoostClaims !== "object") {
    user.adBoostClaims = createEmptyAdBoostClaims();
    changed = true;
  }

  if (!user.activeBoosts || typeof user.activeBoosts !== "object") {
    user.activeBoosts = createDefaultActiveBoosts();
    changed = true;
  }

  if (typeof user.adBoostClaims.dateKey !== "string") {
    user.adBoostClaims.dateKey = "";
    changed = true;
  }

  const claimKeys: Array<keyof IUser["adBoostClaims"]> = [
    "freeSpawnToday",
    "freeDeleteToday",
    "flowBoostToday",
    "doubleOfflineToday"
  ];

  for (const key of claimKeys) {
    if (
      typeof user.adBoostClaims[key] !== "number" ||
      !Number.isFinite(user.adBoostClaims[key]) ||
      user.adBoostClaims[key] < 0
    ) {
      user.adBoostClaims[key] = 0 as never;
      changed = true;
    }
  }

  if (
    typeof user.activeBoosts.flowMultiplier !== "number" ||
    !Number.isFinite(user.activeBoosts.flowMultiplier) ||
    user.activeBoosts.flowMultiplier < 1
  ) {
    user.activeBoosts.flowMultiplier = 1;
    changed = true;
  }

  if (user.activeBoosts.flowMultiplierUntil !== null && !(user.activeBoosts.flowMultiplierUntil instanceof Date)) {
    user.activeBoosts.flowMultiplierUntil = null;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const normalizeRewardedAdSessionFields = async (user: UserDocument): Promise<void> => {
  const now = new Date();
  let changed = false;

  if (!Array.isArray(user.rewardedAdSessions)) {
    user.rewardedAdSessions = [];
    changed = true;
  }

  const normalizedSessions = trimRewardedAdSessions(
    expireRewardedAdSessions(
      user.rewardedAdSessions
        .filter((session) => session && typeof session === "object")
        .map((session) => ({
          sessionId: typeof session.sessionId === "string" ? session.sessionId : "",
          boostType: session.boostType,
          provider: session.provider === "vkads" || session.provider === "rustore" ? session.provider : "mock",
          placement: typeof session.placement === "string" && session.placement.length > 0 ? session.placement : REWARDED_AD_DEFAULT_PLACEMENT,
          status:
            session.status === "completed" ||
            session.status === "rewarded" ||
            session.status === "expired"
              ? session.status
              : "started",
          createdAt: session.createdAt instanceof Date ? session.createdAt : now,
          expiresAt: session.expiresAt instanceof Date ? session.expiresAt : now,
          completedAt: session.completedAt instanceof Date ? session.completedAt : null,
          rewardedAt: session.rewardedAt instanceof Date ? session.rewardedAt : null
        })),
      now
    )
  );

  if (JSON.stringify(normalizedSessions) !== JSON.stringify(user.rewardedAdSessions)) {
    user.rewardedAdSessions = normalizedSessions;
    changed = true;
  }

  if (changed) {
    await user.save();
  }
};

const normalizePurchaseFields = async (user: UserDocument): Promise<void> => {
  const now = new Date();
  let changed = false;

  if (!user.commerceEntitlements || typeof user.commerceEntitlements !== "object") {
    user.commerceEntitlements = {
      removeAds: false,
      starterPackPurchasedAt: null
    };
    changed = true;
  }

  if (typeof user.commerceEntitlements.removeAds !== "boolean") {
    user.commerceEntitlements.removeAds = false;
    changed = true;
  }

  if (
    user.commerceEntitlements.starterPackPurchasedAt !== null &&
    !(user.commerceEntitlements.starterPackPurchasedAt instanceof Date)
  ) {
    user.commerceEntitlements.starterPackPurchasedAt = null;
    changed = true;
  }

  if (!Array.isArray(user.purchaseSessions)) {
    user.purchaseSessions = [];
    changed = true;
  }

  const normalizedPurchaseSessions = trimPurchaseSessions(
    expirePurchaseSessions(
      user.purchaseSessions
        .filter((session) => session && typeof session === "object")
        .map((session) => ({
          sessionId: typeof session.sessionId === "string" ? session.sessionId : "",
          productId:
            session.productId === "starter_pack" ||
            session.productId === "energy_pack_small" ||
            session.productId === "premium_no_ads"
              ? session.productId
              : "energy_pack_small",
          provider: session.provider === "rustore" ? "rustore" : "mock",
          status:
            session.status === "completed" || session.status === "granted" || session.status === "expired"
              ? session.status
              : "started",
          createdAt: session.createdAt instanceof Date ? session.createdAt : now,
          expiresAt: session.expiresAt instanceof Date ? session.expiresAt : now,
          transactionId: typeof session.transactionId === "string" ? session.transactionId : null,
          completedAt: session.completedAt instanceof Date ? session.completedAt : null,
          grantedAt: session.grantedAt instanceof Date ? session.grantedAt : null
        })),
      now
    )
  );

  if (JSON.stringify(normalizedPurchaseSessions) !== JSON.stringify(user.purchaseSessions)) {
    user.purchaseSessions = normalizedPurchaseSessions;
    changed = true;
  }

  if (!Array.isArray(user.purchaseHistory)) {
    user.purchaseHistory = [];
    changed = true;
  }

  const normalizedPurchaseHistory = trimPurchaseHistory(
    user.purchaseHistory
      .filter((entry) => entry && typeof entry === "object")
      .map((entry) => ({
        productId:
          entry.productId === "starter_pack" ||
          entry.productId === "energy_pack_small" ||
          entry.productId === "premium_no_ads"
            ? entry.productId
            : "energy_pack_small",
        provider: entry.provider === "rustore" ? ("rustore" as const) : ("mock" as const),
        transactionId: typeof entry.transactionId === "string" ? entry.transactionId : "",
        grantedAt: entry.grantedAt instanceof Date ? entry.grantedAt : now
      }))
      .filter((entry) => entry.transactionId.length > 0)
  );

  if (JSON.stringify(normalizedPurchaseHistory) !== JSON.stringify(user.purchaseHistory)) {
    user.purchaseHistory = normalizedPurchaseHistory;
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
  const isLinkedAccount = Boolean(user.account.provider && user.account.providerUserId);
  user.activeBoosts = settleActiveFlowBoost(user.activeBoosts, now);
  user.adBoostClaims = resetAdBoostClaimsIfNeeded(user.adBoostClaims, now);
  const flowMultiplier = getEffectiveFlowMultiplier(user.activeBoosts, now);
  const effectiveIncomePerMinute = Math.floor(calculateIncomeWithBase(user.grid, user.baseLevel) * flowMultiplier);
  const dailyCanClaim = canClaimDailyReward(user.lastDailyRewardClaimAt, now);
  const nextDailyClaimAt = getNextDailyClaimAt(user.lastDailyRewardClaimAt);
  const todayCycleDay = getDayInCycle(user.dailyStreak > 0 ? user.dailyStreak : 1);
  const todayReward = getDailyRewardByDay(todayCycleDay);
  const flowActiveUntil = user.activeBoosts.flowMultiplierUntil;

  return {
    _id: user.id,
    player: {
      id: user.playerId,
      mode: isLinkedAccount ? "linked" : "guest"
    },
    character: {
      isRegistered: user.character.isRegistered,
      name: user.character.name,
      codename: user.character.codename,
      archetype: user.character.archetype,
      avatarSeed: user.character.avatarSeed,
      registeredAt: user.character.registeredAt ? user.character.registeredAt.toISOString() : null,
      updatedAt: user.character.updatedAt ? user.character.updatedAt.toISOString() : null
    },
    account: {
      isLinked: isLinkedAccount,
      provider: user.account.provider,
      displayName: user.account.displayName,
      linkedAt: user.account.linkedAt ? user.account.linkedAt.toISOString() : null,
      suggestedProviders: ["vkid", "telegram", "email"]
    },
    gold: user.gold,
    baseLevel: user.baseLevel,
    grid: {
      cells: user.grid.cells.map((cell) => ({
        itemId: normalizeGridCellItemId(cell),
        item: getItemDetails(normalizeGridCellItemId(cell))
      }))
    },
    incomePerMinute: effectiveIncomePerMinute,
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
    goalFreeDeletes: user.goalFreeDeletes,
    dailyReward: {
      canClaim: dailyCanClaim,
      streak: user.dailyStreak,
      bestStreak: user.bestDailyStreak,
      totalClaims: user.totalDailyClaims,
      nextClaimAt: dailyCanClaim || !nextDailyClaimAt ? null : nextDailyClaimAt.toISOString(),
      todayReward,
      weekRewards: buildWeeklyRewards(user.dailyStreak, dailyCanClaim)
    },
    adBoosts: {
      dateKey: user.adBoostClaims.dateKey || toDateKeyUtc(now),
      supportedProviders: REWARDED_AD_SUPPORTED_PROVIDERS,
      options: buildAdBoostOptions(user.adBoostClaims),
      active: {
        flowMultiplier: flowActiveUntil ? Math.max(1, user.activeBoosts.flowMultiplier) : 1,
        flowMultiplierUntil: flowActiveUntil ? flowActiveUntil.toISOString() : null
      }
    },
    commerce: {
      supportedProviders: PURCHASE_SUPPORTED_PROVIDERS,
      offers: PURCHASE_OFFERS,
      entitlements: {
        removeAds: user.commerceEntitlements.removeAds,
        starterPackPurchased: Boolean(user.commerceEntitlements.starterPackPurchasedAt)
      }
    }
  };
};

const assertCellIndex = (index: number, maxSize: number): void => {
  if (!Number.isInteger(index) || index < 0 || index >= maxSize) {
    throw new Error(`Cell index must be an integer from 0 to ${maxSize - 1}`);
  }
};

const toRewardedAdSessionDto = (session: UserDocument["rewardedAdSessions"][number]): RewardedAdSessionDto => ({
  sessionId: session.sessionId,
  boostType: session.boostType,
  provider: session.provider,
  placement: session.placement,
  status: session.status,
  expiresAt: session.expiresAt.toISOString()
});

const toPurchaseSessionDto = (session: UserDocument["purchaseSessions"][number]): PurchaseSessionDto => ({
  sessionId: session.sessionId,
  productId: session.productId,
  provider: session.provider,
  status: session.status,
  expiresAt: session.expiresAt.toISOString()
});

const prepareUser = async (playerId: string): Promise<UserDocument> => {
  // prepareUser must not grant rewards or claim idle income.
  // It only normalizes persisted user state.
  const user = await ensureUser(playerId);
  await normalizeGridFromLegacy(user);
  await normalizeDiscoveredItems(user);
  await normalizeDiscoveredRecipes(user);
  await normalizeRewardedGoals(user);
  await normalizeOnboardingFlags(user);
  await normalizeFreeSpawnsUsed(user);
  await normalizeDeleteActionsUsed(user);
  await normalizeGoalRewardCounters(user);
  await normalizeAccountFields(user);
  await normalizeCharacterFields(user);
  await normalizeDailyRewardFields(user);
  await normalizeAdBoostFields(user);
  await normalizeRewardedAdSessionFields(user);
  await normalizePurchaseFields(user);

  return user;
};

const randomBaseItem = (): string => {
  const randomIndex = Math.floor(Math.random() * BASE_SPAWN_ITEM_IDS.length);
  return BASE_SPAWN_ITEM_IDS[randomIndex];
};

const settlePendingIncome = (user: UserDocument, now: Date): number => {
  user.activeBoosts = settleActiveFlowBoost(user.activeBoosts, now);
  const flowMultiplier = getEffectiveFlowMultiplier(user.activeBoosts, now);
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));
  const incomePerSecond = (calculateIncomeWithBase(user.grid, user.baseLevel) * flowMultiplier) / 60;
  const earnedGold = Math.floor(incomePerSecond * elapsedSeconds);

  if (earnedGold > 0) {
    user.gold += earnedGold;
  }

  user.lastIncomeClaimAt = now;
  return earnedGold;
};

const getClaimableIncomePreview = (user: UserDocument, now: Date): number => {
  user.activeBoosts = settleActiveFlowBoost(user.activeBoosts, now);
  const flowMultiplier = getEffectiveFlowMultiplier(user.activeBoosts, now);
  const elapsedSecondsRaw = Math.floor((now.getTime() - user.lastIncomeClaimAt.getTime()) / 1000);
  const elapsedSeconds = Math.max(0, Math.min(elapsedSecondsRaw, MAX_OFFLINE_INCOME_SECONDS));
  const incomePerSecond = (calculateIncomeWithBase(user.grid, user.baseLevel) * flowMultiplier) / 60;
  return Math.floor(incomePerSecond * elapsedSeconds);
};

export const getUserState = async (playerId: string): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  return toUserStateDto(user, null, null);
};

export const mergeCells = async (playerId: string, input: MergeCellsInput): Promise<UserStateDto> => {
  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await prepareUser(playerId);
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

  if (firstItemId && secondItemId) {
    addDiscoveredRecipe(user, getRecipeKey(firstItemId, secondItemId));
  }

  const goalRewardMessage = applyGoalRewardsAndBuildMessage(user);
  await user.save();

  if (goalRewardMessage) {
    return toUserStateDto(user, latestDiscovery, goalRewardMessage);
  }

  return toUserStateDto(user, latestDiscovery, buildMergeMessage(result.outcome, mergedItem));
};

export const spawnItem = async (playerId: string): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
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

  const spawnProgressionState = {
    freeSpawnsUsed: user.freeSpawnsUsed,
    discoveredItems: user.discoveredItems,
    activeCells: getActiveCells(user).map((cell) => ({
      itemId: normalizeGridCellItemId(cell)
    }))
  };
  const guaranteedItemId = getGuaranteedSpawnItemId(spawnProgressionState);
  const pityItemId = guaranteedItemId ?? getEarlySparkPitySpawnItemId(spawnProgressionState);

  user.freeSpawnsUsed += 1;
  const spawnedItemId = pityItemId ?? randomBaseItem();
  user.grid.cells[emptyIndex].itemId = spawnedItemId;
  user.grid.cells[emptyIndex].itemLevel = undefined;

  const latestDiscovery = addDiscovery(user, spawnedItemId);
  const goalRewardMessage = applyGoalRewardsAndBuildMessage(user);
  await user.save();

  if (goalRewardMessage) {
    return toUserStateDto(user, latestDiscovery, goalRewardMessage);
  }

  return toUserStateDto(user, latestDiscovery, "✨ Синтезирован новый символ");
};

export const deleteCell = async (playerId: string, input: DeleteCellInput): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
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

export const claimIncome = async (playerId: string): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  const earnedGold = settlePendingIncome(user, new Date());

  await user.save();
  return toUserStateDto(user, null, `💰 Поток собран: +${earnedGold} энергии`);
};

export const upgradeBase = async (playerId: string): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  const upgradeCost = getBaseUpgradeCost(user.baseLevel);

  if (user.gold < upgradeCost) {
    throw new Error("Недостаточно энергии");
  }

  user.gold -= upgradeCost;
  user.baseLevel += 1;
  await user.save();

  return toUserStateDto(user, null, "🏛️ Лаборатория усилена");
};

export const claimDailyReward = async (playerId: string): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  const now = new Date();

  if (!canClaimDailyReward(user.lastDailyRewardClaimAt, now)) {
    throw new Error("Награда за сегодня уже получена");
  }

  if (!user.lastDailyRewardClaimAt) {
    user.dailyStreak = 1;
  } else if (isYesterdayUtc(user.lastDailyRewardClaimAt, now)) {
    user.dailyStreak += 1;
  } else {
    user.dailyStreak = 1;
  }

  const dayInCycle = getDayInCycle(user.dailyStreak);
  const reward = getDailyRewardByDay(dayInCycle);
  user.gold += reward.energy;
  user.goalFreeSpawns += reward.freeSpawns;
  user.goalFreeDeletes += reward.freeDeletes;
  user.lastDailyRewardClaimAt = now;
  user.totalDailyClaims += 1;
  user.bestDailyStreak = Math.max(user.bestDailyStreak, user.dailyStreak);

  await user.save();
  return toUserStateDto(user, null, "📅 Ежедневная награда получена");
};

export const startAdBoostSession = async (
  playerId: string,
  input: StartAdBoostSessionInput
): Promise<RewardedAdSessionDto> => {
  const { boostType, provider = "mock", placement = REWARDED_AD_DEFAULT_PLACEMENT } = input;
  const user = await prepareUser(playerId);
  const now = new Date();

  user.adBoostClaims = resetAdBoostClaimsIfNeeded(user.adBoostClaims, now);
  user.rewardedAdSessions = trimRewardedAdSessions(expireRewardedAdSessions(user.rewardedAdSessions, now));
  assertRewardedAdBoostSupported(boostType);
  assertRewardedAdLimitAvailable(user.adBoostClaims, boostType);

  if (!REWARDED_AD_SUPPORTED_PROVIDERS.includes(provider)) {
    throw new Error("??????????? ????????? rewarded ads");
  }

  const session = createRewardedAdSession(boostType, now, provider, placement);
  user.rewardedAdSessions = trimRewardedAdSessions([session, ...user.rewardedAdSessions]);

  await user.save();
  return toRewardedAdSessionDto(session);
};

export const completeAdBoostSessionGrant = async (
  playerId: string,
  input: CompleteAdBoostSessionInput & { boostType: StartAdBoostSessionInput["boostType"] }
): Promise<UserStateDto> => {
  const { sessionId, boostType } = input;
  const user = await prepareUser(playerId);
  const now = new Date();

  user.adBoostClaims = resetAdBoostClaimsIfNeeded(user.adBoostClaims, now);
  user.rewardedAdSessions = trimRewardedAdSessions(expireRewardedAdSessions(user.rewardedAdSessions, now));
  assertRewardedAdBoostSupported(boostType);
  assertRewardedAdLimitAvailable(user.adBoostClaims, boostType);

  const targetSession = user.rewardedAdSessions.find((session) => session.sessionId === sessionId);
  if (!targetSession) {
    throw new Error("Сессия rewarded ads не найдена");
  }

  await verifyRewardedAdCompletion({
    provider: targetSession.provider,
    boostType,
    sessionId
  });

  user.rewardedAdSessions = completeRewardedAdSession(user.rewardedAdSessions, sessionId, boostType, now);

  const currentUsage = getAdBoostUsage(user.adBoostClaims, boostType);

  switch (boostType) {
    case "rewarded_free_spawn":
      user.goalFreeSpawns += 1;
      break;
    case "rewarded_free_delete":
      user.goalFreeDeletes += 1;
      break;
    case "rewarded_flow_boost":
      user.activeBoosts = activateFlowBoost(now);
      break;
    case "rewarded_double_offline_income":
      throw new Error("???? ??????-????? ???? ?? ???????????");
  }

  user.adBoostClaims = setAdBoostUsage(user.adBoostClaims, boostType, currentUsage + 1);
  user.rewardedAdSessions = markRewardedAdSessionGranted(user.rewardedAdSessions, sessionId, now);

  await user.save();
  return toUserStateDto(user, null, "?? ????? ???????");
};

export const startPurchaseSessionIntent = async (
  playerId: string,
  input: StartPurchaseSessionInput
): Promise<PurchaseSessionDto> => {
  const { productId, provider = PURCHASE_DEFAULT_PROVIDER } = input;
  const user = await prepareUser(playerId);
  const now = new Date();

  user.purchaseSessions = trimPurchaseSessions(expirePurchaseSessions(user.purchaseSessions, now));
  assertPurchaseProviderSupported(provider);
  getPurchaseOffer(productId);
  assertPurchaseAllowed(productId, user.commerceEntitlements);

  const session = createPurchaseSession(productId, now, provider);
  user.purchaseSessions = trimPurchaseSessions([session, ...user.purchaseSessions]);

  await user.save();
  return toPurchaseSessionDto(session);
};

export const completePurchaseSessionGrant = async (
  playerId: string,
  input: CompletePurchaseSessionInput
): Promise<UserStateDto> => {
  const { sessionId, transactionId } = input;
  const user = await prepareUser(playerId);
  const now = new Date();

  user.purchaseSessions = trimPurchaseSessions(expirePurchaseSessions(user.purchaseSessions, now));
  user.purchaseHistory = trimPurchaseHistory(user.purchaseHistory);

  if (hasProcessedTransaction(user.purchaseHistory, transactionId)) {
    throw new Error("Транзакция уже обработана");
  }

  const targetSession = user.purchaseSessions.find((session) => session.sessionId === sessionId);
  if (!targetSession) {
    throw new Error("Сессия покупки не найдена");
  }

  getPurchaseOffer(targetSession.productId);
  assertPurchaseAllowed(targetSession.productId, user.commerceEntitlements);
  const verifiedPurchase = await verifyPurchaseCompletion({
    provider: targetSession.provider,
    productId: targetSession.productId,
    transactionId,
    sessionId
  });

  user.purchaseSessions = completePurchaseSession(
    user.purchaseSessions,
    sessionId,
    verifiedPurchase.transactionId,
    now
  );

  const offer = getPurchaseOffer(targetSession.productId);
  user.gold += offer.rewards.energy;
  user.goalFreeSpawns += offer.rewards.freeSpawns;
  user.goalFreeDeletes += offer.rewards.freeDeletes;

  if (offer.productId === "starter_pack") {
    user.commerceEntitlements.starterPackPurchasedAt = now;
  }

  if (offer.rewards.removeAds) {
    user.commerceEntitlements.removeAds = true;
  }

  user.purchaseSessions = grantPurchaseSession(user.purchaseSessions, sessionId, now);
  user.purchaseHistory = trimPurchaseHistory([
    {
      productId: offer.productId,
      provider: targetSession.provider,
      transactionId: verifiedPurchase.transactionId,
      grantedAt: now
    },
    ...user.purchaseHistory
  ]);

  await user.save();
  return toUserStateDto(user, null, "Покупка применена");
};

export const updateOnboardingState = async (
  playerId: string,
  input: UpdateOnboardingInput
): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);

  if (typeof input.hintDismissed === "boolean") {
    user.onboardingHintDismissed = input.hintDismissed;
  }

  if (typeof input.guideDismissed === "boolean") {
    user.onboardingGuideDismissed = input.guideDismissed;
  }

  await user.save();
  return toUserStateDto(user, null, null);
};

export const registerCharacter = async (
  playerId: string,
  input: RegisterCharacterInput
): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  const now = new Date();

  const normalizedName = assertCharacterName(input.name, "name");
  const normalizedArchetype = assertArchetype(input.archetype);
  const normalizedCodename =
    typeof input.codename === "string" && input.codename.trim().length > 0
      ? assertCharacterName(input.codename, "codename")
      : null;
  const normalizedAvatarSeed =
    typeof input.avatarSeed === "string" && input.avatarSeed.trim().length > 0
      ? input.avatarSeed.trim().slice(0, CHARACTER_AVATAR_SEED_MAX_LENGTH)
      : null;

  user.character.isRegistered = true;
  user.character.name = normalizedName;
  user.character.codename = normalizedCodename;
  user.character.archetype = normalizedArchetype;
  user.character.avatarSeed = normalizedAvatarSeed;
  user.character.registeredAt = user.character.registeredAt ?? now;
  user.character.updatedAt = now;

  await user.save();
  return toUserStateDto(user, null, "Персонаж зарегистрирован");
};

export const updateCharacterProfile = async (
  playerId: string,
  input: UpdateCharacterProfileInput
): Promise<UserStateDto> => {
  const user = await prepareUser(playerId);
  if (!user.character.isRegistered) {
    throw new Error("Character is not registered yet");
  }

  let changed = false;

  if (typeof input.name === "string") {
    user.character.name = assertCharacterName(input.name, "name");
    changed = true;
  }

  if (typeof input.codename === "string") {
    user.character.codename =
      input.codename.trim().length > 0 ? assertCharacterName(input.codename, "codename") : null;
    changed = true;
  }

  if (typeof input.archetype === "string") {
    user.character.archetype = assertArchetype(input.archetype);
    changed = true;
  }

  if (typeof input.avatarSeed === "string") {
    user.character.avatarSeed =
      input.avatarSeed.trim().length > 0
        ? input.avatarSeed.trim().slice(0, CHARACTER_AVATAR_SEED_MAX_LENGTH)
        : null;
    changed = true;
  }

  if (!changed) {
    return toUserStateDto(user, null, null);
  }

  user.character.updatedAt = new Date();
  await user.save();
  return toUserStateDto(user, null, "Профиль персонажа обновлен");
};

