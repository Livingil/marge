import { Schema } from "mongoose";
import { GRID_SIZE, MAX_ITEM_LEVEL } from "../services/game.constants.js";

export interface IGridCell {
  itemLevel: number;
}

export interface IGrid {
  cells: IGridCell[];
}

const gridCellSchema = new Schema<IGridCell>(
  {
    itemLevel: {
      type: Number,
      required: true,
      min: 0,
      max: MAX_ITEM_LEVEL,
      default: 0
    }
  },
  { _id: false }
);

export const gridSchema = new Schema<IGrid>(
  {
    cells: {
      type: [gridCellSchema],
      required: true,
      validate: {
        validator: (cells: IGridCell[]) => cells.length === GRID_SIZE,
        message: `Grid must contain exactly ${GRID_SIZE} cells`
      }
    }
  },
  { _id: false }
);
