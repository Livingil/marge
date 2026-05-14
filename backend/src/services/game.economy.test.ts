import assert from "node:assert/strict";
import test from "node:test";
import {
  getBaseUpgradeCost,
  getDeleteCostWithProgression,
  getGoalRewardBundle,
  getSpawnCost
} from "./game.economy.js";

test("spawn cost stays free during free spawn window and scales afterwards", () => {
  assert.equal(getSpawnCost(0, 1), 0);
  assert.equal(getSpawnCost(7, 10), 0);
  assert.equal(getSpawnCost(8, 1), 7);
  assert.equal(getSpawnCost(10, 3), 15);
});

test("delete cost progression increases with prior cleanup actions", () => {
  const baseDeleteCost = getDeleteCostWithProgression(2, 10, 0);
  const progressedDeleteCost = getDeleteCostWithProgression(2, 10, 3);

  assert.equal(progressedDeleteCost - baseDeleteCost, 6);
});

test("goal reward bundle escalates utility rewards on later goals", () => {
  assert.deepEqual(getGoalRewardBundle(2, 1), {
    energy: 140,
    freeSpawns: 0,
    freeDeletes: 0
  });

  assert.deepEqual(getGoalRewardBundle(10, 3), {
    energy: 420,
    freeSpawns: 1,
    freeDeletes: 1
  });

  assert.deepEqual(getGoalRewardBundle(16, 5), {
    energy: 650,
    freeSpawns: 2,
    freeDeletes: 2
  });
});

test("base upgrade cost grows monotonically", () => {
  assert.ok(getBaseUpgradeCost(2) > getBaseUpgradeCost(1));
  assert.ok(getBaseUpgradeCost(10) > getBaseUpgradeCost(5));
});
