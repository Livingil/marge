import { ALCHEMY_EMOJI_PALETTE } from "./alchemy.palette.js";

export type RecipePlanPair = [string, string, string];

const paletteIds = new Set(ALCHEMY_EMOJI_PALETTE.map((item) => item.id));
const keyOf = (a: string, b: string): string => [a, b].sort().join("+");

const plan: RecipePlanPair[] = [];
const byKey = new Map<string, string>();

const addRecipe = (leftId: string, rightId: string, resultId: string): void => {
  if (!paletteIds.has(leftId) || !paletteIds.has(rightId) || !paletteIds.has(resultId)) {
    throw new Error(`Recipe contains unknown ids: ${leftId}+${rightId}=${resultId}`);
  }
  if (resultId === leftId || resultId === rightId) {
    throw new Error(`Invalid self-result recipe: ${leftId}+${rightId}=${resultId}`);
  }

  const key = keyOf(leftId, rightId);
  const existing = byKey.get(key);
  if (existing) {
    throw new Error(
      `Duplicate recipe key '${key}': existing result '${existing}', new result '${resultId}'`
    );
  }

  byKey.set(key, resultId);
  plan.push([leftId, rightId, resultId]);
};

const addBulk = (pairs: RecipePlanPair[]): void => {
  pairs.forEach(([a, b, c]) => addRecipe(a, b, c));
};

addBulk([
  ["spark", "spark", "battery"],
  ["water", "water", "ice"],
  ["seed", "seed", "plant"],
  ["stone", "stone", "crystal"],
  ["fire", "fire", "ash"],
  ["spark", "water", "charge"],
  ["spark", "seed", "life"],
  ["spark", "stone", "crystal"],
  ["spark", "fire", "lightning"],
  ["water", "seed", "plant"],
  ["water", "stone", "clay"],
  ["water", "fire", "steam"],
  ["seed", "stone", "root"],
  ["seed", "fire", "ash"],
  ["stone", "fire", "metal"],

  ["crystal", "charge", "science"],
  ["glass", "charge", "science"],
  ["mechanism", "crystal", "science"],

  ["plant", "spark", "life"],
  ["algae", "spark", "organism"],

  ["reactor", "spark", "powerCore"],
  ["plasma", "magnet", "powerCore"],
  ["lightning", "energyCell", "powerCore"],

  ["portal", "life", "world"],
  ["planet", "life", "world"],
  ["worldTree", "planet", "world"],

  ["galaxy", "dimension", "universe"],
  ["cosmos", "world", "universe"],

  ["worldEngine", "artificialSoul", "genesisCore"],
  ["creationMatrix", "universeHeart", "genesisCore"],

  ["genesisCore", "omegaCharge", "omegaCore"],
  ["eternalReactor", "universeHeart", "omegaCore"]
]);

addBulk([
  ["battery", "battery", "energyCell"],
  ["charge", "battery", "energyCell"],
  ["charge", "charge", "energyCell"],
  ["spark", "energyCell", "magnet"],
  ["battery", "magnet", "reactor"],
  ["stone", "energyCell", "crystal"],
  ["charge", "magnet", "coil"],
  ["magnet", "magnet", "reactor"],
  ["reactor", "magnet", "portal"],
  ["energyCell", "energyCell", "magnet"],
  ["energyCell", "metal", "wire"],
  ["energyCell", "fire", "plasma"],
  ["charge", "metal", "wire"],
  ["charge", "wire", "current"],
  ["current", "coil", "generator"],
  ["coil", "wire", "capacitor"],
  ["current", "generator", "reactor"],
  ["lightning", "battery", "plasma"],
  ["lightning", "wire", "overload"],
  ["overload", "capacitor", "powerCore"],
  ["reactor", "plasma", "fusionCore"],
  ["reactor", "powerCore", "quantumCore"],
  ["fusionCore", "quantumCore", "zeroPointCell"],
  ["star", "plasma", "solarFlare"],
  ["stormCore", "powerCore", "eternalReactor"],
  ["quantumCore", "zeroPointCell", "omegaCharge"],
  ["lightning", "wind", "stormCore"]
]);

