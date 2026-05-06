import { ALCHEMY_EMOJI_PALETTE } from "../services/alchemy.palette.js";

const chainCounts = ALCHEMY_EMOJI_PALETTE.reduce<Record<string, number>>((acc, item) => {
  acc[item.chain] = (acc[item.chain] ?? 0) + 1;
  return acc;
}, {});

const stageCounts = ALCHEMY_EMOJI_PALETTE.reduce<Record<string, number>>((acc, item) => {
  acc[item.stage] = (acc[item.stage] ?? 0) + 1;
  return acc;
}, {});

const idCounts = ALCHEMY_EMOJI_PALETTE.reduce<Record<string, number>>((acc, item) => {
  acc[item.id] = (acc[item.id] ?? 0) + 1;
  return acc;
}, {});

const duplicateIds = Object.entries(idCounts)
  .filter(([, count]) => count > 1)
  .map(([id]) => id);

console.log(`Total palette items: ${ALCHEMY_EMOJI_PALETTE.length}`);
console.log("Count by chain:");
console.table(chainCounts);
console.log("Count by stage:");
console.table(stageCounts);
console.log("Duplicate ids:");
console.table(duplicateIds.length > 0 ? duplicateIds : ["none"]);
