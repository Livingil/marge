import { Schema } from "mongoose";
import { GRID_SIZE } from "../services/game.constants.js";

export interface IGridCell {
  itemId: string | null;
  itemLevel?: number;
}

export interface IGrid {
  cells: IGridCell[];
}

const gridCellSchema = new Schema<IGridCell>(
  {
    itemId: {
      type: String,
      default: null
    },
    itemLevel: {
      type: Number,
      required: false
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
