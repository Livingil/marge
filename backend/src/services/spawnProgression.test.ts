import assert from "node:assert/strict";
import test from "node:test";
import { getEarlySparkPitySpawnItemId, getGuaranteedSpawnItemId } from "./spawnProgression.js";

test("guaranteed spark activates near end of onboarding window when required sparks are still missing", () => {
  const guaranteedSpark = getGuaranteedSpawnItemId({
    freeSpawnsUsed: 7,
    discoveredItems: [],
    activeCells: [{ itemId: "spark" }, { itemId: null }]
  });

  assert.equal(guaranteedSpark, "spark");
});

test("guaranteed spark stops after battery discovery or enough sparks on board", () => {
  assert.equal(
    getGuaranteedSpawnItemId({
      freeSpawnsUsed: 7,
      discoveredItems: ["battery"],
      activeCells: [{ itemId: "spark" }]
    }),
    null
  );

  assert.equal(
    getGuaranteedSpawnItemId({
      freeSpawnsUsed: 6,
      discoveredItems: [],
      activeCells: [{ itemId: "spark" }, { itemId: "spark" }]
    }),
    null
  );
});

test("early spark pity activates only after threshold and only if spark is absent", () => {
  assert.equal(
    getEarlySparkPitySpawnItemId({
      freeSpawnsUsed: 3,
      discoveredItems: [],
      activeCells: []
    }),
    null
  );

  assert.equal(
    getEarlySparkPitySpawnItemId({
      freeSpawnsUsed: 4,
      discoveredItems: [],
      activeCells: []
    }),
    "spark"
  );

  assert.equal(
    getEarlySparkPitySpawnItemId({
      freeSpawnsUsed: 4,
      discoveredItems: [],
      activeCells: [{ itemId: "spark" }]
    }),
    null
  );
});

test("early spark pity stops once target progression item is already discovered", () => {
  assert.equal(
    getEarlySparkPitySpawnItemId({
      freeSpawnsUsed: 6,
      discoveredItems: ["energyCell"],
      activeCells: []
    }),
    null
  );
});
