import { MAX_ITEM_LEVEL } from "./game.constants.js";
import { IGridCell } from "../models/grid.model.js";

export interface MergeResult {
  merged: boolean;
  cellA: IGridCell;
  cellB: IGridCell;
}

const clampLevel = (level: number): number => Math.min(level, MAX_ITEM_LEVEL);

const getMergedLevel = (
  level: number,
  randomValue: number,
  randomFn: () => number
): number => {
  if (randomValue < 0.7) {
    return clampLevel(level + 1);
  }

  if (randomValue < 0.9) {
    return clampLevel(level + 2);
  }

  const downgradeToZero = randomFn() < 0.5;
  return downgradeToZero ? 0 : Math.max(0, level - 1);
};

export const merge = (
  cellA: IGridCell,
  cellB: IGridCell,
  randomFn: () => number = Math.random
): MergeResult => {
  if (cellA.itemLevel === 0 || cellB.itemLevel === 0) {
    return {
      merged: false,
      cellA: { itemLevel: cellA.itemLevel },
      cellB: { itemLevel: cellB.itemLevel }
    };
  }

  if (cellA.itemLevel !== cellB.itemLevel) {
    return {
      merged: false,
      cellA: { itemLevel: cellA.itemLevel },
      cellB: { itemLevel: cellB.itemLevel }
    };
  }

  const nextLevel = getMergedLevel(cellA.itemLevel, randomFn(), randomFn);

  return {
    merged: true,
    cellA: { itemLevel: nextLevel },
    cellB: { itemLevel: 0 }
  };
};
