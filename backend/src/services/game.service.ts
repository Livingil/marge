import { User, UserDocument } from "../models/user.model.js";
import { merge } from "./merge.service.js";
import { upgradeBaseForUserDocument } from "./income.service.js";

export interface MergeCellsInput {
  cellA: number;
  cellB: number;
}

const ensureUser = async (): Promise<UserDocument> => {
  const existingUser = await User.findOne();

  if (existingUser) {
    return existingUser;
  }

  return User.create({});
};

const assertCellIndex = (index: number): void => {
  if (!Number.isInteger(index) || index < 0 || index > 24) {
    throw new Error("Cell index must be an integer from 0 to 24");
  }
};

export const getUserState = async (): Promise<UserDocument> => {
  return ensureUser();
};

export const mergeCells = async (input: MergeCellsInput): Promise<UserDocument> => {
  assertCellIndex(input.cellA);
  assertCellIndex(input.cellB);

  if (input.cellA === input.cellB) {
    throw new Error("cellA and cellB must be different");
  }

  const user = await ensureUser();
  const firstCell = user.grid.cells[input.cellA];
  const secondCell = user.grid.cells[input.cellB];

  const result = merge(firstCell, secondCell);

  if (!result.merged) {
    return user;
  }

  user.grid.cells[input.cellA].itemLevel = result.cellA.itemLevel;
  user.grid.cells[input.cellB].itemLevel = result.cellB.itemLevel;

  await user.save();
  return user;
};

export const upgradeBase = async (): Promise<UserDocument> => {
  const user = await ensureUser();
  return upgradeBaseForUserDocument(user);
};
