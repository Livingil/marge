import type { AlchemyItem } from "./alchemy.data.js";

type RecipePair = [string, string, string];

type ValidateAlchemyDataInput = {
  items: AlchemyItem[];
  recipePairs: RecipePair[];
  baseSpawnItemIds: string[];
  goalSequence: string[];
  legacyLevelToItemId: Record<number, string>;
  getRecipeKey: (a: string, b: string) => string;
};

const getReachableItemIds = (
  baseSpawnItemIds: string[],
  recipePairs: RecipePair[]
): Set<string> => {
  const reachable = new Set<string>(baseSpawnItemIds);
  let changed = true;

  while (changed) {
    changed = false;

    recipePairs.forEach(([leftId, rightId, resultId]) => {
      if (reachable.has(leftId) && reachable.has(rightId) && !reachable.has(resultId)) {
        reachable.add(resultId);
        changed = true;
      }
    });
  }

  return reachable;
};

export const validateAlchemyData = ({
  items,
  recipePairs,
  baseSpawnItemIds,
  goalSequence,
  legacyLevelToItemId,
  getRecipeKey
}: ValidateAlchemyDataInput): void => {
  const rawItemIds = items.map((item) => item.id);
  const uniqueItemIds = new Set(rawItemIds);

  if (uniqueItemIds.size !== rawItemIds.length) {
    const seen = new Set<string>();
    const duplicates = rawItemIds.filter((id) => {
      if (seen.has(id)) {
        return true;
      }
      seen.add(id);
      return false;
    });

    throw new Error(
      `Duplicate item ids in ALCHEMY_ITEMS: ${Array.from(new Set(duplicates)).join(", ")}`
    );
  }

  items.forEach((item) => {
    if (!item.id || !item.icon || !item.name || !item.description) {
      throw new Error(`Item '${item.id || "<empty>"}' must include id, icon, name and description`);
    }
  });

  const itemIds = new Set(rawItemIds);

  baseSpawnItemIds.forEach((itemId) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Spawn item '${itemId}' is missing in ALCHEMY_ITEMS`);
    }
  });

  goalSequence.forEach((itemId) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Goal item '${itemId}' is missing in ALCHEMY_ITEMS`);
    }
  });

  Object.entries(legacyLevelToItemId).forEach(([level, itemId]) => {
    if (!itemIds.has(itemId)) {
      throw new Error(`Legacy level '${level}' points to missing item '${itemId}'`);
    }
  });

  const recipeResultsByKey = new Map<string, string>();

  recipePairs.forEach(([leftId, rightId, resultId]) => {
    if (!itemIds.has(leftId)) {
      throw new Error(`Recipe left item '${leftId}' is missing in ALCHEMY_ITEMS`);
    }
    if (!itemIds.has(rightId)) {
      throw new Error(`Recipe right item '${rightId}' is missing in ALCHEMY_ITEMS`);
    }
    if (!itemIds.has(resultId)) {
      throw new Error(`Recipe result item '${resultId}' is missing in ALCHEMY_ITEMS`);
    }

    const key = getRecipeKey(leftId, rightId);
    const existingResult = recipeResultsByKey.get(key);

    if (existingResult && existingResult !== resultId) {
      throw new Error(
        `Ambiguous recipe '${key}': both '${existingResult}' and '${resultId}' are defined`
      );
    }

    if (existingResult) {
      throw new Error(`Duplicate recipe key '${key}' in recipePairs`);
    }

    recipeResultsByKey.set(key, resultId);
  });

  const reachable = getReachableItemIds(baseSpawnItemIds, recipePairs);
  goalSequence.forEach((goalId) => {
    if (!reachable.has(goalId)) {
      throw new Error(`Goal '${goalId}' is not reachable from BASE_SPAWN_ITEM_IDS`);
    }
  });
};
