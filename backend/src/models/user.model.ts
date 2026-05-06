import { GRID_SIZE } from "../services/game.constants.js";
import { HydratedDocument, Model, Schema, model } from "mongoose";
import { IGrid, gridSchema } from "./grid.model.js";

export interface IUser {
  gold: number;
  baseLevel: number;
  grid: IGrid;
  lastIncomeClaimAt: Date;
  discoveredItems: string[];
  discoveredRecipes: string[];
  rewardedGoals: string[];
  onboardingHintDismissed: boolean;
  onboardingGuideDismissed: boolean;
  freeSpawnsUsed: number;
  deleteActionsUsed: number;
  goalFreeSpawns: number;
  goalFreeDeletes: number;
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
        cells: Array.from({ length: GRID_SIZE }, () => ({ itemId: null }))
      }
    },
    lastIncomeClaimAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    discoveredItems: {
      type: [String],
      required: true,
      default: []
    },
    discoveredRecipes: {
      type: [String],
      required: true,
      default: []
    },
    rewardedGoals: {
      type: [String],
      required: true,
      default: []
    },
    onboardingHintDismissed: {
      type: Boolean,
      required: true,
      default: false
    },
    onboardingGuideDismissed: {
      type: Boolean,
      required: true,
      default: false
    },
    freeSpawnsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    deleteActionsUsed: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    goalFreeSpawns: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    goalFreeDeletes: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export type UserDocument = HydratedDocument<IUser>;
export const User = model<IUser, UserModel>("User", userSchema);
