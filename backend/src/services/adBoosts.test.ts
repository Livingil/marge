import assert from "node:assert/strict";
import test from "node:test";
import {
  activateFlowBoost,
  AD_BOOST_FLOW_MULTIPLIER,
  AD_BOOST_LIMITS,
  buildAdBoostOptions,
  createDefaultActiveBoosts,
  createEmptyAdBoostClaims,
  getAdBoostUsage,
  getEffectiveFlowMultiplier,
  resetAdBoostClaimsIfNeeded,
  setAdBoostUsage,
  settleActiveFlowBoost
} from "./adBoosts.js";

test("resetAdBoostClaimsIfNeeded preserves same-day counters and resets next day", () => {
  const dayOne = new Date("2026-05-09T10:00:00.000Z");
  const sameDay = new Date("2026-05-09T20:00:00.000Z");
  const nextDay = new Date("2026-05-10T00:01:00.000Z");
  const claims = {
    dateKey: "2026-05-09",
    freeSpawnToday: 2,
    freeDeleteToday: 1,
    flowBoostToday: 1,
    doubleOfflineToday: 0
  };

  assert.equal(resetAdBoostClaimsIfNeeded(claims, sameDay), claims);
  assert.deepEqual(resetAdBoostClaimsIfNeeded(claims, nextDay), createEmptyAdBoostClaims("2026-05-10"));
  assert.deepEqual(resetAdBoostClaimsIfNeeded(createEmptyAdBoostClaims(), dayOne), createEmptyAdBoostClaims("2026-05-09"));
});

test("flow boost lifecycle activates multiplier and expires cleanly", () => {
  const now = new Date("2026-05-09T10:00:00.000Z");
  const activeBoost = activateFlowBoost(now);

  assert.equal(activeBoost.flowMultiplier, AD_BOOST_FLOW_MULTIPLIER);
  assert.equal(getEffectiveFlowMultiplier(activeBoost, now), 2);

  const settledWhileActive = settleActiveFlowBoost(activeBoost, new Date("2026-05-09T10:10:00.000Z"));
  assert.equal(settledWhileActive.flowMultiplier, 2);

  const settledAfterExpiry = settleActiveFlowBoost(activeBoost, new Date("2026-05-09T10:31:00.000Z"));
  assert.deepEqual(settledAfterExpiry, createDefaultActiveBoosts());
  assert.equal(getEffectiveFlowMultiplier(settledAfterExpiry, new Date("2026-05-09T10:31:00.000Z")), 1);
});

test("setAdBoostUsage updates the targeted counter only", () => {
  const claims = createEmptyAdBoostClaims("2026-05-09");
  const updatedClaims = setAdBoostUsage(claims, "rewarded_flow_boost", 2);

  assert.equal(getAdBoostUsage(updatedClaims, "rewarded_flow_boost"), 2);
  assert.equal(getAdBoostUsage(updatedClaims, "rewarded_free_spawn"), 0);
});

test("buildAdBoostOptions uses declared limits and blocks placeholder offline boost", () => {
  const claims = {
    dateKey: "2026-05-09",
    freeSpawnToday: AD_BOOST_LIMITS.rewarded_free_spawn,
    freeDeleteToday: 0,
    flowBoostToday: AD_BOOST_LIMITS.rewarded_flow_boost - 1,
    doubleOfflineToday: 0
  };

  const options = buildAdBoostOptions(claims);
  const freeSpawn = options.find((option) => option.type === "rewarded_free_spawn");
  const flowBoost = options.find((option) => option.type === "rewarded_flow_boost");
  const offlineBoost = options.find((option) => option.type === "rewarded_double_offline_income");

  assert.equal(freeSpawn?.canClaim, false);
  assert.equal(flowBoost?.canClaim, true);
  assert.equal(offlineBoost?.canClaim, false);
});
