import {
  ACTIVE_ALCHEMY_ITEM_IDS,
  ACTIVE_FILTERED_RECIPE_PAIRS,
  ACTIVE_RECIPE_PAIRS,
  ALCHEMY_ITEMS,
  BASE_SPAWN_ITEM_IDS,
  GOAL_SEQUENCE,
  RECIPE_DETAILS,
  getRecipeKey
} from "../services/alchemy.data.js";
import { ALCHEMY_EMOJI_PALETTE } from "../services/alchemy.palette.js";

type RecipePair = [string, string, string];

const FORBIDDEN: RecipePair[] = [
  ["ice", "spark", "water"],
  ["reactor", "spark", "science"]
];

const MILESTONES = ["science", "life", "powerCore", "world", "universe", "genesisCore", "omegaCore"] as const;
const stageOrder: Record<string, number> = { early: 0, mid: 1, late: 2, endgame: 3 };

const itemIds = new Set(ALCHEMY_ITEMS.map((item) => item.id));
const activeItemIdsSet = new Set<string>(ACTIVE_ALCHEMY_ITEM_IDS);
const baseSpawnSet = new Set<string>(BASE_SPAWN_ITEM_IDS);
const recipeMap = new Map<string, string>();
const selfResult: string[] = [];
const baseResultRecipes: string[] = [];
const warnings: string[] = [];
const activeIconMap = new Map<string, Array<{ id: string; name: string }>>();

if (ACTIVE_ALCHEMY_ITEM_IDS.length < 60) {
  throw new Error(`Too few active items: ${ACTIVE_ALCHEMY_ITEM_IDS.length} (< 60)`);
}
if (ACTIVE_RECIPE_PAIRS.length < 120) {
  throw new Error(`Too few active recipes: ${ACTIVE_RECIPE_PAIRS.length} (< 120)`);
}

for (const itemId of ACTIVE_ALCHEMY_ITEM_IDS) {
  if (!itemIds.has(itemId)) {
    throw new Error(`ACTIVE_ALCHEMY_ITEM_IDS contains unknown item '${itemId}'`);
  }
}

for (const item of ALCHEMY_ITEMS) {
  const list = activeIconMap.get(item.icon) ?? [];
  list.push({ id: item.id, name: item.name });
  activeIconMap.set(item.icon, list);
}

const activeEmojiDuplicates = Array.from(activeIconMap.entries())
  .filter(([, items]) => items.length > 1)
  .map(([icon, items]) => `${icon}: ${items.map((item) => `${item.id}(${item.name})`).join(", ")}`);

if (activeEmojiDuplicates.length > 0) {
  throw new Error(`Active emoji duplicates found:\n${activeEmojiDuplicates.join("\n")}`);
}

for (const [left, right, result] of ACTIVE_RECIPE_PAIRS) {
  if (!activeItemIdsSet.has(left) || !activeItemIdsSet.has(right) || !activeItemIdsSet.has(result)) {
    throw new Error(`ACTIVE_RECIPE_PAIRS contains non-active id: ${left}+${right}=${result}`);
  }

  if (result === left || result === right) {
    selfResult.push(`${left}+${right}=${result}`);
  }

  const key = getRecipeKey(left, right);
  const existing = recipeMap.get(key);
  if (existing) {
    if (existing === result) {
      throw new Error(`Duplicate active recipe key '${key}'`);
    }
    throw new Error(`Conflicting active recipe key '${key}': '${existing}' vs '${result}'`);
  }
  recipeMap.set(key, result);

  if (baseSpawnSet.has(result)) {
    baseResultRecipes.push(`${left}+${right}=${result}`);
  }
}

if (selfResult.length > 0) {
  throw new Error(`Found result == ingredient: ${selfResult.join(", ")}`);
}

if (baseResultRecipes.length > 0) {
  throw new Error(`Active recipes produce base spawn items: ${baseResultRecipes.join(", ")}`);
}

for (const [a, b, c] of FORBIDDEN) {
  const got = recipeMap.get(getRecipeKey(a, b));
  if (got === c) {
    throw new Error(`Forbidden recipe exists in active set: ${a}+${b}=${c}`);
  }
}

