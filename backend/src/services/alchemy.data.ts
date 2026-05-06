import { validateAlchemyData } from "./alchemy.validation.js";
import { ALCHEMY_EMOJI_PALETTE } from "./alchemy.palette.js";
import { ALCHEMY_RECIPE_PLAN } from "./alchemy.recipePlan.js";

export interface AlchemyItem {
  id: string;
  icon: string;
  name: string;
  description: string;
}

type RecipePair = [string, string, string];
export interface RecipeDetails {
  key: string;
  leftId: string;
  rightId: string;
  resultId: string;
}

const MAX_VISUAL_TIER = 5;

const ACTIVE_ITEM_IDS = [
  // energy early/mid
  "spark", "charge", "battery", "energyCell", "current", "coil", "lightning", "capacitor", "generator", "plasma", "ion", "pulse", "radiation", "overload", "powerCore", "reactor",
  // elemental early/mid
  "fire", "water", "stone", "wind", "ice", "steam", "ash", "smoke", "clay", "mud", "sand", "dust", "lava", "glass", "crystal", "frost", "mist", "acid", "salt",
  // nature early/mid
  "seed", "root", "leaf", "plant", "moss", "algae", "flower", "mushroom", "vine", "tree", "fruit", "pollen", "resin", "bark", "thorn", "herb", "nectar",
  // material early/mid
  "coal", "ore", "metal", "copper", "iron", "steel", "silver", "gold", "alloy", "wire", "magnet", "lens", "mirror", "prism", "ceramic", "graphite",
  // technology early/mid
  "gear", "mechanism", "circuit", "chip", "sensor", "terminal", "scanner", "processor", "machine", "engine", "pump", "drone", "robot",
  // biology early/mid
  "life", "cell", "tissue", "organism", "nerve", "brain", "mind", "bone", "blood", "beast", "shell",
  // magic mid
  "mana", "rune", "sigil", "scroll", "spell", "soul", "spirit", "ghost", "golem", "wand",
  // space mid
  "meteor", "comet", "moon", "portal", "gate", "asteroid",
  // civilization mid
  "camp", "forge", "workshop", "library", "archive",
  // milestone helper
  "science"
] as const;

const ACTIVE_ITEM_ID_SET = new Set<string>(ACTIVE_ITEM_IDS);

const paletteById = new Map(ALCHEMY_EMOJI_PALETTE.map((item) => [item.id, item]));

export const ALCHEMY_ITEMS: AlchemyItem[] = ACTIVE_ITEM_IDS.map((id) => {
  const item = paletteById.get(id);
  if (!item) {
    throw new Error(`Active item '${id}' is missing in ALCHEMY_EMOJI_PALETTE`);
  }

  return {
    id: item.id,
    icon: item.icon,
    name: item.name,
    description: item.description
  };
});

export const getRecipeKey = (a: string, b: string): string => {
  return [a, b].sort().join("+");
};

const forbiddenRecipeKeys = new Set<string>([
  getRecipeKey("ice", "spark"),
  getRecipeKey("reactor", "spark")
]);

const baseSpawnSet = new Set<string>(["spark", "water", "seed", "stone", "fire"]);

const filteredRecipePairs: RecipePair[] = ALCHEMY_RECIPE_PLAN.filter(([leftId, rightId, resultId]) => {
  if (!ACTIVE_ITEM_ID_SET.has(leftId) || !ACTIVE_ITEM_ID_SET.has(rightId) || !ACTIVE_ITEM_ID_SET.has(resultId)) {
    return false;
  }

  if (forbiddenRecipeKeys.has(getRecipeKey(leftId, rightId))) {
    return false;
  }

  if (resultId === leftId || resultId === rightId) {
    return false;
  }

  if (baseSpawnSet.has(resultId) && !baseSpawnSet.has(leftId) && !baseSpawnSet.has(rightId)) {
    return false;
  }

  const resultStage = paletteById.get(resultId)?.stage;
  return resultStage === "early" || resultStage === "mid";
});

