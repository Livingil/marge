import { HydratedDocument, Model, Schema, model } from "mongoose";
import { GRID_SIZE, IGrid, gridSchema } from "./grid.model.js";

export interface IUser {
  gold: number;
  baseLevel: number;
  grid: IGrid;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    gold: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    baseLevel: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    grid: {
      type: gridSchema,
      required: true,
      default: {
        cells: Array.from({ length: GRID_SIZE }, () => ({ itemLevel: 0 }))
      }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser, UserModel>("User", userSchema);