const basePairs: Array<{ pair: string; covered: boolean; result: string | null }> = [];
for (let i = 0; i < BASE_SPAWN_ITEM_IDS.length; i += 1) {
  for (let j = i; j < BASE_SPAWN_ITEM_IDS.length; j += 1) {
    const left = BASE_SPAWN_ITEM_IDS[i];
    const right = BASE_SPAWN_ITEM_IDS[j];
    const key = getRecipeKey(left, right);
    basePairs.push({ pair: `${left}+${right}`, covered: recipeMap.has(key), result: recipeMap.get(key) ?? null });
  }
}
const baseCovered = basePairs.filter((pair) => pair.covered).length;
if (baseCovered < 12) {
  throw new Error(`Base pair coverage too low: ${baseCovered}/15`);
}

const reachable = new Set<string>(BASE_SPAWN_ITEM_IDS);
let changed = true;
while (changed) {
  changed = false;
  for (const [left, right, result] of ACTIVE_RECIPE_PAIRS) {
    if (reachable.has(left) && reachable.has(right) && !reachable.has(result)) {
      reachable.add(result);
      changed = true;
    }
  }
}

const unreachableGoals = GOAL_SEQUENCE.filter((goal) => !reachable.has(goal));
if (unreachableGoals.length > 0) {
  throw new Error(`Unreachable goals: ${unreachableGoals.join(", ")}`);
}

const goalRecipes = GOAL_SEQUENCE.map((goal) => ({
  goal,
  recipes: ACTIVE_RECIPE_PAIRS.filter(([, , result]) => result === goal).map(([left, right]) => `${left}+${right}`)
}));

const milestoneRecipes = ACTIVE_RECIPE_PAIRS.filter(([, , result]) =>
  MILESTONES.includes(result as (typeof MILESTONES)[number])
);

const paletteStageById = new Map(ALCHEMY_EMOJI_PALETTE.map((item) => [item.id, item.stage]));
for (const [left, right, result] of ACTIVE_RECIPE_PAIRS) {
  const leftStage = paletteStageById.get(left) ?? "mid";
  const rightStage = paletteStageById.get(right) ?? "mid";
  const resultStage = paletteStageById.get(result) ?? "mid";
  const maxIngredientStage = Math.max(stageOrder[leftStage], stageOrder[rightStage]);
  if (stageOrder[resultStage] < maxIngredientStage) {
    warnings.push(`Stage downgrade: ${left}+${right} -> ${result}`);
  }
}

const detailPairCount = RECIPE_DETAILS.length;
if (detailPairCount !== ACTIVE_RECIPE_PAIRS.length) {
  throw new Error(`RECIPE_DETAILS mismatch: ${detailPairCount} vs ACTIVE_RECIPE_PAIRS ${ACTIVE_RECIPE_PAIRS.length}`);
}

console.log(`Total active items: ${ACTIVE_ALCHEMY_ITEM_IDS.length}`);
console.log(`Total active recipes: ${ACTIVE_RECIPE_PAIRS.length}`);
console.log(`Total filtered plan recipes: ${ACTIVE_FILTERED_RECIPE_PAIRS.length}`);
console.log("Active emoji duplicates: none");
console.log(`Base pair coverage: ${baseCovered}/15`);
console.log("GOAL_SEQUENCE:");
console.table(GOAL_SEQUENCE.map((goal, index) => ({ index: index + 1, goal, reachable: reachable.has(goal) })));
console.log("Recipes producing each goal item:");
console.table(goalRecipes.map((entry) => ({ goal: entry.goal, recipes: entry.recipes.join(" | ") || "-" })));
console.log("Recipes producing base spawn items:");
console.table(baseResultRecipes.map((recipe) => ({ recipe })));
console.log("Forbidden recipes:");
console.table(FORBIDDEN.map(([a, b, c]) => ({ pair: `${a}+${b}`, result: c, found: recipeMap.get(getRecipeKey(a, b)) === c })));
console.log("Duplicates/conflicts:");
console.table([{ status: "none" }]);
console.log("result == ingredient:");
console.table(selfResult.length > 0 ? selfResult.map((recipe) => ({ recipe })) : [{ status: "none" }]);
console.log("Unreachable goals:");
console.table(unreachableGoals.length > 0 ? unreachableGoals.map((goal) => ({ goal })) : [{ status: "none" }]);
console.log("Milestone recipes:");
console.table(milestoneRecipes.map(([left, right, result]) => ({ left, right, result })));

if (warnings.length > 0) {
  console.warn("Warnings by stage downgrade:");
  warnings.slice(0, 50).forEach((warning) => console.warn(`- ${warning}`));
}