addBulk([
  ["water", "wind", "mist"],
  ["water", "sand", "clay"],
  ["fire", "clay", "ceramic"],
  ["fire", "sand", "glass"],
  ["fire", "metal", "iron"],
  ["fire", "wind", "smoke"],
  ["ash", "stone", "coal"],
  ["ash", "water", "clay"],
  ["stone", "wind", "dust"],
  ["ice", "wind", "frost"],
  ["steam", "wind", "geyser"],
  ["lava", "water", "obsidian"],
  ["lava", "sand", "glass"],
  ["lava", "ash", "obsidian"],
  ["stone", "crystal", "quake"],
  ["mist", "frost", "elementalCore"],
  ["lava", "frost", "elementalCore"],
  ["acid", "metal", "salt"],
  ["water", "salt", "acid"],
  ["steam", "ash", "salt"]
]);

addBulk([
  ["seed", "leaf", "plant"],
  ["seed", "root", "plant"],
  ["plant", "water", "vine"],
  ["plant", "stone", "moss"],
  ["plant", "fire", "ash"],
  ["vine", "tree", "forest"],
  ["tree", "water", "forest"],
  ["tree", "flower", "fruit"],
  ["flower", "wind", "pollen"],
  ["tree", "ash", "resin"],
  ["tree", "stone", "bark"],
  ["thorn", "plant", "herb"],
  ["flower", "water", "nectar"],
  ["moss", "water", "algae"],
  ["algae", "plant", "mushroom"],
  ["forest", "life", "garden"],
  ["forest", "root", "worldTree"],
  ["garden", "worldTree", "world"]
]);

addBulk([
  ["ore", "fire", "metal"],
  ["ore", "coal", "iron"],
  ["iron", "coal", "steel"],
  ["copper", "wire", "circuit"],
  ["metal", "spark", "gear"],
  ["gear", "metal", "mechanism"],
  ["metal", "crystal", "lens"],
  ["glass", "metal", "mirror"],
  ["glass", "crystal", "prism"],
  ["coal", "crystal", "graphite"],
  ["graphite", "plasma", "gem"],
  ["obsidian", "mana", "mythril"],
  ["mythril", "powerCore", "adamant"],
  ["silver", "gold", "alloy"],
  ["iron", "copper", "alloy"],
  ["alloy", "magnet", "mechanism"]
]);

addBulk([
  ["wire", "spark", "circuit"],
  ["circuit", "mechanism", "machine"],
  ["machine", "energyCell", "robot"],
  ["machine", "battery", "drone"],
  ["robot", "mind", "android"],
  ["factory", "mind", "automaton"],
  ["mechanism", "energyCell", "engine"],
  ["engine", "water", "pump"],
  ["sensor", "circuit", "scanner"],
  ["terminal", "circuit", "processor"],
  ["processor", "scanner", "serverCore"],
  ["machine", "forge", "workshop"],
  ["workshop", "circuit", "labModule"],
  ["labModule", "temple", "stabilizer"],
  ["machine", "labModule", "replicator"],
  ["serverCore", "observatory", "transmitter"],
  ["gear", "wire", "mechanism"],
  ["factory", "robot", "drone"],
  ["drone", "processor", "android"],
  ["science", "machine", "stabilizer"]
]);

addBulk([
  ["life", "water", "organism"],
  ["organism", "life", "beast"],
  ["life", "energyCell", "mind"],
  ["life", "stone", "bone"],
  ["life", "steam", "blood"],
  ["cell", "cell", "tissue"],
  ["tissue", "nerve", "brain"],
  ["brain", "scanner", "mind"],
  ["organism", "shell", "beast"],
  ["organism", "dna", "mutation"],
  ["dna", "mutation", "bioCore"],
  ["organism", "portal", "symbiote"],
  ["life", "seed", "embryo"],
  ["mind", "symbiote", "hivemind"],
  ["beast", "mind", "hivemind"],
  ["organism", "spark", "nerve"],
  ["bone", "blood", "organism"]
]);

