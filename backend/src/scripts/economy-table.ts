import { GRID_SIZE, getActiveGridRows, getActiveGridSize } from "../services/game.constants.js";
import {
  getBaseUpgradeCost,
  getDeleteCostWithProgression,
  getGoalRewardBundle,
  getGoalReward,
  getSpawnCost
} from "../services/game.economy.js";
import { calculateIncomeMultiplier, calculateIncomeWithBase } from "../services/income.service.js";
import { BASE_SPAWN_ITEM_IDS, RECIPES, getRecipeKey } from "../services/alchemy.data.js";

type GridCell = { itemId: string | null };
type Grid = { cells: GridCell[] };

const T1_ITEM_ID = "spark";
const T2_ITEM_ID = "battery";

const buildGrid = (occupiedCells: number, itemId: string): Grid => {
  const safeOccupiedCells = Math.max(0, Math.min(occupiedCells, GRID_SIZE));
  const cells: GridCell[] = Array.from({ length: GRID_SIZE }, (_, index) => ({
    itemId: index < safeOccupiedCells ? itemId : null
  }));

  return { cells };
};

const getIncomeFor = (baseLevel: number, occupiedCells: number, itemId: string): number => {
  const grid = buildGrid(occupiedCells, itemId);
  return calculateIncomeWithBase(grid, baseLevel);
};

const toMinutes = (cost: number, incomePerMinute: number): number | null => {
  if (incomePerMinute <= 0) {
    return null;
  }

  return Number((cost / incomePerMinute).toFixed(1));
};

const toPurchasesPer10Min = (incomePerMinute: number, cost: number): number | "free" | null => {
  if (cost === 0) {
    return "free";
  }

  if (incomePerMinute <= 0) {
    return null;
  }

  return Math.floor((incomePerMinute * 10) / cost);
};

const formatRewardBundle = (goalIndex: number, itemTier: number): string => {
  const reward = getGoalRewardBundle(goalIndex, itemTier);
  const parts = [`+${reward.energy} energy`];
  if (reward.freeSpawns > 0) {
    parts.push(`+${reward.freeSpawns} spawn`);
  }
  if (reward.freeDeletes > 0) {
    parts.push(`+${reward.freeDeletes} delete`);
  }

  return parts.join(", ");
};

const rows = Array.from({ length: 50 }, (_, index) => {
  const baseLevel = index + 1;
  const activeRows = getActiveGridRows(baseLevel);
  const activeCells = getActiveGridSize(baseLevel);
  const fullActiveCells = activeCells;
  const baseUpgradeCost = getBaseUpgradeCost(baseLevel);

  const income10T1 = getIncomeFor(baseLevel, 10, T1_ITEM_ID);
  const income25T1 = getIncomeFor(baseLevel, 25, T1_ITEM_ID);
  const income25T2 = getIncomeFor(baseLevel, 25, T2_ITEM_ID);
  const incomeFullT2 = getIncomeFor(baseLevel, fullActiveCells, T2_ITEM_ID);

  const spawnCostUsed0 = getSpawnCost(0, baseLevel);
  const spawnCostUsed10 = getSpawnCost(10, baseLevel);
  const spawnCostUsed50 = getSpawnCost(50, baseLevel);
  const spawnCostUsed100 = getSpawnCost(100, baseLevel);

  const deleteCostT1Occ10Used0 = getDeleteCostWithProgression(1, 10, 0);
  const deleteCostT3Occ25Used10 = getDeleteCostWithProgression(3, 25, 10);
  const deleteCostT5FullUsed50 = getDeleteCostWithProgression(5, fullActiveCells, 50);

  const goalRewardEarlyT1 = getGoalReward(0, 1);
  const goalRewardMidT3 = getGoalReward(10, 3);
  const goalRewardLateT5 = getGoalReward(19, 5);

  return {
    baseLevel,
    activeRows,
    activeCells,
    baseUpgradeCost,
    incomeMultiplier: Number(calculateIncomeMultiplier(baseLevel).toFixed(2)),
    income_10_T1: income10T1,
    income_25_T1: income25T1,
    income_25_T2: income25T2,
    income_full_T2: incomeFullT2,
    spawnCost_freeUsed_0: spawnCostUsed0,
    spawnCost_freeUsed_10: spawnCostUsed10,
    spawnCost_freeUsed_50: spawnCostUsed50,
    spawnCost_freeUsed_100: spawnCostUsed100,
    delete_t1_occ10_used0: deleteCostT1Occ10Used0,
    delete_t3_occ25_used10: deleteCostT3Occ25Used10,
    delete_t5_full_used50: deleteCostT5FullUsed50,
    minutes_upgrade_full_T1: toMinutes(baseUpgradeCost, income10T1),
    minutes_upgrade_full_T2: toMinutes(baseUpgradeCost, incomeFullT2),
    minutes_upgrade_25_T2: toMinutes(baseUpgradeCost, income25T2),
    spawns_per_10min_full_T2_at_used10: toPurchasesPer10Min(incomeFullT2, spawnCostUsed10),
    spawns_per_10min_full_T2_at_used50: toPurchasesPer10Min(incomeFullT2, spawnCostUsed50),
    spawns_per_10min_full_T2_at_used100: toPurchasesPer10Min(incomeFullT2, spawnCostUsed100),
    deletes_per_10min_t3_occ25_used10: toPurchasesPer10Min(incomeFullT2, deleteCostT3Occ25Used10),
    deletes_per_10min_t5_full_used50: toPurchasesPer10Min(incomeFullT2, deleteCostT5FullUsed50),
    goalReward_early_T1: goalRewardEarlyT1,
    goalReward_mid_T3: goalRewardMidT3,
    goalReward_late_T5: goalRewardLateT5,
    reward_early: formatRewardBundle(0, 1),
    reward_mid: formatRewardBundle(10, 3),
    reward_late: formatRewardBundle(19, 5),
    midGoalReward_to_upgrade_percent: Math.round((goalRewardMidT3 / baseUpgradeCost) * 100)
  };
});

