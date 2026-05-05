export const GRID_COLUMNS = 5;
export const BASE_GRID_ROWS = 5;
export const GRID_ROW_UNLOCK_LEVELS = [25, 75, 150] as const;
export const GRID_SIZE = GRID_COLUMNS * (BASE_GRID_ROWS + GRID_ROW_UNLOCK_LEVELS.length);

export const MAX_ITEM_LEVEL = 5;
export const SPAWN_ITEM_LEVEL = 1;
export const BASE_SPAWN_COST = 5;
export const SPAWN_COST_PER_OCCUPIED_CELL = 3;
export const SPAWN_COST_PER_BASE_LEVEL = 2;
export const BASE_DELETE_COST = 10;
export const DELETE_COST_PER_TIER = 15;
export const DELETE_COST_PER_OCCUPIED_CELL = 2;
export const BASE_INCOME_STEP = 0.04;
export const MAX_OFFLINE_INCOME_SECONDS = 2 * 60 * 60;

export const getActiveGridRows = (baseLevel: number): number => {
  const unlockedRows = GRID_ROW_UNLOCK_LEVELS.filter((level) => baseLevel >= level).length;
  return BASE_GRID_ROWS + unlockedRows;
};

export const getActiveGridSize = (baseLevel: number): number => {
  return GRID_COLUMNS * getActiveGridRows(baseLevel);
};