addBulk([
  ["crystal", "spark", "mana"],
  ["mana", "crystal", "rune"],
  ["rune", "mana", "sigil"],
  ["scroll", "mana", "spell"],
  ["life", "spark", "soul"],
  ["soul", "portal", "spirit"],
  ["soul", "metal", "golem"],
  ["wand", "mana", "spell"],
  ["ritual", "altar", "oracle"],
  ["relic", "ritual", "oracle"],
  ["mana", "soul", "aura"],
  ["sigil", "shadow", "curse"],
  ["sigil", "solarFlare", "blessing"],
  ["mana", "science", "arcaneCore"],
  ["rune", "spell", "ritual"],
  ["oracle", "mana", "arcaneCore"],
  ["spirit", "curse", "ghost"],
  ["science", "rune", "spell"]
]);

addBulk([
  ["stone", "reactor", "meteor"],
  ["meteor", "fire", "star"],
  ["star", "stone", "planet"],
  ["planet", "orbit", "moon"],
  ["planet", "magnet", "gravity"],
  ["portal", "reactor", "gate"],
  ["gate", "world", "dimension"],
  ["star", "dust", "nebula"],
  ["nebula", "star", "galaxy"],
  ["galaxy", "void", "cosmos"],
  ["planet", "moon", "eclipse"],
  ["meteor", "stone", "asteroid"],
  ["portal", "gravity", "orbit"],
  ["asteroid", "fire", "comet"],
  ["cosmos", "dimension", "universe"],
  ["star", "gate", "portal"]
]);

addBulk([
  ["shadow", "portal", "rift"],
  ["rift", "charge", "anomaly"],
  ["anomaly", "gravity", "blackHole"],
  ["blackHole", "powerCore", "singularity"],
  ["singularity", "entropy", "void"],
  ["echo", "rift", "anomaly"],
  ["darkMatter", "gravity", "blackHole"],
  ["void", "mana", "entropy"],
  ["shadow", "echo", "abyss"],
  ["anomaly", "void", "darkMatter"]
]);

addBulk([
  ["life", "fire", "camp"],
  ["camp", "metal", "forge"],
  ["forge", "mechanism", "workshop"],
  ["workshop", "science", "library"],
  ["library", "science", "archive"],
  ["city", "tower", "observatory"],
  ["market", "guild", "city"],
  ["temple", "ritual", "guild"],
  ["camp", "tree", "colony"],
  ["forge", "library", "workshop"],
  ["archive", "orbit", "observatory"],
  ["city", "portal", "colony"],
  ["library", "mana", "temple"],
  ["workshop", "market", "city"],
  ["tower", "gate", "observatory"]
]);

addBulk([
  ["android", "soul", "artificialSoul"],
  ["artificialSoul", "machine", "livingMachine"],
  ["world", "reactor", "worldEngine"],
  ["universe", "mind", "cosmicMind"],
  ["universe", "life", "universeHeart"],
  ["realitySeed", "world", "creationMatrix"],
  ["creationMatrix", "cosmicMind", "genesisCore"],
  ["worldEngine", "universeHeart", "genesisCore"],
  ["genesisCore", "eternalReactor", "omegaCore"],
  ["bioCore", "machine", "livingMachine"],
  ["arcaneCore", "serverCore", "artificialSoul"],
  ["worldTree", "reactor", "worldEngine"],
  ["cosmos", "mind", "cosmicMind"],
  ["universeHeart", "realitySeed", "creationMatrix"],
  ["adamant", "arcaneCore", "colossus"],
  ["colossus", "genesisCore", "omegaCore"]
]);
export const ALCHEMY_RECIPE_PLAN: RecipePlanPair[] = plan;
