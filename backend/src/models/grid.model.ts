import { Schema } from "mongoose";

export interface IGridCell {
  itemLevel: number;
}

export interface IGrid {
  cells: IGridCell[];
}

export const GRID_SIZE = 25;

const gridCellSchema = new Schema<IGridCell>(
  {
    itemLevel: {
      type: Number,
      required: true,
      min: 0,
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
