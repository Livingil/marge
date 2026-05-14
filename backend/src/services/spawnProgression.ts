type ProgressionCell = {
  itemId?: string | null;
};

type SpawnProgressionState = {
  freeSpawnsUsed: number;
  discoveredItems: string[];
  activeCells: ProgressionCell[];
};

const GUARANTEED_SPARK_WINDOW = 8;
const GUARANTEED_SPARK_COUNT = 2;
const GUARANTEED_SPARK_ITEM_ID = "spark";
const EARLY_SPARK_PITY_TARGET_ITEM_ID = "energyCell";
const EARLY_SPARK_PITY_ITEM_ID = "spark";
const EARLY_SPARK_PITY_MIN_FREE_SPAWNS_USED = 4;

const countItemInActiveCells = (activeCells: ProgressionCell[], itemId: string): number => {
  return activeCells.filter((cell) => cell.itemId === itemId).length;
};

const hasActiveItem = (activeCells: ProgressionCell[], itemId: string): boolean => {
  return activeCells.some((cell) => cell.itemId === itemId);
};

export const getGuaranteedSpawnItemId = (state: SpawnProgressionState): string | null => {
  if (state.freeSpawnsUsed >= GUARANTEED_SPARK_WINDOW) {
    return null;
  }

  if (state.discoveredItems.includes("battery")) {
    return null;
  }

  const sparkOnBoard = countItemInActiveCells(state.activeCells, GUARANTEED_SPARK_ITEM_ID);
  const remainingGuaranteedSpawns = GUARANTEED_SPARK_WINDOW - state.freeSpawnsUsed;
  const missingSpark = GUARANTEED_SPARK_COUNT - sparkOnBoard;

  if (missingSpark <= 0) {
    return null;
  }

  if (remainingGuaranteedSpawns <= missingSpark) {
    return GUARANTEED_SPARK_ITEM_ID;
  }

  return null;
};

export const getEarlySparkPitySpawnItemId = (state: SpawnProgressionState): string | null => {
  if (state.discoveredItems.includes(EARLY_SPARK_PITY_TARGET_ITEM_ID)) {
    return null;
  }

  if (state.freeSpawnsUsed < EARLY_SPARK_PITY_MIN_FREE_SPAWNS_USED) {
    return null;
  }

  if (hasActiveItem(state.activeCells, EARLY_SPARK_PITY_ITEM_ID)) {
    return null;
  }

  return EARLY_SPARK_PITY_ITEM_ID;
};
