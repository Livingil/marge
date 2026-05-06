import {
  ALCHEMY_ITEMS,
  BASE_SPAWN_ITEM_IDS,
  GOAL_SEQUENCE,
  RECIPE_DETAILS,
  getRecipeKey
} from "../services/alchemy.data.js";
import { ALCHEMY_EMOJI_PALETTE } from "../services/alchemy.palette.js";

const FORBIDDEN: Array<[string, string, string]> = [
  ["ice", "spark", "water"],
  ["reactor", "spark", "science"]
];

const MILESTONES = ["science", "life", "powerCore", "robot", "mana", "spell", "portal", "mind"] as const;
const stageOrder: Record<string, number> = { early: 0, mid: 1, late: 2, endgame: 3 };

const itemIds = new Set(ALCHEMY_ITEMS.map((item) => item.id));
const recipePairs = RECIPE_DETAILS.map((recipe) => [recipe.leftId, recipe.rightId, recipe.resultId] as const);
const recipeMap = new Map<string, string>();
const baseSpawnSet = new Set(BASE_SPAWN_ITEM_IDS);

const selfResult: string[] = [];
const baseResultRecipes: string[] = [];

for (const [left, right, result] of recipePairs) {
  if (!itemIds.has(left) || !itemIds.has(right) || !itemIds.has(result)) {
    throw new Error(`Recipe has unknown active id: ${left}+${right}=${result}`);
  }

  if (result === left || result === right) {
    selfResult.push(`${left}+${right}=${result}`);
  }

  const key = getRecipeKey(left, right);
  const existing = recipeMap.get(key);
  if (existing) {
    throw new Error(`Duplicate/conflicting active recipe key '${key}': '${existing}' vs '${result}'`);
  }
  recipeMap.set(key, result);

  if (baseSpawnSet.has(result)) {
    baseResultRecipes.push(`${left}+${right}=${result}`);
  }
}

if (selfResult.length > 0) {
  throw new Error(`result==ingredient in active recipes: ${selfResult.join(", ")}`);
}

for (const [a, b, c] of FORBIDDEN) {
  const got = recipeMap.get(getRecipeKey(a, b));
  if (got === c) {
    throw new Error(`Forbidden active recipe found: ${a}+${b}=${c}`);
  }
}

const basePairs: Array<{ pair: string; covered: boolean; result: string | null }> = [];
for (let i = 0; i < BASE_SPAWN_ITEM_IDS.length; i += 1) {
  for (let j = i; j < BASE_SPAWN_ITEM_IDS.length; j += 1) {
    const a = BASE_SPAWN_ITEM_IDS[i];
    const b = BASE_SPAWN_ITEM_IDS[j];
    const key = getRecipeKey(a, b);
    basePairs.push({ pair: `${a}+${b}`, covered: recipeMap.has(key), result: recipeMap.get(key) ?? null });
  }
}
const baseCovered = basePairs.filter((pair) => pair.covered).length;

const reachable = new Set<string>(BASE_SPAWN_ITEM_IDS);
let changed = true;
while (changed) {
  changed = false;
  for (const [left, right, result] of recipePairs) {
    if (reachable.has(left) && reachable.has(right) && !reachable.has(result)) {
      reachable.add(result);
      changed = true;
    }
  }
}

const unreachableGoals = GOAL_SEQUENCE.filter((goal) => !reachable.has(goal));
if (unreachableGoals.length > 0) {
  throw new Error(`Unreachable goals in GOAL_SEQUENCE: ${unreachableGoals.join(", ")}`);
}

const milestoneRecipes = recipePairs.filter(([, , result]) =>
  MILESTONES.includes(result as (typeof MILESTONES)[number])
);

const paletteStageById = new Map(ALCHEMY_EMOJI_PALETTE.map((item) => [item.id, item.stage]));
const warnings: string[] = [];
for (const [left, right, result] of recipePairs) {
  const leftStage = paletteStageById.get(left) ?? "mid";
  const rightStage = paletteStageById.get(right) ?? "mid";
  const resultStage = paletteStageById.get(result) ?? "mid";
  const maxIngredientStage = Math.max(stageOrder[leftStage], stageOrder[rightStage]);
  if (stageOrder[resultStage] < maxIngredientStage) {
    warnings.push(`Stage downgrade: ${left}+${right} -> ${result}`);
  }
}

console.log(`Total active items: ${ALCHEMY_ITEMS.length}`);
console.log(`Total active recipes: ${recipePairs.length}`);
console.log(`Base pair coverage: ${baseCovered}/15`);
console.table(basePairs);
console.log("Recipes producing base spawn items:");
console.table(baseResultRecipes);
console.log("Forbidden recipes:");
console.table(FORBIDDEN.map(([a, b, c]) => ({ pair: `${a}+${b}`, result: c, found: recipeMap.get(getRecipeKey(a, b)) === c })));
console.log("Milestone recipes:");
console.table(milestoneRecipes.map(([left, right, result]) => ({ left, right, result })));
console.log("GOAL_SEQUENCE:");
console.table(GOAL_SEQUENCE.map((goal, index) => ({ index: index + 1, goal, reachable: reachable.has(goal) })));
if (warnings.length > 0) {
  console.warn("Warnings:");
  warnings.slice(0, 20).forEach((warning) => console.warn(`- ${warning}`));
}
