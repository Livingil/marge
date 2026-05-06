import { ALCHEMY_EMOJI_PALETTE } from "../services/alchemy.palette.js";
import { ALCHEMY_RECIPE_PLAN } from "../services/alchemy.recipePlan.js";

const BASE_SPAWN = ["spark", "water", "seed", "stone", "fire"] as const;
const ALLOWED_BASE_RESULT_RECIPES: Array<[string, string, string]> = [];
const MILESTONES = ["science", "life", "powerCore", "world", "universe", "genesisCore", "omegaCore"] as const;
const FORBIDDEN: Array<[string, string, string]> = [
  ["ice", "spark", "water"],
  ["reactor", "spark", "science"]
];

const keyOf = (a: string, b: string): string => [a, b].sort().join("+");

const paletteById = new Map(ALCHEMY_EMOJI_PALETTE.map((item) => [item.id, item]));

const seenItemIds = new Set<string>();
for (const item of ALCHEMY_EMOJI_PALETTE) {
  if (seenItemIds.has(item.id)) {
    throw new Error(`Duplicate item id in palette: ${item.id}`);
  }
  seenItemIds.add(item.id);
}

const byKey = new Map<string, string>();
const missingIds: string[] = [];
const badSelfResult: string[] = [];
const baseResultRecipes: Array<{ left: string; right: string; result: string }> = [];
const stageOrder: Record<string, number> = { early: 0, mid: 1, late: 2, endgame: 3 };
const warnings: string[] = [];

for (const [left, right, result] of ALCHEMY_RECIPE_PLAN) {
  if (!paletteById.has(left)) missingIds.push(left);
  if (!paletteById.has(right)) missingIds.push(right);
  if (!paletteById.has(result)) missingIds.push(result);

  if (result === left || result === right) {
    badSelfResult.push(`${left}+${right}=${result}`);
  }

  const key = keyOf(left, right);
  const existing = byKey.get(key);
  if (existing && existing !== result) {
    throw new Error(`Conflicting recipe key '${key}': '${existing}' vs '${result}'`);
  }
  if (existing && existing === result) {
    throw new Error(`Duplicate recipe key '${key}'`);
  }
  byKey.set(key, result);

  if (BASE_SPAWN.includes(result as (typeof BASE_SPAWN)[number])) {
    baseResultRecipes.push({ left, right, result });
  }

  const leftStage = paletteById.get(left)?.stage;
  const rightStage = paletteById.get(right)?.stage;
  const resultStage = paletteById.get(result)?.stage;
  if (leftStage && rightStage && resultStage) {
    const maxIng = Math.max(stageOrder[leftStage], stageOrder[rightStage]);
    if (stageOrder[resultStage] < maxIng) {
      warnings.push(`Stage downgrade: ${left}+${right} -> ${result}`);
    }
  }
}

if (missingIds.length > 0) {
  throw new Error(`Missing recipe ids in palette: ${Array.from(new Set(missingIds)).join(", ")}`);
}

if (badSelfResult.length > 0) {
  throw new Error(`Recipes with result == ingredient: ${badSelfResult.join("; ")}`);
}

for (const [a, b, c] of FORBIDDEN) {
  const key = keyOf(a, b);
  const got = byKey.get(key);
  if (got === c) {
    throw new Error(`Forbidden recipe found: ${a}+${b}=${c}`);
  }
}

const basePairs: Array<{ pair: string; covered: boolean; result: string | null }> = [];
for (let i = 0; i < BASE_SPAWN.length; i += 1) {
  for (let j = i; j < BASE_SPAWN.length; j += 1) {
    const a = BASE_SPAWN[i];
    const b = BASE_SPAWN[j];
    const key = keyOf(a, b);
    basePairs.push({ pair: `${a}+${b}`, covered: byKey.has(key), result: byKey.get(key) ?? null });
  }
}

const baseCovered = basePairs.filter((pair) => pair.covered).length;
if (baseCovered < 12) {
  throw new Error(`Base pair coverage too low: ${baseCovered}/15`);
}

if (ALCHEMY_RECIPE_PLAN.length < 120) {
  throw new Error(`Too few curated recipes: ${ALCHEMY_RECIPE_PLAN.length} (minimum is 120)`);
}
if (ALCHEMY_RECIPE_PLAN.length < 160) {
  warnings.push(`Curated recipe count is low: ${ALCHEMY_RECIPE_PLAN.length} (<160)`);
}

const allowedBaseResultKeys = new Set(
  ALLOWED_BASE_RESULT_RECIPES.map(([left, right, result]) => `${keyOf(left, right)}=>${result}`)
);

const disallowedBaseResultRecipes = baseResultRecipes.filter(({ left, right, result }) => {
  return !allowedBaseResultKeys.has(`${keyOf(left, right)}=>${result}`);
});

if (disallowedBaseResultRecipes.length > 0) {
  throw new Error(
    `Disallowed base-result recipes found: ${disallowedBaseResultRecipes
      .map((recipe) => `${recipe.left}+${recipe.right}=${recipe.result}`)
      .join(", ")}`
  );
}

const chainCounts = ALCHEMY_EMOJI_PALETTE.reduce<Record<string, number>>((acc, item) => {
  acc[item.chain] = (acc[item.chain] ?? 0) + 1;
  return acc;
}, {});

const stageCounts = ALCHEMY_EMOJI_PALETTE.reduce<Record<string, number>>((acc, item) => {
  acc[item.stage] = (acc[item.stage] ?? 0) + 1;
  return acc;
}, {});

const milestoneRecipes = ALCHEMY_RECIPE_PLAN.filter(([, , result]) => MILESTONES.includes(result as (typeof MILESTONES)[number]));

console.log(`Total items: ${ALCHEMY_EMOJI_PALETTE.length}`);
console.log(`Total recipes: ${ALCHEMY_RECIPE_PLAN.length}`);
console.log("Count by chain:");
console.table(chainCounts);
console.log("Count by stage:");
console.table(stageCounts);
console.log(`Base pair coverage: ${baseCovered}/15`);
console.table(basePairs);
console.log("Recipes producing base spawn items:");
console.table(baseResultRecipes);
console.log("Milestone recipes:");
console.table(milestoneRecipes.map(([left, right, result]) => ({ left, right, result })));

if (warnings.length > 0) {
  console.warn("Warnings:");
  warnings.slice(0, 50).forEach((warning) => console.warn(`- ${warning}`));
  if (warnings.length > 50) {
    console.warn(`- ...and ${warnings.length - 50} more`);
  }
}