console.log("Economy baseline");
console.table(
  rows.map((row) => ({
    baseLevel: row.baseLevel,
    activeRows: row.activeRows,
    activeCells: row.activeCells,
    baseUpgradeCost: row.baseUpgradeCost,
    incomeMultiplier: row.incomeMultiplier,
    income_10_T1: row.income_10_T1,
    income_25_T1: row.income_25_T1,
    income_25_T2: row.income_25_T2,
    income_full_T2: row.income_full_T2,
    spawnCost_freeUsed_0: row.spawnCost_freeUsed_0,
    spawnCost_freeUsed_10: row.spawnCost_freeUsed_10,
    spawnCost_freeUsed_50: row.spawnCost_freeUsed_50,
    spawnCost_freeUsed_100: row.spawnCost_freeUsed_100,
    delete_t1_occ10_used0: row.delete_t1_occ10_used0,
    delete_t3_occ25_used10: row.delete_t3_occ25_used10,
    delete_t5_full_used50: row.delete_t5_full_used50
  }))
);

console.log("Economy pacing");
console.table(
  rows.map((row) => ({
    baseLevel: row.baseLevel,
    minutes_upgrade_full_T1: row.minutes_upgrade_full_T1,
    minutes_upgrade_full_T2: row.minutes_upgrade_full_T2,
    minutes_upgrade_25_T2: row.minutes_upgrade_25_T2,
    spawns_per_10min_full_T2_at_used10: row.spawns_per_10min_full_T2_at_used10,
    spawns_per_10min_full_T2_at_used50: row.spawns_per_10min_full_T2_at_used50,
    spawns_per_10min_full_T2_at_used100: row.spawns_per_10min_full_T2_at_used100,
    deletes_per_10min_t3_occ25_used10: row.deletes_per_10min_t3_occ25_used10,
    deletes_per_10min_t5_full_used50: row.deletes_per_10min_t5_full_used50,
    goalReward_early_T1: row.goalReward_early_T1,
    goalReward_mid_T3: row.goalReward_mid_T3,
    goalReward_late_T5: row.goalReward_late_T5,
    reward_early: row.reward_early,
    reward_mid: row.reward_mid,
    reward_late: row.reward_late,
    midGoalReward_to_upgrade_percent: row.midGoalReward_to_upgrade_percent
  }))
);

const basePairs: Array<{ pair: string; result: string | null }> = [];
for (let i = 0; i < BASE_SPAWN_ITEM_IDS.length; i += 1) {
  for (let j = i; j < BASE_SPAWN_ITEM_IDS.length; j += 1) {
    const left = BASE_SPAWN_ITEM_IDS[i];
    const right = BASE_SPAWN_ITEM_IDS[j];
    const key = getRecipeKey(left, right);
    basePairs.push({
      pair: `${left}+${right}`,
      result: RECIPES[key] ?? null
    });
  }
}

const coveredBasePairs = basePairs.filter((pair) => pair.result !== null).length;
console.log("Early game base pair coverage");
console.log(`BASE_SPAWN_ITEM_IDS: ${BASE_SPAWN_ITEM_IDS.join(", ")}`);
console.log(`Covered base pairs: ${coveredBasePairs}/${basePairs.length}`);
console.table(basePairs);
