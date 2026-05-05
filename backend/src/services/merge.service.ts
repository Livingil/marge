import { IGridCell } from "../models/grid.model.js";
import { getRecipeKey, RECIPES } from "./alchemy.data.js";

export type MergeOutcome = "normal" | "bonus" | "downgrade" | "failed";

export interface MergeResult {
  merged: boolean;
  outcome: MergeOutcome;
  cellA: IGridCell;
  cellB: IGridCell;
}

export const merge = (cellA: IGridCell, cellB: IGridCell): MergeResult => {
  const itemA = cellA.itemId;
  const itemB = cellB.itemId;

  if (!itemA || !itemB) {
    return {
      merged: false,
      outcome: "failed",
      cellA: { itemId: itemA ?? null },
      cellB: { itemId: itemB ?? null }
    };
  }

  const recipeKey = getRecipeKey(itemA, itemB);
  const resultItemId = RECIPES[recipeKey];

  if (!resultItemId) {
    return {
      merged: false,
      outcome: "failed",
      cellA: { itemId: itemA },
      cellB: { itemId: itemB }
    };
  }

  return {
    merged: true,
    outcome: "normal",
    cellA: { itemId: resultItemId },
    cellB: { itemId: null }
  };
};
