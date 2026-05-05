import { MAX_ITEM_LEVEL } from "./game.constants.js";
import { IGridCell } from "../models/grid.model.js";

export type MergeOutcome = "normal" | "bonus" | "downgrade" | "failed";

export interface MergeResult {
  merged: boolean;
  outcome: MergeOutcome;
  cellA: IGridCell;
  cellB: IGridCell;
}

const clampLevel = (level: number): number => Math.min(level, MAX_ITEM_LEVEL);

const getMergedLevel = (
  level: number,
  randomValue: number,
  randomFn: () => number
): { nextLevel: number; outcome: Exclude<MergeOutcome, "failed"> } => {
  if (randomValue < 0.7) {
    return {
      nextLevel: clampLevel(level + 1),
      outcome: "normal"
    };
  }

  if (randomValue < 0.9) {
    return {
      nextLevel: clampLevel(level + 2),
      outcome: "bonus"
    };
  }

  const downgradeToZero = randomFn() < 0.5;
  return {
    nextLevel: downgradeToZero ? 0 : Math.max(0, level - 1),
    outcome: "downgrade"
  };
};

export const merge = (
  cellA: IGridCell,
  cellB: IGridCell,
  randomFn: () => number = Math.random
): MergeResult => {
  if (cellA.itemLevel === 0 || cellB.itemLevel === 0) {
    return {
      merged: false,
      outcome: "failed",
      cellA: { itemLevel: cellA.itemLevel },
      cellB: { itemLevel: cellB.itemLevel }
    };
  }

  if (cellA.itemLevel !== cellB.itemLevel) {
    return {
      merged: false,
      outcome: "failed",
      cellA: { itemLevel: cellA.itemLevel },
      cellB: { itemLevel: cellB.itemLevel }
    };
  }

  const merged = getMergedLevel(cellA.itemLevel, randomFn(), randomFn);

  return {
    merged: true,
    outcome: merged.outcome,
    cellA: { itemLevel: merged.nextLevel },
    cellB: { itemLevel: 0 }
  };
};