const curatedExtraPairs: RecipePair[] = [
  ["spark", "battery", "energyCell"],
  ["spark", "energyCell", "magnet"],
  ["battery", "magnet", "reactor"],
  ["stone", "energyCell", "crystal"],
  ["metal", "energyCell", "wire"],
  ["charge", "charge", "coil"],
  ["magnet", "magnet", "reactor"],
  ["reactor", "magnet", "portal"]
];

const recipePairMap = new Map<string, RecipePair>();
[...filteredRecipePairs, ...curatedExtraPairs].forEach(([leftId, rightId, resultId]) => {
  const key = getRecipeKey(leftId, rightId);
  if (!recipePairMap.has(key)) {
    recipePairMap.set(key, [leftId, rightId, resultId]);
  }
});

const recipePairs: RecipePair[] = Array.from(recipePairMap.values());

export const BASE_SPAWN_ITEM_IDS = ["spark", "water", "seed", "stone", "fire"];

export const LEGACY_LEVEL_TO_ITEM_ID: Record<number, string> = {
  1: "spark",
  2: "battery",
  3: "energyCell",
  4: "magnet",
  5: "reactor"
};

export const GOAL_SEQUENCE = [
  "battery",
  "charge",
  "energyCell",
  "crystal",
  "life",
  "metal",
  "mechanism",
  "science",
  "powerCore",
  "robot",
  "mana",
  "spell",
  "organism",
  "mind",
  "portal"
];

validateAlchemyData({
  items: ALCHEMY_ITEMS,
  recipePairs,
  baseSpawnItemIds: BASE_SPAWN_ITEM_IDS,
  goalSequence: GOAL_SEQUENCE,
  legacyLevelToItemId: LEGACY_LEVEL_TO_ITEM_ID,
  getRecipeKey,
  forbiddenRecipes: [
    ["ice", "spark", "water"],
    ["reactor", "spark", "science"]
  ],
  minBasePairCoverage: 12,
  disallowBaseResultRecipes: true,
  allowBaseResultRecipes: []
});

export const ALCHEMY_ITEMS_BY_ID: Record<string, AlchemyItem> = Object.fromEntries(
  ALCHEMY_ITEMS.map((item) => [item.id, item])
);

export const RECIPES: Record<string, string> = recipePairs.reduce<Record<string, string>>(
  (acc, [a, b, result]) => {
    acc[getRecipeKey(a, b)] = result;
    return acc;
  },
  {}
);

export const RECIPE_DETAILS: RecipeDetails[] = recipePairs.map(([leftId, rightId, resultId]) => ({
  key: getRecipeKey(leftId, rightId),
  leftId,
  rightId,
  resultId
}));

export const RECIPE_DETAILS_BY_KEY: Record<string, RecipeDetails> = Object.fromEntries(
  RECIPE_DETAILS.map((recipe) => [recipe.key, recipe])
);

export const getRecipeDetailsByKey = (key: string): RecipeDetails | null => {
  return RECIPE_DETAILS_BY_KEY[key] ?? null;
};

const computeAlchemyItemTiers = (): Record<string, number> => {
  const tiers = Object.fromEntries(
    ALCHEMY_ITEMS.map((item) => [item.id, Number.POSITIVE_INFINITY])
  ) as Record<string, number>;

  BASE_SPAWN_ITEM_IDS.forEach((itemId) => {
    tiers[itemId] = 1;
  });

  let changed = true;

  while (changed) {
    changed = false;

    recipePairs.forEach(([leftId, rightId, resultId]) => {
      const leftTier = tiers[leftId];
      const rightTier = tiers[rightId];

      if (!Number.isFinite(leftTier) || !Number.isFinite(rightTier)) {
        return;
      }

      const nextTier = Math.min(MAX_VISUAL_TIER, Math.max(leftTier, rightTier) + 1);

      if (nextTier < tiers[resultId]) {
        tiers[resultId] = nextTier;
        changed = true;
      }
    });
  }

  return Object.fromEntries(
    Object.entries(tiers).map(([itemId, tier]) => [itemId, Number.isFinite(tier) ? tier : MAX_VISUAL_TIER])
  );
};

export const ALCHEMY_ITEM_TIERS = computeAlchemyItemTiers();
