import test from "node:test";
import assert from "node:assert/strict";
import { GOAL_SEQUENCE } from "./alchemy.data.js";
import { __internal } from "./game.service.js";

type RewardTestUser = {
  rewardedGoals: string[];
  discoveredItems: string[];
  gold: number;
  goalFreeSpawns: number;
  goalFreeDeletes: number;
};

const createUser = (overrides: Partial<RewardTestUser> = {}): RewardTestUser => ({
  rewardedGoals: [],
  discoveredItems: [],
  gold: 0,
  goalFreeSpawns: 0,
  goalFreeDeletes: 0,
  ...overrides
});

test("goal reward is granted only once for the same goal (index 5)", () => {
  const targetGoalIndex = 5;
  const goalItemId = GOAL_SEQUENCE[targetGoalIndex];
  const user = createUser({
    rewardedGoals: GOAL_SEQUENCE.slice(0, targetGoalIndex),
    discoveredItems: GOAL_SEQUENCE.slice(0, targetGoalIndex + 1)
  });

  const first = __internal.applyGoalRewards(user as never);
  const second = __internal.applyGoalRewards(user as never);

  assert.equal(first.freeSpawns, 1);
  assert.equal(second.freeSpawns, 0);
  assert.equal(user.goalFreeSpawns, 1);
  assert.ok(user.rewardedGoals.includes(goalItemId));
});

test("reward is not granted for future discovered goal while current unrewarded goal is missing", () => {
  const user = createUser({
    rewardedGoals: [GOAL_SEQUENCE[0]],
    discoveredItems: [GOAL_SEQUENCE[0], GOAL_SEQUENCE[2]]
  });

  const reward = __internal.applyGoalRewards(user as never);

  assert.equal(reward.energy, 0);
  assert.equal(reward.freeSpawns, 0);
  assert.equal(user.goalFreeSpawns, 0);
  assert.deepEqual(user.rewardedGoals, [GOAL_SEQUENCE[0]]);
});
